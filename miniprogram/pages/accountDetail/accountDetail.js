import $ from './../../utils/tool'
import { fingerCheck } from './../../utils/util'

Page({
  data: {
    title: '',
    userKey: '',
    account: '',
    jPassword: '',
    platform: '',
    phone: '',
    mail: '',
    desc: '',
    updateTime: '',
    times: 0,
    createTime: '',
    _id: '',
    _openid: '',
    validatePwdShow: false
  },
  onLoad() {
    const that = this
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('postDetailData', function({ data }) {
      Object.keys(data).forEach(key => {
        that.setData({
          [key]: data[key]
        })
      })
    })
  },
  onTapPwd(e) {
    const { currentTarget: { dataset: { j } } } = e
    if (!j) {
      this.onShowPwd()
    } else {
      this.setData({ jPassword: '' })
    }
  },
  onShowPwd() {
    const mainKey = wx.getStorageSync('pwd')
    const encryption = $.store.get('encryption')
    if ($.digest(mainKey) === encryption) { // 本地主密码是正确的
      fingerCheck(mainKey).then((state) => {
        if (state) {
          this.showPassword(mainKey)
        } else {
          throw new Error('没有指纹解锁')
        }
      }).catch(e => {
        console.log('log => : onShowPwd -> e', e)
        this.setData({ validatePwdShow: true })
      })
    } else { // 接口调用失败
      console.log('接口调用失败')
      this.setData({ validatePwdShow: true })
    }
  },
  validateSuccess(e) {
    const { detail: { password } } = e
    this.showPassword(password)
  },
  showPassword(pwd) {
    const { data: { password } } = this
    const value = $.decrypt(password, pwd)
    this.setData({ jPassword: value })
    wx.setClipboardData({ data: value })
  },
  onCopy(e) {
    const { currentTarget: { dataset: { copyValue } } } = e
    console.log('log => : onCopy -> copyData', copyValue)
    wx.setClipboardData({ data: copyValue })
  }
})
