// pages/qqmap/qqmap.js
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
 
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    qqmapsdk = new QQMapWX({
      key: 'C5HBZ-H4PWI-J4JGT-5ZLM6-BKXDH-4EF2Z'
    });
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
    qqmapsdk.search({
      keyword: '酒店',
      success: function(res) {
        console.log('search res',res);
      },
      fail: function(res) {
        console.log('search fail',res);
      }
    })

    qqmapsdk.calculateDistance({
      from: {
        latitude: 39.0012,
        longitude: 117.12
      },
      to: [{
        latitude: 39.984060,
        longitude: 116.307520
      }, {
        latitude: 39.984572,
        longitude: 116.306339
      }],
      success: function (res) {
        console.log('calculateDistance res',res);
      },
      fail: function (res) {
        console.log('calculateDistance fail',res);
      }
    });

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