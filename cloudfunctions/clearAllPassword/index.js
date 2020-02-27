const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const log = cloud.logger()
const db = cloud.database()
const passwordModel = db.collection('password')

exports.main = async () => {
  const { OPENID: _openid } = cloud.getWXContext()
  try {
    await passwordModel.where({ _openid }).remove()
    return { code: 0 }
  } catch (error) {
    log.error(error)
  }
  return { code: -1 }
}
