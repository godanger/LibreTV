const CUSTOMER_SITES = {
	hhzyapi: {
			"api": "https://hhzyapi.com/api.php/provide/vod",
			"name": "豪华资源",
		},
};

// 调用全局方法合并
if (window.extendAPISites) {
    window.extendAPISites(CUSTOMER_SITES);
} else {
    console.error("错误：请先加载 config.js！");
}
