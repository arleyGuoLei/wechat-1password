const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const log = cloud.logger()
const db = cloud.database()
const userModel = db.collection('user')

exports.main = async (event) => {
  const { encryption } = event
  const { OPENID: _openid } = cloud.getWXContext()
  try {
    const { stats: { updated = 0 } } = await userModel.where({ _openid, encryption: '' }).update({ data: { encryption } })
    if (updated !== 0) { return { code: 0 } }
  } catch (error) { log.error(error) }
  return { code: -1 }
}
