//app.js
App({
  onLaunch: function () {
    wx.showShareMenu({
      withShareTicket: true
    })
    // 展示本地存储能力
    var username = wx.getStorageSync('userInfo') ;
    console.log('username', username)
    if(username){
      console.log('已经登陆');
      this.globalData.userInfo=username;
    }else{
      console.log('没有登陆');
      wx.redirectTo({
        url:'/pages/login/login'
      })
    }
  },
  onHide:function(){
    
  },
  globalData: {
    latitude: 23.10229,
    longitude: 113.3345211,
    count: 0,
    polyline: [{
      points: [],
      color: '#1AAD19',
      width: 4,
      dottedLine: false
    }],
    userInfo: null,
    photoSrc:''
  },
  timer: null,
})