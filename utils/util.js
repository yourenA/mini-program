const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


const converErrorCodeToMsg = error => {
  console.log("error", error)
  error = typeof (error) === "string"?JSON.parse(error):error
  if (error.toString() === 'Error: Network Error') {
    console.log('网络错误')
    wx.showToast({
      title: '网络错误',
      icon: 'none'
    })
    return false
  }
  if (error.status_code === 401) {
    // message.error(messageJson['token fail']);

    // setTimeout(function () {
    //   window.location.reload()
    // },1000)
    console.log('401错误')
    wx.showToast({
      title: '登录令牌无效或过期，请重新登录',
      icon: 'none'
    })
    setTimeout(function(){
      wx.reLaunch({
        url: '/pages/login/login'
      })
    },1000)
  
  } else if (!error.errors) {
    console.log('一般错误1')
    wx.showToast({
      title: `${error.message}`,
      icon: 'none'
    })
  }else if (error.status_code === 422) {
    let first;
    for (first in error.errors) break;
    console.log('一般错误2')
    wx.showToast({
      title: `${error.errors[first][0]}`,
      icon: 'none'
    })
  } else {
    console.log('一般错误4')
    wx.showToast({
      title: '出现错误',
      icon: 'none'
    })
  }
}

const getDistance=function(lat1, lng1, lat2, lng2) {
  lat1 = lat1 || 0;
  lng1 = lng1 || 0;
  lat2 = lat2 || 0;
  lng2 = lng2 || 0;
  var rad1 = lat1 * Math.PI / 180.0;
  var rad2 = lat2 * Math.PI / 180.0;
  var a = rad1 - rad2;
  var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
  var r = 6378137;
  return (r * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)))).toFixed(0)
}
const getDay=()=>{
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${formatNumber(year)}-${formatNumber(month)}-${formatNumber(day)}`
}

const getMonth = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  return `${formatNumber(year)}-${formatNumber(month)}`
}


module.exports = {
  getDistance: getDistance,
  formatTime: formatTime,
  formatNumber: formatNumber,
  converErrorCodeToMsg: converErrorCodeToMsg,
  getDay: getDay,
  getMonth: getMonth
}