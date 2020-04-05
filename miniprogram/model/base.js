import $ from './../utils/tool'

export default class {
  constructor(collectionName) {
    this.env = $.app.globalData.env
    const database = wx.cloud.database({ env: this.env })
    this.db = database.collection(collectionName)
    this._ = database.command
    this.database = database
  }

  get date() {
    return wx.cloud.database({ env: this.env }).serverDate()
  }
}
