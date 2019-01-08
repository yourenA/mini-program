// pages/run/run.js
const gcoord = require('../../utils/gcoord.js')
const util = require('../../utils/util.js')
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  timer: null,
  data: {
    array: ['线路一', '线路二', '线路三', '线路四'],
    index: 0,
    latitude: 23.12463,
    longitude: 113.36199,
    polyline: [],
    markers: [],
    date: ''
  },
  /**
   * 监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      date: util.getMonth(),

    })

    const user_id = app.globalData.userInfo.user_id;
    const that = this;
    wx.request({
      url: `https://api.water.amwares.com/locations/${user_id}`,
      header: {
        Authorization: `Bearer ${app.globalData.userInfo.token}`
      },
      method: 'GET',
      success: function(res) {
       // console.log('get locations res', res)

        if (res.statusCode === 200) {

          wx.request({
            url: `https://api.water.amwares.com/location_data`,
            header: {
              Authorization: `Bearer ${app.globalData.userInfo.token}`
            },
            method: 'GET',
            data: {
              month: that.data.date,

            },
            success: function(doneRes) {
              console.log('get location_data doneRes', doneRes)
              if (doneRes.statusCode === 200) {
                console.log('获取成功')
                const donePoints = doneRes.data.data
                qqmapsdk = new QQMapWX({
                  key: 'C5HBZ-H4PWI-J4JGT-5ZLM6-BKXDH-4EF2Z' // 必填
                });
                let BD09ToGCJ02 = []
                for (let i = 0; i < res.data.locations.data.length; i++) {
                  let point = res.data.locations.data[i]
                  let result = gcoord.transform(
                    [point.longitude, point.latitude], // 经纬度坐标
                    gcoord.BD09, // 当前坐标系
                    gcoord.GCJ02 // 目标坐标系
                  );
                  let done = -1;
                  let created_at=""
            
                  for (let j = 0; j < donePoints.length; j++) {
                    if (donePoints[j].latitude == point.latitude && donePoints[j].longitude == point.longitude) {
                      done = 1;
                      created_at = donePoints[j].created_at
                      console.log('有一个done')
                    }
                  }
                  BD09ToGCJ02.push({
                    id: `${result[0]}/${result[1]}`,
                    longitude: result[0],
                    latitude: result[1],
                    oriLongitude: point.longitude,
                    oriLatitude: point.latitude,
                    done: done,
                    meter_count: point.meter_count,
                    alpha: 0.8,
                    created_at: created_at,
                    title: `第${i + 1}个地点`,
                    label: {
                      content: `第${i + 1}个地点`,
                      padding: 5,
                      borderRadius: 5,
                      bgColor: '#EEE'
                    },
                    callout: {
                      content: created_at?`水表数量:${point.meter_count}\n备注:${point.remark}\n最后抄表时间:${created_at}`:
                        `水表数量:${point.meter_count}\n备注:${point.remark}`,
                      fontSize: 16,
                      borderRadius: 5,
                      padding: 5
                    }
                  })
                }
                console.log('BD09ToGCJ02', BD09ToGCJ02)

                that.setData({
                  markers: BD09ToGCJ02,
                })
                that.changemarker(BD09ToGCJ02)
                that.changePolyline(BD09ToGCJ02)
                that.getLocation()



              } else {
                console.log('获取失败')
              }
            }
          })




        } else {
          console.log('获取失败')
          util.converErrorCodeToMsg(res.data)
        }
      }
    })
    setTimeout(function () {
      that.getDistance()
    }, 100)
    that.getDistance()
    if (!this.timer) {
      console.log('strt on onload')
      this.timer = setInterval(function() {
        that.getDistance()
      }, 10000)
    }

  },
  bindMaptap:function(e){
    console.log('bindMaptap')
  },
  changemarker: function(points) {
    for (let i = 0; i < points.length; i++) {
      points[i].iconPath = points[i].done === 1 ? '/icon/location.png' : '/icon/location-red.png'
    }
    this.setData({
      markers: points,
    })
  },


  changePolyline: function(points) {
    let doneIndex = -1;
    for (let i = 0; i < points.length; i++) {
      if (points[i].done === 1) {
        doneIndex = i
      }
    }
    console.log('doneIndex', doneIndex)
    if (doneIndex >= 0) {
      this.setData({
        polyline: []

      })
      let donePoints = points.slice(0, doneIndex + 1);
      let noDonePoints = points.slice(doneIndex);
      console.log('donePoints', donePoints)
      console.log('noDonePoints', noDonePoints)
      this.data.polyline.push({
        points: donePoints,
        color: '#65c835',
        width: 6
      })
      this.data.polyline.push({
        points: noDonePoints,
        color: '#f96e6e',
        width: 6
      })
      this.setData({
        polyline: this.data.polyline

      }, function() {
        console.log(this.data.polyline)
      })
    } else {
      this.data.polyline.push({
        points: points,
        color: '#f96e6e',
        width: 6
      })
      this.setData({
        polyline: this.data.polyline

      })
    }



  },



  openCamera: function() {
    const that = this;
    wx.chooseImage({
      sizeType: 'compressed',
    
      success(res) {
        console.log('res', res)
        
         const tempFilePaths = JSON.stringify(res.tempFilePaths);
        // let tempFilePaths=[];
        // for (let i = 0; i < res.tempFilePaths.length;i++){
        //     tempFilePaths.push(res.tempFilePaths[i])
        // }
        let undoneIndex = -1;
        let lng = 0;
        let lat = 0;
        let nextPoint = {};
        let donePoint = {};
        for (let i = 0; i < that.data.markers.length; i++) {
          if (that.data.markers[i].done === -1) {
            undoneIndex = i;
            lng = that.data.markers[i].oriLongitude;
            lat = that.data.markers[i].oriLatitude;
            break
          }
        }
        console.log('undoneIndex', undoneIndex)
        if (undoneIndex > 0) {
          nextPoint = that.data.markers[undoneIndex]
          donePoint = that.data.markers[undoneIndex - 1]
        } else if (undoneIndex === 0) {
          nextPoint = that.data.markers[undoneIndex]
        } else if (undoneIndex === -1){
          donePoint = that.data.markers[that.data.markers.length-1]
        }
        console.log('donePoint', donePoint)
        console.log('nextPoint', nextPoint)
        wx.navigateTo({
          url: `/pages/preview/preview?src=${tempFilePaths}&doneLng=${donePoint.oriLongitude}&doneLat=${donePoint.oriLatitude}&nextLng=${nextPoint.oriLongitude}&nextLat=${nextPoint.oriLatitude}`
        })
      }
    })
  },
  openLocation: function(lacation) {
    console.log('lacation', lacation)
    let longitude = lacation.split('/')[0];
    let latitude = lacation.split('/')[1];
    wx.openLocation({
      latitude: Number(latitude), // 纬度，范围为-90~90，负数表示南纬
      longitude: Number(longitude), // 经度，范围为-180~180，负数表示西经
      scale: 15, // 缩放比例
    })


  },

  getLocation: function() {
    const that = this;
    wx.getLocation({

      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function(res) {
        console.log('res', res)
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,

        })
      }
    })
  },
  getDistance: function() {
    var that = this
    wx.getLocation({

      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function(res) {
        // console.log('res', res)
        // that.setData({
        //   latitude: res.latitude,
        //   longitude: res.longitude,

        // })
        let checkPoint = null;
        let pointIndex = null
        for (let i = 0; i < that.data.markers.length; i++) {

          if (that.data.markers[i].done !== 1) {
            checkPoint = that.data.markers[i];
            pointIndex = i
            break;

          }
        }
        // console.log('checkPoint', checkPoint)
        // console.log('pointIndex', pointIndex)
        if (checkPoint) {
          
          let distance = util.getDistance(res.latitude, res.longitude, checkPoint.latitude, checkPoint.longitude);
          console.log('手工距离', distance, '米')
          if (distance < 200) {
            console.log('小于100米');


            wx.request({
              url: `https://api.water.amwares.com/location_data`,
              header: {
                Authorization: `Bearer ${app.globalData.userInfo.token}`
              },
              method: 'POST',
              data: {
                longitude: checkPoint.oriLongitude,
                latitude: checkPoint.oriLatitude
              },
              success: function(res) {
                console.log('location_data res', res)
                if (res.statusCode === 200) {
                  console.log('上传成功')

                  const keyname = `markers[${pointIndex}]`

                  that.setData({
                    [keyname]: {
                      ...checkPoint,
                      done: 1,
                      iconPath: "/icon/location.png"
                    }

                  }, function() {
                    that.changePolyline(that.data.markers)
                    console.log('markers', that.data.markers[pointIndex])
                  })


                } else {
                  console.log('上传失败')
                }
              }
            })




          }
        } else {
          console.log('没有符合距离的点')
        }





      },
    })

  },


  bindPickerChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },

  bindcallouttap: function(e) {
    console.log(e)
    this.openLocation(e.markerId)
  },
  bindmarkertap:function(e){
    
    const that=this;
    wx.getLocation({

      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function (res) {
        console.log('res', res)
        let checkPoint = null;
        let pointIndex = null
        for (let i = 0; i < that.data.markers.length; i++) {

          if (that.data.markers[i].done !== 1) {
            checkPoint = that.data.markers[i];
            pointIndex = i
            break;

          }
        }
    
        if (checkPoint) {
          let checkPointId = `${checkPoint.longitude}/${checkPoint.latitude}`

          console.log('checkPointId', checkPointId)
          console.log('e.markerId', e.markerId)
          if (checkPointId === e.markerId){
            wx.showModal({
              title: '提示',
              content: '确定要将当前地点设置为已抄表吗?',
              success(modalRes) {
                if (modalRes.confirm) {
                  console.log('用户点击确定')

                  let distance = util.getDistance(res.latitude, res.longitude, checkPoint.latitude, checkPoint.longitude);
                  console.log('点击点距离', distance, '米')
                  if (distance < 200) {
                    console.log('小于200米');


                    wx.request({
                      url: `https://api.water.amwares.com/location_data`,
                      header: {
                        Authorization: `Bearer ${app.globalData.userInfo.token}`
                      },
                      method: 'POST',
                      data: {
                        longitude: checkPoint.oriLongitude,
                        latitude: checkPoint.oriLatitude
                      },
                      success: function (res) {
                        console.log('location_data res', res)
                        if (res.statusCode === 200) {
                          console.log('上传成功')

                          const keyname = `markers[${pointIndex}]`

                          that.setData({
                            [keyname]: {
                              ...checkPoint,
                              done: 1,
                              iconPath: "/icon/location.png"
                            }

                          }, function () {
                            that.changePolyline(that.data.markers)
                            console.log('markers', that.data.markers[pointIndex])
                          })


                        } else {
                          console.log('上传失败')
                        }
                      }
                    })




                  } else {
                    wx.showToast({
                      title: `当前定位距离目标过远`,
                      icon: 'none'
                    })
                  }


                }
              }
            })
          }
          
        } else {
          console.log('没有符合距离的点')
        
        }
      }
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
    // console.log('on show -----------------')
    // this.getDistance()
    console.log('this.timer',this.timer)
    if (this.timer) {
      const that = this;
      clearInterval(this.timer)
      console.log('start onShow')
      this.timer = setInterval(function() {
        that.getDistance()
      }, 10000)
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    console.log('this.timer', this.timer)

    // if (this.timer) {

    //   clearInterval(this.timer)
    //   console.log('clearInterval')
    // }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    console.log('onUnload')
    console.log('this.timer', this.timer)

    if (this.timer) {
      clearInterval(this.timer)
    }

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