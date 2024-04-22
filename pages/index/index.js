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
        this.setData({
            isLogin: wx.getStorageSync('isLogin'),
            nickName: wx.getStorageSync('login_stu_id'),
        });
        this.getMyResvList();
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
        isPopupHidden: false,
        loginType1: false,
        loginType2: true,
        stu_id: "",
        stu_phone: "",
        stu_pwd: "",
        checkLoginPwdTips: "默认密码为njfu+身份证后6位+!",
        showMyResvList: true,
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
                // setTimeout(() => {
                //     this.showRequestSubscribeMessage();
                // }, 1000);
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

    // 登录区
    onLoginTabsClick(e) {
        this.setData({
            checkLoginIdTips: "",
            checkLoginPhoneTips: "",
            checkLoginIdStatus: "",
            checkLoginPhoneStatus: "",
            checkLoginPwdStatus: ""
        })
        if (e.detail.value == "0") {
            this.setData({
                loginType1: false,
                loginType2: true,
            })
        } else {
            this.setData({
                loginType2: false,
                loginType1: true,
            })
        };
    },
    checkLoginId(e) {
        var stu_id = e.detail.value;
        if (stu_id.length <= 12 && stu_id.length >= 9) {
            if (this.data.loginType1) {
                this.setData({
                    checkLoginIdStatus: "check-circle",
                    stu_id: stu_id,
                });
            } else {
                wx.request({
                    url: 'https://libseat.littleking.site/wxapi/check_login_id',
                    method: 'POST',
                    header: {
                        'content-type': 'application/json',
                        'Cookie': wx.getStorageSync('auth_cookie')
                    },
                    data: {
                        'stu_id': stu_id,
                    },
                    dataType: 'json',
                    success: (res) => {
                        if (res.data['result'] == 'success') {
                            this.setData({
                                checkLoginIdStatus: "check-circle",
                                checkLoginIdTips: "验证成功，绑定的手机尾号为：" + res.data['data'],
                                stu_id: stu_id,
                            });
                        } else {
                            this.setData({
                                checkLoginIdStatus: "error-circle",
                                checkLoginIdTips: "此账户未绑定过手机号，请使用右侧登录方式",
                                stu_id: stu_id,
                            });
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
            }
        } else {
            this.setData({
                checkLoginIdStatus: "error-circle",
                checkLoginIdTips: "学号格式错误",
            })
        }
    },
    checkLoginPhone(e) {
        var stu_phone = e.detail.value;
        if (/^[1][3,4,5,6,7,8,9][0-9]{9}$/.test(stu_phone)) {
            this.setData({
                checkLoginPhoneStatus: "check-circle",
                checkLoginPhoneTips: "",
                stu_phone: stu_phone,
            })
        } else {
            this.setData({
                checkLoginPhoneStatus: "error-circle",
                checkLoginPhoneTips: "手机号格式错误",
            })
        }
    },
    checkLoginPwd(e) {
        var stu_pwd = e.detail.value;
        if (stu_pwd == "") {
            this.setData({
                checkLoginPwdStatus: "error-circle",
                checkLoginPwdTips: "请输入密码，默认密码为njfu+身份证后6位+!",
            })
        } else {
            this.setData({
                checkLoginPwdStatus: "check-circle",
                stu_pwd: stu_pwd
            })
        }
    },
    getLoginCode(callback) {
        wx.login({
            success(res) {
                if (res.code) {
                    callback(res.code); // 调用回调函数，将 code 作为参数传递
                } else {
                    wx.showToast({
                        title: '请稍后重试',
                        icon: 'error',
                        duration: 1000
                    });
                    callback(false); // 调用回调函数，传递 false 表示失败
                }
            }
        });
    },
    login() {
        wx.showLoading({
            title: '请稍后',
        });
        this.getLoginCode((wxcode) => { // 调用 getLoginCode，并传入一个回调函数

            // 手机号登录
            if (this.data.loginType2 && !this.data.loginType1) {
                var stu_id = this.data.stu_id;
                var stu_phone = this.data.stu_phone;
                if ((stu_id.length <= 12 && stu_id.length >= 9) && (stu_phone.length == 11) && wxcode) {
                    wx.request({
                        url: 'https://libseat.littleking.site/wxapi/wxmplogin',
                        method: 'POST',
                        header: {
                            'content-type': 'application/json',
                            'Cookie': wx.getStorageSync('auth_cookie')
                        },
                        data: {
                            'login_type': "phone",
                            'wxcode': wxcode,
                            'stu_id': stu_id,
                            'stu_phone': stu_phone
                        },
                        dataType: 'json',
                        success: (res) => {
                            if (res.data['result'] == 'success' && (res.data['token']).length == 22) {
                                this.setData({
                                    isLogin: "true",
                                    nickName: res.data['stu_id']
                                });
                                wx.setStorageSync('isLogin', "true");
                                wx.setStorageSync('login_stu_id', stu_id);
                                wx.setStorageSync('token', res.data['token']);
                                wx.showToast({
                                    title: '登录成功',
                                    duration: 1000,
                                    icon: 'success'
                                });
                            } else {
                                wx.showToast({
                                    title: '登录失败',
                                    duration: 1000,
                                    icon: 'error'
                                });
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
                } else {
                    wx.showToast({
                        title: '请稍后重试',
                        icon: 'error',
                        duration: 1000
                    });
                    this.setData({
                        stu_id: "",
                        stu_phone: "",
                        stu_pwd: "",
                        checkLoginIdTips: "",
                        checkLoginPhoneTips: "",
                        checkLoginIdStatus: "",
                        checkLoginPhoneStatus: "",
                        checkLoginPwdStatus: ""
                    })
                }
            }
            // 密码登录
            else if (this.data.loginType1 && !this.data.loginType2) {
                var stu_id = this.data.stu_id;
                var stu_pwd = this.data.stu_pwd;
                if ((stu_id.length <= 12 && stu_id.length >= 9) && (stu_pwd.length > 0) && wxcode) {
                    wx.request({
                        url: 'https://libseat.littleking.site/wxapi/wxmplogin',
                        method: 'POST',
                        header: {
                            'content-type': 'application/json',
                            'Cookie': wx.getStorageSync('auth_cookie')
                        },
                        data: {
                            'login_type': "pwd",
                            'wxcode': wxcode,
                            'stu_id': stu_id,
                            'stu_pwd': stu_pwd
                        },
                        dataType: 'json',
                        success: (res) => {
                            if (res.data['result'] == 'success' && (res.data['token']).length == 22) {
                                this.setData({
                                    isLogin: "true",
                                    nickName: res.data['stu_id']
                                });
                                wx.setStorageSync('isLogin', "true");
                                wx.setStorageSync('login_stu_id', res.data['stu_id']);
                                wx.setStorageSync('token', res.data['token']);

                                wx.showToast({
                                    title: '登录成功',
                                    duration: 1000,
                                    icon: 'success'
                                });
                            } else {
                                wx.showToast({
                                    title: '登录失败',
                                    duration: 1000,
                                    icon: 'error'
                                });
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

                } else {
                    wx.showToast({
                        title: '请稍后重试',
                        icon: 'error',
                        duration: 1000
                    });
                    this.setData({
                        stu_id: "",
                        stu_phone: "",
                        stu_pwd: "",
                        checkLoginIdTips: "",
                        checkLoginPhoneTips: "",
                        checkLoginIdStatus: "",
                        checkLoginPhoneStatus: "",
                        checkLoginPwdStatus: ""
                    })
                }
            } else {
                wx.showToast({
                    title: '请稍后重试',
                    icon: 'error',
                    duration: 1000
                });
            }
        });
        this.getMyResvList();
    },
    logout() {
        wx.setStorageSync('isLogin', "false");
        wx.removeStorageSync('stu_id');
        this.setData({
            isLogin: "false",
            nickName: "",
            showMyResvList: true
        });
        wx.showToast({
            title: '注销成功',
            duration: 1000
        });
    },

    // 查询我的预约记录
    getMyResvList() {
        if (this.data.isLogin == "true") {
            this.setData({
                showMyResvList: true
            });
            wx.showLoading({
                title: '加载中',
            });
            wx.request({
                url: 'https://libseat.littleking.site/wxapi/get_my_resv_list',
                method: 'GET',
                header: {
                    'Cookie': wx.getStorageSync('auth_cookie')
                },
                dataType: 'json',
                success: (res) => {
                    if (res.data['result'] == 'success') {
                        this.setData({
                            myResvList: res.data['data'],
                            showMyResvList: false
                        });
                        wx.hideLoading();
                    } else if (res.data['result'] == 'zero') {
                        wx.showToast({
                            title: '没有预约记录',
                            icon: 'error',
                            duration: 2000,
                        })
                    } else {
                        wx.showToast({
                            title: '请求失败',
                            icon: 'error',
                            duration: 1000,
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
        }
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
        if (e.detail.value == '' || e.detail.value == ' ') {
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
        if (e.detail.value == '' || e.detail.value == ' ') {
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
    // onChooseAvatar(e) {
    //     var tmp_avatar_url = e.detail
    //     // 上传临时头像文件到服务器，并获取真实的头像url地址

    //     this.setData({
    //         avatarUrl: avatar_url,
    //     });
    // },



})