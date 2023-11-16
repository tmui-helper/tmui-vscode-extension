// 导入vscode模块
import * as vscode from 'vscode';
import { bigCamelCase } from './utils';
import { getComponentDesc, getComponentLink, componentMap } from './tmui/componentMap';
import { LINK_REG, LANGUAGE_IDS, LINK_COMPONENT_COMMON_PROPS } from './constant';

// 定义输出组件Markdown文档的方法
export const renderComponentMd = async (componentName: string) => {
	let markdownString = '';

	// 获取组件的文档内容
	// const doc = await getComponentDesc(bigCamelCase(componentName));
	const doc = componentMap[componentName];

	// 获取组件的标题
	// const title = componentMap[componentName].title;
	const title = doc.title;
	// 获取组件的描述
	// const desc = componentMap[componentName].desc;
	const desc = doc.desc;
	// 获取组件的兼容性描述
	const compalicity = componentMap[componentName].compalicity;
	// 获取组件的文档链接
	const docLink = componentMap[componentName].doc;
	// 获取组件的属性描述
	// const propsDesc = componentMap[componentName].props.desc;
	// const propsDesc = doc.props.desc;
	// 获取组件的属性列表
	// const props = componentMap[componentName].props;
	const props = doc.propsList;
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
	markdownString += `${desc}  [文档原文](${docLink})\n\n`;
	if (doc.demoCode && doc.demoCode()?.length) {
		// 示例代码
		markdownString += `### 示例代码【由于vscode markdown字符串字数限制，有些示例代码过长会显示不完，请查看[文档原文](${docLink})】\n\n`;
		// 增加markdown的代码块折叠/展开功能
		markdownString += `<details>\n`;
		markdownString += `\t<summary>点击折叠/展开</summary>\n\n`;
		markdownString += doc.demoCode();
		markdownString += `</details>\n\n`;
	}
	// 组装组件的兼容性描述
	markdownString += `### 兼容性\n\n`;
	// 组装组件的兼容性列表
	markdownString += `|APP-VUE|APP-NVUE|小程序|WEB/H5|VUE3/TS\n`;
	markdownString += `|---|---|---|---|---|\n`;
	markdownString += `|${compalicity!.appVue}|${compalicity!.appNvue}|${compalicity!.mp}|${compalicity!.web}|${compalicity!.vue3}|\n\n`;
	// 遍历组件的属性列表
	if (props?.length) {
		props.forEach((item) => {
			markdownString += `### ${item.title}\n\n`;
			markdownString += `${item.desc}\n\n`;
			markdownString += `|属性名|类型|默认值|说明|\n`;
			markdownString += `|---|---|---|---|\n`;
			item.table.forEach((item) => {
				// 判断属性是否有版本要求
				const minVersion = item.minVersion ? `\`${item.minVersion}\`` : '';
				markdownString += `|${item.name}${minVersion}|${item.type}|\`${item.default}\`|${item.desc}|\n`;
			});
		});
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

	if (doc.refs.demoCode && doc.refs.demoCode()?.length) {
		// 示例代码
		markdownString += `#### Refs示例代码\n\n`;
		// 这里不需要折叠，测试发现折叠功能无故失效
		// 增加markdown的代码块折叠/展开功能
		// markdownString += `<details>\n`;
		// markdownString += `\t<summary>点击折叠/展开</summary>\n\n`;
		// markdownString += `\n`;
		markdownString += doc.refs.demoCode();
		// markdownString += `\n`;
		// markdownString += `</details>\n\n`;
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