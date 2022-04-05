// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as formatter from './tools/json';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "mtool" is now active!');

	let disposable = vscode.commands.registerCommand('mtool.logFormat', () => {
		const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			console.log('No active');
			return;
		}
		
		activeEditor.edit(editBuilder => {
			const fullRange = getDocumentFullRange(activeEditor.document);
			const rawText = getRawText(activeEditor.document, fullRange);

			const content = rawText.trim();
			if (!content) {
				vscodeWarningMessage('content is null, return');
				return;
			}

			let replace: string;
			try {
				replace = formatLog(content);
			} catch (err) {
				vscodeWarningMessage((<Error>err).message.toString());
				return;
			}

			editBuilder.replace(fullRange, replace);
		    // vscode.window.showInformationMessage('Log format ok!');
		});
	});

	context.subscriptions.push(disposable);
}

function getDocumentFullRange(document: vscode.TextDocument): vscode.Range { 
	const start = new vscode.Position(0, 0);
	const end = new vscode.Position(document.lineCount + 1, 0);
	return new vscode.Range(start, end);
}

function getRawText(document: vscode.TextDocument, fullRange: vscode.Range): string {
	// const formatJson = formatJSONDocument(document, fullRange);
	return document.getText(fullRange);
}

function formatJSONDocument(document: vscode.TextDocument, fullRange: vscode.Range): string {
	let rawText: string = document.getText(fullRange);

	return rawText;
}

function vscodeWarningMessage(errorStr: string) {
	vscode.window.showWarningMessage(errorStr);
}

// this method is called when your extension is deactivated
function deactivate() {
	console.log('your extension "mtool" is now deactivated');
}

const beautify = (content: string) => {
    return formatter.beautify(content);
};


function formatLog(content: string): string {
	let replace = "";
	const contentList = content.split('\n');
	for (var i=0; i < contentList.length; i++) {
		// 1. 解析成对象
		const obj = JSON.parse(contentList[i]);
		
		// 2. json格式化
		const beautifyData = beautify(contentList[i]);

		// 3. 添加时间和日志等级前缀
		replace += addLogTimeAndLevel(obj, beautifyData);

		// 4. 添加特殊的解析功能
		replace += addRequestBody(obj);
		replace += addResponseBody(obj);
		replace += addPushBody(obj);
	}

	return replace;
}

function addLogTimeAndLevel(obj: any, beautifyData: string) {
	let replace = '';
	const beautifyDataList = beautifyData.split('\n');
	for (var j = 0; j < beautifyDataList.length; j++) {
		let time = '';
		let logLevel = '';
		if (obj['time'] === undefined) {
			time = '[time]';
		} else {
			time = obj['time'];
		}

		if (obj['log.level'] === undefined) {
			logLevel = '[level]';
		} else {
			logLevel = obj['log.level'];
		}
		replace += time + ':' + logLevel + ':' + '\t\t\t' + beautifyDataList[j] + '\r\n';
	}
	return replace;
}

function addRequestBody(obj: any): string {
	return addSpecialFieldParse(obj, 'http.request.body.content', 'Request body');
}

function addResponseBody(obj: any): string {
	return addSpecialFieldParse(obj, 'http.response.body.content', 'Response body');
}

function addPushBody(obj: any): string {
	return addSpecialFieldParse(obj, 'push.content', 'Push body');
}

function addSpecialFieldParse(obj: any, fieldName: string, formatName: string): string {
	const kg = "\t\t\t\t\t\t\t\t";
	const kgb = kg + "\t\t\t";

	let replace = kg + formatName + ':\n';
	const requestBody = obj[fieldName];
	if (!requestBody) {
		return "";
	}
	
	try {
		const beautifyData = beautify(requestBody);
		const beautifyDataList = beautifyData.split('\n');
		for (var i=0; i < beautifyDataList.length; i++) {
			replace += kgb + beautifyDataList[i] + "\n";
		}
	} catch (error) {
		console.log(error);
		return "";
	}

	return replace;
}
