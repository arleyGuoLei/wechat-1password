const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const log = cloud.logger()
const db = cloud.database()
const _ = db.command
const passwordModel = db.collection('password')

exports.main = async (event) => {
  const { _id } = event
  try {
    const { stats: { updated = 0 } } = await passwordModel.doc(_id).update({ data: { times: _.inc(1), updateTime: db.serverDate() } })
    if (updated !== 0) { return { code: 0 } }
  } catch (error) {
    log.error(error)
  }
  return { code: -1 }
}
