import Base from './base'
import $ from './../utils/tool'
const collectionName = 'user'

export default class extends Base {
  constructor() {
    super(collectionName)
  }

  register() {
    return this.db.add({
      data: {
        createTime: this.date,
        encryption: ''
      }
    })
  }

  getInfo() {
    return this.db.where({ _openid: '{openid}' }).limit(1).get()
  }

  async updateEncryption(encryption, pwd) {
    $.loading()
    const { result: { code = -1 } } = await $.callCloud({
      name: 'updateEncryption',
      data: { encryption }
    }, false)
    $.hideLoading()
    if (code !== -1) {
      $.store.set('encryption', encryption)
      wx.setStorageSync('pwd', pwd)
      return code
    } else {
      $.tip('设置失败')
    }
    return false
  }
}
