import $ from './../../utils/tool'
import Password from './../../model/password'

import { fingerCheck } from './../../utils/util'

Page({
  data: {
    listHeight: $.app.globalData.screenHeight - $.app.globalData.CustomBar,
    title: '全部记录',
    page: 1,
    pageSum: 0,
    list: [],
    type: 'all', // [all, search]
    onBottom: false, // 到底了
    validatePwdShow: false
  },
  onLoad(options) {
    this.getData()
  },
  onReachBottom() {
    const { data: { page, pageSum } } = this
    if (page < pageSum) { this.getData(page + 1) }
  },
  async getData(page = 1) {
    $.loading()
    const password = new Password()
    const { list, pageSum } = await password.getList(page)
    let { data: { list: localList, pageSum: localPageSum } } = this
    if (pageSum !== -1) { localPageSum = pageSum }
    if (page === 1) { localList = list } else { localList = localList.concat(list) }
    if (page === localPageSum) { this.setData({ onBottom: true }) }

    this.setData({ list: localList, pageSum: localPageSum, page })
    $.hideLoading()
  },
  onMenu() {
    wx.showActionSheet({
      itemList: ['详情', '修改'],
      success(res) {
        console.log(res.tapIndex)
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  showPassword(index, pwd) {
    const { data: { list } } = this
    const key = `list[${index}].jPassword`
    const value = $.decrypt(list[index].password, pwd)
    this.setData({ [key]: value })
    wx.setClipboardData({ data: value })
  },
  onTapUser(e) {
    const { currentTarget: { dataset: { index } } } = e
    const { data: { list } } = this
    wx.setClipboardData({ data: list[index].account })
  },
  onShowPwd(e) {
    const { currentTarget: { dataset: { index } } } = e
    this._selectIndex = index
    const mainKey = wx.getStorageSync('pwd')
    const encryption = $.store.get('encryption')
    if ($.digest(mainKey) === encryption) { // 本地主密码是正确的
      fingerCheck(mainKey).then((state) => {
        if (state) {
          this.showPassword(index, mainKey)
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
    this.showPassword(this._selectIndex, password)
  },
  onTapPwd(e) {
    const { currentTarget: { dataset: { index, j } } } = e
    if (!j) {
      this.onShowPwd(e)
    } else {
      const key = `list[${index}].jPassword`
      this.setData({ [key]: '' })
    }
    console.log('log => : onTapPwd -> e', e)
  }

})
