//index.js
//获取应用实例
const util = require('../../utils/util.js')
const app = getApp()

Page({
  timer:null,
  data: {
    count:0,
    dateArr:[],
    hasStartRecord:false,
    longitude: 113.12463,
    latitude: 40.36199,
    polyline: [{
      points: [{
        latitude: 23.10229,
        longitude: 113.3345211,
      }, {
        latitude: 23.00229,
        longitude: 113.3345211,
      }],
      color: '#1AAD19',
      width: 2,
      dottedLine: false
    }]
  },
  onReady: function (e) {
    this.mapCtx = wx.createMapContext('myMap')
  },
  getLocation:function(){
    const that=this;
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success: (res) => {
        console.log("getLocation", res)
        const latitude = res.latitude // 纬度
        const longitude = res.longitude // 经度
        that.data.polyline[0].points.push({ latitude: latitude, longitude: longitude });
        that.setData({
          latitude: latitude,
          longitude: longitude,
          markers: [{
            id: 0,
            latitude: latitude,
            longitude: longitude,
          }],
          'polyline[0].points': that.data.polyline[0].points
        },function(){
          that.mapCtx.includePoints({
            padding: [10],
            points: that.data.markers
          })
        })


        

        var locationString = latitude + "," + longitude;
        wx.request({
          url: 'https://apis.map.qq.com/ws/geocoder/v1/?l&get_poi=1',
          data: {
            "key": "YLFBZ-WHAWI-ZXUGH-53Q65-TOJ7E-ADBNQ",
            "location": locationString
          },
          method: 'GET',
          // header: {}, 
          success: function (res) {
            // success
            console.log("请求成功");
            console.log("请求数据:" , res.data);
          },
          fail: function () {
            // fail
            console.log("请求失败");
          },
          complete: function () {
            // complete
            console.log("请求完成");
          }
        })

      

      }
    })
  },
  includePoints: function () {
    this.mapCtx.includePoints({
      padding: [10],
      points: [{
        latitude: 23.10229,
        longitude: 113.3345211,
      }, {
        latitude: 23.00229,
        longitude: 113.3345211,
      }]
    })
  },
  onLoad: function () {
    this.setData({
      data:app.globalData
    })
  },
  markertap(e) {
    console.log(e)
  },
  startRecord:function(){
    console.log('startRecord')
    const that=this;
    this.setData({
      hasStartRecord:true
    })
    if (this.timer){
      clearInterval(this.timer)
    }
    this.timer = setInterval(function () {
      console.log('setInterval')

      const newCount = that.data.count + 1;

      that.data.dateArr.unshift(util.formatTime(new Date()))
      that.setData({
        count: newCount,
        dateArr: that.data.dateArr
      })
    }, 1000)
  },
  stopRecord:function(){
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  startCamera:function(){
    wx.navigateTo({
      url: '/pages/takePhoto/takePhoto'
    })
  },
  startNativeCamera:function(){
    wx.chooseImage({
      sizeType:'compressed',
      count:1,
      success(res) {
        console.log('res', res)
        const tempFilePaths = res.tempFilePaths[0]
        wx.navigateTo({
          url: `/pages/preview/preview?src=${tempFilePaths}`
        })
      }
    })
  },
 openTrajectory:function(){
   wx.navigateTo({
     url: '/pages/run/run'
   })
 },
  onShareAppMessage: function () {
    wx.showShareMenu({
      withShareTicket: true
    })
    return {
      title: '这是转发标题',
      
      success: function (res) {
        console.log('分享返回',res)
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
      fail: function (err) {
        console.log('err', err)
        // 转发失败
      }
    }
  }
})
