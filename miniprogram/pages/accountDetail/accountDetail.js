import $ from './../../utils/tool'
import router from './../../utils/router'
import { fingerCheck, throttle } from './../../utils/util'
import log from './../../utils/log'
import PasswordDb from './../../model/password'

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
    validatePwdShow: false,
    postObj: null
  },
  onLoad() {
    $.loading()
    const that = this
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('postDetailData', function({ data }) {
      that.setData({ postObj: { ...data } })
      Object.keys(data).forEach(key => {
        that.setData({
          [key]: data[key]
        })
      })
      $.hideLoading()
    })
  },
  onTapPwd: throttle(function(e) {
    const { currentTarget: { dataset: { j } } } = e
    if (!j) {
      this.onShowPwd()
    } else {
      this.setData({ jPassword: '' })
    }
  }, 1000),
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
        this.setData({ validatePwdShow: true })
        log.error(e)
      })
    } else { // 接口调用失败
      log.error('接口调用失败')
      this.setData({ validatePwdShow: true })
    }
  },
  validateSuccess(e) {
    const { detail: { password } } = e
    this.showPassword(password)
  },
  showPassword(pwd) {
    const { data: { password, _id, times } } = this
    const value = $.decrypt(password, pwd)
    this.setData({ jPassword: value, times: times + 1 })
    const passwordModel = new PasswordDb()
    passwordModel.updateTimes(_id)
    wx.setClipboardData({ data: value })
  },
  onCopy(e) {
    const { currentTarget: { dataset: { copyValue } } } = e
    wx.setClipboardData({ data: copyValue })
  },
  onUpdate() {
    const { data: { postObj } } = this
    router.push('addAccountUpdate', {}, res => {
      res.eventChannel.emit('postDetailData', { data: postObj })
    })
  },
  onDelete() {
    const { data: { _id } } = this
    wx.showModal({
      title: '提示',
      content: '请确认删除？',
      confirmText: '删除',
      confirmColor: '#e64340',
      async success(res) {
        if (res.confirm) {
          const passwordModel = new PasswordDb()
          const res = await passwordModel.delete(_id)
          if (res) {
            await $.tip('删除成功', 1000)
            router.reLaunch()
          } else {
            $.tip('删除失败, 请重试 ~')
          }
        } else if (res.cancel) {
          $.tip('取消删除')
        }
      }
    })
  }
})
