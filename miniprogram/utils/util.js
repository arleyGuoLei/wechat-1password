import $ from './tool'
import log from './log'

export function formatDate(date) {
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const strDate = date.getDate().toString().padStart(2, '0')
  return `${date.getFullYear()}-${month}-${strDate} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}

export function fingerCheck(challenge) {
  return new Promise((resolve, reject) => {
    wx.checkIsSoterEnrolledInDevice({
      checkAuthMode: 'fingerPrint',
      success(res) {
        const { isEnrolled = false } = res
        if (isEnrolled) {
          wx.startSoterAuthentication({
            requestAuthModes: ['fingerPrint'],
            challenge,
            authContent: '请验证指纹',
            success(res) {
              const { errCode = -1 } = res
              if (errCode === 0) {
                return resolve(true) // 有指纹并且验证成功
              } else {
                $.tip('指纹验证失败, 请重试')
                return reject(new Error('指纹验证失败'))
              }
            }
          })
        } else {
          return resolve(false) // 没有指纹
        }
      },
      fail(e) {
        $.tip('无指纹验证')
        log.error(e)
        return reject(e)
      }
    })
  })
}
