import * as vscode from 'vscode';

/**
 * 首字母大写
 */
export const firstUpperCase = (str: string): string => {
  return str.replace(/^\S/, (s) => s.toUpperCase());
};

/**
 * 中划线转大写驼峰，如tm-button转为TmButton，tm-button-group转为TmButtonGroup，如果没有中划线则首字母大写
 * @param str string
 */
export const hyphenToHump = (str: string): string => {
  return str.replace(/-(\w)/g, (all, letter) => letter.toUpperCase());
};

/**
 * 字符串字母全部小写
 */
export const allLowerCase = (str: string): string => {
  return str.toLowerCase();
};

/**
 * 通过axios获取组件的文档内容
 * @param componentName 组件名
 * @returns 组件的文档内容
 */
export const getComponentDoc = async (
  componentName: string
): Promise<string> => {
  const axios = require("axios");
  const url = `https://tmui.design/com/${firstUpperCase(componentName)}.html`;
  const res = await axios.get(url);
  return res.data;
};

/**
 * 根据axios获取的组件文档内容，获取组件的标题
 */
export const getTitle = async (componentName: string): Promise<string> => {
  const doc = await getComponentDoc(componentName);
  const title = doc.match(/(?<=<title>)([\s\S]*?)(?=<\/title>)/g) || [];
  return `${title[0]}`;
};

/**
 * 判断当前光标是否在组件标签内
 * @param document 文档对象
 * @param position 光标位置
 */
export const isInComponentTag = (
  document: vscode.TextDocument,
  position: vscode.Position
): boolean => {
  // 判断当前光标是否在标签内
  const lineInfo = document.lineAt(position.line);
  const lineText = lineInfo.text.trim();
  const txtArr = lineText.match(/<[^(>/)]+/gim);
  if (txtArr) {
    for (let i = (txtArr.length - 1); i >= 0; i--) {
      if (txtArr[i][0] === '<' && txtArr[i][1] !== '/') {
        return true;
      }
    }
  }
  return false;
};

/**
 * 获取当前光标所在的组件标签
 */
export const getTag = (document: vscode.TextDocument, position: vscode.Position): string => {
  let line = position.line;
  let tag = '';

  while (line >= 0 && !tag) {
    let lineInfo = document.lineAt(line);
    let lineText = lineInfo.text.trim();
    // 本行则获取光标所在的标签
    if (line === position.line) {
      lineText = lineText.substring(0, position.character);
    }
    let txtArr = lineText.match(/<[^(>/)]+/gim);
    if (txtArr) {
      for (let i = (txtArr.length - 1); i >= 0; i--) {
        if (txtArr[i][0] === '<' && txtArr[i][1] !== '/') {
            if (txtArr[i].indexOf(' ') !== -1) {
                tag = txtArr[i].replace(/^<(\S*)(\s.*|\s*)/gi, '$1');
            } else {
                tag = txtArr[i].replace(/^<(.*)/gi, '$1');
            }
            break;
        }
      }
    }
    line--;
  }
  return tag;
};

/**
 * 根据标签名获取组件名，如tm-button获取button
 * @param tag 标签名
 * @returns 组件名
 */
export const getComponentNameByTagName = (tag: string): string => {
  return tag.replace('tm-', '');
};

/**
 * 根据属性名和属性类型拼接vue组件的属性，如果属性名为a，属性类型为string，则拼接为a，如果属性名为a，属性类型不为string，则拼接为:a
 * @param propName 属性名
 * @param propType 属性类型
 * @returns vue组件的属性
 */
export const getVueProp = (propName: string, propType: string): string => {
  return propType === 'string' ? propName : `:${propName}`;
};

/**
 * 判断当前光标是否在组件的属性内
 * @param document 文档对象
 * @param position 光标位置
 * @returns 是否在组件的属性内
 */
export const isInComponentProp = (
  document: vscode.TextDocument,
  position: vscode.Position
): boolean => {
  // 判断当前光标是否在标签内
  const lineInfo = document.lineAt(position.line);
  const lineText = lineInfo.text.trim();
  const txtArr = lineText.match(/<[^(>/)]+/gim);
  if (txtArr) {
    for (let i = (txtArr.length - 1); i >= 0; i--) {
      if (txtArr[i][0] === '<' && txtArr[i][1] !== '/') {
        const tag = txtArr[i].replace(/^<(\S*)(\s.*|\s*)/gi, '$1');
        const componentName = getComponentNameByTagName(tag);
        const propReg = new RegExp(`\\s${componentName}\\.\\S*="\\S*"$`);
        if (propReg.test(lineText)) {
          return true;
        }
      }
    }
  }
  return false;
};

/**
 * 短横线转驼峰，如tm-button转为tmButton，tm-button-group转为tmButtonGroup，如果没有中划线则首字母小写
 * @param str
 * @returns
 */
export const camelCase = (str: string): string => {
  return str.replace(/-(\w)/g, (all, letter) => letter.toUpperCase());
};

/**
 * 转换为大驼峰，如tm-button转为TmButton，tm-button-group转为TmButtonGroup，如果没有中划线则首字母大写
 * @param str 
 * @returns 
 */
export const bigCamelCase = (str: string): string => {
  return camelCase(str).replace(/^\S/, (s) => s.toUpperCase());
};

/**
 * 转中横线，如tmButton转为tm-button，tmButtonGroup转为tm-button-group，如果没有中划线则首字母小写
 * @param str
 * @returns
 */
export const kebabCase = (str: string): string => {
  return str.replace(/([A-Z])/g, '-$1').trim().split(' ').join('-').toLowerCase();
};



/**
 * 根据组件名爬取https://tmui.design官网组件库的组件信息，生成组件库配置
 * @param componentName 组件名
 * @returns 组件库配置
 */
// export const getComponentMap = async (
//   componentName: string
// ): Promise<ComponentDesc> => {
//   // 获取组件的标题
//   const title = await getTitle(componentName);
//   // 获取组件的描述
//   const desc = await getDesc(componentName);
//   // 获取组件的属性描述
//   const propsDesc = await getPropsDesc(componentName);
//   // 获取组件的属性列表
//   const props = await getProps(componentName);
//   // 获取组件的事件列表
//   const events = await getEvents(componentName);
//   // 获取组件的插槽列表
//   const slots = await getSlots(componentName);
//   // 获取组件的ref列表
//   const refs = await getRefs(componentName);

//   return {
//     name: componentName,
//     title,
//     desc,
//     props: {
//       desc: propsDesc,
//       table: props,
//     },
//     events,
//     slots,
//     refs,
//   };
// };