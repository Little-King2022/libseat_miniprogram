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
            path: '/pages/seat/index?seat=' + wx.getStorageSync('seat'),
        }
    },
    onLoad: function (options) {
        wx.removeStorageSync('seat');
        wx.setStorageSync('seat', options.seat);
    },
    onReady() {
        this.setData({
            seat: wx.getStorageSync('seat'),
        });
        this.getSeatList("part");
        this.getNowResv();
    },
    data: {
        showResvDetail: false,
        showAllButton: false,
        showNowResv: true
    },
    // 远程签到按钮
    remoteSign() {
        const seat_name = wx.getStorageSync('seat');
        wx.request({
            url: 'https://libseat.littleking.site/wxapi/get_sign_url',
            method: 'POST',
            header: {
                'content-type': 'application/json',
                'Cookie': wx.getStorageSync('auth_cookie')
            },
            data: {
                'seat': seat_name,
            },
            dataType: 'json',
            success: (res) => {
                if (res.data['result'] == 'success') {
                    wx.setClipboardData({
                        data: "以下是“" + seat_name + "”的远程签到链接。请在微信内发送到任一好友（例如文件传输助手）后打开。\n使用前请先检查：\n1、已连接到校园网或VPN\n2、此微信号已绑定过读者证\n" + res.data['url'],
                        success: (res) => {
                            wx.showModal({
                                title: '签到链接已复制',
                                content: '远程签到链接复制成功，请在微信内发送到任一好友（例如文件传输助手）后打开。',
                            });
                        }
                    })
                }
                else if (res.data['result'] == 'not login.'){
                    wx.showToast({
                        title: '请先登录',
                        icon: 'error',
                        duration: 10000,
                        mask: true
                    })
                }
                 else {
                    wx.showToast({
                        title: '请求失败',
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
        })

    },
    getNowResv() {
        const seat_name = wx.getStorageSync('seat');
        wx.request({
            url: 'https://libseat.littleking.site/wxapi/get_now_resv',
            method: 'POST',
            header: {
                'content-type': 'application/json',
                'Cookie': wx.getStorageSync('auth_cookie')
            },
            data: {
                'seat': seat_name,
            },
            dataType: 'json',
            success: (res) => {
                if (res.data['result'] == 'success') {
                    this.setData({
                        stuId: res.data['stu_id'],
                        stuName: res.data['stu_name'],
                        resvBeginTime: res.data['resv_begin_time'],
                        resvEndTime: res.data['resv_end_time'],
                        showNowResv: false
                    })
                } 
                if (res.data['result'] == 'not login.'){
                    wx.showToast({
                        title: '请先登录',
                        icon: 'error',
                        duration: 10000,
                        mask: true
                    })
                }
            },
        })
    },


    showAll() {
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
        const seat_name = wx.getStorageSync('seat');
        wx.request({
            url: 'https://libseat.littleking.site/wxapi/get_resv_list',
            method: 'POST',
            header: {
                'content-type': 'application/json',
                'Cookie': wx.getStorageSync('auth_cookie')
            },
            data: {
                'type': 'seat',
                'seat_name': seat_name,
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
        })
    },
    getDetail(res) {
        wx.showLoading({
            title: '加载中',
            mask: true
        });

        var resvid = res.detail.currentTarget.dataset.custom;
        var that = this;
        wx.request({
            url: "https://libseat.littleking.site/libseat/get_resvinfo/" + resvid,
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