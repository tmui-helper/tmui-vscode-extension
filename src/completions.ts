// 导入vscode模块
import * as vscode from 'vscode';
import { firstUpperCase, getTag, getComponentNameByTagName } from './utils';
import { getComponentDesc, getComponentProps } from './tmui/componentMap';
import { LANGUAGE_IDS } from './constant';

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
 * 注册自动补全
 * @param context 上下文
 */
export const registerCompletions = (context: vscode.ExtensionContext) => {
    /**
     * 创建一个用于提供候选项的类，继承自CompletionItemProvider
     */
    class TMCompletionItemProvider implements vscode.CompletionItemProvider {
        /**
         * 提供代码补全的候选项 
         * @param document 
         * @param position 
         * @param token 
         * @returns 
         */
        public async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[]> {
            const completionItems: vscode.CompletionItem[] = [];

            // 获取当前光标所在的单词
            const word = document.getText(document.getWordRangeAtPosition(position));
            // 获取当前光标所在的标签
            const tag = getTag(document, position);
            // 获取组件名
            const componentName = getComponentNameByTagName(tag);
            // 获取组件的属性列表
            const props = await getComponentProps(firstUpperCase(componentName));

            if (props.length) {
                props.forEach((item) => {
                    // 创建一个CompletionItem，用于提供代码补全的候选项
                    const completionItem = new vscode.CompletionItem(item.name, vscode.CompletionItemKind.Field);
                    const labelMd = new vscode.MarkdownString();
                    labelMd.isTrusted = true;
                    labelMd.supportHtml = true;
                    labelMd.value = item.name;
                    // 设置候选项的插入文本，即属性名
                    completionItem.label = (item.type === 'String' || item.type === 'string') ? item.name : `:${item.name}`;
                    // 设置候选项的详情，即属性的类型
                    completionItem.detail = item.type;
                    // 设置候选项的文档，即属性的描述信息
                    const md = new vscode.MarkdownString();
                    md.isTrusted = true;
                    md.supportHtml = true;
                    md.value = item.desc;
                    completionItem.documentation = md;
                    // 将候选项添加到数组中
                    completionItems.push(completionItem);
                });
            }

            return completionItems;
        }

        /**
         * 根据鼠标选中的组件属性候选词，回车后自动补全组件的完整属性，如:tm-button，自动补全为:tm-button=""
         * @param item
         * @param token
         * @returns
         */
        public resolveCompletionItem(item: vscode.CompletionItem): vscode.ProviderResult<vscode.CompletionItem> {
            const insertText = new vscode.SnippetString(`${item.label}="$1"$0`);
            item.insertText = insertText;
            return item;
        }
    }

    // 注册自动补全
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(LANGUAGE_IDS, new TMCompletionItemProvider(), ' '));
};