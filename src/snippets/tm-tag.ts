export const tmTagSnippets = [
    {
        prefix: "tm-app",
        body: `<tm-app ref="app">
    <!-- 这里是你的页面代码。 -->
    $1
</tm-app>`,
        description: "应用节点组件",
        attributes: [
            {
                name: 'theme',
                type: 'string',
                default: 'grey-5'
            }
        ]
    }
];