import log from './log'

const OPENID = 'uid'

export default {
  get app() {
    return getApp()
  },
  get openid() {
    return wx.getStorageSync(OPENID)
  },
  tip(msg, duration = 2000) {
    return new Promise(resolve =>
      wx.showToast({
        title: msg,
        icon: 'none',
        duration,
        complete: resolve
      })
    )
  },
  sleep(time = 2000) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, time)
    })
  },
  reLaunch() {
    wx.reLaunch({ url: '/pages/home/home' })
  },
  callCloud(options, showLoading = true) {
    showLoading && wx.showLoading({ title: '获取数据中', mask: true })
    return wx.cloud.callFunction(options).then(res => {
      showLoading && wx.hideLoading()
      return res
    }).catch(e => {
      log.error(e)
      showLoading && wx.hideLoading()
      throw e
    })
  }
}
