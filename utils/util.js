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
  if (error.toString() === 'Error: Network Error') {
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
  } else if (!error.errors) {
    console.log('出现错误2')
    wx.showToast({
      title: `${error.message}`,
      icon: 'none'
    })
  }else if (error.status_code === 422) {
    let first;
    for (first in error.errors) break;
    console.log('出现错误3')
    wx.showToast({
      title: `${error.errors[first][0]}`,
      icon: 'none'
    })
  } else {
    console.log('出现错误4')
    wx.showToast({
      title: '出现错误4',
      icon: 'none'
    })
  }
}

module.exports = {
  formatTime: formatTime,
  converErrorCodeToMsg: converErrorCodeToMsg
}