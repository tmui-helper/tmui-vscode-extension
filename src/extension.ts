// 引入vscode模块，提供vscode扩展开发的API
import * as vscode from 'vscode';
// 引入path模块，提供路径处理功能
import * as path from 'path';
// 导入工具类
import { firstUpperCase } from './utils';
// 定义组件库配置
import { componentMap, getComponentDesc } from './tmui/componentMap';

const files = ['vue', 'nvue', 'javascript', 'typescript'];
const LINK_REG = /(?<=<tm-)([\w-]+)/g;
const LINK_COMPONENT_COMMON_PROPS = 'https://tmui.design/spec/组件公共样式.html';

// 定义输出组件Markdown文档的方法
const renderComponentMd = async (componentName: string) => {
	let markdownString = '';

	// 获取组件的文档内容
	const doc = await getComponentDesc(componentName);

	// 获取组件的标题
	// const title = componentMap[componentName].title;
	const title = doc.title;
	// 获取组件的描述
	// const desc = componentMap[componentName].desc;
	const desc = doc.desc;
	// 获取组件的属性描述
	// const propsDesc = componentMap[componentName].props.desc;
	const propsDesc = doc.props.desc;
	// 获取组件的属性列表
	// const props = componentMap[componentName].props;
	const props = doc.props.table;
	// 获取组件的事件列表
	// const events = componentMap[componentName].events;
	const events = doc.events.table;
	// 获取组件的事件描述
	const eventsDesc = doc.events.desc;
	// 获取组件的插槽列表
	// const slots = componentMap[componentName].slots;
	const slots = doc.slots.table;
	// 获取组件的插槽描述
	const slotsDesc = doc.slots.desc;
	// 获取组件的ref列表
	// const refs = componentMap[componentName].refs;
	const refs = doc.refs.table;
	// 获取组件的ref描述
	const refsDesc = doc.refs.desc;

	// 组装组件的标题
	markdownString += `## ${title}\n\n`;
	// 组装组件的描述
	markdownString += `${desc}\n\n`;
	// 组装组件的属性列表
	markdownString += `### 属性\n\n`;
	// 组装组件的属性描述
	markdownString += `${propsDesc}\n\n`;
	// 判断组件是否有属性
	if (props.length) {
		// 组装组件的属性列表
		markdownString += `|属性名|类型|默认值|说明|\n`;
		markdownString += `|---|---|---|---|\n`;
		props.forEach((item) => {
			markdownString += `|${item.name}|${item.type}|${item.default}|${item.desc}|\n`;
		});
		markdownString += `\n`;
	}
	// 组装组件的事件列表
	markdownString += `### 事件\n\n`;
	// 组装组件的事件描述
	markdownString += `${eventsDesc}\n\n`;
	// 判断组件是否有事件
	if (events.length) {
		markdownString += `|事件名|参数|返回数据|描述|\n`;
		markdownString += `|---|---|---|---|\n`;
		events.forEach((item) => {
			markdownString += `|${item.name}|${item.data}|${item.cb}|${item.desc}|\n`;
		});
		markdownString += `\n`;
	}
	// 组装组件的插槽列表
	markdownString += `### slot插槽\n\n`;
	// 组装组件的插槽描述
	markdownString += `${slotsDesc}\n\n`;
	// 判断组件是否有插槽
	if (slots.length) {
		markdownString += `|插槽名|数据|类型|描述|\n`;
		markdownString += `|---|---|---|---|\n`;
		slots.forEach((item) => {
			markdownString += `|${item.name}|${item.data}|${item.type}|${item.desc}|\n`;
		});
		markdownString += `\n`;
	}
	// 组装组件的ref列表
	markdownString += `### Refs\n\n`;
	// 组装组件的ref描述
	markdownString += `${refsDesc}\n\n`;
	// 判断组件是否有ref
	if (refs.length) {
		markdownString += `|方法名|参数|返回值|描述|\n`;
		markdownString += `|---|---|---|---|\n`;
		refs.forEach((item) => {
			markdownString += `|${item.name}|${item.data}|${item.cb}|${item.desc}|\n`;
		});
		markdownString += `\n`;
	}

	// 返回组件的Markdown文档
	return markdownString;
};

