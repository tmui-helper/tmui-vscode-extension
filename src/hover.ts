// 导入vscode模块
import * as vscode from 'vscode';
import { bigCamelCase } from './utils';
import { getComponentDesc, getComponentLink } from './tmui/componentMap';
import { LINK_REG, LANGUAGE_IDS, LINK_COMPONENT_COMMON_PROPS } from './constant';

// 定义输出组件Markdown文档的方法
export const renderComponentMd = async (componentName: string) => {
	let markdownString = '';

	// 获取组件的文档内容
	const doc = await getComponentDesc(bigCamelCase(componentName));

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
	markdownString += `${desc}  [文档原文](${getComponentLink(bigCamelCase(componentName))})\n\n`;
	// 组装组件的属性列表
	markdownString += `### 属性\n\n`;
	// 组装组件的属性描述
	markdownString += `本组件含有公共属性 [公共属性](${LINK_COMPONENT_COMMON_PROPS})\n\n`;
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
 * 注册悬停提示
 * @param context 上下文
 */
export const registerHover = (context: vscode.ExtensionContext) => {
    /**
     * 提供悬停提示 
     * @param document 
     * @param position 
     * @param token 
     * @returns 
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
    
            md.value = await renderComponentMd(components[0]);
    
            return new vscode.Hover(md);
        }
    
        // 返回null，表示不显示悬停提示
        return null;
    };

    context.subscriptions.push(vscode.languages.registerHoverProvider(LANGUAGE_IDS, {
        provideHover
    }));
};