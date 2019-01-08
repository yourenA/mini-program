//app.js
App({
  onLaunch: function() {
    wx.showShareMenu({
      withShareTicket: true
    })
    // 展示本地存储能力
    var username = wx.getStorageSync('userInfo');
    console.log('username', username)
    if (username) {
      console.log('已经登陆');
      this.globalData.userInfo = username;
    } else {
      console.log('没有登陆');
      console.log('切换到登陆页面')
      wx.redirectTo({
        url: '/pages/login/login'
      })
    }
  },
  onHide: function() {

  },
  globalData: {
    userInfo: null,
  },
  timer: null,
  points: [],
  polyline: [],
  failArr:[]
})