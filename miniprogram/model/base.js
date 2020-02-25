import $ from './../utils/tool'

export default class {
  constructor(collectionName) {
    this.env = $.app.globalData.env
    this.db = wx.cloud.database({ env: this.env }).collection(collectionName)
  }

  get date() {
    return wx.cloud.database({ env: this.env }).serverDate()
  }
}
