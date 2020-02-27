import $ from './../utils/tool'

export default class {
  constructor(collectionName) {
    const database = wx.cloud.database({ env: this.env })
    this.env = $.app.globalData.env
    this.db = database.collection(collectionName)
    this._ = database.command
    this.database = database
  }

  get date() {
    return wx.cloud.database({ env: this.env }).serverDate()
  }
}
