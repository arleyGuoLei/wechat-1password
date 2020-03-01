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

function checkAuthMode(){
  // 判断 checkAuthMode 支持情况
  // 遍历，当支持面容 则 优先使用 面容 后者覆盖前者
  return new Promise(async(resolve,reject)=>{
    let authMode = '';
    let msg = ''
    let arr = [{ auth: 'fingerPrint', name: '指纹' }, { auth: 'facial', name: '面容' },  { auth: 'speech', name: '声纹' }]
    for(let item of arr){
      let obj = { checkAuthMode: item.auth }
      const { isEnrolled } = await checkIsSupport(item);
      if (isEnrolled) {
        authMode = item.auth;
        msg = item.name;
      }
    }
    if(authMode && msg) resolve({authMode,msg});
    else reject(new Error('不支持任何生物识别'))
  })
}

// promise 检测设备支持函数
function checkIsSupport(item){
  return new Promise((resolve,reject)=>{
    wx.checkIsSoterEnrolledInDevice({
      checkAuthMode: item.auth,
      complete(res){
        return resolve(res)
      }
    })
  })
}

export async function fingerCheck(challenge) {
  return new Promise(async(resolve, reject) => {
    const { authMode, msg } = await checkAuthMode().catch(e => { return reject(e) });
    wx.startSoterAuthentication({
      requestAuthModes: [authMode],
      challenge,
      authContent: `请验证${msg}`,
      async success(res) {
        console.log('success',res)
        const { errCode = -1, jsonString, jsonSignature } = res
        if (errCode === 0) {
          const { result: { errCode = -1 } } = await $.callCloud({ // 服务端验证
            name: 'verifySignature',
            data: {
              jsonString,
              jsonSignature
            }
          })
          if (errCode === 0) {
            return resolve(true) // 有生物识别并且验证成功
          }
          return reject(new Error('服务端验证失败'))
        } else {
          $.tip(`${msg}验证失败, 请重试`)
          return reject(new Error(`${msg}验证失败`))
        }
      },
      fail(e) {
        console.log('fail', e)
        const { errCode } = e
        if (errCode === 90010) {
          $.tip(`${msg}验证多次失败, 请输入主密码`, 1200)
          return reject(new Error('验证失败太多次, 稍后重试'))
        }
        if (errCode === 90003) {
          $.tip(`${msg}验证方式不支持`, 1200)
          return reject(new Error('验证方式不支持, 请重试'))
        }
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
