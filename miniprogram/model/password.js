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

  async delete(_id) {
    const { stats: { removed = -1 } } = await this.db.doc(_id).remove()
    if (removed === 1) {
      return true
    }
    return false
  }

  async search(keywords, page = 1) {
    const key = '(' + keywords.trim().replace(/[(){}.*?:$+-]|[=^!|]/ig, `\\$&`).split(/\s+/).join('|') + ')'

    const condition = new RegExp(`${key}`, 'ig')

    const or = this._.or(['title', 'account', 'desc', 'mail', 'phone', 'platform'].map(item => {
      return {
        [item]: condition
      }
    }))
    // { _openid: '{openid}', or }
    const size = 10
    const { data } = await this.db.where(or).skip((page - 1) * size).limit(size).orderBy('times', 'desc').orderBy('updateTime', 'desc').get()

    const list = data.map(item => {
      return {
        ...item,
        updateTime: formatDate(item.updateTime),
        createTime: formatDate(item.createTime)
      }
    })
    let pageSum = -1
    if (page === 1) {
      // { _openid: '{openid}', or }
      const { total } = await this.db.where(or).count()
      pageSum = Math.ceil(total / size)
    }
    return {
      list,
      pageSum
    }
  }

  async clear() {
    const { result: { code } } = await $.callCloud({ name: 'clearAllPassword' })
    if (code === 0) {
      return true
    }
    return false
  }
}
