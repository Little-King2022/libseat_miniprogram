// pages/showNotifi/index.js
Page({
    data: {
        content: '',
        id: wx.getStorageSync('notifications')['id']
    },
    onBack() {
        wx.navigateBack();
    },
    onGoHome() {
        wx.reLaunch({
            url: '/pages/index/index',
        });
    },
    onLoad(options) {
        this.setData({ content: wx.getStorageSync('notifications')['content'] }); 
    },
    haveRead(){
        wx.setStorageSync(wx.getStorageSync('notifications')['id'], true);
        wx.navigateBack();
    }
});
