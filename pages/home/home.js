// pages/home/home.js
const gcoord = require('../../utils/gcoord.js')
const util = require('../../utils/util.js')
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
const app = getApp()
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    latitude:0,
    longitude: 0,
    date:'',
    userInfo: null,
    month:'',
    endMonth:'',
    markers:[],
    polyline:[]

  },
  getLocation: function () {
    const that = this;
    wx.getLocation({

      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function (res) {
        console.log('res', res)
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,

        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.getLocation()
 
    this.setData({
      date:util.getDay(),
      month:util.getMonth(),
      endMonth: util.getMonth(),
      userInfo: app.globalData.userInfo
    })
    this.getPolylineAndMarker(util.getMonth())
  
   

  },
  reloadpage:function(){
    wx.reLaunch({
      url: '/pages/home/home'
    })
  },
  bindDateChange(e) {
    wx.showLoading({
      title: '加载中...',
      mask:true
    })
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      month: e.detail.value
    })
    this.getPolylineAndMarker(e.detail.value)
  },
  getPolylineAndMarker:function(month){
    const user_id = app.globalData.userInfo.user_id;
    const that = this;
    wx.request({
      url: `https://api.water.amwares.com/locations/${user_id}`,
      header: {
        Authorization: `Bearer ${app.globalData.userInfo.token}`
      },
      method: 'GET',
      success: function (res) {
        console.log('get locations res', res)

        if (res.statusCode === 200) {

          wx.request({
            url: `https://api.water.amwares.com/location_data`,
            header: {
              Authorization: `Bearer ${app.globalData.userInfo.token}`
            },
            method: 'GET',
            data: {
              month,

            },
            success: function (doneRes) {
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
                    let created_at="";
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
                    title: `第${i + 1}个地点`,
                    label: {
                      content: `第${i + 1}个地点`,
                      padding: 5,
                      borderRadius: 5,
                      bgColor: '#EEE'
                    },
                    callout: {
                      content: created_at ? `水表数量:${point.meter_count}\n备注:${point.remark}\n最后抄表时间:${created_at}` :
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
                wx.hideLoading()



              } else {
                util.converErrorCodeToMsg(doneRes.data)
                console.log('获取失败')
              }
            }
          })




        } else {
          console.log('获取失败')
          wx.hideLoading()
          util.converErrorCodeToMsg(res.data)
      
        }
      }
    })
  },

  changemarker: function (points) {
    for (let i = 0; i < points.length; i++) {
      points[i].iconPath = points[i].done === 1 ? '/icon/location.png' : '/icon/location-red.png'
    }
    this.setData({
      markers: points,
    })
  },

  changePolyline: function (points) {
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

      }, function () {
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
  logout:function(){
    console.log('start logout')
    if (!app.globalData.userInfo){
      console.log('没有用户信息')
    }
    wx.showModal({
      title: '提示',
      content: '确定要退出当前账号吗?',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.request({
            url: 'https://api.water.amwares.com/logout',
            
            method: 'POST',
            header: { Authorization: `Bearer ${app.globalData.userInfo.token}` },
            success: function (res) {
              console.log('res', res)
              wx.clearStorageSync()
              if (res.statusCode === 200) {
                console.log('退出成功')

                wx.showToast({
                  title: '退出成功',
                  icon: 'success'
                })
                setTimeout(function(){
                  wx.reLaunch({
                    url: '/pages/login/login'
                  })
                },500)
           
                // wx.redirectTo({
                //   url: '/pages/login/login'
                // })
              } else {

                console.log('退出失败')
                util.converErrorCodeToMsg(res.data)
                setTimeout(function () {
                  wx.reLaunch({
                    url: '/pages/login/login'
                  })
                }, 500)


              }

            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    return
 
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