// pages/setResvDuration/index.js
Page({
    data: {
        content: '',
        value: 1,
        timeOptions: ["07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "13:00", "13:30", "14:00"],
        value2: 0,
        timeOptions2: ["22:00（周五20:00）"]

    },
    onChange(e) {
        this.setData({
            value: e.detail.value
        });
    },
    onBack() {
        wx.navigateBack();
    },
    onGoHome() {
        wx.reLaunch({
            url: '/pages/index/index',
        });
    },
    onShow() {
        const userInfo = wx.getStorageSync('user_info');
        if (userInfo && userInfo.resv_start_time) {
            const startTime = userInfo.resv_start_time;
            const index = this.data.timeOptions.findIndex(time => time === startTime);
            if (index !== -1) {
                this.setData({
                    value: index
                });
            }
        }
    },
    setResvDuration() {
        const userInfo = wx.getStorageSync('user_info');
        if (wx.getStorageSync('auth_cookie') == null) {
            wx.showToast({
                title: '请重启小程序',
                duration: 3000,
                icon: 'error'
            });
        } else if (wx.getStorageSync('isLogin') != "true") {
            wx.showToast({
                title: '用户未登录',
                duration: 2000,
                icon: 'error'
            });
            setTimeout(() => {
                wx.reLaunch({
                    url: '/pages/index/index',
                });
            }, 2000)
        } else {
            wx.request({
                url: 'https://libseat.littleking.site/wxapi/set_resv_start_time',
                method: 'POST',
                header: {
                    'content-type': 'application/json',
                    'Cookie': wx.getStorageSync('auth_cookie')
                },
                data: {
                    'start_time': this.data.timeOptions[this.data.value]
                },
                success: (res) => {
                    if (res.statusCode == 200) {
                        userInfo['resv_start_time'] = this.data.timeOptions[this.data.value];
                        wx.setStorageSync('user_info', userInfo);
                        wx.showToast({
                            title: '保存成功',
                        });
                    } else {
                        wx.showToast({
                            title: res.data.message ? res.data.message : "系统错误，请稍后重试",
                            icon: 'none'
                        });
                    }
                },
                fail: () => {
                    wx.showToast({
                        title: '请检查网络连接',
                        icon: 'error'
                    });
                }
            })
        }
    }
})