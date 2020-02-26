const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const log = cloud.logger()
const db = cloud.database()
const passwordModel = db.collection('password')

exports.main = async (event) => {
  const { _id } = event
  delete event._id
  const { OPENID: _openid } = cloud.getWXContext()
  try {
    const { stats: { updated = 0 } } = await passwordModel.where({ _openid, _id }).update({ data: {
      ...event,
      updateTime: db.serverDate()
    } })
    if (updated !== 0) { return { code: 0 } }
  } catch (error) {
    log.error(error)
  }
  return { code: -1 }
}
