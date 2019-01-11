// pages/preview/preview.js
import { promisify } from '../../utils/promise.util'
const app = getApp()
const util = require('../../utils/util.js')

const gcoord = require('../../utils/gcoord.js')
const wxUploadFile = promisify(wx.uploadFile)
Page({

  /**
   * 页面的初始数据
   */
  data: {
    images: [],
    failArr:[],
    percent: 0,
    doneLat: "0",
    doneLng: "0",
    nextLat: "0",
    nextLng: "0"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    console.log(options)
    let images = JSON.parse(options.src);
    let transImage=[]
    for(let i=0;i<images.length;i++){
      const item = {};
      item.url = images[i];
      item.percent = 0;

      transImage.push(item)
    }
    this.setData({
      images: transImage,
      doneLat: options.doneLat,
      doneLng: options.doneLng,
      nextLat: options.nextLat,
      nextLng: options.nextLng
    })
  },
  handleImagePreview(e) {
    
    const idx = e.target.dataset.idx
    const images = this.data.images.map((item,index)=>{
      return item.url
    })
    console.log('images',images)
    wx.previewImage({
      current: images[idx],  //当前预览的图片
      urls: images,  //所有要预览的图片
    })
  },
  removeImage(e) {
    const idx = e.target.dataset.idx
    this.data.images.splice(idx, 1)
   this.setData({
     images: this.data.images
   })
  },
  chooseImage(e) {
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        
        for (let i = 0; i < res.tempFilePaths.length; i++) {
          let images = this.data.images
          const item = {};
          item.url = res.tempFilePaths[i];
          item.percent = 0;

          images = this.data.images.concat(item)
          console.log('images', images)
          this.data.images = images.length <= 9 ? images : images.slice(0, 9)
          this.setData({
            images: this.data.images
          })
        }
       
        
      }
    })
  },
  setFailArr:function(item){
    app.failArr.push(item);
    console.log('app.failArr', app.failArr)
    // this.setData({
    //   failArr: this.data.failArr
    // },function(){
    //   console.log('this.data.failArr', this.data.failArr)
    // })
  },
  savePreview: function() {
    console.log('savePreview')
    const that = this;
    wx.showModal({
      title: '提示',
      content: '确定要上传当前照片吗?',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.getLocation({
            type: 'gcj02',
            altitude: true,
            success: (res) => {
              console.log("getLocation", res)
              const latitude = res.latitude // 纬度
              const longitude = res.longitude // 经度

              let result = gcoord.transform(
                [longitude, latitude], // 经纬度坐标
                gcoord.GCJ02, // 当前坐标系
                gcoord.BD09 // 目标坐标系
              );

              console.log('that.data',that.data)
            
              let nowToDoneDistance = util.getDistance(result[1], result[0], that.data.doneLat, that.data.doneLng);
              let nowToNextDistance = util.getDistance(result[1], result[0], that.data.nextLat, that.data.nextLng);

              console.log('当前到已经抄表距离', nowToDoneDistance)
              console.log('当前到下一个抄表距离', nowToNextDistance)
              let sendPoint = {}
              if (nowToDoneDistance=='NaN'){
                console.log('使用下一个地点')
                sendPoint={ latitude: that.data.nextLat, longitude: that.data.nextLng } 
              }else{

                sendPoint = Number(nowToDoneDistance) >= Number(nowToNextDistance) ? { latitude: that.data.nextLat, longitude: that.data.nextLng } : { latitude: that.data.doneLat, longitude: that.data.doneLng }
              }
              
              console.log('sendPoint', sendPoint)
              let distance = util.getDistance(result[1], result[0], sendPoint.latitude, sendPoint.longitude);
              console.log('上传图片距离', distance, '米')
              if (distance > 200) {
                console.log('大于200米');
                wx.showToast({
                  title: `当前定位距离目标过远`,
                  icon: 'none'
                })
                return 
              }

              for (let i = 0; i < that.data.images.length;i++){

                let uploadTask = wx.uploadFile({
                  url: 'https://api.water.amwares.com/meter_images',
                  filePath: that.data.images[i].url,
                  name: 'file',
                  header: {
                    "Content-Type": "multipart/form-data",

                    "Authorization": `Bearer ${app.globalData.userInfo.token}`
                  },
                  formData: {
                    latitude: sendPoint.latitude,
                    longitude: sendPoint.longitude,

                  },

                  success(res) {
                    console.log('success', res)
                    let pages = getCurrentPages();
                    let prevPage = pages[pages.length - 2];
                    if (res.statusCode === 200) {
                      that.data.images.splice(i, 1)
                      that.setData({
                        images: that.data.images
                      })
                      wx.showToast({
                        title: `上传成功`,
                        icon: 'success'
                      });

                    } else if (res.statusCode === 413) {
                      that.setFailArr(that.data.images[i])
                      that.setData({
                        percent: 0
                      })
                      wx.showToast({
                        title: `照片过大,上传失败`,
                        icon: 'none'
                      })
                    } else {
                      that.setFailArr(that.data.images[i])
                      that.setData({
                        percent: 0
                      })
                      util.converErrorCodeToMsg(res.data)

                    }



                    // do something
                  },
                  fail(err) {
                    
                    console.log('err', err)
                    that.setFailArr(that.data.images[i])
                    that.setData({
                      percent: 0
                    })
                    wx.showToast({
                      title: `上传失败,请重试`,
                      icon: 'none'
                    })
                  }

                })

                uploadTask.onProgressUpdate((res) => {
                  console.log('上传进度', res.progress)

                  if (res.progress === 100) {
                    setTimeout(function () {
                      that.setData({
                        percent: 0
                      })
                    }, 300)



                  } else {
                    that.setData({
                      percent: res.progress
                    })
                  }

                  console.log('已经上传的数据长度', res.totalBytesSent)
                  console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
                })

                // uploadTask.onProgressUpdate((res) => {
                //   console.log('上传进度', res.progress)
                //   const key = `images[${i}].percent`
                //   if (res.progress === 100) {
                //     setTimeout(function () {
                //       that.setData({
                //         [key]: 0
                //       })
                //     }, 300)

                //   } else {

                //     that.setData({
                //       [key]: res.progress
                //       //percent: res.progress
                //     })
                //   }

                //   console.log('已经上传的数据长度', res.totalBytesSent)
                //   console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
                // })
              }
             

              

              return

              const arr = []

              //将选择的图片组成一个Promise数组，准备进行并行上传
              for (let path of that.data.images) {
                arr.push(wxUploadFile({
                  url: 'https://api.water.amwares.com/meter_images',
                  filePath: path,
                  name: 'file',
                  header: {
                    "Content-Type": "multipart/form-data",

                    "Authorization": `Bearer ${app.globalData.userInfo.token}`
                  },
                  formData: {
                    latitude: sendPoint.latitude,
                    longitude: sendPoint.longitude,

                  },
                }))
              }


              // 开始并行上传图片
              Promise.all(arr).then(res => {
                // 上传成功，获取这些图片在服务器上的地址，组成一个数组
                console.log('res', res)
                return res.map(item => JSON.parse(item.data).url)
              }).catch(err => {
                console.log(">>>> upload images error:", err)
              }).then(urls => {
                console.log('urls', urls)
                // 调用保存问题的后端接口
                // return createQuestion({
                //   title: title,
                //   content: content,
                //   images: urls
                // })
              }).then(res => {
                // 保存问题成功，返回上一页（通常是一个问题列表页）
                // const pages = getCurrentPages();
                // const currPage = pages[pages.length - 1];
                // const prevPage = pages[pages.length - 2];

                // // 将新创建的问题，添加到前一页（问题列表页）第一行
                // prevPage.data.questions.unshift(res)
                // $digest(prevPage)

                // wx.navigateBack()
              }).catch(err => {
                console.log(">>>> create question error:", err)
              }).then(() => {
                // wx.hideLoading()
              })
            
return

              const uploadTask = wx.uploadFile({
                url: 'https://api.water.amwares.com/meter_images',
                filePath: that.data.images,
                name: 'file',
                header: {
                  "Content-Type": "multipart/form-data",

                  "Authorization": `Bearer ${app.globalData.userInfo.token}`
                },
                formData: {
                  latitude: sendPoint.latitude,
                  longitude: sendPoint.longitude,
                 
                },

                success(res) {
                  console.log('success', res)
                  let pages = getCurrentPages();
                  let prevPage = pages[pages.length - 2];
                  console.log('pages', pages)
                  console.log('prevPage', prevPage)
                  if (res.statusCode === 200) {
                    wx.showToast({
                      title: `上传成功`,
                      icon: 'success'
                    });


                    prevPage.getDistance()
                    setTimeout(function () {
                      wx.navigateBack({
                        delta: 1,
                      })
                    }, 1000)

                  } else if (res.statusCode === 413) {
                    that.setData({
                      percent: 0
                    })
                    wx.showToast({
                      title: `照片过大,上传失败`,
                      icon: 'none'
                    })
                  } else {
                    that.setData({
                      percent: 0
                    })
                    util.converErrorCodeToMsg(res.data)

                  }



                  // do something
                },
                fail(err) {
                  console.log('err', err)
                  that.setData({
                    percent: 0
                  })
                  wx.showToast({
                    title: `上传失败,请重试`,
                    icon: 'none'
                  })
                },

                complete(res) {
                  console.log('complete', res)
                }
              })

              uploadTask.onProgressUpdate((res) => {
                console.log('上传进度', res.progress)

                if (res.progress === 100) {
                  setTimeout(function () {
                    that.setData({
                      percent: 0
                    })
                  }, 300)



                } else {
                  that.setData({
                    percent: res.progress
                  })
                }

                console.log('已经上传的数据长度', res.totalBytesSent)
                console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
              })


            },

            fail: (res) => {
              console.log('获取定位失败，请重试')
              wx.showToast({
                title: `定位失败,无法上传`,
                icon: 'none'
              })
            }
          })
         


          return
         

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })


  },
  // handleImagePreview(e) {
  //   console.log(e)
  //   const images = this.data.images
  //   wx.previewImage({
  //     current: images, //当前预览的图片
  //     urls: [images], //所有要预览的图片
  //   })
  // },


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