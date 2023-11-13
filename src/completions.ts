// 导入vscode模块
import * as vscode from 'vscode';
import { getComponentNameByTagName, isString, kebabCase, bigCamelCase } from './utils';
import { getComponentDesc, getComponentProps, getComponentCommonProps, getComponentEvents } from './tmui/componentMap';
import { LANGUAGE_IDS, TAG_REG } from './constant';

/**
 * 判断是否应该禁用自动补全
 * @param document 文档对象
 * @param position 光标位置
 */
export const shouldDisable = (
  document: vscode.TextDocument,
  position: vscode.Position
): boolean => {
    // 判断当前文档是否为vue文件，如果不是则禁用自动补全
    if (document.languageId !== 'vue') {
        return true;
    }

    const offset = document.offsetAt(position);
    const lastText = document.getText().substring(offset);

    const inAttrRange = lastText.indexOf('>') > -1 && lastText.indexOf('<') === -1;
    const inTemplate = lastText.indexOf('</template>') > -1;

    return inAttrRange || inTemplate;
};

/**
 * 判断是否应该禁用属性自动补全 
 * @param nextText 下一个字符
 * @returns 
 */
export const shouldDisableAttrProvide = (nextText: string, text: string): boolean => {
    if (nextText !== ' ' && nextText !== '\n' && nextText !== '/' && nextText !== '>') {
        return true;
    }

    if (!Array.from(text.matchAll(TAG_REG)).length) {
        return true;
    }

    return false;
};

/**
 * 注册自动补全
 * @param context 上下文
 */
