import $ from './../../utils/tool'
import router from './../../utils/router'
import User from './../../model/user'
import Password from './../../model/password'
import log from './../../utils/log'

Page({
  data: {

  },
  onLoad() {

  },
  onAbout() {
    router.push('about')
  },
  onShareAppMessage() {
    return {
      title: '我在这里记密码，安全简洁，支持指纹验证 ~',
      path: '/pages/home/home',
      imageUrl: './../../images/share-bg.png'
    }
  },
  onGithub() {
    const url = 'https://github.com/arleyGuoLei/wechat-1password'
    wx.setClipboardData({
      data: url,
      success() {
        $.tip('已复制github链接')
      }
    })
  },
  onZan() {
    wx.previewImage({
      urls: ['https://7077-pwd-prod-1301366756.tcb.qcloud.la/admire.jpg']
    })
  },
  clearAccount() {
    wx.showModal({
      title: '提示',
      content: '清空后无法恢复!!!',
      confirmText: '清空',
      confirmColor: '#e64340',
      async success(res) {
        if (res.confirm) {
          const userModel = new User()
          const passwordModel = new Password()
          try {
            if (await userModel.clear() && await passwordModel.clear()) {
              wx.setStorageSync('pwd', '')
              $.store.set('encryption', '')
              $.tip('清空成功!')
            } else {
              throw new Error('清空调用云函数出现异常')
            }
          } catch (error) {
            log.error({ msg: error.message })
            $.tip('清空失败, 请重试!')
          }
        } else if (res.cancel) {
          $.tip('取消清空')
        }
      }
    })
  }
})
