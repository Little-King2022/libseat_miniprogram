// app.js
App({
    data: {
        isVip: false,
        version: "",
    },
    onLaunch() {
        wx.showLoading({
            title: '加载中'
        })

        // 鉴权初始化
        wx.removeStorageSync('auth_cookie');
        wx.setStorageSync('isAuth', 'false');
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
                    wx.hideLoading();
                    if (wx.getStorageSync('isLogin') == '' || wx.getStorageSync('isLogin') == 'false') {
                        wx.setStorageSync('isLogin', 'false');
                    } else if (wx.getStorageSync('isLogin') == 'true' && wx.getStorageSync('token').length == 22 && wx.getStorageSync('login_stu_id').length >= 9) {
                        wx.request({
                            url: 'https://libseat.littleking.site/wxapi/wxmplogin',
                            method: 'POST',
                            header: {
                                'content-type': 'application/json',
                                'Cookie': wx.getStorageSync('auth_cookie')
                            },
                            data: {
                                'login_type': "token",
                                'stu_id': wx.getStorageSync('login_stu_id'),
                                'token': wx.getStorageSync('token')
                            },
                            dataType: 'json',
                            success: (res) => {
                                if (res.data['result'] == 'success' && (res.data['token']).length == 22) {
                                    wx.setStorageSync('isLogin', "true");
                                    wx.setStorageSync('login_stu_id', res.data['stu_id']);
                                    wx.setStorageSync('token', res.data['token']);
                                    wx.setStorageSync('isVip', "true");
                                } else {
                                    wx.setStorageSync('isLogin', 'false');
                                    wx.removeStorageSync('login_stu_id');
                                    wx.showToast({
                                        title: '登录状态失效',
                                        duration: 3000,
                                        icon: 'error'
                                    });
                                }
                            },
                            fail: (res) => {
                                wx.showToast({
                                    title: '网络异常',
                                    icon: 'error',
                                    duration: 3000,
                                })
                            }
                        })
                    } else {
                        wx.setStorageSync('isLogin', 'false');
                        wx.showToast({
                            title: '登录状态失效',
                            duration: 3000,
                            icon: 'error'
                        });
                    };
                } else {
                    wx.showToast({
                        title: '鉴权失败',
                        icon: 'error',
                        duration: 3000,
                    })
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: '网络异常',
                    icon: 'error',
                    duration: 3000,
                })
            }
        });

        // 获取系统信息
        const systemInfo = wx.getSystemInfoSync();

        // 判断操作系统
        let platforms = ['ios', 'mac', 'devtools'];
        if (platforms.includes(systemInfo.platform)) {
            wx.setStorageSync('isIOS', true);
        } else {
            wx.setStorageSync('isIOS', false);
        }





        // 分享权限控制
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline'],
        });


    },
})