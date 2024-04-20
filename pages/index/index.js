// index.js
import Message from 'tdesign-miniprogram/message/index';
// 分享权限控制
wx.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline'],
});
Page({
    // 自定义分享卡片
    onShareAppMessage() {
        return {
            title: '我发现了一个很好用的座位预约小程序，推荐给你～',
            path: 'pages/index/index',
        }
    },
    onReady() {
        setTimeout(() => {
            this.getLibNum();
            this.getResvNum();

        }, 500);
        setInterval(() => {
            this.getLibNum();
            this.getResvNum();
        }, 20000);
        
    },
    onShow(){
        this.setData({
            isLogin: wx.getStorageSync('isLogin')
        });

    },

    data: {
        home_input_style: 'border: 3rpx solid rgba(220,220,220,1);border-radius: 16rpx;height:30rpx',
        showHelpInfoDlg: false,
        isHomeHidden: false,
        isResvHidden: true,
        isMyHidden: true,
        currentPage: 'home',
        inLibPercentage: 0,
        resvPercentage: 0,
        _2fnum: 0,
        _3fnum: 0,
        _4fnum: 0,
        _5fnum: 0,
        _6fnum: 0,
        _2fPer: 0,
        _3fPer: 0,
        _4fPer: 0,
        _5fPer: 0,
        _6fPer: 0,
        resvCount: 0,
        freeCount: 0,
        inLibCount: 0,
        remainCount: 0,
        isPopupHidden: false

    },
    methods: {

    },

    showRequestSubscribeMessage() {
        // 计算偏移量
        const navigationBarHeight = wx.getSystemInfoSync().statusBarHeight + 110 + 'rpx';
        Message.info({
            context: this,
            offset: [navigationBarHeight, 20],
            icon: 'notification-filled',
            content: '若您需要接收“预约成功”和“签到成功”的通知，请先点击右侧按钮授权',
            marquee: {
                speed: 70,
                loop: -1,
                delay: 0
            },
            duration: 30000,
            link: {
                content: '点击订阅通知',
                navigatorProps: {
                    url: '/pages/requestSubscribe/index?seat=123',
                },
            },
        });
    },
    changePages(e) {
        if (e.detail.value == 'home') {
            this.setData({
                isHomeHidden: false,
                isResvHidden: true,
                isMyHidden: true,
                currentPage: 'home',
            });
        }
        if (e.detail.value == 'resv') {
            if (wx.getStorageSync('isLogin') == "true") {
                // 延迟1秒执行
                setTimeout(() => {
                    this.showRequestSubscribeMessage();
                }, 1000);
                this.setData({
                    isHomeHidden: true,
                    isResvHidden: false,
                    isMyHidden: true,
                    currentPage: 'resv',
                });
            } else {
                this.needLogin();
            }
        }
        if (e.detail.value == 'my') {
            this.setData({
                isHomeHidden: true,
                isResvHidden: true,
                isMyHidden: false,
                currentPage: 'my',
            });
        }
    },
    needLogin() {
        this.setData({
            isPopupHidden: true
        })
    },
    jumpToLogin() {
        this.setData({
            isPopupHidden: false,
            isHomeHidden: true,
            isResvHidden: true,
            isMyHidden: false,
            currentPage: 'my',
        });
    },
    login() {
        wx.setStorageSync('isLogin', "true");
        wx.showToast({
            title: '测试登录成功',
            duration: 1000
        });
        this.setData({
            isLogin: true
        });
    },
    logout() {
        wx.setStorageSync('isLogin', "false");
        wx.showToast({
            title: '测试注销成功',
            duration: 1000
        });
        this.setData({
            isLogin: false
        });
        
    },


    onPopupVisibleChange(e) {
        this.setData({
            isPopupHidden: e.detail.visible,
        });
    },

    showHelpInfo() {
        this.setData({
            showHelpInfoDlg: true,
        });
    },
    closeHelpInfo() {
        this.setData({
            showHelpInfoDlg: false,
        });
    },
    getLibNum() {
        if (wx.getStorageSync('isAuth') == "true") {
            wx.request({
                url: 'https://libseat.littleking.site/libseat/get_inlibnum',
                method: 'GET',
                header: {
                    'Cookie': wx.getStorageSync('auth_cookie')
                },
                success: (res) => {
                    try {
                        res = JSON.parse(res.data);
                        var current_count = res.current_count;
                        var remain_count = res.remaining_count;
                        this.setData({
                            inLibPercentage: (current_count / remain_count * 100).toFixed(0),
                            inLibCount: current_count,
                            remainCount: remain_count,
                        });
                    } catch {
                        wx.showToast({
                            title: '请求失败',
                            icon: 'error',
                            duration: 2000,
                            mask: true
                        })
                    }
                }
            })
        };
    },
    getResvNum() {
        if (wx.getStorageSync('isAuth') == "true") {
            wx.request({
                url: 'https://libseat.littleking.site/libseat/get_all_resv',
                method: 'GET',
                header: {
                    'Cookie': wx.getStorageSync('auth_cookie')
                },
                contentType: "application/json",
                success: (res) => {
                    if (res['data']['result'] == 'success') {
                        this.setData({
                            'resvCount': res['data']['resvnum'],
                            'freeCount': res['data']['freenum'],
                            'resvPercentage': (100 - res['data']['freerate']).toFixed(0)
                        })
                    }
                }

            })
            for (let i = 2; i <= 6; i++) {
                wx.request({
                    url: 'https://libseat.littleking.site/libseat/get_room_resv/' + i,
                    method: 'GET',
                    contentType: 'application/json',
                    header: {
                        'Cookie': wx.getStorageSync('auth_cookie')
                    },
                    success: (res) => {
                        if (res['data']['result'] == 'success') {
                            this.setData({
                                ['_' + i + 'fnum']: res['data']['freenum'],
                                ['_' + i + 'fPer']: parseInt(100 - res['data']['freerate']),
                            });
                        }
                    }
                })
            }
        };
    },

    // 座位查询输入框
    bindSeatInput(e) {
        if (e.detail.value == '') {
            this.setData({
                isSeatPickerHidden: true,
            })
        } else {
            this.setData({
                isSeatPickerHidden: false,
            })
        }
        wx.request({
            url: 'https://libseat.littleking.site/libseat/search_seat_by_name',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded',
                'Cookie': wx.getStorageSync('auth_cookie')
            },
            data: {
                'query': e.detail.value
            },
            dataType: 'json',
            success: (res) => {
                var seatList = res['data']['results']
                this.setData({
                    seatList: seatList
                })
            }
        })
    },
    // 预约查询输入框
    bindResvInput(e) {
        if (e.detail.value == '') {
            this.setData({
                isStuPickerHidden: true,
            })
        } else {
            this.setData({
                isStuPickerHidden: false,
            })
        }
        wx.request({
            url: 'https://libseat.littleking.site/libseat/search_stu',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded',
                'Cookie': wx.getStorageSync('auth_cookie')
            },
            data: {
                'query': e.detail.value
            },
            dataType: 'json',
            success: (res) => {
                var stuList = res['data']['stu_list']
                this.setData({
                    stuList: stuList
                })
            }
        })
    },

    bindSeatSelect(e) {
        if (wx.getStorageSync('isLogin') == "true") {
            var seat = e.target.dataset.item;
            wx.navigateTo({
                url: '/pages/seat/index?seat=' + seat,
            })
        } else {
            this.needLogin();
        }

    },
    bindStuSelect(e) {
        if (wx.getStorageSync('isLogin') == "true") {

            var stu_id = (e.target.dataset.item).match(/.*\d+/g);
            wx.navigateTo({
                url: '/pages/stu/index?stu_id=' + stu_id,
            })
        } else {
            this.needLogin();
        }
    },







    // my页面
    onChooseAvatar(e) {
        console.log(e.detail);
        this.setData({
            avatarUrl: e.detail,
        });
        console.log('after');
    },



})