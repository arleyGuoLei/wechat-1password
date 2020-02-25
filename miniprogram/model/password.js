import Base from './base'
import $ from './../utils/tool'
const collectionName = 'password'

export default class extends Base {
  constructor() {
    super(collectionName)
  }

  add(obj) {
    return this.db.add({
      data: {
        ...obj,
        createTime: this.date
      }
    })
  }
}
