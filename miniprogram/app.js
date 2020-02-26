import User from './model/user'
import $ from './utils/tool'

App({
  initUiGlobal() {
    return new Promise(resolve => {
      wx.getSystemInfo({
        success: e => {
          this.globalData.StatusBar = e.statusBarHeight
          this.globalData.screenHeight = e.screenHeight
          const capsule = wx.getMenuButtonBoundingClientRect()
          if (capsule) {
            this.globalData.Custom = capsule
            this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight
          } else {
            this.globalData.CustomBar = e.statusBarHeight + 50
          }
        },
        complete: resolve
      })
    })
  },
  initEnv() {
    const envVersion = __wxConfig.envVersion
    const env = envVersion === 'develop' ? 'pwd-dev' : '' // ['develop', 'trial', 'release']
    wx.cloud.init({ env, traceUser: true })
    this.globalData.env = env
  },
  async login() {
    $.loading()
    const user = new User()
    const { data: info } = await user.getInfo()
    if (info.length === 0) {
      await user.register()
      $.store.set('encryption', '')
    } else {
      $.store.set('encryption', info[0].encryption)
    }
    $.hideLoading()
  },
  async onLaunch() {
    this.initEnv()
    await this.initUiGlobal()
    this.login()
  },
  globalData: {
    StatusBar: null,
    Custom: null,
    CustomBar: null,
    screenHeight: null,
    env: ''
  },
  store: {
    encryption: ''
  }
})
