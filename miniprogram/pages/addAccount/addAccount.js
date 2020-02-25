import $ from './../../utils/tool'

Page({
  data: {
    userKey: '用户名',
    pwdItems: [
      { value: '大写', checked: false },
      { value: '小写', checked: false },
      { value: '数字', checked: false },
      { value: '特殊符号', checked: false }
    ],
    moreOptions: false,
    viewHeight: $.app.globalData.screenHeight - $.app.globalData.CustomBar
  },
  onLoad(options) {

  },
  titleChange(e) {
    const { detail: { value } } = e
    console.log(value)
  },
  pwdSettingChange(e) {
    console.log('log => : pwdSettingChange -> e', e)
  },
  switchOptions() {}

})
