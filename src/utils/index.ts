/**
 * 首字母大写
 */
export const firstUpperCase = (str: string): string => {
  return str.replace(/^\S/, (s) => s.toUpperCase());
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