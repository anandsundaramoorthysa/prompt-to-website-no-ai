import * as vscode from 'vscode';
import * as path from 'node:path';
import { CORPUS } from './generated/corpus.js';
import { compose, vendorFiles } from './compose/compose.js';
import { planWrites, writeAll } from './write/writer.js';
import { PreviewServer } from './preview/server.js';
import { StudioPanel } from './panel/studio.js';
import { StackView } from './panel/stackView.js';
import { resolveSession } from './refine/resolve.js';
import { loadSession, saveSession, newSession, addStep, toggleStep } from './refine/session.js';
import type { Session } from './refine/session.js';
import { renderTokens } from './compose/tokens.js';
import { applyAxes } from './compose/axes.js';
import { DEFAULT_AXES } from './refine/mutate.js';
import { fillSlots } from './compose/slots.js';
import { render } from './compose/template.js';
import { seedFrom } from './hash.js';
import type { Stack } from './types.js';

const server = new PreviewServer();
let status: vscode.StatusBarItem;
let root: vscode.Uri | null = null;
let session: Session | null = null;
let extensionUri: vscode.Uri;
let stackView: StackView;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  extensionUri = context.extensionUri;

  status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  status.command = 'promptToWebsite.studio';
  setStatus();
  status.show();

  stackView = new StackView(() => session);
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('promptToWebsite.stack', stackView),
    vscode.commands.registerCommand('promptToWebsite.toggleStep', async (id: number) => {
      if (!session || !root) return;
      session = toggleStep(session, id);
      await writeSite(false);
      StudioPanel.current?.refresh();
    }),
    status,
    vscode.commands.registerCommand('promptToWebsite.generate', generate),
    vscode.commands.registerCommand('promptToWebsite.refine', refine),
    vscode.commands.registerCommand('promptToWebsite.studio', openStudio),
    vscode.commands.registerCommand('promptToWebsite.preview', preview),
    vscode.commands.registerCommand('promptToWebsite.stopPreview', stopPreview),
    vscode.commands.registerCommand('promptToWebsite.insertBlock', insertBlock),
    vscode.commands.registerCommand('promptToWebsite.reTheme', reTheme),
    vscode.commands.registerCommand('promptToWebsite.diagnostics', diagnostics),
    { dispose: () => { void server.stop(); } }
  );

  // Re-entry: opening a folder that already holds a stack restores it (D12).
  const folders = vscode.workspace.workspaceFolders;
  if (folders && folders.length) {
    const existing = await loadSession(folders[0].uri.fsPath);
    if (existing) {
      root = folders[0].uri;
      session = existing;
      setStatus();
      stackView.refresh();
    }
  }
}

export function deactivate(): Thenable<void> {
  return server.stop();
}

function setStatus(): void {
  status.text = server.running
    ? `$(check) No AI · :${server.port}`
    : session
      ? `$(circle-outline) No AI · ${session.steps.filter((s) => s.enabled).length} steps`
      : `$(circle-outline) No AI · corpus v${CORPUS.version}`;
  status.tooltip = vscode.l10n.t('Prompt to Website — open the Studio panel');
}

async function pickFolder(): Promise<vscode.Uri | null> {
  const folders = vscode.workspace.workspaceFolders;
  if (folders && folders.length === 1) return folders[0].uri;
  if (folders && folders.length > 1) {
    const chosen = await vscode.window.showWorkspaceFolderPick();
    return chosen ? chosen.uri : null;
  }
  const picked = await vscode.window.showOpenDialog({
    canSelectFolders: true, canSelectFiles: false, canSelectMany: false,
    openLabel: vscode.l10n.t('Generate site here')
  });
  return picked && picked.length ? picked[0] : null;
}

