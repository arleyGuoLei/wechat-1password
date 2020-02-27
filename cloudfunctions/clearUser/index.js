const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const log = cloud.logger()
const db = cloud.database()
const userModel = db.collection('user')

exports.main = async () => {
  const { OPENID: _openid } = cloud.getWXContext()
  try {
    await userModel.where({ _openid }).update({ data: { encryption: '' } })
    return { code: 0 }
  } catch (error) { log.error(error) }
  return { code: -1 }
}
