const vscode = require('vscode');
function activate(context) {
	const disposable = vscode.commands.registerCommand('extension.solidityHelper.rm-comments', function () {
		vscode.window.activeTextEditor.edit(editBuilder => {
			const text = vscode.window.activeTextEditor.document.getText();
			let code = removeCodeComments(text)
			const end = new vscode.Position(vscode.window.activeTextEditor.document.lineCount + 1, 0);
			editBuilder.replace(new vscode.Range(new vscode.Position(0, 0), end), code);
			vscode.commands.executeCommand(`editor.action.formatDocument`);
		});
	});
	context.subscriptions.push(disposable);
}

function deactivate() { }

function removeCodeComments(code) {
    let inQuoteChar = null;
    let inBlockComment = false;
    let inLineComment = false;
    let inRegexLiteral = false;
    let newCode = '';
    for (let i=0; i<code.length; i++) {
        if (!inQuoteChar && !inBlockComment && !inLineComment && !inRegexLiteral) {
            if (code[i] === '"' || code[i] === "'" || code[i] === '`') {
                inQuoteChar = code[i];
            }
            else if (code[i] === '/' && code[i+1] === '*') {
                inBlockComment = true;
            }
            else if (code[i] === '/' && code[i+1] === '/') {
                inLineComment = true;
            }
            else if (code[i] === '/' && code[i+1] !== '/') {
                inRegexLiteral = true;
            }
        }
        else {
            if (inQuoteChar && ((code[i] === inQuoteChar && code[i-1] != '\\') || (code[i] === '\n' && inQuoteChar !== '`'))) {
                inQuoteChar = null;
            }
            if (inRegexLiteral && ((code[i] === '/' && code[i-1] !== '\\') || code[i] === '\n')) {
                inRegexLiteral = false;
            }
            if (inBlockComment && code[i-1] === '/' && code[i-2] === '*') {
                inBlockComment = false;
            }
            if (inLineComment && code[i] === '\n') {
                inLineComment = false;
            }
        }
        if (!inBlockComment && !inLineComment) {
            newCode += code[i];
        }
    }
    return newCode;
}

module.exports = {
	activate,
	deactivate
}
