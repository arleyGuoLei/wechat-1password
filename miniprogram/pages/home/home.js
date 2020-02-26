import router from './../../utils/router'
import $ from './../../utils/tool'

Page({
  data: {

  },
  onLoad() {
    const a = $.encrypt('abc123', 'arley1103')
    console.log('log => : onLoad -> a', a)

    const b = $.decrypt(a, 'arley1103')
    console.log('log => : onLoad -> b', b)
  },
  addAccount() {
    const encryption = $.store.get('encryption')
    console.log('log => : addAccount -> encryption', encryption)
    if (encryption === '') {
      router.push('register')
    } else {
      router.push('addAccount')
    }
  }
})