export const registerCompletions = (context: vscode.ExtensionContext) => {
    const attrProvider: vscode.CompletionItemProvider = {
        async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            // 获取当前光标所在文本
            const text = document.getText(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(position.line, position.character)));
            // 获取当前光标的偏移量
            const offset = document.offsetAt(position);
            // 获取当前光标最后的文本
            const lastText = document.getText().substring(offset);
            // 获取当前光标最后的文本的第一个字符
            const nextText = lastText.charAt(0);

            // 判断是否应该禁用属性自动补全
            if (shouldDisableAttrProvide(nextText, text)) {
                return null;
            }

            let name: string = '';
            let lastValue: string = '';
            let startIndex: number = 0;

            for (const matched of text.matchAll(TAG_REG)) {
                name = kebabCase(matched[1] ?? matched[2]);
                lastValue = matched[0];
                startIndex = matched.index!;
            }

            const currentIndex = text.length;
            const endIndex = startIndex! + lastValue!.length;

            if (currentIndex > endIndex || currentIndex < startIndex!) {
                return null;
            }

            // 获取组件名
            const componentName = getComponentNameByTagName(name);
            // 获取组件的属性列表
            const propsArr = await getComponentProps(bigCamelCase(componentName));

            // 已使用的属性名列表
            let usedProps: string[] = [];

            // 获取当前激活的文本编辑器对象
            const editor = vscode.window.activeTextEditor;
            // 判断是否存在激活的文本编辑器
            if (editor) {
                // 获取当前光标的位置
                const position = editor.selection.active;
                // 获取当前光标所在的文本行
                const line = editor.document.lineAt(position);
                // 获取文本行的内容
                const text = line.text;
                // 定义一个正则表达式，匹配所有已使用的属性名
                const regex = /(\w+)\s*=\s*[^=]*$/g;
                // 使用正则表达式测试文本行的内容
                const match = text.match(regex);
                // 判断是否匹配成功
                if (match) {
                    // 获取匹配的属性名
                    usedProps = match;
                }
            }

            const props = propsArr.map((attr) => {
                const item = new vscode.CompletionItem(attr.name, vscode.CompletionItemKind.Field);
                const labelMd = new vscode.MarkdownString();
                labelMd.isTrusted = true;
                labelMd.supportHtml = true;
                labelMd.value = attr.name;
                // 设置候选项的插入文本，即属性名
                item.label = (attr.type === 'String' || attr.type === 'string') ? attr.name : `:${attr.name}`;
                // item.label = name;
                // 设置候选项的详情，即属性的类型
                item.detail = attr.type;
                // 设置候选项的文档，即属性的描述信息
                const md = new vscode.MarkdownString();
                md.isTrusted = true;
                md.supportHtml = true;
                md.value = attr.desc;
                // md.value = `${JSON.stringify(usedProps)}`;
                item.documentation = md;
                item.insertText = attr?.default?.replaceAll("'", '');
                item.sortText = '0';

                return item;
            });

            // 获取组件的公共属性列表
            const commonPropsArr = await getComponentCommonProps();

            const commonProps = commonPropsArr.map((attr) => {
                const item = new vscode.CompletionItem(attr.name, vscode.CompletionItemKind.Field);
                const labelMd = new vscode.MarkdownString();
                labelMd.isTrusted = true;
                labelMd.supportHtml = true;
                labelMd.value = attr.name;
                // 设置候选项的插入文本，即属性名
                item.label = (attr.type === 'String' || attr.type === 'string') ? attr.name : `:${attr.name}`;
                // item.label = name;
                // 设置候选项的详情，即属性的类型
                item.detail = attr.type;
                // 设置候选项的文档，即属性的描述信息
                const md = new vscode.MarkdownString();
                md.isTrusted = true;
                md.supportHtml = true;
                md.value = attr.desc;
                item.documentation = md;
                item.insertText = attr?.default?.replaceAll("'", '');
                item.sortText = '0';

                return item;
            });

            // 获取组件的事件列表
            const eventsArr = await getComponentEvents(bigCamelCase(componentName));

            const hasProps = text.endsWith(" ") || text.endsWith(":");
            const hasEvents = text.endsWith('@');

            const events = eventsArr.map((attr) => {
                const item = new vscode.CompletionItem(attr.name, vscode.CompletionItemKind.Event);
                const labelMd = new vscode.MarkdownString();
                labelMd.isTrusted = true;
                labelMd.supportHtml = true;
                labelMd.value = attr.name;
                // 设置候选项的插入文本，即属性名
                item.label = `@${attr.name}`;
                // 设置候选项的详情，即属性的类型
                item.detail = attr.type;
                // 设置候选项的文档，即属性的描述信息
                const md = new vscode.MarkdownString();
                md.isTrusted = true;
                md.supportHtml = true;
                md.value = attr.desc;
                item.documentation = md;
                item.insertText = "";
                item.sortText = '0';

                return item;
            });

            return [...(hasProps ? props : []), ...(hasProps ? commonProps : []), ...(hasEvents ? events : [])];
        },

        async resolveCompletionItem(item: vscode.CompletionItem): Promise<vscode.CompletionItem | null | undefined> {
            if (!isString(item.label)) {
                item.command = {
                    title: 'tmui-helper.move-cursor',
                    command: 'tmui-helper.move-cursor',
                    arguments: [-1],
                };
                item.insertText = `${item.insertText}=""`;
            } else {
                item.insertText = `${item.label}="${item.insertText}"`;
            }
            return item;
        }
    };

    const attrValueProvider: vscode.CompletionItemProvider = {
        async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            // 获取当前光标所在文本
            const text = document.getText(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(position.line, position.character)));

            let name: string = '';
            let lastValue: string = '';
            let startIndex: number = 0;

            for (const matched of text.matchAll(TAG_REG)) {
                name = kebabCase(matched[1] ?? matched[2]);
                lastValue = matched[0];
                startIndex = matched.index!;
            }

            const currentIndex = text.length;
            const endIndex = startIndex! + lastValue!.length;

            if (currentIndex > endIndex || currentIndex < startIndex!) {
                return null;
            }

            // 获取组件名
            const componentName = getComponentNameByTagName(name);
            // 获取组件的属性列表
            const propsArr = await getComponentProps(bigCamelCase(componentName));

            let propertyName = '';

            // 获取当前激活的文本编辑器对象
            const editor = vscode.window.activeTextEditor;
            // 判断是否存在激活的文本编辑器
            if (editor) {
                // 获取当前光标的位置
                const position = editor.selection.active;
                // 获取当前光标所在的文本行
                const line = editor.document.lineAt(position);
                // 获取文本行的内容
                const text = line.text;
                // 定义一个正则表达式，匹配“=”前的属性名
                const regex = /(\w+)\s*=\s*[^=]*$/;
                // 使用正则表达式测试文本行的内容
                const match = regex.exec(text);
                // 判断是否匹配成功
                if (match) {
                    // 获取匹配的属性名
                    propertyName = match[1];
                }
            }

            const propertyType = propsArr.find((attr) => attr.name === propertyName)?.type;

            const propsValueArr = [];

            // 判断属性类型是否为布尔值
            if (propertyType === 'Boolean' || propertyType === 'boolean') {
                propsValueArr.push({
                    name: 'true',
                    desc: '布尔值true',
                }, {
                    name: 'false',
                    desc: '布尔值false',
                });
            }

            const propsValue = propsValueArr.map((attr) => {
                const item = new vscode.CompletionItem(attr.name, vscode.CompletionItemKind.Value);
                const labelMd = new vscode.MarkdownString();
                labelMd.isTrusted = true;
                labelMd.supportHtml = true;
                labelMd.value = attr.name;
                // 设置候选项的插入文本，即属性名
                item.label = attr.name;
                // 设置候选项的详情，即属性的类型
                item.detail = 'any';
                // 设置候选项的文档，即属性的描述信息
                const md = new vscode.MarkdownString();
                md.isTrusted = true;
                md.supportHtml = true;
                md.value = attr.desc;
                item.documentation = md;
                item.insertText = attr.name;
                item.sortText = '0';

                return item;
            });

            return propsValue;
        },
    };

    // 注册自动补全
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(LANGUAGE_IDS, attrProvider, ' ', '@', ':'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(LANGUAGE_IDS, attrValueProvider, '"', "'", ''));
};