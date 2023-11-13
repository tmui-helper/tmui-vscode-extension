import * as vscode from "vscode";

export const registerCommands = (context: vscode.ExtensionContext) => {
    context.subscriptions.push(
        vscode.commands.registerCommand("tmui-helper.move-cursor", (offset: number) => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const position = editor.selection.active;
                const newPosition = position.with(position.line, position.character + offset);
                const newSelection = new vscode.Selection(newPosition, newPosition);
                editor.selection = newSelection;
            }
        })
    );
};