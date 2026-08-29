import * as vscode from 'vscode';
import type { Session, Step } from '../refine/session.js';

/**
 * The Activity Bar view. Shows the prompt stack, so the extension has a
 * permanent home rather than living only in the command palette.
 *
 * Each step is a row you can tick off and on; the site re-resolves from the
 * enabled steps, which is the same contract the Studio panel offers.
 */
export class StackView implements vscode.TreeDataProvider<Row> {
  private readonly emitter = new vscode.EventEmitter<Row | undefined>();
  readonly onDidChangeTreeData = this.emitter.event;

  constructor(private getSession: () => Session | null) {}

  refresh(): void {
    this.emitter.fire(undefined);
  }

  getTreeItem(row: Row): vscode.TreeItem {
    return row;
  }

  getChildren(): Row[] {
    const session = this.getSession();
    if (!session || !session.steps.length) {
      const empty = new Row(vscode.l10n.t('No site open'), vscode.TreeItemCollapsibleState.None);
      empty.description = vscode.l10n.t('Run Generate to start');
      empty.iconPath = new vscode.ThemeIcon('lightbulb');
      empty.command = { command: 'promptToWebsite.generate', title: vscode.l10n.t('Generate') };
      return [empty];
    }
    return session.steps.map((s, i) => stepRow(s, i));
  }
}

class Row extends vscode.TreeItem {}

function stepRow(step: Step, index: number): Row {
  const row = new Row(step.text, vscode.TreeItemCollapsibleState.None);
  row.id = String(step.id);
  row.description = String(index + 1);
  row.tooltip = new vscode.MarkdownString(
    (step.enabled ? '**Step ' : '**Step (off) ') + (index + 1) + '**\n\n' + step.text +
    '\n\n_Click to ' + (step.enabled ? 'disable' : 'enable') + '._'
  );
  // A ticked box reads as "counted"; an empty one as "skipped". Both states are
  // legible without relying on colour.
  row.iconPath = new vscode.ThemeIcon(step.enabled ? 'pass-filled' : 'circle-large-outline');
  row.contextValue = step.enabled ? 'stepEnabled' : 'stepDisabled';
  row.command = {
    command: 'promptToWebsite.toggleStep',
    title: vscode.l10n.t('Toggle step'),
    arguments: [step.id]
  };
  return row;
}
