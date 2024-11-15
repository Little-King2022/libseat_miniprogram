// pages/stu/index.js
// 分享权限控制
wx.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline'],
});
Page({
    // 导航栏按钮控制
    onBack() {
        wx.navigateBack();
    },
    onGoHome() {
        wx.reLaunch({
            url: '/pages/index/index',
        });
    },
    // 自定义分享卡片
    onShareAppMessage() {
        return {
            title: 'NJFU图书馆座位预约',
            path: '/pages/stu/index?stu_id=' + wx.getStorageSync('stu_id'),
        }
    },
    onLoad: function (options) {
        wx.removeStorageSync('stu_id');
        wx.setStorageSync('stu_id', options.stu_id);
    },
    onReady() {
        this.setData({
            stuId: wx.getStorageSync('stu_id'),
        });
        this.getSeatList("part");
    },
    data: {
        showResvDetail: false,
        showAllButton: false
    },
    showAll(){
        this.getSeatList("all");
        this.setData({
            showAllButton: true
        })
    },
    
    getSeatList(num) {
        wx.showLoading({
            title: '加载中',
            duration: 1200
        })
        const stu_id = wx.getStorageSync('stu_id');
        wx.request({
            url: 'https://libseat.littleking.site/wxapi/get_resv_list',
            method: 'POST',
            header: {
                'content-type': 'application/json',
                'Cookie': wx.getStorageSync('auth_cookie')
            },
            data: {
                'type': 'stu',
                'stu_id': stu_id,
                'num': num
            },
            dataType: 'json',
            success: (res) => {
                if (res.data['result'] == 'success') {
                    this.setData({
                        studentList: res.data['data']
                    });
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
        })
    },
    
    getDetail(res) {
        wx.showLoading({
            title: '加载中',
            
        });

        var resvid = res.detail.currentTarget.dataset.custom;
        var that = this;
        wx.request({
            url: "https://libseat.littleking.site/wxapi/get_resv_info/" + resvid,
            method: "GET",
            dataType: "json",
            header: {
                'content-type': 'application/json',
                'Cookie': wx.getStorageSync('auth_cookie')
            },
            success: function (res) {
                var data = JSON.parse(res.data);
                console.log(data)
                if (data.message == '查询成功') {
                    var jsonData = data.data;
                    that.setData({
                        resvDetailList: jsonData,
                        showResvDetail: true,
                    });
                    wx.hideLoading();
                } else {
                    wx.showToast({
                        title: '请求失败',
                        icon: 'error'
                    });
                }
            },
            fail: function () {
                wx.showToast({
                    title: '网络异常',
                    icon: 'error'
                });
            }
        });


    },
    closeResvDetail() {
        this.setData({
            showResvDetail: false,
        })
    },

});