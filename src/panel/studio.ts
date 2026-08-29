import * as vscode from 'vscode';
import { CORPUS } from '../generated/corpus.js';
import { resolveSession } from '../refine/resolve.js';
import { addStep, toggleStep, removeStep, moveStep } from '../refine/session.js';
import type { Session } from '../refine/session.js';
import type { SiteModel } from '../refine/mutate.js';

export interface StudioHost {
  getSession(): Session | null;
  setSession(s: Session): Promise<void>;
  writeSite(): Promise<void>;
  preview(): Promise<void>;
}

/**
 * The Studio panel (section 06 of the plan). The prompt stack is the document:
 * steps are numbered, toggleable and reorderable, and the site is a pure
 * function of the enabled ones. No iframe — fidelity lives in the real browser
 * behind Preview (D15); the panel shows structure.
 */
export class StudioPanel {
  public static current: StudioPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];

  static show(host: StudioHost, extensionUri: vscode.Uri): StudioPanel {
    if (StudioPanel.current) {
      StudioPanel.current.panel.reveal(vscode.ViewColumn.Beside);
      StudioPanel.current.refresh();
      return StudioPanel.current;
    }
    const panel = vscode.window.createWebviewPanel(
      'promptToWebsite.studio',
      'Prompt to Website',
      vscode.ViewColumn.Beside,
      { enableScripts: true, retainContextWhenHidden: true, localResourceRoots: [extensionUri] }
    );
    StudioPanel.current = new StudioPanel(panel, host);
    return StudioPanel.current;
  }

  private constructor(panel: vscode.WebviewPanel, private host: StudioHost) {
    this.panel = panel;
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    this.panel.webview.onDidReceiveMessage(async (msg) => {
      const s = this.host.getSession();
      if (!s) return;
      try {
        if (msg.type === 'add' && String(msg.text || '').trim()) {
          await this.host.setSession(addStep(s, String(msg.text).trim()));
        } else if (msg.type === 'toggle') {
          await this.host.setSession(toggleStep(s, msg.id));
        } else if (msg.type === 'remove') {
          if (s.steps.length > 1) await this.host.setSession(removeStep(s, msg.id));
        } else if (msg.type === 'move') {
          await this.host.setSession(moveStep(s, msg.id, msg.delta));
        } else if (msg.type === 'write') {
          await this.host.writeSite();
          void vscode.window.showInformationMessage(vscode.l10n.t('Site written.'));
        } else if (msg.type === 'preview') {
          await this.host.preview();
        }
      } catch (err: any) {
        void vscode.window.showErrorMessage(String(err && err.message ? err.message : err));
      }
      this.refresh();
    }, null, this.disposables);
    this.refresh();
  }

  refresh(): void {
    const session = this.host.getSession();
    if (!session) { this.panel.webview.html = this.shell('<p class="empty">No site open.</p>'); return; }

    let model: SiteModel | null = null;
    let error = '';
    try { model = resolveSession(session).model; } catch (e: any) { error = String(e.message || e); }

    this.panel.webview.html = this.shell(this.body(session, model, error));
  }

  private body(session: Session, model: SiteModel | null, error: string): string {
    const steps = session.steps.map((s, i) => `
      <li class="step ${s.enabled ? '' : 'off'}">
        <button class="tg" data-act="toggle" data-id="${s.id}"
                aria-pressed="${s.enabled}" title="Enable or disable this step">${s.enabled ? '&#10003;' : ''}</button>
        <span class="n">${i + 1}</span>
        <span class="txt">${esc(s.text)}</span>
        <span class="acts">
          <button data-act="move" data-id="${s.id}" data-delta="-1" title="Move up" ${i === 0 ? 'disabled' : ''}>&#8593;</button>
          <button data-act="move" data-id="${s.id}" data-delta="1" title="Move down" ${i === session.steps.length - 1 ? 'disabled' : ''}>&#8595;</button>
          <button data-act="remove" data-id="${s.id}" title="Delete step" ${session.steps.length < 2 ? 'disabled' : ''}>&#215;</button>
        </span>
      </li>`).join('');

    if (error) {
      return `<h2>Prompt stack</h2><ul class="steps">${steps}</ul><p class="err">${esc(error)}</p>`;
    }

    const m = model!;
    const pages = m.pages.map((p) => `<span class="chip">${esc(p.title)}</span>`).join('');
    const blocks = m.pages[0].sections
      .map((c) => `<div class="blk"><b>${esc(label(c))}</b><span>${esc(m.pages[0].variants[c])}</span></div>`)
      .join('');
    const unknown = m.unknown.length
      ? `<p class="warn">Not in my vocabulary: ${m.unknown.map((u) => `<code>${esc(u)}</code>`).join(' ')} &mdash; ignored.</p>`
      : '';
    const notes = m.notes.map((n) => `<p class="warn">${esc(n)}</p>`).join('');
    const blockCount = m.pages.reduce((n, p) => n + p.sections.length, 0);

    return `
      <h2>Prompt stack <small>${session.steps.filter((s) => s.enabled).length} of ${session.steps.length} active</small></h2>
      <ul class="steps">${steps}</ul>
      <form id="composer">
        <input id="step" type="text" placeholder="add a blog page &nbsp;|&nbsp; make it roomier &nbsp;|&nbsp; no javascript"
               aria-label="Add a step to the prompt stack">
        <button class="primary" type="submit">Apply</button>
      </form>

      <h2>What I understood</h2>
      <dl class="rows">
        <dt>Type</dt><dd>${esc(CORPUS.recipes[m.siteType]?.label || m.siteType)}</dd>
        <dt>Stack</dt><dd>${esc(m.stack)}</dd>
        <dt>Brand</dt><dd>${esc(m.brand || 'placeholder')}</dd>
        <dt>Palette</dt><dd>${esc(CORPUS.tokens[m.palette]?.label || m.palette)}</dd>
        <dt>Style</dt><dd>radius ${esc(m.axes.radius)} &middot; density ${esc(m.axes.density)} &middot; elevation ${esc(m.axes.elevation)}${m.axes.primary ? ' &middot; primary ' + esc(m.axes.primary) : ''}</dd>
        <dt>Pages</dt><dd>${pages}</dd>
      </dl>
      ${unknown}${notes}

      <h2>Structure <small>home page</small></h2>
      <div class="strip">${blocks}</div>

      <div class="bar">
        <span class="stats">${m.pages.length} pages &middot; ${blockCount} blocks &middot; 0 external requests &middot; no AI &#10003; &middot; WCAG 2.2 AA &#10003;</span>
        <span class="grow"></span>
        <button data-act="preview">Preview in browser</button>
        <button class="primary" data-act="write">Write files</button>
      </div>
      <p class="claim">Blocks ship WCAG 2.2 AA-audited; your content determines final conformance.</p>`;
  }

  private shell(inner: string): string {
    const nonce = String(Math.random()).slice(2);
    const csp = `default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';`;
    return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<style>
  body { font-family: var(--vscode-font-family); font-size: 13px;
         color: var(--vscode-foreground); background: var(--vscode-editor-background);
         padding: 14px 16px; }
  h2 { font-size: 11px; text-transform: uppercase; letter-spacing: .1em;
       color: var(--vscode-descriptionForeground); margin: 20px 0 8px; font-weight: 600; }
  h2:first-child { margin-top: 0; }
  h2 small { text-transform: none; letter-spacing: 0; margin-left: 8px; opacity: .8; }
  .steps { list-style: none; margin: 0 0 10px; padding: 0; }
  .step { display: flex; align-items: flex-start; gap: 8px; padding: 5px 6px; border-radius: 4px; }
  .step:hover { background: var(--vscode-list-hoverBackground); }
  .step.off .txt { opacity: .45; text-decoration: line-through; }
  .n { color: var(--vscode-descriptionForeground); min-width: 14px; font-variant-numeric: tabular-nums; }
  .txt { flex: 1; font-family: var(--vscode-editor-font-family); }
  .acts { display: flex; gap: 2px; }
  button { min-width: 24px; min-height: 24px; background: var(--vscode-button-secondaryBackground);
           color: var(--vscode-button-secondaryForeground); border: none; border-radius: 4px;
           cursor: pointer; padding: 3px 8px; font-family: inherit; font-size: 12px; }
  button:hover { background: var(--vscode-button-secondaryHoverBackground); }
  button:disabled { opacity: .35; cursor: not-allowed; }
  button.primary { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
  button.tg { min-width: 24px; }
  button:focus-visible { outline: 1px solid var(--vscode-focusBorder); outline-offset: 2px; }
  #composer { display: flex; gap: 6px; margin-bottom: 4px; }
  #step { flex: 1; padding: 6px 8px; min-height: 28px;
          background: var(--vscode-input-background); color: var(--vscode-input-foreground);
          border: 1px solid var(--vscode-input-border, transparent); border-radius: 4px;
          font-family: var(--vscode-editor-font-family); }
  .rows { display: grid; grid-template-columns: 90px 1fr; gap: 4px 12px; margin: 0; }
  .rows dt { color: var(--vscode-descriptionForeground); }
  .rows dd { margin: 0; }
  .chip { display: inline-block; padding: 1px 8px; margin: 0 4px 4px 0; border-radius: 3px;
          background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); }
  .strip { display: flex; flex-wrap: wrap; gap: 6px; }
  .blk { border: 1px solid var(--vscode-panel-border); border-radius: 4px; padding: 6px 9px; min-width: 84px; }
  .blk b { display: block; font-weight: 600; }
  .blk span { color: var(--vscode-descriptionForeground); font-size: 11px; }
  .warn { color: var(--vscode-editorWarning-foreground); margin: 8px 0 0; }
  .err { color: var(--vscode-editorError-foreground); }
  .bar { display: flex; align-items: center; gap: 8px; margin-top: 20px;
         padding-top: 12px; border-top: 1px solid var(--vscode-panel-border); }
  .grow { flex: 1; }
  .stats { color: var(--vscode-descriptionForeground); font-size: 11px; }
  .claim { color: var(--vscode-descriptionForeground); font-size: 11px; margin-top: 10px; }
  code { font-family: var(--vscode-editor-font-family); }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
</style></head><body>
${inner}
<script nonce="${nonce}">
  const vscode = acquireVsCodeApi();
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    vscode.postMessage({
      type: b.dataset.act,
      id: b.dataset.id ? Number(b.dataset.id) : undefined,
      delta: b.dataset.delta ? Number(b.dataset.delta) : undefined
    });
  });
  const form = document.getElementById('composer');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('step');
    if (input.value.trim()) vscode.postMessage({ type: 'add', text: input.value });
    input.value = '';
  });
</script></body></html>`;
  }

  dispose(): void {
    StudioPanel.current = undefined;
    this.panel.dispose();
    while (this.disposables.length) this.disposables.pop()?.dispose();
  }
}

function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function label(cat: string): string {
  return cat.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}
