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
            async success(res) {
              const { errCode = -1, jsonString, jsonSignature } = res
              if (errCode === 0) {
                const { result: { errCode = -1 } } = await $.callCloud({ // 服务端验证指纹
                  name: 'verifySignature',
                  data: {
                    jsonString,
                    jsonSignature
                  }
                })
                if (errCode === 0) {
                  return resolve(true) // 有指纹并且验证成功
                }
                return reject(new Error('服务端验证失败'))
              } else {
                $.tip('指纹验证失败, 请重试')
                return reject(new Error('指纹验证失败'))
              }
            },
            fail(e) {
              const { errCode } = e
              if (errCode === 90010) {
                $.tip('指纹验证多次失败, 请输入主密码', 1200)
                return reject(new Error('验证失败太多次, 稍后重试'))
              }
            }
          })
        } else {
          return resolve(false) // 没有指纹
        }
      },
      fail(e) {
        console.log('log => : fail -> e', e)
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
