// pages/requestSubscribe/index.js
Page({
    requestSubscribe() {
        if (wx.getStorageSync('auth_cookie') == '') {
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
                url: 'https://libseat.littleking.site/wxapi/get_subscribe_tmpls',
                method: 'GET',
                header: {
                    'content-type': 'application/json',
                    'Cookie': wx.getStorageSync('auth_cookie')
                },
                success: (res) => {
                    const data = res['data'];
                    const count = data['count'];
                    if (count == 0) {
                        wx.showModal({
                            title: '提示',
                            showCancel: false,
                            confirmText: '关闭',
                            content: '暂无可以订阅的通知',
                        })
                    } else {
                        const list = data['list'];
                        const tmpls_list = [];
                        for (let i = 0; i < count; i++) {
                            tmpls_list.push(list[i]['id']);
                        }
                        wx.requestSubscribeMessage({
                            tmplIds: tmpls_list,
                            success(res) {
                                const success_name_list = [];
                                const success_id_list = [];
                                const fail_name_list = [];
                                for (let i = 0; i < count; i++) {
                                    if (res[list[i]['id']] == "accept") {
                                        success_name_list.push(list[i]['name']);
                                        success_id_list.push(list[i]['id']);
                                    } else {
                                        fail_name_list.push(list[i]['name']);
                                    }
                                }
                                wx.request({
                                    url: 'https://libseat.littleking.site/wxapi/subscribe_success',
                                    method: 'POST',
                                    header: {
                                        'content-type': 'application/json',
                                        'Cookie': wx.getStorageSync('auth_cookie')
                                    },
                                    data: {
                                        'success_list': success_id_list,
                                    },
                                    dataType: 'json',
                                    success: (res) => {
                                        if (res.data['result'] == 'success') {
                                            if (fail_name_list.length == 0) {
                                                wx.showModal({
                                                    title: '订阅结果',
                                                    showCancel: false,
                                                    confirmText: '关闭',
                                                    content: '*以下订阅成功*\n' + success_name_list,
                                                })
                                            } else {
                                                wx.showModal({
                                                    title: '订阅结果',
                                                    showCancel: false,
                                                    confirmText: '关闭',
                                                    content: '*以下订阅成功*\n' + success_name_list + '\n*以下订阅失败*\n' + fail_name_list,
                                                    success: (res) => {
                                                        if (res.confirm) {
                                                            wx.showModal({
                                                                title: '提示',
                                                                showCancel: false,
                                                                confirmText: '关闭',
                                                                content: '*如需修改，请按如下步骤*\n右上角三个点 -> 设置 -> 订阅消息',
                                                            });
                                                        }
                                                    }
                                                })

                                            }

                                        } else {
                                            wx.showToast({
                                                title: '订阅失败',
                                                icon: 'error',
                                                duration: 3000
                                            });
                                        }
                                    },
                                    fail: () => {
                                        wx.showToast({
                                            title: '网络异常',
                                            icon: 'error',
                                            duration: 3000
                                        });
                                    }
                                })
                            },
                            fail: () => {
                                wx.showToast({
                                    title: '订阅失败',
                                    icon: 'error',
                                    duration: 3000
                                });
                            }
                        })
                    }
                },
                fail: () => {
                    wx.showToast({
                        title: '网络异常',
                        icon: 'error',
                        duration: 3000
                    });
                }
            })
        }
    },
    onInputChange(e) {
        if (this.validateUrl(e.detail.value)) {
            this.setData({
                "validBarkToken": true
            });
        } else {
            this.setData({
                "validBarkToken": false
            });
        }
    },
    validateUrl(url) {
        // 正则表达式匹配URL中的推送token部分
        const urlPattern = /^(https:\/\/api\.day\.app\/)([a-zA-Z0-9]{22})(\/.*)?$/;
        const match = url.match(urlPattern);

        if (match) {
            const token = match[2];
            // wx.setStorageSync('barkToken', token);
            this.setData({
                "tmpBarkToken": token
            })
            return true;
        } else {
            return false;
        }
    },
    testToken(e) {
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
                url: 'https://libseat.littleking.site/wxapi/test_bark_token',
                method: 'POST',
                header: {
                    'content-type': 'application/json',
                    'Cookie': wx.getStorageSync('auth_cookie')
                },
                data: {
                    'token': this.data.tmpBarkToken?this.data.tmpBarkToken:this.data.barkToken
                },
                success: (res) => {
                    if (res.statusCode == 200) {
                        wx.showToast({
                            title: '推送成功，请检查是否收到通知',
                            icon: 'none'
                        })
                    } else {
                        wx.showToast({
                            title: res.data.message?res.data.message:"系统错误，请稍后重试",
                            icon: 'none'
                        })
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
    },
    saveToken() {
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
        } else if (this.data.tmpBarkToken == null) {
            wx.showToast({
                title: '请先输入推送链接',
                duration: 2000,
                icon: 'error'
            });
        } else {
            wx.request({
                url: 'https://libseat.littleking.site/wxapi/save_bark_token',
                method: 'POST',
                header: {
                    'content-type': 'application/json',
                    'Cookie': wx.getStorageSync('auth_cookie')
                },
                data: {
                    'token': this.data.tmpBarkToken
                },
                success: (res) => {
                    if (res.statusCode == 200) {
                        this.setData({
                            'barkToken': this.data.tmpBarkToken
                        });
                        wx.setStorageSync('barkToken', this.data.tmpBarkToken)
                        wx.showToast({
                            title: '保存成功',
                            icon: 'none'
                        });
                    } else {
                        wx.showToast({
                            title: res.data.message?res.data.message:"系统错误，请稍后重试",
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
    },
    removeToken(){
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
                url: 'https://libseat.littleking.site/wxapi/remove_bark_token',
                method: 'GET',
                header: {
                    'content-type': 'application/json',
                    'Cookie': wx.getStorageSync('auth_cookie')
                },
                success: (res) => {
                    if (res.statusCode == 200) {
                        this.setData({
                            'barkToken': null
                        });
                        wx.removeStorageSync('barkToken')
                        wx.showToast({
                            title: '关闭成功',
                            icon: 'none'
                        });
                    } else {
                        wx.showToast({
                            title: res.data.message?res.data.message:"系统错误，请稍后重试",
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
    onShow(){
        this.setData({
            'barkToken': wx.getStorageSync('barkToken')
        })
    },
    data: {
        "style": "border:4rpx solid rgba(220,220,220,1);border-radius: 16rpx;height:40rpx;margin-bottom: 10rpx",
        "validBarkToken": false,
        "barkToken": wx.getStorageSync('barkToken'),
        "tmpBarkToken": ""
    },
    methods: {

    },
})