// pages/run/run.js
const app = getApp()
var starRun = 0;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    latitude: app.globalData.latitude,
    longitude: app.globalData.longitude,
    count: app.globalData.count,
    polyline: app.globalData.polyline
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('app', app)
    this.setData({
      latitude: app.globalData.latitude,
      longitude: app.globalData.longitude,
      count: app.globalData.count,
      polyline: app.globalData.polyline
    })
    if (app.globalData.timer) {
      console.log('clearInterval')
      clearInterval(this.timer)
      this.starRun();
    }

  },
  openLocation: function() {
    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function(res) {
        wx.openLocation({
          latitude: res.latitude, // 纬度，范围为-90~90，负数表示南纬
          longitude: res.longitude, // 经度，范围为-180~180，负数表示西经
          scale: 28, // 缩放比例
        })
      },
    })
  },

  starRun: function() {
    if (app.globalData.timer) {
      console.log('clearInterval')
      clearInterval(app.globalData.timer)
    }
    const that = this;
    app.globalData.timer = setInterval(function() {
      that.getLocation();
    }, 1000)

  },
  stopRun: function() {
    console.log(app.globalData.timer)
    if (app.globalData.timer) {
      clearInterval(app.globalData.timer)
    }
  },
  getLocation: function() {
    var that = this
    wx.getLocation({

      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function(res) {
        console.log('res', res)
        console.log('set globalData')
        app.globalData.count = app.globalData.count+1;
        app.globalData.polyline[0].points.push({
          latitude: res.latitude,
          longitude: res.longitude
        });
        app.globalData.latitude = res.latitude
        app.globalData.longitude = res.longitude
        app.globalData.polyline[0].points = app.globalData.polyline[0].points;


        console.log('set data')
        that.data.polyline[0].points.push({
          latitude: res.latitude,
          longitude: res.longitude
        });
        that.data.count = that.data.count + 1
        that.setData({
          count: that.data.count,
          latitude: res.latitude,
          longitude: res.longitude,
          'polyline[0].points': that.data.polyline[0].points
        })


      },
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    console.log('onUnload')
    //clearInterval(this.timer)

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})