/**
 * 提供鼠标悬停提示 
 * @param document The document
 * @param position The position 
 * @param token A cancellation token. 
 */
const provideHover = async (document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) => {
	// 获取当前光标所在的行
	const line = document.lineAt(position);
	const componentLink = line.text.match(LINK_REG) ?? [];
	const components = [...new Set([...componentLink])];

	if (components.length) {

		const md = new vscode.MarkdownString();
		md.isTrusted = true;
		md.supportHtml = true;

		md.value = await renderComponentMd(firstUpperCase(components[0]));

		return new vscode.Hover(md);
	}

	return new vscode.Hover('未找到组件');
};

/**
 * 提供组件名代码提示功能
 */
const provideCompletionItems = () => {
	const completionItems: vscode.CompletionItem[] = [];
	completionItems.push(
		new vscode.CompletionItem('tm-button', vscode.CompletionItemKind.Field)
	);

	return completionItems;
};

/**
 * 根据鼠标选中的组件名候选词，回车后自动补全组件的完整标签，如tm-button，自动补全为<tm-button></tm-button>
 */
const resolveCompletionItem = (item: vscode.CompletionItem) => {
	const name = item.label;
	const insertText = new vscode.SnippetString(`<${name}>\t$1</${name}>`);
	item.insertText = insertText;

	return item;
};


/**
 * 激活扩展程序
 */
export async function activate(context: vscode.ExtensionContext) {
	// 创建一个CompletionProvider，提供代码补全功能
	// 获取组件库的配置文件
	let provider = vscode.languages.registerCompletionItemProvider(
		// 指定提供自动补全的语言，*表示所有语言，也可以单独指定如：'javascript'，'typescript'等，可在命令面板中输入Configure Language Specific Settings进行设置
		files,
		{
			async provideCompletionItems(document, position, token, context) {
				// 获取当前编辑器选中的文本
				let text = document.getText();
				// 获取当前光标所在的行
				let line = position.line;
				// 获取当前光标所在的列
				let column = position.character;
				// 获取当前光标所在的单词
				let word = document.getWordRangeAtPosition(position);
				// 获取当前光标所在的单词的字符串
				let wordText = document.getText(word);
				// 定义一个空数组，用于存放候选项
				let items: vscode.CompletionItem[] = [];
				// 判断当前光标是否在<template>标签内
				if (text.includes('<template>')) {
					// 判断当前光标是否在<tm-开头的标签内
					if (text.match(/<tm-[\w-]*$/)) {
						// 读取tmui3.0组件库的配置文件
						let config = await vscode.workspace.openTextDocument(
							// 假设配置文件在项目根目录下的tmui3.0.json文件中
							path.join(`${vscode.workspace.rootPath}`, 'src', 'tmui', 'config.json'),
						);
						console.log(config);
						// 解析配置文件
						let data = JSON.parse(config.getText());
						// 遍历配置文件中的组件
						for (let key in data) {
							// 创建一个CompletionItem，用于提供代码补全的候选项
							let item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Snippet);
							// 设置候选项的插入文本，即组件的完整标签名，这里用${1}、${2}等占位符表示光标的初始位置
							item.insertText = new vscode.SnippetString(`<tm-${key}>\n\t$1\n</tm-${key}>`);
							// 设置候选项的详情，即组件的描述信息
							item.detail = data[key].description;
							// 设置候选项的文档，即组件的使用文档
							item.documentation = new vscode.MarkdownString(
								`[查看文档](https://tmui.design/com/${data[key].name}).html`,
							);
							// 将候选项添加到数组中
							items.push(item);
						}
					}
				}

				// 返回所有候选项
				return items;
			}
		},
		// 指定自动补全的字符，这里表示遇到<, :, @时就触发自动补全
		'<',
		':',
		'@'
	);

	// 将CompletionProvider注册到扩展程序上下文中
	context.subscriptions.push(
		vscode.languages.registerHoverProvider(files, { provideHover }), 
		vscode.languages.registerCompletionItemProvider(files, { provideCompletionItems, resolveCompletionItem })
	);
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "helloworld-sample" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello TMUI3.1.09!!');
	});

	context.subscriptions.push(disposable);
}

// 定义一个deactivate方法，当插件停用时会被调用
export function deactivate() { }