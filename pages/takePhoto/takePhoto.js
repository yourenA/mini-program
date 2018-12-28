// pages/takePhoto/takePhoto.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    flash:'off',
    onTaking:false,
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.ctx = wx.createCameraContext();
    this.setData({
      flashIconPath: this.data.flash === 'off' ? '../../icon/flash-off.png' : '../../icon/flash-on.png',
      cameraIconPath: this.data.onTaking===false ? '../../icon/camera.png' :'../../icon/camera-ing.png'
    })
  },
  takePhoto() {
    this.setData({
      onTaking:true,
      cameraIconPath: '../../icon/camera-ing.png'
    })
    this.ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        console.log('res', res)
        const tempImagePath = res.tempImagePath
        this.setData({
          src: res.tempImagePath
        })
        wx.navigateTo({
          url: `/pages/preview/preview?src=${tempImagePath}`
        })
       

      },
      complete: (res) => {
        this.setData({
          onTaking: false,
         
          cameraIconPath: '../../icon/camera.png'
        })
      }
    })
  },
  takePhotoFlash:function(){
    console.log(this.data.flash)
    this.setData({
      flash:this.data.flash==='off'?'on':'off'
    },function(){
      this.setData({
        flashIconPath: this.data.flash === 'off' ? '../../icon/flash-off.png' : '../../icon/flash-on.png'
      })
     
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