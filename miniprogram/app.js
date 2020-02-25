App({
  initUiGlobal() {
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
      }
    })
  },
  initEnv() {
    const envVersion = __wxConfig.envVersion
    const env = envVersion === 'develop' ? 'pwd-dev' : '' // ['develop', 'trial', 'release']
    wx.cloud.init({ env, traceUser: true })
    this.globalData.env = env
  },
  onLaunch() {
    this.initEnv()
    this.initUiGlobal()
  },
  globalData: {
    StatusBar: null,
    Custom: null,
    CustomBar: null,
    screenHeight: null,
    env: ''
  }
})
