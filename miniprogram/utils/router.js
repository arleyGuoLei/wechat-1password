const pages = {
  home: '/pages/home/home',
  addAccount: '/pages/addAccount/addAccount',
  register: '/pages/register/register',
  list: '/pages/list/list'
}

export default {
  push(url, events = {}, callback = () => {}) {
    wx.navigateTo({
      url: pages[url],
      events,
      success: callback
    })
  },

  pop(delta) {
    wx.navigateBack({ delta })
  },

  redirectTo(url) {
    wx.redirectTo({ url: pages[url] })
  },

  reLaunch() {
    wx.reLaunch({ url: pages.home })
  }

}