async function generate(): Promise<void> {
  const prompt = await vscode.window.showInputBox({
    title: vscode.l10n.t('Prompt to Website'),
    prompt: vscode.l10n.t('Describe the site you want'),
    placeHolder: 'a landing page for a project management saas with pricing and faq',
    ignoreFocusOut: true
  });
  if (!prompt || !prompt.trim()) return;

  const folder = await pickFolder();
  if (!folder) return;

  const stack = vscode.workspace.getConfiguration('promptToWebsite')
    .get<Stack>('defaultStack', 'bootstrap');

  root = folder;
  session = newSession(prompt.trim(), stack);
  await writeSite(true);
  openStudio();
}

async function refine(): Promise<void> {
  if (!session || !root) {
    void vscode.window.showWarningMessage(vscode.l10n.t('No site open. Run Generate first.'));
    return;
  }
  const step = await vscode.window.showInputBox({
    title: vscode.l10n.t('Refine'),
    prompt: vscode.l10n.t('Add a step to the prompt stack'),
    placeHolder: 'add a blog page | make it roomier | no javascript',
    ignoreFocusOut: true
  });
  if (!step || !step.trim()) return;
  session = addStep(session, step.trim());
  await writeSite(false);
  StudioPanel.current?.refresh();
}

function openStudio(): void {
  StudioPanel.show(
    {
      getSession: () => session,
      setSession: async (s) => { session = s; await writeSite(false); },
      writeSite: () => writeSite(false),
      preview
    },
    extensionUri
  );
}

async function writeSite(confirmOverwrite: boolean): Promise<void> {
  if (!session || !root) return;

  const { plan, model } = resolveSession(session);
  const { files, warnings } = compose(plan);
  const vendorRoot = path.join(extensionUri.fsPath, 'corpus', 'vendor');
  const all = files.concat(vendorFiles(plan.intent.stack, vendorRoot));

  if (confirmOverwrite) {
    const clashes = await planWrites(root.fsPath, all);
    if (clashes.length) {
      const go = await vscode.window.showWarningMessage(
        vscode.l10n.t('{0} file(s) already exist and would be overwritten.', clashes.length),
        { modal: true, detail: clashes.slice(0, 12).join('\n') },
        vscode.l10n.t('Overwrite')
      );
      if (!go) return;
    }
  }

  await writeAll(root.fsPath, all);
  await saveSession(root.fsPath, session);
  server.touch();
  setStatus();
  stackView?.refresh();

  if (model.unknown.length) {
    void vscode.window.showWarningMessage(
      vscode.l10n.t('Not in my vocabulary: {0}. I built the rest.', model.unknown.join(', '))
    );
  }
  for (const n of model.notes.slice(0, 3)) void vscode.window.showInformationMessage(n);
  for (const w of warnings.slice(0, 2)) void vscode.window.showWarningMessage(w);
}

async function preview(): Promise<void> {
  const folder = root || (await pickFolder());
  if (!folder) return;
  root = folder;
  const firstPort = vscode.workspace.getConfiguration('promptToWebsite').get<number>('previewPort', 5510);
  try {
    if (!server.running) await server.start(folder.fsPath, firstPort);
    else server.touch();
    setStatus();
    await vscode.env.openExternal(vscode.Uri.parse(`http://127.0.0.1:${server.port}/index.html`));
  } catch (err: any) {
    void vscode.window.showErrorMessage(`Preview server: ${err?.message ?? String(err)}`);
  }
}

async function stopPreview(): Promise<void> {
  await server.stop();
  setStatus();
  void vscode.window.showInformationMessage(vscode.l10n.t('Preview server stopped, port released.'));
}

/**
 * D8 — works on any file, including hand-written pages this tool never
 * generated. The inserted markup inherits whatever tokens the file already uses.
 */
