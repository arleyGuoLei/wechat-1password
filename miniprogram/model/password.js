import Base from './base'
import $ from './../utils/tool'
import { formatDate } from './../utils/util'
const collectionName = 'password'

export default class extends Base {
  constructor() {
    super(collectionName)
  }

  add(obj) {
    return this.db.add({
      data: {
        ...obj,
        createTime: this.date,
        times: 0,
        updateTime: this.date
      }
    })
  }

  async getList(page) {
    const size = 10
    const { data } = await this.db.where({
      _openid: '{openid}'
    }).skip((page - 1) * size).limit(size).orderBy('times', 'desc').orderBy('updateTime', 'desc').get()

    const list = data.map(item => {
      return {
        ...item,
        updateTime: formatDate(item.updateTime),
        createTime: formatDate(item.createTime)
      }
    })
    let pageSum = -1
    if (page === 1) {
      const { total } = await this.db.where({ _openid: '{openid}' }).count()
      pageSum = Math.ceil(total / size)
    }
    return {
      list,
      pageSum
    }
  }

  async update(obj) {
    const res = await $.callCloud({
      name: 'updateAccount',
      data: {
        ...obj
      }
    }, true)
    return res
  }

  updateTimes(_id) {
    return $.callCloud({
      name: 'updateTimes',
      data: { _id }
    }, false)
  }
}
