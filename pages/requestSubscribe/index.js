// pages/requestSubscribe/index.js
Page({
    requestSubscribe() {
        wx.requestSubscribeMessage({
            tmplIds: ['N-M0osMwN8UJZ1RD2-CpIiv2_ez6K7bDU21FuJIXF7A'],
            success(res) {
                wx.showToast({
                    title: '订阅成功',
                    icon: 'success',
                    duration: 1500
                })

            }
        })
    },
    // 导航栏按钮控制
    onBack() {
        wx.navigateBack();
    },
    onGoHome() {
        wx.reLaunch({
            url: '/pages/index/index',
        });
    },

    data: {

    },
})