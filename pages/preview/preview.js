// pages/preview/preview.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    src:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      src:options.src
    })
  },
  savePreview:function(){
    console.log('savePreview')
    wx.uploadFile({
      url: 'https://api.water.amwares.com/login',  
      filePath: this.data.src,
      name: 'file',
      header: { Authorization: `Bearer ${app.globalData.userInfo.token}` },
      formData: {
        user: 'test'
      },
      success(res) {
        const data = res.data
        // do something
      },
      fail(err){
        console.log('err', err)
      }
    })
  
    return
    wx.saveImageToPhotosAlbum({
      filePath: res.tempImagePath,
      success(res) {
        console.log("保存图片：success");
        wx.showToast({
          title: '保存成功',
        });


      },
      fail(res) {
        console.log("保存图片：fail");
        console.log(res);
      }
    })
  },
  handleImagePreview(e) {
    console.log(e)
    const images = this.data.src
    wx.previewImage({
      current: images,  //当前预览的图片
      urls: [images],  //所有要预览的图片
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
    return {
      title: '自定义转发标题',
      path: '/page/user?id=123',
      success: function (res) {
        var shareTickets = res.shareTickets;
        if (shareTickets.length == 0) {
          return false;
        }
        wx.getShareInfo({
          shareTicket: shareTickets[0],
          success: function (res) {
            var encryptedData = res.encryptedData;
            var iv = res.iv;
          }
        })
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})