async function insertBlock(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    void vscode.window.showWarningMessage(vscode.l10n.t('Open an HTML file first.'));
    return;
  }
  const text = editor.document.getText();
  const usesBootstrap = /bootstrap(\.bundle)?\.min\.(css|js)/.test(text) || /class="[^"]*\bcontainer\b/.test(text);
  const variantKey = usesBootstrap ? 'bootstrap' : 'vanilla';

  const items = Object.values(CORPUS.blocks)
    .filter((b) => b.insertable && b.stacks[variantKey]?.available && b.variants[variantKey])
    .map((b) => ({ label: b.label, description: b.category, detail: b.id, id: b.id }));

  const chosen = await vscode.window.showQuickPick(items, {
    title: vscode.l10n.t('Insert block'),
    placeHolder: vscode.l10n.t('Matched to this file: {0} variant', variantKey)
  });
  if (!chosen) return;

  const block = CORPUS.blocks[(chosen as any).id];
  const seed = seedFrom(editor.document.uri.toString() + block.id);
  const brandMatch = /<title>([^<—]+)/.exec(text);
  const { data } = fillSlots(block, CORPUS.copy['saas'] || {}, {
    brand: (brandMatch?.[1] || 'Your Brand').trim(),
    navLinks: [{ label: 'Home', href: 'index.html' }],
    pageTitle: 'Page',
    seed
  });

  const html = render(block.variants[variantKey].html, data, {});
  await editor.edit((e) => e.insert(editor.selection.active, '\n' + html + '\n'));

  void vscode.window.showInformationMessage(
    vscode.l10n.t('Inserted {0}. Its CSS lives in the block corpus — add it to your stylesheet if this file was not generated.', block.id)
  );
}

/** D4 made this a single-file rewrite rather than a redesign. */
async function reTheme(): Promise<void> {
  const folder = root || (await pickFolder());
  if (!folder) return;

  const items = Object.values(CORPUS.tokens).map((t) => ({
    label: t.label,
    description: `${t.color.primary} / ${t.color.bg}`,
    id: t.id
  }));
  const chosen = await vscode.window.showQuickPick(items, {
    title: vscode.l10n.t('Re-theme'),
    placeHolder: vscode.l10n.t('Rewrites css/tokens.css only')
  });
  if (!chosen) return;

  const stack = session?.stack ?? 'bootstrap';
  const preset = applyAxes(CORPUS.tokens[(chosen as any).id], { ...DEFAULT_AXES });
  const css = renderTokens(preset, stack) + '\n';
  const target = vscode.Uri.joinPath(folder, 'css', 'tokens.css');
  await vscode.workspace.fs.writeFile(target, Buffer.from(css, 'utf8'));

  if (session) {
    session = addStep(session, `use the ${(chosen as any).id.replace(/-/g, ' ')} palette`);
    await saveSession(folder.fsPath, session);
    StudioPanel.current?.refresh();
  }
  server.touch();
  void vscode.window.showInformationMessage(
    vscode.l10n.t('Palette changed to {0}.', (chosen as any).label)
  );
}

/** H10 — a feedback path that keeps the zero-telemetry stance. Nothing is sent. */
async function diagnostics(): Promise<void> {
  const report = [
    'Prompt to Website — diagnostic report',
    `extension : ${CORPUS.version}`,
    `corpus    : sha256:${CORPUS.corpusHash.slice(0, 16)}`,
    `blocks    : ${Object.keys(CORPUS.blocks).length}`,
    `recipes   : ${Object.keys(CORPUS.recipes).join(', ')}`,
    `vscode    : ${vscode.version}`,
    `platform  : ${process.platform} ${process.arch}`,
    `node      : ${process.version}`,
    `session   : ${session ? session.steps.length + ' steps, schema ' + session.schemaVersion : 'none'}`,
    `preview   : ${server.running ? 'running on ' + server.port : 'stopped'}`,
    '',
    'No prompts, file paths or workspace contents are included.'
  ].join('\n');
  await vscode.env.clipboard.writeText(report);
  void vscode.window.showInformationMessage(vscode.l10n.t('Diagnostic report copied to the clipboard.'));
}
