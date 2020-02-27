import $ from './tool'
import log from './log'

export function formatDate(date) {
  function padStr(obj) {
    return obj.toString().padStart(2, '0')
  }
  const month = padStr(date.getMonth() + 1)
  const strDate = padStr(date.getDate())
  const hour = padStr(date.getHours())
  const minute = padStr(date.getMinutes())
  const second = padStr(date.getSeconds())
  return `${date.getFullYear()}-${month}-${strDate} ${hour}:${minute}:${second}`
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

export function throttle(fn, gapTime = 500) {
  let _lastTime = null
  return function() {
    const _nowTime = +new Date()
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      fn.apply(this, arguments)
      _lastTime = _nowTime
    }
  }
}
