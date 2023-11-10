import { ComponentDesc } from './componentDesc';
import axios from 'axios';

const LINK_COMPONENT_COMMON_PROPS = 'https://tmui.design/spec/组件公共样式.html';

/**
 * 获取组件名
 * @param componentName 组件名
 */
export const getComponentName = (componentName: string) => {
    // 部分组件名需要特殊处理
    switch (componentName) {
        case 'GridItem':
            componentName = 'Grid';
            break;
        case 'Col':
            componentName = 'Row';
            break;
        case 'CollapseItem':
            componentName = 'Collapse';
            break;
        case 'DescriptionsItem':
            componentName = 'Descriptions';
            break;
        case 'ImageGroup':
            componentName = 'Image';
            break;
        case 'IndexesItem':
            componentName = 'Indexes';
            break;
        case 'TabsPane':
            componentName = 'Tabs';
            break;
        case 'TimelineItem':
            componentName = 'Timeline';
            break;
        case 'WaterfallItem':
            componentName = 'Waterfall';
            break;
        case 'CheckboxGroup':
            componentName = 'Checkbox';
            break;
        case 'CalendarView':
            componentName = 'Calendar';
            break;
        case 'CityCascader':
            componentName = 'City';
            break;
        case 'CityPicker':
            componentName = 'City';
            break;
        case 'FormItem':
            componentName = 'Form';
            break;
        case 'RadioGroup':
            componentName = 'Radio';
            break;
        case 'TimeView':
            componentName = 'Time';
            break;
        case 'TimePicker':
            componentName = 'Time';
            break;
        case 'SkeletonLine':
            componentName = 'Skeleton';
            break;
        case 'StepsItem':
            componentName = 'Steps';
            break;
        case 'TabbarItem':
            componentName = 'Tabbar';
            break;
        case 'FilterMenuItem':
            componentName = 'FilterMenu';
            break;
        default:
            componentName = componentName;
    };
    return componentName;
};

/**
 * 获取组件链接
 */
export const getComponentLink = (componentName: string) => {
    return `https://tmui.design/com/${getComponentName(componentName)}.html`;
};

/**
 * 通过axios获取组件的文档内容
 * @param componentName 组件名
 */
const getComponentDoc = async (componentName: string) => {
    const url = getComponentLink(componentName);
    const res = await axios.get(url);
    return res.data;
};

/**
 * 通过cheerio解析文档内容，获取组件的属性参数
 * @param doc 组件文档内容
 * @param componentName 组件名
 */
const parseComponentProps = (doc: string) => {
    const cheerio = require('cheerio');
    const $ = cheerio.load(doc);
    const props: any[] = [];
    let $props = $('#参数').next().next().find('tbody tr');
    // 有些组件的参数表格在下一个兄弟节点
    if ($props.length === 0) {
        $props = $('#参数').next().next().next().find('tbody tr');
    }
    $props.each((i: any, el: any) => {
        const $tds = $(el).find('td');
        let name = $tds.eq(0).html();
        // 替换class含有VPBadge的span标签，将其替换为markdown的代码块
        name = name.replace(/<span class="VPBadge .*" .*>.*<\/span>/g, ` \`${$(el).find('td:nth-child(1) span.VPBadge').text()}\``);
        const type = $tds.eq(1).text();
        const def = $tds.eq(2).text();
        const desc = $tds.eq(3).html() || '';
        props.push({ name, type, default: def, desc });
    });
    return props;
};

/**
 * 获取组件的参数列表
 * @param componentName 组件名
 */
export const getComponentProps = async (componentName: string) => {
    const doc = await getComponentDoc(componentName);
    const props = parseComponentProps(doc);
    return props;
};

/**
 * 通过cheerio解析文档内容，获取组件的事件参数
 * @param doc 组件文档内容
 * @param componentName 组件名
 */
