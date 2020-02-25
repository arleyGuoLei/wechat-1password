import $ from './../../utils/tool'

Page({
  data: {
    userKey: '用户名',
    userTitleFocus: false,
    pwdSetting: false,
    moreOptionsShow: false,
    passwordLen: 12,
    pwdItems: [
      { value: '大写', checked: true },
      { value: '小写', checked: true },
      { value: '数字', checked: true },
      { value: '特殊符号', checked: false }
    ],
    moreOptions: false,
    viewHeight: $.app.globalData.screenHeight - $.app.globalData.CustomBar,
    title: '111',
    account: '',
    password: '',
    platform: '',
    phone: '',
    mail: '',
    desc: ''
  },
  onLoad(options) {

  },

  onUserTitleBlur(e) {
    const { detail: { value } } = e
    if (value === '') { this.setData({ userKey: '用户名' }) }
  },
  onInputChange(e) {
    const { detail: { value, tag } } = e
    this.setData({ [tag]: value })
  },
  pwdSettingChange(e) {
    console.log('log => : pwdSettingChange -> e', e)
  },
  onUpdateUserTitle() {
    this.setData({ userTitleFocus: true })
  },
  onPwdSetting() {
    const { data: { pwdSetting } } = this
    this.setData({ pwdSetting: !pwdSetting })
  },
  onDataSet(e) {
    const { currentTarget: { dataset: { tag } } } = e
    const { detail: { value } } = e
    this.setData({ [tag]: value })
  }
})
