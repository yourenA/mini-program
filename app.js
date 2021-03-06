//app.js
App({
  onLaunch: function() {

    //检查是否存在新版本
    wx.getUpdateManager().onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log("是否有新版本：" + res.hasUpdate);
      if (res.hasUpdate) {//如果有新版本

        // 小程序有新版本，会主动触发下载操作（无需开发者触发）
        wx.getUpdateManager().onUpdateReady(function () {//当新版本下载完成，会进行回调
          // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
          wx.getUpdateManager().applyUpdate();
          // wx.showModal({
          //   title: '更新提示',
          //   content: '新版本已经准备好，单击确定重启应用',
          //   showCancel: false,
          //   success: function (res) {
          //     if (res.confirm) {
          //       // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
          //       wx.getUpdateManager().applyUpdate();
          //     }
          //   }
          // })

        })

        // 小程序有新版本，会主动触发下载操作（无需开发者触发）
        wx.getUpdateManager().onUpdateFailed(function () {//当新版本下载失败，会进行回调
          wx.showModal({
            title: '提示',
            content: '检查到有新版本，但下载失败，请检查网络设置',
            showCancel: false,
          })
        })
      }
    })


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