const parseComponentEvents = (doc: string) => {
    const cheerio = require('cheerio');
    const $ = cheerio.load(doc);
    const events: any[] = [];
    let $events = $('h2:contains("事件")').next().find('tr');
    // 有些组件的事件表格在下一个兄弟节点
    if ($events.length === 0) {
        $events = $('h2:contains("事件")').next().next().find('tr');
    }
    $events.each((i: any, el: any) => {
        const $tds = $(el).find('td');
        const name = $tds.eq(0).text();
        const data = $tds.eq(1).text();
        const cb = $tds.eq(2).text();
        const desc = $tds.eq(3).html() || '';
        events.push({ name, data, cb, desc });
    });
    return events;
};

/**
 * 获取组件的事件列表
 * @param componentName 组件名
 */
export const getComponentEvents = async (componentName: string) => {
    const doc = await getComponentDoc(componentName);
    const events = parseComponentEvents(doc);
    return events;
};

/**
 * 通过cheerio解析文档内容，获取组件的插槽参数
 * @param doc 组件文档内容
 * @param componentName 组件名
 */
const parseComponentSlots = (doc: string) => {
    const cheerio = require('cheerio');
    const $ = cheerio.load(doc);
    const slots: any[] = [];
    let $slots = $('h2:contains("slot插槽")').next().find('tr');
    // 有些组件的插槽表格在下一个兄弟节点
    if ($slots.length === 0) {
        $slots = $('h2:contains("slot插槽")').next().next().find('tr');
    }
    $slots.each((i: any, el: any) => {
        const $tds = $(el).find('td');
        const name = $tds.eq(0).text();
        const desc = $tds.eq(1).text();
        const data = $tds.eq(2).text();
        const type = $tds.eq(3).html() || '';
        slots.push({ name, desc, data, type });
    });
    return slots;
};

/**
 * 获取组件的插槽列表
 * @param componentName 组件名
 */
export const getComponentSlots = async (componentName: string) => {
    const doc = await getComponentDoc(componentName);
    const slots = parseComponentSlots(doc);
    return slots;
};

/**
 * 通过cheerio解析文档内容，获取组件的ref参数
 * @param doc 组件文档内容
 * @param componentName 组件名
 */
const parseComponentRefs = (doc: string) => {
    const cheerio = require('cheerio');
    const $ = cheerio.load(doc);
    const refs: any[] = [];
    let $refs = $('h2:contains("ref方法")').next().find('tr');
    // 有些组件的ref表格在下一个兄弟节点
    if ($refs.length === 0) {
        $refs = $('h2:contains("ref方法")').next().next().find('tr');
    }
    $refs.each((i: any, el: any) => {
        const $tds = $(el).find('td');
        const name = $tds.eq(0).text();
        const data = $tds.eq(1).text();
        const cb = $tds.eq(2).text();
        const desc = $tds.eq(3).html() || '';
        refs.push({ name, data, cb, desc });
    });
    return refs;
};

/**
 * 获取组件的ref列表
 * @param componentName 组件名
 */
export const getComponentRefs = async (componentName: string) => {
    const doc = await getComponentDoc(componentName);
    const refs = parseComponentRefs(doc);
    return refs;
};

/**
 * 通过cheerio解析文档内容，获取组件的属性、事件、插槽、引用
 * @param doc 组件文档内容
 * @param componentName 组件名
 */
