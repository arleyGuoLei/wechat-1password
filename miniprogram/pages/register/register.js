import $ from './../../utils/tool'
import log from './../../utils/log'
import User from './../../model/user'
import router from './../../utils/router'
Page({
  data: {
    pwd: '',
    pwd2: '',
    checked: false
  },
  onLoad() {

  },
  onChange(e) {
    const { detail: { value: arr } } = e
    this.setData({ checked: arr.length !== 0 })
  },
  onPwdChange(e) {
    const { detail: { value: pwd } } = e
    this.setData({ pwd })
  },
  onPwd2Change(e) {
    const { detail: { value: pwd2 } } = e
    this.setData({ pwd2 })
  },
  async update(pwd) {
    const encryption = $.sm3(pwd)
    const user = new User()
    const check = await user.updateEncryption(encryption, pwd)
    if (check) {
      await $.tip('设置密码成功', 1000)
      router.redirectTo('addAccount')
    }
  },
  async onSubmit() {
    const { data: { pwd, pwd2, checked } } = this
    if (pwd.length < 4 || pwd2.length < 4) { return $.tip('密码长度不能小于4哦') }
    if (pwd !== pwd2) { return $.tip('两次输入密码不一致') }
    if (!checked) { return $.tip('请勾选已了解') }
    if (/[\u4e00-\u9fa5]/.test(pwd)) { return $.tip('密码不能含有中文') }
    this.fingerCheck(pwd)
  },
  fingerCheck(pwd) {
    const that = this
    wx.checkIsSoterEnrolledInDevice({
      checkAuthMode: 'fingerPrint',
      success(res) {
        const { isEnrolled = false } = res
        if (isEnrolled) {
          wx.startSoterAuthentication({
            requestAuthModes: ['fingerPrint'],
            challenge: pwd,
            authContent: '请验证指纹',
            success(res) {
              const { errCode = -1 } = res
              if (errCode === 0) {
                that.update(pwd)
              } else {
                $.tip('指纹验证失败, 请重试')
              }
            }
          })
        } else {
          that.update(pwd)
        }
      },
      fail(e) {
        $.tip('接口调用失败, 请重试')
        log.error(e)
      }
    })
  }
})
