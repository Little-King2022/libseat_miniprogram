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
    returnPage() {
        wx.navigateBack({
            delta: 1,
        });

    },

    /**
     * 页面的初始数据
     */
    data: {

    },


    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        // 标题栏高度
        const navigationBarHeight = wx.getSystemInfoSync().statusBarHeight + 44;
        this.setData({
            navigationBarHeight: navigationBarHeight
        });

    },
})