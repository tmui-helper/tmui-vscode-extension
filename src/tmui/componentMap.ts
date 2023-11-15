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
 * 通过cheerio解析文档内容，获取组件的公共属性参数
 * @param doc 组件文档内容
 */
const parseComponentCommonProps = (doc: string) => {
    const cheerio = require('cheerio');
    const $ = cheerio.load(doc);
    const props: any[] = [];
    let $props = $('#组件参数说明').next().find('tbody tr');
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
 * 获取组件的公共参数列表
 */
export const getComponentCommonProps = async () => {
    const { data } = await axios.get(LINK_COMPONENT_COMMON_PROPS);
    const props = parseComponentCommonProps(data);
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
    componentDesc.props!.table = await getComponentProps(componentName);
    // 获取组件属性的描述
    const propsDesc = $('#参数').next('p').html();
    componentDesc.props!.desc = propsDesc || '';

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
    'app': {
        name: 'app',
        title: '应用节点 App',
        desc: '这是所有页面的根节点，请务必在创建页面时把它作为页面的根节点。以后可扩展性非常强。',
        doc: 'https://tmui.design/com/App.html',
        propsList: [
            {
                title: '参数',
                desc: `本组件含有公共属性 [公共属性](${LINK_COMPONENT_COMMON_PROPS})`,
                table: [
                    {
                        name: 'theme',
                        type: 'string',
                        default: '`grey-5`',
                        desc: '当前应用主题(未开放)',
                    },
                    {
                        name: 'bg-img',
                        type: 'string',
                        default: '`https://picsum.photos/750/1448`',
                        desc: 'APP应用的背景图,nvue不支持',
                    },
                    {
                        name: 'color',
                        type: 'string',
                        default: '`grey-4`',
                        desc: '应用的背景颜色,会使子组件文字颜色继承这个主题色（自动计算的文字色，不是主题本身,因此不能设置为透明，否则继承的文字没有颜色）',
                    },
                    {
                        name: 'dark-color',
                        type: 'string',
                        default: '`#050505`',
                        desc: '暗黑时的背景色值，只能是颜色值。',
                        minVersion: 'v3.0.74+',
                    },
                    {
                        name: 'blur',
                        type: 'boolean|string',
                        default: '`false`',
                        desc: '模糊背景(未开放)',
                    },
                    {
                        name: 'navbar',
                        type: 'Object',
                        default: "`{background: '#ffffff',fontColor: '#000000'}`",
                        desc: '标题导航配色(可选)，这里默认是读取你page.json中的配置，如果你没有配置，这里才会起作用。',
                    },
                    {
                        name: 'text',
                        type: 'boolean',
                        default: '`true`',
                        desc: '是否浅色背景,比如white,如果为true它是浅灰，不是白，只有设置为false才是使用原色白',
                    },
                    {
                        name: 'transparent',
                        type: 'boolean',
                        default: '`false`',
                        desc: '是否透明背景',
                    },
                    {
                        name: 'navbar-dark-auto',
                        type: 'boolean',
                        default: '`true`',
                        desc: '是否自动修改系统自带的navbar的暗黑主题，设置false，当切换为暗黑时，不对系统自带的导航条进行设置。',
                    },
                    {
                        name: 'bg-style',
                        type: 'string',
                        default: '-',
                        desc: '背景层的样式，可以用来写背景图尺寸样式等。',
                    }
                ],
            },
        ],
        events: {
            desc: '无',
            table: [],
        },
        slots: {
            desc: '默认default menu 插槽，用来显示覆盖在页面左边弹出层的菜单插槽。具体见demo前页示例。',
            table: [],
        },
        refs: {
            desc: '',
            table: [
                {
                    name: 'set-theme',
                    data: 'colorName: string 主题名称',
                    cb: '无',
                    desc: '设定主题',
                },
                {
                    name: 'set-dark',
                    data: 'dark ? : boolean 是否暗黑',
                    cb: '无',
                    desc: '设定暗黑',
                },
            ],
        },
    },
    'button': {
        name: 'button',
        title: '按钮 Button',
        desc: '常用组件按钮。',
        doc: 'https://tmui.design/com/Button.html',
        propsList: [
            {
                title: '参数',
                desc: `本组件含有公共属性 [公共属性](${LINK_COMPONENT_COMMON_PROPS})`,
                table: [
                    {
                        name: 'transparent',
                        type: 'boolean',
                        default: '`false`',
                        desc: '是否透明',
                    },
                    {
                        name: 'follow-theme',
                        type: '`boolean`',
                        default: '`true`',
                        desc: '是否跟随全局主题',
                    },
                    {
                        name: 'size',
                        type: 'string',
                        default: '`normal`',
                        desc: '按钮尺寸:`mini`,`small`,`normal`,`middle`,`large`',
                    },
                    {
                        name: 'font-size',
                        type: 'number',
                        default: '`0`',
                        desc: '按钮文字大小，单位rpx',
                    },
                    {
                        name: 'font-color',
                        type: 'string',
                        default: '-',
                        desc: '按钮文字/图标主题色，默认为空，自动配色',
                        minVersion: 'v3.0.63+'
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
                        type: 'number',
                        default: '`2`',
                        desc: '投影,0-25',
                    },
                    {
                        name: 'width',
                        type: 'number',
                        default: '`0`',
                        desc: '按钮宽度，单位rpx',
                    },
                    {
                        name: 'height',
                        type: 'number',
                        default: '`0`',
                        desc: '按钮高度，单位rpx',
                    },
                    {
                        name: 'block',
                        type: 'boolean',
                        default: '`false`',
                        desc: '使用按钮宽度自动100%',
                    },
                    {
                        name: 'round',
                        type: 'number',
                        default: '`3`',
                        desc: '圆角-1-25，单位rpx，如果想去除按钮圆角，请设置为-1',
                    },
                    {
                        name: 'loading',
                        type: 'boolean',
                        default: '`false`',
                        desc: '使按钮加载状态，其它事件不会触发',
                    },
                    {
                        name: 'disabled',
                        type: 'boolean',
                        default: '`false`',
                        desc: '是否禁用',
                    },
                    {
                        name: 'url',
                        type: 'string',
                        default: '-',
                        desc: `页面地址，当提供时，点击会跳转到相应页面，必须为绝对路径，不能是'./'开头，是全路径且以'/'开头，比如'/pages/xx'`,
                    },
                    {
                        name: 'label',
                        type: 'string',
                        default: '-',
                        desc: '按钮文字',
                    },
                    {
                        name: 'icon',
                        type: 'string',
                        default: '-',
                        desc: '按钮图标',
                    },
                    {
                        name: 'form-type',
                        type: 'string',
                        default: '-',
                        desc: `submit,reset,本组件额外新增:'filterCancel','filterConfirm',提供此值时，此按钮可以配合form组件用来提交事件表单`,
                    },
                    {
                        name: 'open-type',
                        type: 'string',
                        default: '-',
                        desc: '开放能力，见[见文档](https://uniapp.dcloud.net.cn/component/button.html#open-type-%E6%9C%89%E6%95%88%E5%80%BC)',
                    },
                    {
                        name: 'app-parameter',
                        type: 'string',
                        default: '-',
                        desc: '[见文档](https://uniapp.dcloud.net.cn/component/button.html',
                    },
                    {
                        name: 'session-from',
                        type: 'string',
                        default: '-',
                        desc: '[见文档](https://uniapp.dcloud.net.cn/component/button.html',
                    },
                    {
                        name: 'send-message-title',
                        type: 'string',
                        default: '-',
                        desc: '[见文档](https://uniapp.dcloud.net.cn/component/button.html',
                    },
                    {
                        name: 'send-message-path',
                        type: 'string',
                        default: '-',
                        desc: '[见文档](https://uniapp.dcloud.net.cn/component/button.html',
                    },
                    {
                        name: 'send-message-img',
                        type: 'string',
                        default: '-',
                        desc: '[见文档](https://uniapp.dcloud.net.cn/component/button.html',
                    },
                    {
                        name: 'send-message-card',
                        type: 'string',
                        default: '-',
                        desc: '[见文档](https://uniapp.dcloud.net.cn/component/button.html',
                    },
                    {
                        name: 'disabled-color',
                        type: 'string',
                        default: '`grey-1`',
                        desc: '按钮被禁用时展现的颜色',
                    },
                ]
            },
        ],
        events: {
            desc: '',
            table: [
                {
                    name: 'click',
                    data: '-',
                    cb: '-',
                    desc: '-',
                },
                {
                    name: 'touchstart',
                    data: '-',
                    cb: '-',
                    desc: '-',
                },
                {
                    name: 'touchmove',
                    data: '-',
                    cb: '-',
                    desc: '-',
                },
                {
                    name: 'touchcancel',
                    data: '-',
                    cb: '-',
                    desc: '-',
                },
                {
                    name: 'touchend',
                    data: '-',
                    cb: '-',
                    desc: '-',
                },
                {
                    name: 'tap',
                    data: '-',
                    cb: '-',
                    desc: '-',
                },
                {
                    name: 'longpress',
                    data: '-',
                    cb: '-',
                    desc: '-',
                },
                {
                    name: 'getphonenumber',
                    data: '-',
                    cb: '-',
                    desc: '-',
                },
                {
                    name: 'getuserinfo',
                    data: '-',
                    cb: '-',
                    desc: '[见文档](https://uniapp.dcloud.net.cn/component/button.html#button)',
                },
                {
                    name: 'error',
                    data: '-',
                    cb: '-',
                    desc: '-',
                },
                {
                    name: 'opensetting',
                    data: '-',
                    cb: '-',
                    desc: '[见文档](https://uniapp.dcloud.net.cn/component/button.html#button)',
                },
                {
                    name: 'launchapp',
                    data: '-',
                    cb: '-',
                    desc: '[见文档](https://uniapp.dcloud.net.cn/component/button.html#button)',
                },
                {
                    name: 'contact',
                    data: '-',
                    cb: '-',
                    desc: '[见文档](https://uniapp.dcloud.net.cn/component/button.html#button)',
                }
            ],
        },
        slots: {
            desc: '默认default,为文本内容。这个默认只有非nvue才有用。我不建议用默认插槽来书写按钮文本。原因是不能跨平台，建议使用按钮属性`label`',
            table: [],
        },
        refs: {
            desc: '无',
            table: [],
        },
    },
    'icon': {
        name: 'icon',
        title: '图标 Icon',
        desc: '常用组件图标。',
        doc: 'https://tmui.design/com/Icon.html',
        propsList: [
            {
                title: '参数',
                desc: `本组件含有公共属性 [公共属性](${LINK_COMPONENT_COMMON_PROPS})`,
                table: [
                    {
                        name: 'font-size',
                        type: 'number',
                        default: '`34`',
                        desc: '图标大小',
                    },
                    {
                        name: 'color',
                        type: 'string',
                        default: '-',
                        desc: '图标颜色',
                    },
                    {
                        name: 'name',
                        type: 'string',
                        default: '-',
                        desc: '图标名称',
                    },
                    {
                        name: 'spin',
                        type: 'boolean',
                        default: '`true`',
                        desc: '是否使图标旋转',
                    },
                    {
                        name: 'unit',
                        type: 'string',
                        default: '`rpx`',
                        desc: '字号单位',
                        minVersion: 'v3.0.73+',
                    },
                    {
                        name: 'rotate',
                        type: 'boolean',
                        default: '`true`',
                        desc: '是否允许单独控制图标旋转的角度',
                    },
                    {
                        name: 'rotate-deg',
                        type: 'number',
                        default: '`0`',
                        desc: '图标旋转的角度',
                    },
                    {
                        name: 'customicon',
                        type: 'boolean',
                        default: '`false`',
                        desc: '当你采用自定义图标名称时，请开启此属性',
                    },
                ],
            },
        ],
        events: {
            desc: '',
            table: [
                {
                    name: 'click',
                    data: '-',
                    cb: '-',
                    desc: '点击事件',
                },
                {
                    name: 'longpress',
                    data: '-',
                    cb: '-',
                    desc: '长按事件',
                }
            ],
        },
        slots: {
            desc: '默认default',
            table: [],
        },
        refs: {
            desc: '无',
            table: [],
        },
    },
    'text': {
        name: 'text',
        title: '文本 Text',
        desc: '自带主题和常用属性，能根据全局主题和暗黑自动切换，必须放在tmSheet下，获得更好的主题适应能力。',
        doc: 'https://tmui.design/com/Text.html',
        propsList: [
            {
                title: '参数',
                desc: `本组件含有公共属性 [公共属性](${LINK_COMPONENT_COMMON_PROPS})`,
                table: [
                    {
                        name: 'label',
                        type: 'string|number',
                        default: '-',
                        desc: '文本标签',
                    },
                    {
                        name: 'font-size',
                        type: 'number|string',
                        default: '`28`',
                        desc: '字体大小',
                    },
                    {
                        name: 'color',
                        type: 'string',
                        default: '-',
                        desc: '字体颜色',
                    },
                    {
                        name: 'selectable',
                        type: 'boolean|string',
                        default: '`false`',
                        desc: '是否可选',
                    },
                    {
                        name: 'unit',
                        type: 'number',
                        default: '`rpx`',
                        desc: '字号单位',
                        minVersion: 'v3.0.73+',
                    },
                    {
                        name: 'parent-class',
                        type: 'string',
                        default: '-',
                        desc: '组件的最外层class类,组件内嵌view的class选择器，你可能还需要使用!important来加强自定义选择器的权重',
                    },
                    {
                        name: 'line-height',
                        type: 'number|string',
                        default: '`auto`',
                        desc: '行高',
                    }
                ],
            },
        ],
        events: {
            desc: '',
            table: [
                {
                    name: 'click',
                    data: '-',
                    cb: '-',
                    desc: '点击事件',
                },
            ]
        },
        slots: {
            desc: '默认default',
            table: [],
        },
        refs: {
            desc: '无',
            table: [],
        },
    },
    'divider': {
        name: 'divider',
        title: '分割线 Divider',
        desc: '用于将不同内容的区域进行分割，提高页面美观度和可读性！',
        doc: 'https://tmui.design/com/Divider.html',
        propsList: [
            {
                title: '参数',
                desc: `本组件含有公共属性 [公共属性](${LINK_COMPONENT_COMMON_PROPS})`,
                table: [
                    {
                        name: 'color',
                        type: 'string',
                        default: '`grey-3`',
                        desc: '颜色',
                    },
                    {
                        name: 'vertical',
                        type: 'boolean',
                        default: '`false`',
                        desc: '是否纵向展示',
                    },
                    {
                        name: 'height',
                        type: 'number',
                        default: '`26`',
                        desc: '高度（只有为纵向时起作用。）',
                    },
                    {
                        name: 'show-lable',
                        type: 'boolean',
                        default: '`false`',
                        desc: '当你的label为空时，使用插槽label时，需要这里设置为true,不然插槽无法显示',
                    },
                    {
                        name: 'label',
                        type: 'string',
                        default: '-',
                        desc: '文字内容',
                    },
                    {
                        name: 'font-color',
                        type: 'string',
                        default: '`grey-1`',
                        desc: '文字颜色',
                    },
                    {
                        name: 'font-size',
                        type: 'number',
                        default: '`26`',
                        desc: '字号大小',
                    },
                    {
                        name: 'align',
                        type: 'string',
                        default: '`center`',
                        desc: '文字位置 可选：left,right,center',
                    },
                    {
                        name: 'margin',
                        type: 'number[]',
                        default: '`[16,24]`',
                        desc: '外边距',
                    },
                    {
                        name: 'border',
                        type: 'number',
                        default: '`1`',
                        desc: '分割线粗细',
                    },
                    {
                        name: 'real-color',
                        type: 'boolean',
                        default: '`false`',
                        desc: '是否使用原始色值，未经过处理的颜色值，因黑白灰会被处理，如果不想处理设置此为真即可。',
                        minVersion: 'v3.0.63+',
                    }
                ],
            },
        ],
        events: {
            desc: 'click , 点击横线时触发。',
            table: [
                {
                    name: 'click',
                    data: '-',
                    cb: '-',
                    desc: '点击事件',
                },
            ]
        },
        slots: {
            desc: 'label,文字区域插槽。',
            table: [],
        },
        refs: {
            desc: '无',
            table: [],
        },
    },
    'grid': {
        name: 'grid',
        title: '宫格 Grid',
        desc: '宫格用于把元素进行水平方向分割成等宽区块，是较为常用的布局方式，通常用于页面导航。',
        doc: 'https://tmui.design/com/Grid.html',
        propsList: [
            {
                title: '参数',
                desc: `本组件含有公共属性 [公共属性](${LINK_COMPONENT_COMMON_PROPS})`,
                table: [
                    {
                        name: 'width',
                        type: 'number',
                        default: '`750`',
                        desc: '宽度',
                    },
                    {
                        name: 'col',
                        type: 'number',
                        default: '`5`',
                        desc: '每行的列数',
                    },
                    {
                        name: 'show-border',
                        type: 'boolean',
                        default: '`false`',
                        desc: '是否显示边线',
                    },
                    {
                        name: 'color',
                        type: 'string',
                        default: '`white`',
                        desc: '背景颜色',
                    },
                    {
                        name: 'transprent',
                        type: 'boolean',
                        default: '`false`',
                        desc: '是否透明背景',
                    }
                ],
            },
        ],
        events: {
            desc: '无',
            table: [],
        },
        slots: {
            desc: '注意，它内部只能放置tm-grid-item，且不能嵌套tm-grid',
            table: [],
        },
        refs: {
            desc: '无',
            table: [],
        },
    },
    'grid-item': {
        name: 'grid-item',
        title: '宫格子组件 Grid-Item',
        desc: '宫格子组件',
        doc: 'https://tmui.design/com/Grid.html#%E5%AE%AB%E6%A0%BC%E5%AD%90%E7%BB%84%E4%BB%B6-grid-item',
        propsList: [
            {
                title: '参数',
                desc: `本组件含有公共属性 [公共属性](${LINK_COMPONENT_COMMON_PROPS})`,
                table: [
                    {
                        name: 'height',
                        type: 'number',
                        default: '`100`',
                        desc: '高度，如果提供为0，就表示自动高度。',
                    },
                    {
                        name: 'dot',
                        type: 'boolean|string',
                        default: '`false`',
                        desc: '是否显示红点',
                    },
                    {
                        name: 'icon',
                        type: 'boolean|string',
                        default: '`false`',
                        desc: '显示图标',
                    },
                    {
                        name: 'count',
                        type: 'boolean|string',
                        default: '`0`',
                        desc: '为数字时，显示数字角标，如果为string是显示文本角标',
                    },
                    {
                        name: 'max-count',
                        type: 'number',
                        default: '`999`',
                        desc: '数字角标显示最大值',
                    },
                    {
                        name: 'color',
                        type: 'string',
                        default: '`red`',
                        desc: 'dot的主题色',
                    },
                    {
                        name: 'url',
                        type: 'string',
                        default: '-',
                        desc: '如果提供了链接，当点击格子时自动跳转页面',
                    }
                ],
            },
        ],
        events: {
            desc: '',
            table: [
                {
                    name: 'click',
                    data: '-',
                    cb: '-',
                    desc: '点击事件',
                }
            ],
        },
        slots: {
            desc: '无',
            table: [],
        },
        refs: {
            desc: '无',
            table: [],
        },
    },
    'row': {
        name: 'row',
        title: '布局 Row',
        desc: '你可以用来排版，排列，九宫格等需要排版布局时非常有用。比如自己作表格等。 它是按12列划分的,当然也可以通过属性更改列数哦。',
        doc: 'https://tmui.design/com/Row.html#%E5%B8%83%E5%B1%80-row',
        propsList: [
            {
                title: '参数',
                desc: `Row组件含有[公共属性](https://tmui.design/spec/%E7%BB%84%E4%BB%B6%E5%85%AC%E5%85%B1%E6%A0%B7%E5%BC%8F.html),必须配合tmCol\n我建议row上最好定义width,这样性能与原生无异 当外部宽度不可预测时，width可以不设置，即让组件自动检测宽度，这样适合少量元素的布局。不适合大量数据布局。`,
                table: [
                    {
                        name: 'height',
                        type: 'number',
                        default: '`50`',
                        desc: '高度，单位rpx,如果为0时，表示高度自动，不受限制。',
                    },
                    {
                        name: 'margin',
                        type: 'number[]',
                        default: '`[0,0]`',
                        desc: '外间距[x,y]x=左右，y=上下',
                    },
                    {
                        name: 'width',
                        type: 'number',
                        default: '`0`',
                        desc: '宽度，单位rpx',
                    },
                    {
                        name: 'round',
                        type: 'number',
                        default: '`0`',
                        desc: '圆角0-25，单位rpx',
                    },
                    {
                        name: 'gutter',
                        type: 'number',
                        default: '`0`',
                        desc: '从3.0.89开始，此属性已经删除，请见col下的margin',
                    },
                    {
                        name: 'column',
                        type: 'number',
                        default: '`12`',
                        desc: '列',
                    },
                    {
                        name: 'justify',
                        type: 'string',
                        default: '`start`',
                        desc: '可选值：start/center/end/around/between',
                    },
                    {
                        name: 'align',
                        type: 'string',
                        default: '`center`',
                        desc: '可选值：start/center/end/stretch',
                    },
                    {
                        name: 'color',
                        type: 'string',
                        default: '`white`',
                        desc: '颜色',
                    },
                ],
            },
        ],
        events: {
            desc: '',
            table: [
                {
                    name: 'click',
                    data: '-',
                    cb: '-',
                    desc: '单元格点击时触发',
                }
            ],
        },
        slots: {
            desc: '默认default',
            table: [],
        },
        refs: {
            desc: '无',
            table: [],
        },
    },
    'col': {
        name: 'col',
        title: '布局 Col',
        desc: '必须配合tmRow使用。否则报错。',
        doc: 'https://tmui.design/com/Row.html#col%E7%BB%84%E4%BB%B6%E5%8F%82%E6%95%B0',
        propsList: [
            {
                title: '参数',
                desc: '',
                table: [
                    {
                        name: 'height',
                        type: 'number',
                        default: '`50`',
                        desc: '高度，单位rpx,如果为0时，表示高度自动，不受限制。',
                    },
                    {
                        name: 'color',
                        type: 'string',
                        default: '`white`',
                        desc: '颜色',
                    },
                    {
                        name: 'transprent',
                        type: 'boolean|string',
                        default: '`false`',
                        desc: '是否透明',
                    },
                    {
                        name: 'align',
                        type: 'string',
                        default: '`center`',
                        desc: '可选值：start/center/end',
                    },
                    {
                        name: 'col',
                        type: 'number',
                        default: '`1`',
                        desc: '所占row中column的列数，这里默认占1列',
                    },
                    {
                        name: 'margin',
                        type: 'number[]',
                        default: '`[0]`',
                        desc: '四周的间隙，规则见[公共属性margin](https://tmui.design/spec/%E7%BB%84%E4%BB%B6%E5%85%AC%E5%85%B1%E6%A0%B7%E5%BC%8F.html)',
                    },
                    {
                        name: 'border-color',
                        type: 'string',
                        default: '`rgba(0,0,0,0.04)`',
                        desc: '边线的颜色',
                    },
                    {
                        name: 'border-gutter',
                        type: 'number[]',
                        default: '`[0,0,0,0]`',
                        desc: '四周的边线大小，顺序为：0左，1上，2右，3下',
                    }
                ]
            },
        ],
        events: {
            desc: '无',
            table: [],
        },
        slots: {
            desc: '默认default',
            table: [],
        },
        refs: {
            desc: '无',
            table: [],
        },
    },
    'sheet': {
        name: 'sheet',
        title: '基础容器 Sheet',
        desc: '用于布局的容器组件，方便快速搭建页面的基本结构。',
        doc: 'https://tmui.design/com/Sheet.html',
        propsList: [
            {
                title: '参数',
                desc: `本组件含有公共属性 [公共属性](${LINK_COMPONENT_COMMON_PROPS})`,
                table: [
                    {
                        name: 'paren-class',
                        type: 'string',
                        default: '-',
                        desc: '组件的最外层class类,组件内嵌view的class选择器，你可能还需要使用!important来加强自定义选择器的权重',
                    },
                    {
                        name: 'cont-style',
                        type: 'string',
                        default: '-',
                        desc: '',
                    },
                    {
                        name: 'height',
                        type: 'number',
                        default: '`0`',
                        desc: '高度，单位rpx',
                    },
                    {
                        name: 'width',
                        type: 'number',
                        default: '`0`',
                        desc: '宽度，单位rpx',
                    },
                    {
                        name: 'color',
                        type: 'string',
                        default: '`white`',
                        desc: '背景主题颜色名称',
                    },
                    {
                        name: 'transprent',
                        type: 'boolean|string',
                        default: '`false`',
                        desc: '是否透明',
                    },
                    {
                        name: 'border',
                        type: 'number|string',
                        default: '`0`',
                        desc: '边框',
                    },
                    {
                        name: 'margin',
                        type: 'number[]',
                        default: '`[32,24]`',
                        desc: '[x]时表示四周的间隙,[x,x]时表示水平，上下的间隙，[x,x,x]时表示左，上，右，下：0的间隙,[x,x,x,x]时表示：左，上，右，下的x间隙',
                    },
                    {
                        name: 'padding',
                        type: 'number[]',
                        default: '`[24,24]`',
                        desc: '[x]时表示四周的间隙,[x,x]时表示水平，上下的间隙，[x,x,x]时表示左，上，右，下：0的间隙,[x,x,x,x]时表示：左，上，右，下的x间隙',
                    },
                    {
                        name: 'unit',
                        type: 'string',
                        default: '`rpx`',
                        desc: '单位',
                    },
                    {
                        name: 'hover-class',
                        type: 'string',
                        default: '`none`',
                        desc: '鼠标悬停颜色',
                    },
                    {
                        name: 'dark-bg-color',
                        type: 'string',
                        default: '-',
                        desc: '有时自动的背景，可能不是你想要暗黑背景，此时可以使用此参数，强制使用背景色',
                    },
                    {
                        name: 'no-level',
                        type: 'boolean',
                        default: '`false`',
                        desc: '如果输入框表单与tmshee在同一层下。他们的黑白暗黑背景色是相同的。为了区分这个问题，需要单独指示，以便区分背景同层。',
                    },
                    {
                        name: 'blur',
                        type: 'boolean',
                        default: '`false`',
                        desc: '是否开启磨砂背景。只有是黑白灰色系才能使用',
                    },
                    {
                        name: 'url',
                        type: 'string',
                        default: '-',
                        desc: '跳转链接，如果提供，点击时将发生跳转至该链接',
                    }
                ],
            },
        ],
        events: {
            desc: '',
            table: [
                {
                    name: 'click',
                    data: 'Event',
                    cb: '-',
                    desc: '点击时触发',
                },
                {
                    name: 'longpress',
                    data: 'Event',
                    cb: '-',
                    desc: '长按时触发',
                },
                {
                    name: 'touchend',
                    data: 'Event',
                    cb: '-',
                    desc: '触控结束时触发',
                },
                {
                    name: 'touchstart',
                    data: 'Event',
                    cb: '-',
                    desc: '触控开始时触发',
                },
                {
                    name: 'touchcancel',
                    data: 'Event',
                    cb: '-',
                    desc: '触控取消时触发',
                },
                {
                    name: 'mousedown',
                    data: 'Event',
                    cb: '-',
                    desc: '鼠标按下时触发',
                },
                {
                    name: 'mouseup',
                    data: 'Event',
                    cb: '-',
                    desc: '鼠标松开时触发',
                },
                {
                    name: 'mouseleave',
                    data: 'Event',
                    cb: '-',
                    desc: '鼠标移出时触发',
                }
            ],
        },
        slots: {
            desc: '默认default',
            table: [],
        },
        refs: {
            desc: '无',
            table: [],
        },
    },
    'avatar': {
        name: 'avatar',
        title: '头像 Avatar',
        desc: '本组件一般用于展示头像的地方，如个人中心，或者评论列表页的用户头像展示等场所。',
        doc: 'https://tmui.design/com/Avatar.html',
        propsList: [
            {
                title: '参数',
                desc: `本组件含有公共属性 [公共属性](${LINK_COMPONENT_COMMON_PROPS})`,
                table: [
                    {
                        name: 'size',
                        type: 'number',
                        default: '`90`',
                        desc: '头像的宽高,单位rpx',
                    },
                    {
                        name: 'trigger',
                        type: 'boolean|string',
                        default: '`false`',
                        desc: '是否开启交互，在pc端有用，鼠标移上去变成手型',
                    },
                    {
                        name: 'trigger-color',
                        type: 'string',
                        default: '`-`',
                        desc: '角标颜色',
                    },
                    {
                        name: 'trigger-icon',
                        type: 'string',
                        default: '`-`',
                        desc: '角标图标',
                    },
                    {
                        name: 'trigger-style',
                        type: 'string',
                        default: '`-`',
                        desc: '自定义角标样式',
                    },
                    {
                        name: 'round',
                        type: 'number|string',
                        default: '`6`',
                        desc: '圆角，0-26',
                    },
                    {
                        name: 'outlined',
                        type: 'boolean',
                        default: '`false`',
                        desc: '边框模式',
                    },
                    {
                        name: 'border',
                        type: 'number',
                        default: '`0`',
                        desc: '边框，边框颜色为你的color颜色',
                    },
                    {
                        name: 'margin',
                        type: 'number[]',
                        default: '`[0,0]`',
                        desc: '外间距[x,y]x=左右，y=上下',
                    },
                    {
                        name: 'padding',
                        type: 'number[]',
                        default: '`[0,0]`',
                        desc: '内间距[x,y]x=左右，y=上下',
                    },
                    {
                        name: 'transprent',
                        type: 'boolean|string',
                        default: '`false`',
                        desc: '-',
                    },
                    {
                        name: 'label',
                        type: 'string',
                        default: '-',
                        desc: '当填入信息时，文本头像，禁用img模式',
                    },
                    {
                        name: 'icon',
                        type: 'string',
                        default: '-',
                        desc: '图标',
                    },
                    {
                        name: 'img',
                        type: 'string',
                        default: '-',
                        desc: '图片地址',
                    },
                    {
                        name: 'font-size',
                        type: 'number',
                        default: '`0`',
                        desc: '自动匹配字体大小',
                    },
                    {
                        name: 'text',
                        type: 'boolean',
                        default: '`false`',
                        desc: '是否开启文本模式',
                    },
                    {
                        name: 'color',
                        type: 'string',
                        default: '`white`',
                        desc: '背景主题颜色名称',
                    },
                    {
                        name: 'unit',
                        type: 'string',
                        default: '`rpx`',
                        desc: '单位，仅：rpx,px',
                    },
                    {
                        name: 'icon-color',
                        type: 'string',
                        default: '`-`',
                        desc: '图标颜色。如果不提供使用主题色',
                    }
                ],
            },
        ],
        events: {
            desc: '',
            table: [
                {
                    name: 'click',
                    data: '-',
                    cb: '-',
                    desc: '点击事件',
                }
            ],
        },
        slots: {
            desc: '默认default',
            table: [],
        },
        refs: {
            desc: '无',
            table: [],
        },
    },
    'qrcode': {
        name: 'qrcode',
        title: '二维码 Qrcode',
        desc: '二维码组件，用于生成二维码',
        doc: 'https://tmui.design/com/Qrcode.html',
        propsList: [
            {
                title: '参数',
                desc: `本组件含有公共属性 [公共属性](${LINK_COMPONENT_COMMON_PROPS})`,
                table: [
                    {
                        name: 'option',
                        type: '`ObjectasPropType<qrOpts>`',
                        default: '`{}`',
                        desc: '看下面的参数',
                    }
                ],
            },
            {
                title: 'Option 参数',
                desc: 'Option 参数',
                table: [
                    {
                        name: 'base-color',
                        type: 'string|string[]',
                        default: '`#fff`',
                        desc: '二维码背景色,可以是数组颜色，将产生渐变',
                    },
                    {
                        name: 'background-image',
                        type: 'string',
                        default: '`-`',
                        desc: '使用图片作为二维码背景',
                    },
                    {
                        name: 'background-color',
                        type: 'string|string[]',
                        default: '`-`',
                        desc: '背景色,可以是数组颜色，将产生渐变。',
                    },
                    {
                        name: 'size',
                        type: 'number',
                        default: '`300`',
                        desc: '图片大小',
                    },
                    {
                        name: 'border',
                        type: 'number',
                        default: '`0.05`',
                        desc: '边 width = size * border,比如二维码是200,那么想要让边为10那么 border = 200*0.05',
                    },
                    {
                        name: 'str',
                        type: 'string',
                        default: '`-`',
                        desc: '内容',
                    },
                    {
                        name: 'forground-color',
                        type: 'string|string[]',
                        default: '`#000`',
                        desc: '二维码前景色,也可以是["#FF0000","#FFFF00"]如果提供数组，将会绘制渐变色',
                    },
                    {
                        name: 'logo-image',
                        type: 'string',
                        default: '`-`',
                        desc: 'logo图片',
                    },
                    {
                        name: 'logo-width',
                        type: 'number',
                        default: '`20`',
                        desc: '宽',
                    },
                    {
                        name: 'logo-height',
                        type: 'number',
                        default: '`20`',
                        desc: '高',
                    },
                    {
                        name: 'ecc',
                        type: 'string',
                        default: '`M`',
                        desc: '容错率，可选：L,M,Q,H',
                    },
                    {
                        name: 'linear-dir',
                        type: 'string',
                        default: '`-`',
                        desc: '如果forgroundColor是数组渐变色，则此可以更改渐变方向，left,right,bottom,top,tlbr:左顶点至底右下点，trbl,右顶点底右左点，bltr右底左点至顶右点。brtl底右点至顶左点。',
                    }
                ],
            }
        ],
        events: {
            desc: '无',
            table: [],
        },
        slots: {
            desc: '默认default',
            table: [],
        },
        refs: {
            desc: '如果在安卓端nvue原生的情况下保存二维码有未知问题，请使用vue页面使用本组件。',
            table: [
                {
                    name: 'save',
                    data: '-',
                    cb: '图片路径string,h5端返回的是base64',
                    desc: '保存当前生成的二维码图片',
                    minVersion: 'v3.0.63+'
                }
            ],
        }
    },
    'badge': {
        name: 'badge',
        title: '徽标 Badge',
        desc: '该组件一般用于图标右上角显示未读的消息数量，提示用户点击，有圆点和圆包含文字两种形式。',
        doc: 'https://tmui.design/com/Badge.html',
        propsList: [
            {
                title: '参数',
                desc: `本组件含有公共属性 [公共属性](${LINK_COMPONENT_COMMON_PROPS})`,
                table: [
                    {
                        name: 'round',
                        type: 'number|string',
                        default: '`6`',
                        desc: '圆角，0-26',
                    },
                    {
                        name: 'border',
                        type: 'number',
                        default: '`0`',
                        desc: '边框，边框颜色为你的color颜色',
                    },
                    {
                        name: 'color',
                        type: 'string',
                        default: '`white`',
                        desc: '背景主题颜色名称',
                    },
                    {
                        name: 'margin',
                        type: 'number[]',
                        default: '`[0,0]`',
                        desc: '外间距[x,y]x=左右，y=上下',
                    },
                    {
                        name: 'padding',
                        type: 'number[]',
                        default: '`[0,0]`',
                        desc: '内间距[x,y]x=左右，y=上下',
                    },
                    {
                        name: 'transprent',
                        type: 'boolean|string',
                        default: '`false`',
                        desc: '-',
                    },
                    {
                        name: 'label',
                        type: 'string',
                        default: '-',
                        desc: '状态文本模式，需要配合,status为true时展现，具体见示例',
                    },
                    {
                        name: 'font-size',
                        type: 'number',
                        default: '`22`',
                        desc: '自动匹配字体大小，单位rpx',
                    },
                    {
                        name: 'status',
                        type: 'boolean|string',
                        default: '`false`',
                        desc: '为真时，隐藏插槽数据，展现状态文本模式。',
                    },
                    {
                        name: 'dot',
                        type: 'boolean|string',
                        default: '`false`',
                        desc: '使用点。优先级高于label数字展示。',
                    },
                    {
                        name: 'icon',
                        type: 'boolean|string',
                        default: '`false`',
                        desc: '使用图标作为显示角标',
                    },
                    {
                        name: 'count',
                        type: 'number|string',
                        default: '`0`',
                        desc: '如果count为数字时，显示数字角标，如果为string是显示文本角标。',
                    },
                    {
                        name: 'max-count',
                        type: 'number|string',
                        default: '`999`',
                        desc: '如果count为数字时，最大数值',
                    },
                    {
                        name: 'top',
                        type: 'number',
                        default: '`0`',
                        desc: '允许微调位置,整数,可以是负数',
                    },
                    {
                        name: 'right',
                        type: 'number',
                        default: '`0`',
                        desc: '允许微调位置,整数,可以是负数',
                    }
                ]
            }
        ],
        events: {
            desc: '',
            table: [
                {
                    name: 'click',
                    data: '-',
                    cb: '-',
                    desc: '点击事件',
                }
            ]
        },
        slots: {
            desc: '默认default',
            table: [],
        },
        refs: {
            desc: '无',
            table: [],
        }
    },
    'card': {
        name: 'card',
        title: '卡片 Card',
        desc: '卡片组件，用于展示一些内容，比如商品列表，文章列表等。',
        doc: 'https://tmui.design/com/Card.html',
        propsList: [
            {
                title: '参数',
                desc: `本组件含有公共属性 [公共属性](${LINK_COMPONENT_COMMON_PROPS})`,
                table: [
                    {
                        name: 'shadow',
                        type: 'number|string',
                        default: '`2`',
                        desc: '卡片投影，0-26',
                    },
                    {
                        name: 'round',
                        type: 'number|string',
                        default: '`4`',
                        desc: '卡片圆角，0-26',
                    },
                    {
                        name: 'border',
                        type: 'number',
                        default: '`0`',
                        desc: '边框',
                    },
                    {
                        name: 'margin',
                        type: 'number[]',
                        default: '`[32,0,32,24]`',
                        desc: '外间距[x,y]x=左右，y=上下,详细规则见公共属性中的说明',
                    },
                    {
                        name: 'padding',
                        type: 'number[]',
                        default: '`[16,0]`',
                        desc: '内间距[x,y]x=左右，y=上下',
                    },
                    {
                        name: 'transprent',
                        type: 'boolean|string',
                        default: '`false`',
                        desc: '-',
                    },
                    {
                        name: 'color',
                        type: 'string',
                        default: '`white`',
                        desc: '背景主题颜色名称',
                    },
                    {
                        name: 'width',
                        type: 'number',
                        default: '`0`',
                        desc: '宽度，单位rpx',
                    },
                    {
                        name: 'height',
                        type: 'number',
                        default: '`0`',
                        desc: '高度，单位rpx',
                    },
                    {
                        name: 'title',
                        type: 'string',
                        default: '`-`',
                        desc: '标题',
                    },
                    {
                        name: 'status',
                        type: 'string',
                        default: '`-`',
                        desc: '状态文本',
                    },
                    {
                        name: 'status-color',
                        type: 'string',
                        default: '`primary`',
                        desc: '状态文本的主题色',
                    },
                    {
                        name: 'content',
                        type: 'string',
                        default: '`-`',
                        desc: '卡片的正文内容',
                    }
                ],
            }
        ],
        events: {
            desc: '无',
            table: []
        },
        slots: {
            desc: '',
            table: [
                {
                    name: 'title',
                    data: '-',
                    type: '-',
                    desc: '卡片标题',
                },
                {
                    name: 'status',
                    data: '-',
                    type: '-',
                    desc: '卡片右上角状态文本',
                },
                {
                    name: 'content',
                    data: '-',
                    type: '-',
                    desc: '卡片正文部分',
                },
                {
                    name: 'action',
                    data: '-',
                    type: '-',
                    desc: '卡片底部操作部分，默认为空',
                }
            ],
        },
        refs: {
            desc: '无',
            table: [],
        }
    },
    'carousel': {
        name: 'carousel',
        title: '轮播 Carousel',
        desc: '该组件一般用于导航轮播，广告展示等场景,可开箱即用。',
        doc: 'https://tmui.design/com/Carousel.html',
        propsList: [
            {
                title: '参数',
                desc: `本组件含有公共属性 [公共属性](${LINK_COMPONENT_COMMON_PROPS})`,
                table: [
                    {
                        name: 'follow-theme',
                        type: 'boolean',
                        default: '`true`',
                        desc: '跟随主题色',
                    },
                    {
                        name: 'color',
                        type: 'string',
                        default: '`primary`',
                        desc: '当前选中的指示点颜色',
                    },
                    {
                        name: 'indicator-color',
                        type: 'string',
                        default: '`white`',
                        desc: '指示点颜色',
                    },
                    {
                        name: 'width',
                        type: 'number',
                        default: '`750`',
                        desc: '宽度，单位rpx',
                    },
                    {
                        name: 'height',
                        type: 'number',
                        default: '`500`',
                        desc: '高度，单位rpx',
                    },
                    {
                        name: 'round',
                        type: 'number',
                        default: '`0`',
                        desc: '开启圆角,单位n*4rpx(即round-1 为 4rpx)',
                    },
                    {
                        name: 'margin',
                        type: 'number[]',
                        default: '`[0,0]`',
                        desc: '外间距[x,y]x=左右，y=上下',
                    },
                    {
                        name: 'list',
                        type: 'string[]|ListItem[]',
                        default: '`[]`',
                        desc: '图片列表，可以是string数组或者ListItem数组，ListItem结构见下方',
                    },
                    {
                        name: 'rang-key',
                        type: 'string',
                        default: '`url`',
                        desc: '图片列表object数组时，需要提供图片地址的键值。',
                    },
                    {
                        name: 'default-value',
                        type: 'number',
                        default: '`0`',
                        desc: '默认选中的图片',
                    },
                    {
                        name: 'dot-position',
                        type: 'string',
                        default: '`bottom`',
                        desc: '指示点位置，可选：top,left,right,bottom',
                    },
                    {
                        name: 'align',
                        type: 'string',
                        default: '`center`',
                        desc: '内容居对齐，左left，中center，右right，在dotPosition为left,right时，align的left和right表示，上下对齐',
                    },
                    {
                        name: 'model',
                        type: 'string',
                        default: '`number`',
                        desc: '指示点的样式：dot,number,rect',
                    },
                    {
                        name: 'interval',
                        type: 'number',
                        default: '`5000`',
                        desc: '自动切换时间间隔，单位ms',
                    },
                    {
                        name: 'duration',
                        type: 'number',
                        default: '`500`',
                        desc: '滑动动画时长，单位ms',
                    },
                    {
                        name: 'circular',
                        type: 'boolean',
                        default: '`true`',
                        desc: '是否采用衔接滑动，即播放到末尾后重新回到开头',
                    },
                    {
                        name: 'acceleration',
                        type: 'boolean',
                        default: '`false`',
                        desc: '是否开启动画加速',
                    },
                    {
                        name: 'disable-programmatic-animation',
                        type: 'boolean',
                        default: '`false`',
                        desc: '是否禁用编程式动画',
                    },
                    {
                        name: 'autoplay',
                        type: 'boolean',
                        default: '`true`',
                        desc: '是否自动切换',
                    },
                    {
                        name: 'display-multiple-items',
                        type: 'number',
                        default: '`1`',
                        desc: '同时显示的滑块数量',
                    },
                    {
                        name: 'skip-hidden-item-layout',
                        type: 'boolean',
                        default: '`false`',
                        desc: '是否跳过未显示的滑块布局，对于未显示的滑块，不会触发滑块布局，可以提升性能',
                    },
                    {
                        name: 'disable-touch',
                        type: 'boolean',
                        default: '`false`',
                        desc: '是否禁止手势滑动',
                    },
                    {
                        name: 'touchable',
                        type: 'boolean',
                        default: '`false`',
                        desc: '是否支持手势滑动',
                    },
                    {
                        name: 'indicator-dots',
                        type: 'boolean',
                        default: '`true`',
                        desc: '是否显示指示点',
                    },
                    {
                        name: 'show-load',
                        type: 'boolean',
                        default: '`true`',
                        desc: '是否显示加载动画',
                        minVersion: 'v3.0.77+',
                    }
                ],
            },
            {
                title: 'ListItem 结构',
                desc: 'ListItem 结构，可以增加自定义字段，但是不要使用url，type，img，text这几个字段，否则会被覆盖。',
                table: [
                    {
                        name: 'url',
                        type: 'string',
                        default: '`-`',
                        desc: '图片地址',
                    },
                    {
                        name: 'type',
                        type: 'ListItemType',
                        default: '`-`',
                        desc: '图片类型，可选：image,video',
                    },
                    {
                        name: 'img',
                        type: 'string',
                        default: '`-`',
                        desc: '视频封面图片',
                    },
                    {
                        name: 'text',
                        type: 'string',
                        default: '`-`',
                        desc: '轮播的底部文字，如果提供就显示底部文字，不提供，就不显示。',
                    }
                ],
            }
        ],
        events: {
            desc: '',
            table: [
                {
                    name: 'change',
                    data: '-',
                    cb: '-',
                    desc: '切换时触发',
                },
                {
                    name: 'click',
                    data: 'index',
                    cb: '-',
                    desc: '点击时触发',
                }
            ],
        },
        slots: {
            desc: '默认default',
            table: [],
        },
        refs: {
            desc: '无',
            table: [],
        },
    },
    'collapse': {
        name: 'collapse',
        title: '折叠面板 Collapse',
        desc: '通过折叠面板收纳内容区域。',
        doc: 'https://tmui.design/com/Collapse.html',
        propsList: [
            {
                title: '参数',
                desc: '',
                table: [
                    {
                        name: 'active-key',
                        type: 'string[]',
                        default: '`[]`',
                        desc: '当前展开并激活的面板(v-model:active-key),为下面的CollapseItem的name字段合集',
                    },
                    {
                        name: 'default-active-key',
                        type: 'string[]',
                        default: '`[]`',
                        desc: '默认展开的面板,为下面的CollapseItem的name字段合集',
                    },
                    {
                        name: 'accordion',
                        type: 'boolean|string',
                        default: '`false`',
                        desc: '是否设置为单个面板展开，默认fase，允许 多个面板同时展开',
                    },
                    {
                        name: 'border',
                        type: 'number|string',
                        default: '`2`',
                        desc: '边框',
                    },
                    {
                        name: 'icon-pos',
                        type: 'string',
                        default: '`left`',
                        desc: '展开图标的位置，可选left/right',
                    },
                    {
                        name: 'open-icon',
                        type: 'string',
                        default: '`tmicon-angle-up`',
                        desc: '打开时的图标',
                        minVersion: 'v3.0.77+',
                    },
                    {
                        name: 'close-icon',
                        type: 'string',
                        default: '`tmicon-angle-down`',
                        desc: '关闭时的图标',
                        minVersion: 'v3.0.77+',
                    }
                ],
            }
        ],
        events: {
            desc: '',
            table: [
                {
                    name: 'change',
                    data: 'name',
                    cb: '-',
                    desc: '切换时触发',
                }
            ],
        },
        slots: {
            desc: '默认default',
            table: [],
        },
        refs: {
            desc: '无',
            table: [],
        },
    },
    'collapse-item': {
        name: 'collapse-item',
        title: '折叠面板 CollapseItem，必须配合Collapse使用',
        desc: '通过折叠面板收纳内容区域。',
        doc: 'https://tmui.design/com/Collapse.html#collapseitem',
        propsList: [
            {
                title: '参数',
                desc: `本组件含有公共属性 [公共属性](${LINK_COMPONENT_COMMON_PROPS})`,
                table: [
                    {
                        name: 'color',
                        type: 'string',
                        default: '`white`',
                        desc: '主题色',
                    },
                    {
                        name: 'title',
                        type: 'string',
                        default: '`-`',
                        desc: '面板标题',
                    },
                    {
                        name: 'name',
                        type: 'string|number',
                        default: '`-`',
                        desc: '必填，标识，用来展开和关闭的标识,Collapse的activeKey，defaultActiveKey数组标识就是此值',
                    },
                    {
                        name: 'active-color',
                        type: 'string',
                        default: '`primary`',
                        desc: '展开时的主题色',
                    },
                    {
                        name: 'margin',
                        type: 'number[]',
                        default: '`[0,0]`',
                        desc: '外间距[x,y]x=左右，y=上下',
                    },
                    {
                        name: 'padding',
                        type: 'number[]',
                        default: '`[0,0]`',
                        desc: '内间距[x,y]x=左右，y=上下',
                    },
                    {
                        name: 'disabled',
                        type: 'boolean',
                        default: '`false`',
                        desc: '面板是否可以打开或收起',
                    },
                    {
                        name: 'left-icon',
                        type: 'string',
                        default: '`-`',
                        desc: '标题前的图标',
                    },
                    {
                        name: 'left-icon-color',
                        type: 'string',
                        default: '`-`',
                        desc: '标题前的图标主题颜色，默认为空即自动配色，当激活时，使用activeColor。如果本属性不为空，将始终使用本属性颜色主题。',
                    },
                    {
                        name: 'height',
                        type: 'number',
                        default: '`80`',
                        desc: '标题的高度',
                        minVersion: 'v3.0.77+',
                    },
                    {
                        name: 'title-size',
                        type: 'number',
                        default: '`30`',
                        desc: '标题字号大小',
                    },
                    {
                        name: 'left-icon-size',
                        type: 'number',
                        default: '`24`',
                        desc: '左边图标大小',
                    }
                ],
            }
        ],
        events: {
            desc: '',
            table: [
                {
                    name: 'click',
                    data: '-',
                    cb: '-',
                    desc: '点击时触发',
                }
            ],
        },
        slots: {
            desc: '',
            table: [
                {
                    name: 'title',
                    data: '-',
                    type: '-',
                    desc: '标题插槽',
                },
                {
                    name: 'icon',
                    data: '-',
                    type: '-',
                    desc: '标题前图标插槽',
                },
                {
                    name: 'rightLabel',
                    data: '-',
                    type: '-',
                    desc: '右边图标的文本插槽',
                    minVersion: 'v3.0.77+',
                }
            ],
        },
        refs: {
            desc: '无',
            table: [],
        },
    },
    'comment': {
        name: 'comment',
        title: '评论 Comment',
        desc: '评论组件，用于展示评论列表，或者评论输入框。',
        doc: 'https://tmui.design/com/Comment.html',
        propsList: [
            {
                title: '参数',
                desc: `本组件含有公共属性 [公共属性](${LINK_COMPONENT_COMMON_PROPS})`,
                table: [
                    {
                        name: 'shadow',
                        type: 'number',
                        default: '`0`',
                        desc: '卡片投影，0-26',
                    },
                    {
                        name: 'round',
                        type: 'number',
                        default: '`4`',
                        desc: '卡片圆角，0-26',
                    },
                    {
                        name: 'width',
                        type: 'number',
                        default: '`0`',
                        desc: '宽度，单位rpx',
                    },
                    {
                        name: 'height',
                        type: 'number',
                        default: '`0`',
                        desc: '高度，单位rpx',
                    },
                    {
                        name: 'border',
                        type: 'number',
                        default: '`0`',
                        desc: '边框',
                    },
                    {
                        name: 'margin',
                        type: 'number[]',
                        default: '`[32,8]`',
                        desc: '外间距[x,y]x=左右，y=上下',
                    },
                    {
                        name: 'padding',
                        type: 'number[]',
                        default: '`[24,24]`',
                        desc: '内间距[x,y]x=左右，y=上下',
                    },
                    {
                        name: 'transprent',
                        type: 'boolean|string',
                        default: '`false`',
                        desc: '-',
                    },
                    {
                        name: 'color',
                        type: 'string',
                        default: '`white`',
                        desc: '背景主题颜色名称',
                    },
                    {
                        name: 'border-bottom',
                        type: 'boolean|string',
                        default: '`false`',
                        desc: '是否显示底部的边线',
                    },
                    {
                        name: 'author',
                        type: 'string',
                        default: '`-`',
                        desc: '名称',
                    },
                    {
                        name: 'author-font-size',
                        type: 'number',
                        default: '`26`',
                        desc: 'author字体大小,默认26',
                    },
                    {
                        name: 'author-color',
                        type: 'string',
                        default: '`primary`',
                        desc: 'author主题色',
                    },
                    {
                        name: 'avatar',
                        type: 'string',
                        default: '`-`',
                        desc: '头像',
                    },
                    {
                        name: 'content',
                        type: 'string',
                        default: '`-`',
                        desc: '内容',
                    },
                    {
                        name: 'time',
                        type: 'string',
                        default: '`-`',
                        desc: '时间',
                    },
                    {
                        name: 'align',
                        type: 'string',
                        default: '`right`',
                        desc: '时间和下面的操作按钮是靠左还是靠右：right,left',
                    },
                    {
                        name: 'auto-format-time',
                        type: 'boolean',
                        default: '`true`',
                        desc: '是否格式化时间标签。',
                    }
                ],
            }
        ],
        events: {
            desc: '',
            table: [
                {
                    name: 'avatar-click',
                    data: '-',
                    cb: '-',
                    desc: '点击头像时触发',
                },
                {
                    name: 'author-click',
                    data: '-',
                    cb: '-',
                    desc: '点击名称时触发',
                },
                {
                    name: 'time-click',
                    data: '-',
                    cb: '-',
                    desc: '点击时间时触发',
                },
                {
                    name: 'content-click',
                    data: '-',
                    cb: '-',
                    desc: '点击内容时触发',
                }
            ],
        },
        slots: {
            desc: '',
            table: [
                {
                    name: 'author',
                    data: '-',
                    type: '-',
                    desc: '评论的人',
                },
                {
                    name: 'time',
                    data: '-',
                    type: '-',
                    desc: '评论的时间',
                },
                {
                    name: 'content',
                    data: '-',
                    type: '-',
                    desc: '评论的内容正文',
                },
                {
                    name: 'actions',
                    data: '-',
                    type: '-',
                    desc: '评论的底部插槽，默认是空内容，用于自定底部一些其它布局，比如输入框，先点赞按钮这些或者其它操作按钮等。',
                },
                {
                    name: 'default',
                    data: '-',
                    type: '-',
                    desc: '默认插槽，主要，可以放置任意组件和元素，可以用来嵌套评论组件，把评论组件放置默认插槽中形成嵌套效果。',
                }
            ],
        },
        refs: {
            desc: '无',
            table: [],
        },
    },
    'cell': {
        name: 'cell',
        title: '单元格 Cell',
        desc: '常用于列表',
        doc: 'https://tmui.design/com/Cell.html',
        propsList: [
            {
                title: '参数',
                desc: `本组件含有公共属性 [公共属性](${LINK_COMPONENT_COMMON_PROPS})`,
                table: [
                    {
                        name: 'shadow',
                        type: 'number|string',
                        default: '`0`',
                        desc: '投影，0-25',
                    },
                    {
                        name: 'round',
                        type: 'number|string',
                        default: '`0`',
                        desc: '圆角，0-25，单位rpx',
                    },
                    {
                        name: 'margin',
                        type: 'number[]',
                        default: '`[32,0]`',
                        desc: '外间距[x,y]x=左右，y=上下',
                    },
                    {
                        name: 'padding',
                        type: 'number[]',
                        default: '`[24,24]`',
                        desc: '内间距[x,y]x=左右，y=上下',
                    },
                    {
                        name: 'height',
                        type: 'number',
                        default: '`0`',
                        desc: '高度，单位rpx',
                    },
                    {
                        name: 'transprent',
                        type: 'boolean|string',
                        default: '`false`',
                        desc: '是否透明',
                    },
                    {
                        name: 'color',
                        type: 'string',
                        default: '`white`',
                        desc: '单元格背景色',
                    },
                    {
                        name: 'title',
                        type: 'string',
                        default: '`-`',
                        desc: '标题',
                    },
                    {
                        name: 'title-color',
                        type: 'string',
                        default: '`-`',
                        desc: '默认为空，采用自动配色（根据主题）',
                    },
                    {
                        name: 'title-font-size',
                        type: 'number',
                        default: '`28`',
                        desc: '标题字体大小',
                    },
                    {
                        name: 'label',
                        type: 'string',
                        default: '`-`',
                        desc: '标题下方的描述',
                    },
                    {
                        name: 'label-color',
                        type: 'string',
                        default: '`grey`',
                        desc: '标题下方文字的颜色',
                    },
                    {
                        name: 'label-font-size',
                        type: 'number',
                        default: '`22`',
                        desc: '标题下方文字的字体大小',
                    },
                    {
                        name: 'right-text',
                        type: 'string',
                        default: '`-`',
                        desc: '右边的文字',
                    },
                    {
                        name: 'right-text-size',
                        type: 'number',
                        default: '`24`',
                        desc: '右边的文字大小',
                        minVersion: 'v3.0.75+'
                    },
                    {
                        name: 'right-icon',
                        type: 'string',
                        default: '`tmicon-angle-right`',
                        desc: '右边的图标',
                    },
                    {
                        name: 'right-color',
                        type: 'string',
                        default: '`grey`',
                        desc: '右边的文字颜色',
                    },
                    {
                        name: 'show-avatar',
                        type: 'boolean',
                        default: '`false`',
                        desc: '是否显示头像',
                    },
                    {
                        name: 'avatar',
                        type: 'string',
                        default: '`-`',
                        desc: '头像路径',
                    },
                    {
                        name: 'avatar-size',
                        type: 'number',
                        default: '`60`',
                        desc: '头像大小',
                    },
                    {
                        name: 'avatar-round',
                        type: 'number',
                        default: '`10`',
                        desc: '头像圆角',
                    },
                    {
                        name: 'border',
                        type: 'number',
                        default: '`0`',
                        desc: '边线宽度',
                    },
                    {
                        name: 'border-direction',
                        type: 'string',
                        default: '`bottom`',
                        desc: '边线方向，可选：top,bottom,left,right',
                    },
                    {
                        name: 'bottom-border',
                        type: 'boolean',
                        default: '`false`',
                        desc: '是否显示下边线',
                    },
                    {
                        name: 'url',
                        type: 'string',
                        default: '`-`',
                        desc: '当有链接地址时，将打开链接',
                    },
                    {
                        name: 'dark-bg-color',
                        type: 'string',
                        default: '`-`',
                        desc: '有时自动的背景，可能不是你想要暗黑背景，此时可以使用此参数，强制使用背景色',
                    }
                ],
            }
        ],
        events: {
            desc: '',
            table: [
                {
                    name: 'click',
                    data: '-',
                    cb: '-',
                    desc: '点击组件时触发',
                }
            ],
        },
        slots: {
            desc: '',
            table: [
                {
                    name: 'avatar',
                    data: '-',
                    type: '-',
                    desc: '自定义头像',
                },
                {
                    name: 'title',
                    data: '-',
                    type: '-',
                    desc: '自定义左侧标题部分的内容',
                },
                {
                    name: 'label',
                    data: '-',
                    type: '-',
                    desc: '自定义label内容',
                },
                {
                    name: 'rightText',
                    data: '-',
                    type: '-',
                    desc: '自定义右边文字内容',
                },
                {
                    name: 'right',
                    data: '-',
                    type: '-',
                    desc: '自定义右图标内容',
                }
            ],
        },
        refs: {
            desc: '无',
            table: [],
        },
    },
    'countdown': {
        name: 'countdown',
        title: '倒计时 Countdown',
        desc: '常用于计时，短信验证码倒计时，活动倒计时等。',
        doc: 'https://tmui.design/com/Countdown.html',
        propsList: [
            {
                title: '参数',
                desc: `本组件含有公共属性 [公共属性](${LINK_COMPONENT_COMMON_PROPS})`,
                table: [
                    {
                        name: 'time',
                        type: 'number',
                        default: '`10 * 1000`',
                        desc: '单位毫秒，倒计时的总时长',
                    },
                    {
                        name: 'format',
                        type: 'string',
                        default: '`{DD}天{HH}小时{MM}分{SS}秒{MS}毫秒`',
                        desc: '格式。如果只想要秒：SS秒，注意如果当你的formatType设定某值时，里面只能读取到你设定的值。'
                    },
                    {
                        name: 'auto-start',
                        type: 'boolean',
                        default: '`true`',
                        desc: '是否自动开始倒计时',
                    },
                    {
                        name: 'color',
                        type: 'string',
                        default: '`-`',
                        desc: '文字颜色',
                    },
                    {
                        name: 'format-type',
                        type: 'string',
                        default: '`HH`',
                        desc: '格式类型，可选：DD,HH,MM,SS,MS，具体说明见下方',
                    }
                ],
            },
            {
                title: 'FormatType 说明',
                desc: '+ 倒计时格式的类型，设定下面的值时，倒计时功能不会进位，而是以指定的值进行倒计时。\n+ 比如分，你设置为MM,那么你倒计时如果是200分钟，就从200开始倒计时。而不会进位到小时。\n+"DD"|"HH"|"MM"|"SS"|"MS"|""\n+天|时|分|秒|毫秒',
                table: [],
            }
        ],
        events: {
            desc: '',
            table: [
                {
                    name: 'start',
                    data: '-',
                    cb: '-',
                    desc: '开始或者继续。',
                },
                {
                    name: 'end',
                    data: '-',
                    cb: '-',
                    desc: '停止，直接结束。',
                },
                {
                    name: 'change',
                    data: '-',
                    cb: '-',
                    desc: '时间变化时触发。',
                }
            ],
        },
        slots: {
            desc: '',
            table: [
                {
                    name: 'default',
                    data: '数据',
                    type: 'timeData',
                    desc: '倒计时数据',
                }
            ],
        },
        refs: {
            desc: '无',
            table: [],
        },
    }
};