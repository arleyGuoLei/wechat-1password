import $ from './../../utils/tool'
import router from './../../utils/router'
import Password from './../../model/password'
import log from './../../utils/log'

import { fingerCheck, throttle } from './../../utils/util'

Page({
  data: {
    listHeight: $.app.globalData.screenHeight - $.app.globalData.CustomBar,
    title: '全部记录',
    page: 1,
    pageSum: 0,
    list: [],
    type: 'all', // [all, search]
    onBottom: false, // 到底了
    validatePwdShow: false,
    keywords: ''
  },
  onLoad(options) {
    const { search = false } = options
    if (search) {
      $.loading()
      const that = this
      const eventChannel = this.getOpenerEventChannel()
      eventChannel.on('postKeywords', function({ keywords }) {
        $.hideLoading()
        that.setData({ keywords, title: `搜索:${keywords}`, type: 'search' })
        that.getDataList(1, keywords)
      })
    } else {
      this.getDataList(1)
    }
  },
  onReachBottom() {
    const { data: { page, pageSum, keywords } } = this
    if (page < pageSum) { this.getDataList(page + 1, keywords) }
  },
  async getDataList(page = 1, keywords = '') {
    $.loading()
    let { data: { list: localList, pageSum: localPageSum, type } } = this
    const { list, pageSum } = await this.getData(type, page, keywords)
    if (pageSum !== -1) { localPageSum = pageSum }
    if (page === 1) { localList = list } else { localList = localList.concat(list) }
    if (page === localPageSum) { this.setData({ onBottom: true }) }
    this.setData({ list: localList, pageSum: localPageSum, page })
    $.hideLoading()
  },
  async getData(type, page, keywords) {
    let data = null
    const password = new Password()
    if (type === 'all') {
      data = await password.getList(page)
    } else {
      data = await password.search(keywords, page)
    }
    return data
  },
  onMenu(e) {
    const { currentTarget: { dataset: { index } } } = e
    const { data: { list } } = this
    const that = this
    wx.showActionSheet({
      itemList: ['详情', '修改', '删除'],
      success(res) {
        if (res.tapIndex === 0) {
          router.push('accountDetail', {}, res => {
            res.eventChannel.emit('postDetailData', { data: list[index] })
          })
        }
        if (res.tapIndex === 1) {
          router.push('addAccountUpdate', {}, res => {
            res.eventChannel.emit('postDetailData', { data: list[index] })
          })
        }

        if (res.tapIndex === 2) {
          wx.showModal({
            title: '提示',
            content: '请确认删除？',
            confirmText: '删除',
            confirmColor: '#e64340',
            async success(res) {
              if (res.confirm) {
                const passwordModel = new Password()
                const res = await passwordModel.delete(list[index]._id)
                if (res) {
                  list.splice(index, 1)
                  that.setData({ list })
                } else {
                  $.tip('删除失败, 请重试 ~')
                }
              } else if (res.cancel) {
                $.tip('取消删除')
              }
            }
          })
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  showPassword(index, pwd) {
    const { data: { list } } = this
    const key = `list[${index}].jPassword`
    const timesKey = `list[${index}].times`
    const value = $.decrypt(list[index].password, pwd)
    this.setData({ [key]: value, [timesKey]: list[index].times + 1 })
    const passwordModel = new Password()
    passwordModel.updateTimes(list[index]._id)
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
      fingerCheck(encryption + Date.now()).then(() => {
        this.showPassword(index, mainKey)
      }).catch(e => {
        this.setData({ validatePwdShow: true })
        log.error({ msg: e.message })
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
  onTapPwd: throttle(function(e) {
    const { currentTarget: { dataset: { index, j } } } = e
    if (!j) {
      this.onShowPwd(e)
    } else {
      const key = `list[${index}].jPassword`
      this.setData({ [key]: '' })
    }
  }, 1800)

})