const parseComponentDoc = async (doc: string, componentName: string) => {
    const cheerio = require('cheerio');
    const $ = cheerio.load(doc);
    const componentDesc: ComponentDesc = {
        name: componentName,
        title: $('h1').text(),
        desc: $('h1').next().text(),
        props: {
            desc: `本组件含有公共属性 [公共属性](${LINK_COMPONENT_COMMON_PROPS})`,
            table: [],
        },
        events: {
            desc: '',
            table: [],
        },
        slots: {
            desc: '',
            table: [],
        },
        refs: {
            desc: '',
            table: [],
        },
    };
    componentDesc.props.table = await getComponentProps(componentName);
    // 获取组件属性的描述
    const propsDesc = $('#参数').next('p').html();
    componentDesc.props.desc = propsDesc || '';

    componentDesc.events.table = await getComponentEvents(componentName);
    // 获取组件事件的描述
    const eventsDesc = $('h2:contains("事件")').next('p').html();
    componentDesc.events.desc = eventsDesc || '';

    componentDesc.slots.table = await getComponentSlots(componentName);
    // 获取组件插槽的描述
    const slotsDesc = $('h2:contains("slot插槽")').next('p').html();
    componentDesc.slots.desc = slotsDesc || '';

    componentDesc.refs.table = await getComponentRefs(componentName);
    // 获取组件ref的描述
    const refsDesc = $('h2:contains("ref方法")').next('p').html();
    componentDesc.refs.desc = refsDesc || '';

    return componentDesc;
};

/**
 * 获取组件的描述信息
 * @param componentName 组件名
 */
export const getComponentDesc = async (componentName: string) => {
    const doc = await getComponentDoc(componentName);
    const componentDesc = await parseComponentDoc(doc, componentName);
    return componentDesc;
};

export const componentMap: Record<string, ComponentDesc> = {
    'button': {
        name: 'button',
        title: '按钮 Button',
        desc: '常用组件按钮。',
        props: {
            desc: `本组件含有公共属性 [公共属性](${LINK_COMPONENT_COMMON_PROPS})`,
            table: [
                {
                    name: 'transparent',
                    type: 'Boolean',
                    default: 'false',
                    desc: '是否透明',
                },
                {
                    name: 'followTheme',
                    type: 'Boolean',
                    default: 'true',
                    desc: '是否跟随全局主题',
                },
                {
                    name: 'size',
                    type: 'String',
                    default: `'normal'`,
                    desc: '按钮尺寸:`mini`,`small`,`normal`,`middle`,`large`',
                },
                {
                    name: 'fontSize',
                    type: 'Number',
                    default: '0',
                    desc: '按钮文字大小，单位rpx',
                },
                {
                    name: 'fontColor `v3.0.63+`',
                    type: 'String',
                    default: `''`,
                    desc: '按钮文字/图标主题色，默认为空，自动配色',
                },
                {
                    name: 'margin',
                    type: '`ArrayasPropType<Array<number>>`',
                    default: '`()=>[0,16]`',
                    desc: '外间距[x,y]x=左右，y=上下',
                },
                {
                    name: 'padding',
                    type: '`ArrayasPropType<Array<number>>`',
                    default: '`()=>[0,0]`',
                    desc: '内间距[x,y]x=左右，y=上下',
                },
                {
                    name: 'shadow',
                    type: 'Number',
                    default: '2',
                    desc: '投影,0-25',
                },
                {
                    name: 'width',
                    type: 'Number',
                    default: '0',
                    desc: '按钮宽度，单位rpx',
                },
                {
                    name: 'height',
                    type: 'Number',
                    default: '0',
                    desc: '按钮高度，单位rpx',
                },
                {
                    name: 'block',
                    type: 'Boolean',
                    default: 'false',
                    desc: '使用按钮宽度自动100%',
                },
                {
                    name: 'round',
                    type: 'Number',
                    default: '3',
                    desc: '圆角-1-25，单位rpx，如果想去除按钮圆角，请设置为-1',
                },
                {
                    name: 'loading',
                    type: 'Boolean',
                    default: 'false',
                    desc: '使按钮加载状态，其它事件不会触发',
                }
            ]
        },
        events: {
            desc: '',
            table: [],
        },
        slots: {
            desc: '',
            table: [],
        },
        refs: {
            desc: '',
            table: [],
        },
        // events: [
        //     {
        //         name: 'click',
        //         desc: '点击事件'
        //     }
        // ],
        // slots: [
        //     {
        //         name: 'default',
        //         desc: '按钮内容'
        //     }
        // ],
        // refs: [],
    },
};