// pages/login/login.js
const util = require('../../utils/util.js')
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    code:''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.code){
      this.setData({
        code: options.code
      })
    }
  
  },
  formSubmit(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    const username = e.detail.value.username;
    const password = e.detail.value.password;
    const company_code = e.detail.value.company_code;
    wx.request({
      url: 'https://api.water.amwares.com/login',   
      data: {
        username,
        password,
        company_code
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log('res',res)
     
        if (res.statusCode===200){
          console.log('登陆成功')
          wx.setStorageSync('userInfo', res.data)
          app.globalData.userInfo = res.data
          wx.showToast({
            title: '登陆成功',
            icon: 'success'
          })
          wx.switchTab({
            url: '/pages/index/index'
          })
        }else{
          console.log('登陆失败')
          util.converErrorCodeToMsg(res.data)
        }
        
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})