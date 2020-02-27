const pages = {
  home: '/pages/home/home',
  addAccount: '/pages/addAccount/addAccount',
  addAccountUpdate: '/pages/addAccount/addAccount?update=true',
  register: '/pages/register/register',
  list: '/pages/list/list',
  listSearch: '/pages/list/list?search=true',
  accountDetail: '/pages/accountDetail/accountDetail'
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
