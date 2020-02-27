import router from './../../utils/router'
import $ from './../../utils/tool'

import { throttle } from './../../utils/util'
Page({
  data: {
    keywords: ''
  },
  onLoad() {
  },
  onInput(e) {
    const { detail: { value } } = e
    this.setData({ keywords: value })
  },
  onSearch: throttle(function() {
    const { data: { keywords } } = this
    if (keywords !== '') {
      router.push('listSearch', {}, res => {
        res.eventChannel.emit('postKeywords', { keywords })
      })
    }
  }),
  addAccount() {
    const encryption = $.store.get('encryption')
    if (encryption === '') {
      router.push('register')
    } else {
      router.push('addAccount')
    }
  },
  routerList() {
    router.push('list')
  }
})
