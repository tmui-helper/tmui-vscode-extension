// 引入vscode模块，提供vscode扩展开发的API
import * as vscode from 'vscode';
// 引入鼠标悬停提示的服务
import { registerHover } from './hover';
// 引入自动补全的服务
import { registerCompletions } from './completions';
// 引入命令的服务
import { registerCommands } from './commands';

/**
 * 激活扩展程序
 */
export async function activate(context: vscode.ExtensionContext) {
	// console.log('Congratulations, your extension "helloworld-sample" is now active!');
	registerHover(context);
	registerCompletions(context);
	registerCommands(context);
}

// 定义一个deactivate方法，当插件停用时会被调用
export function deactivate() { }