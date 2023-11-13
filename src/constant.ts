/**
 * 定义鼠标悬停的正则
 */
export const LINK_REG = /(?<=<tm-)([\w-]+)/g;

export const TAG_REG = /(?:<(tm-[\w-]+)[^>/]*)|(?:<(TM[\w-]+)[^>/]*)/g;

/**
 * 定义激活的语言类型
 */
export const LANGUAGE_IDS = ['vue', 'javascript', 'typescript', 'javascriptreact', 'typescriptreact'];

/**
 * 定义组件公共样式的链接
 */
export const LINK_COMPONENT_COMMON_PROPS = encodeURI('https://tmui.design/spec/组件公共样式.html');