// app.js
App({
    onLaunch() {
        wx.showLoading({
            title: '加载中',
            duration: 1000,
        })

        // 鉴权初始化
        wx.removeStorageSync('auth_cookie');
        wx.setStorageSync('isAuth', 'false');

        // 分享权限控制
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline'],
        });

        var date = new Date();
        var pwd = "wxmp_auth" + (date.getMonth() + 1).toString().padStart(2, "0") + date.getDate().toString().padStart(2, "0");
        // 向服务器发送初始认证，并保存cookie
        wx.request({
            url: 'https://libseat.littleking.site/wxapi/auth',
            method: 'POST',
            header: {
                'content-type': 'application/json',
            },
            data: {
                'code': pwd
            },
            success: (res) => {
                if (res.statusCode == 200) {
                    wx.setStorageSync('auth_cookie', res.header['Set-Cookie']);
                    wx.setStorageSync('isAuth', 'true');

                } else {
                    wx.showToast({
                        title: '鉴权失败',
                        icon: 'error',
                        duration: 10000,
                        mask: true
                    })
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: '网络异常',
                    icon: 'error',
                    duration: 10000,
                    mask: true
                })
            }
        });
    },
})