const CUSTOMER_SITES = {
    zyku: {
        api: 'https://api.1080zyku.com/inc/api_mac10.php',
        name: '1080资源'
    },
    yayazy: {
        api: 'https://cj.yayazy.net/api.php/provide/vod',
        name: '丫丫点播'
    },
    suoni: {
        api: 'https://suoniapi.com/api.php/provide/vod',
        name: '索尼资源'
    },
    hongniu: {
        api: 'https://www.hongniuzy2.com/api.php/provide/vod',
        name: '红牛资源'
    },
    huya: {
        api: 'https://www.huyaapi.com/api.php/provide/vod',
        name: '虎牙资源'
    },
    maoyan: {
        api: 'https://api.maoyanapi.top/api.php/provide/vod/at/json',
        name: '猫眼资源'
    },
    ysgc: {
        api: 'https://cj.lziapi.com/api.php/provide/vod/',
        name: '影视工厂'
    },
    subo: {
        api: 'https://subocaiji.com/api.php/provide/vod',
        name: '速博资源'
    },
    jyzy: {
        api: 'https://jyzyapi.com/provide/vod',
        name: '金鹰资源'
    },
    yzzy: {
        api: 'https://api.yzzy-api.com/inc/apijson.php',
        name: '优质资源'
    },
    hhzyapi: {
        api: 'https://hhzyapi.com/api.php/provide/vod',
        name: '豪华资源'
    }
};

// 调用全局方法合并
if (window.extendAPISites) {
    window.extendAPISites(CUSTOMER_SITES);
} else {
    console.error("错误：请先加载 config.js！");
}
