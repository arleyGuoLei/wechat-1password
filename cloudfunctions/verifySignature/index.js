const cloud = require('wx-server-sdk')
cloud.init()
exports.main = async (event) => {
  const { jsonString, jsonSignature } = event
  const { OPENID: _openid } = cloud.getWXContext()
  try {
    const result = await cloud.openapi.soter.verifySignature({
      openid: _openid,
      jsonString,
      jsonSignature
    })
    return result
  } catch (err) {
    return err
  }
}
