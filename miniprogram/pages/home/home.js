import router from './../../utils/router'
import $ from './../../utils/tool'

Page({
  data: {

  },
  onLoad() {
  },
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
