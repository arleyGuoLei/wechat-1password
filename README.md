# 项目介绍

## 需求分析

国内市场找了很多密码存储类APP体验不怎么优秀！之前还遇到数据全部丢失的app... 无耐之下，自己搞一个。分析如下：

- 数据安全，不丢失。所以，技术选型了微信小程序云开发，服务器用马爸爸的，重点是免费，能承受一定用户量。
- 设置一个主密码，用过主密码加密解密账号数据，支持指纹验证读取密码。

## UI设计

UI用sketch画的，通过蓝湖插件上传到了[蓝湖](https://lanhuapp.com/url/LUcSI-CdVms), 设计图链接有效期为14天,如果过期了可以联系我要新的链接。

最终项目预览：![扫码](https://user-gold-cdn.xitu.io/2020/2/27/170871ac3d8c673f?w=258&h=258&f=jpeg&s=43247)

对于sketch，在此推荐几个插件，前端工程师也能做大师级UI

- [dapollo](https://oursketch.com/plugin/dapollo)：蚂蚁金服联合 Iconfont推出的一站式设计开发工作台
- [kitchen](https://oursketch.com/plugin/kitchen): 填充图标，数据等功能蛮好用的


![首页](https://user-gold-cdn.xitu.io/2020/2/27/1708715278952e61?w=2297&h=3288&f=png&s=575836)
![设置主密码](https://user-gold-cdn.xitu.io/2020/2/27/170871638cf3ab19?w=2297&h=3288&f=png&s=352148)
![主密码设置-验证](https://user-gold-cdn.xitu.io/2020/2/27/1708715e6923b22c?w=2297&h=3288&f=png&s=386191)
![记个密码](https://user-gold-cdn.xitu.io/2020/2/27/1708715b019b2aef?w=2297&h=3288&f=png&s=517045)
![查看数据](https://user-gold-cdn.xitu.io/2020/2/27/17087156ea1a8904?w=2297&h=3288&f=png&s=414632)
![数据详情](https://user-gold-cdn.xitu.io/2020/2/27/1708717ac5860732?w=2297&h=3288&f=png&s=612761)
![偏好设置](https://user-gold-cdn.xitu.io/2020/2/27/170871718d0d63aa?w=2297&h=3288&f=png&s=465585)



# Coding

## 项目目录解析

```md
miniprogram: 小程序前端部分

├── animate.wxss
├── app.js
├── app.json
├── app.wxss
├── components #公用组件
|  ├── header #全局header
|  ├── home-add-tips #首页添加到我的小程序提示
|  ├── input #全局下划线输入框
|  └── validatePwd #没有指纹验证设备的主密码验证
├── images
├── model
|  ├── base.js #小程序端操作云开发数据库的基类
|  ├── password.js #password集合的model层
|  └── user.js #用户model集合层
├── pages
|  ├── about #关于页面
|  ├── accountDetail #数据详情页面
|  ├── addAccount #添加/修改密码页面
|  ├── home #首页
|  ├── list #搜索/全部记录页
|  ├── mine #偏好设置页面
|  └── register #主密码设置页
├── sitemap.json
└── utils
   ├── cryptojs #加解密类库，用到了sha256 和 AES
   |  ├── README.md
   |  ├── cryptojs.js
   |  ├── lib
   |  ├── package.json
   |  └── test
   ├── log.js #日志操作
   ├── pageScript.wxs
   ├── router.js #全局路由
   ├── tool.js #全局SDK，封装了复用性较多的函数
   └── util.js #工具类函数
```


总结： 小程序云开发，推荐封装数据库操作为model层（实践了两个小程序，发现这个写下来代码比较清晰，参考model目录）。

## 全局函数封装

**注意**：下方代码为之后要出现很多次的`$`

```js
// util/tool.js
import log from './log'
const CryptoJS = require('./cryptojs/cryptojs.js').Crypto
const OPENID = 'uid'

export default {
  get app() {
    return getApp()
  },
  get openid() {
    return wx.getStorageSync(OPENID)
  },
  tip(msg, duration = 2000) {
    return new Promise(resolve =>
      wx.showToast({
        title: msg,
        icon: 'none',
        duration,
        complete() {
          setTimeout(() => {
            resolve()
          }, duration)
        }
      })
    )
  },
  sleep(time = 2000) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, time)
    })
  },
  callCloud(options, showLoading = true) {
    showLoading && wx.showLoading({ title: '获取数据中', mask: true })
    return wx.cloud.callFunction(options).then(res => {
      showLoading && wx.hideLoading()
      return res
    }).catch(e => {
      log.error(e)
      showLoading && wx.hideLoading()
      throw e
    })
  },
  get store() {
    const store = getApp().store
    return {
      set: (key, value = '') => {
        if (key) {
          store[key] = value
        }
      },
      get: (key) => {
        return store[key]
      }
    }
  },
  digest(str) {
    return CryptoJS.SHA256(str)
  },
  loading(title = '加载中', mask = true) {
    return new Promise(resolve => { wx.showLoading({ title, mask, complete: resolve }) })
  },
  hideLoading() { wx.hideLoading() },
  encrypt(value, key) {
    return CryptoJS.AES.encrypt(value, key).toString()
  },
  decrypt(value, key) {
    return CryptoJS.AES.decrypt(value, key).toString()
  }
}

```

## 主密码部分

1. 在小程序启动的时候，在`onLaunch`生命周期获取用户通过SHA256加密的主密码。如果获取为空，则没有设置过主密码。

```js
// app.js
// encryption = SHA256(主密码)
  async login() {
    $.loading()
    const user = new User()
    const { data: info } = await user.getInfo() // 调用获取用户信息
    if (info.length === 0) {// 说明是第一次进入小程序的用户，注册add一条记录
      await user.register()
      $.store.set('encryption', '')
    } else {
      $.store.set('encryption', info[0].encryption) // 把encryption存储在app全局层面
    }
    $.hideLoading()
  }
```


2. 当用户在首页点击`记个密码`,执行下方程序

```js
// home.js
// $ 为tool.js的引用
  addAccount() {
    const encryption = $.store.get('encryption') // 从全局获取encryption
    if (encryption === '') {
      router.push('register') // 为空，表示没有主密码，跳转到主密码设置页面
    } else {
      router.push('addAccount') // 有主密码，直接进入记个密码页面
    }
  }
```



3. 注册主密码


```js
// register.js
  async update(pwd) {
    const encryption = $.digest(pwd) // SHA256摘要加密
    const user = new User()
    const check = await user.updateEncryption(encryption, pwd) // 更新没注册过用户的加密主密码
    if (check) {
      await $.tip('设置密码成功', 1000)
      router.redirectTo('addAccount')
    }
  },
```

**SO**: 主密码服务器不明文存储，SHA256无法解密，所以保证了主密码的安全性。

## 记个密码

1. 可生成随机组合密码

```js
// addAccount.js
const passwordArray = ['ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz', '1234567890', '!@#$%&*()']
// ...
for (let i = 0; i < passwordLen; i++) { // 从上方数组中根据用户选择的规则，随机取字符就行
  const index = Math.floor(Math.random() * sumLen)
  str = str + originPwds[index]
}
// ...
```

2. 密码数据存储

```js
// addAccount.js
  async onSave(e, passValidate = false, mainPassword = '') {
    if (this.validate() || passValidate) {
      this.setData({ saveLoading: true })
      const { data: { title, account, password: pwd, platform, phone, mail, desc, userKey, _id: localId, update } } = this
      let mainKey = mainPassword
      if (mainPassword === '') {
        mainKey = wx.getStorageSync('pwd') // 本地缓存中取用户的主密码
      }
      const password = $.encrypt(pwd, mainKey) // 将密码通过主密码进行AES加密
      //  $.encrypt  ---   return CryptoJS.AES.encrypt(value, key).toString()
      const obj = { title, account, password, platform, phone, mail, desc, userKey }
      const passwordModel = new PasswordDb()
      if (update) {
        const { result: { code = -1 } } = await passwordModel.update({
          ...obj,
          _id: localId
        })
        if (code === 0) {
          await $.tip('修改成功', 1000)
          router.reLaunch()
        } else {
          $.tip('内容无变更或修改失败', 1000)
        }
      } else {
        const { _id = '' } = await passwordModel.add(obj)
        if (_id !== '') {
          await $.tip('保存成功', 1000)
          router.pop()
        } else {
          $.tip('保存失败, 请重试', 1000)
        }
      }
      this.setData({ saveLoading: false })
    }
  }
```

密码通过主密码进行AES加密，主密码来源如下：
- 如果设备支持指纹验证，验证通过之后会从缓存里面读取主密码
- 如果设备不支持指纹验证，则弹窗让用户输入主密码

**SO**: 用户密码在服务端加密存储，没有主密码没办法解密

## 查看密码详情

1. 指纹验证获取本地缓存里的主密码

```js
// list.js
  onShowPwd() {
    const mainKey = wx.getStorageSync('pwd')
    const encryption = $.store.get('encryption')
    if ($.digest(mainKey) === encryption) { // 通过相同的SHA256算法判断 本地主密码是正确的
      fingerCheck(mainKey).then((state) => {
        if (state) {
          this.showPassword(mainKey)
        } else {
          throw new Error('没有指纹解锁')
        }
      }).catch(e => {
        this.setData({ validatePwdShow: true }) // 弹框让用户输入主密码进行验证
        log.error(e)
      })
    } else { // 接口调用失败
      log.error('接口调用失败')
      this.setData({ validatePwdShow: true }) // 弹框让用户输入主密码进行验证
    }
  },
```

2. 如何判断用户输入的主密码正确?

```js
// 取服务器下发的encryption， 将用户输入的主密码通过SHA256加密对比验证
const encryption = $.store.get('encryption')
  if ($.digest(password) !== encryption) {
    $.tip('主密码错误')
    this.setData({ password: '' })
    const inputComponent = this.selectComponent('#password')
    inputComponent.inputContent({ detail: { value: '' } })
    return false
  }
```


3. 显示密码

```js
  showPassword(pwd) {
    const { data: { password, _id, times } } = this
    const value = $.decrypt(password, pwd) // 通过主密码AES算法解密原本密码
    this.setData({ jPassword: value, times: times + 1 })
    const passwordModel = new PasswordDb()
    passwordModel.updateTimes(_id)
    wx.setClipboardData({ data: value })
  },
```

## 高级模糊搜索

搜索引擎的搜索，会将空格替换为或的条件，实现检索更多的数据，我们也实现一下

```js
// password.js => search节选

// keywords 为用户输入的关键词
const key = '(' + keywords.trim().replace(/[(){}.*?:$+-]|[=^!|]/ig, `\\$&`).split(/\s+/).join('|') + ')'// 将空白字符切开 生成正则或 替换用户输入的正则特殊符号

const condition = new RegExp(`${key}`, 'ig')

const or = this._.or(['title', 'account', 'desc', 'mail', 'phone', 'platform'].map(item => { // 将需要模糊搜索的字段生成云开发的or条件
  return {
    [item]: condition
  }
}))
```


## 其他小程序坑点解析

1. 节流传参

当触发点击事件的时候，做了节流处理，但是节流的函数中需要获取点击事件的`event`，所以就遇到了这个坑：call 和 apply的区别。 网上找的节流函数大部分都是call调用，但是这样的话参数传递到原本的函数就传不全！

```js
export function throttle(fn, gapTime = 500) {
  let _lastTime = null
  return function() {
    const _nowTime = +new Date()
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      fn.apply(this, arguments) // arguments类似一个数组，要把原本的参数原封不动的传递的话，这里不能用call
      _lastTime = _nowTime
    }
  }
}

```

2. model层封装

之前做项目都是前后端都要写，后端用的thinkjs和egg，后来小程序出了云开发（severless）之后，就不需要在搭后端和买服务器了。这个封装的思想，算是借鉴了上述框架的model层，这样处理起来，代码比较清晰。

```js
// base.js
import $ from './../utils/tool'

export default class {
  constructor(collectionName) {
    const database = wx.cloud.database({ env: this.env })
    this.env = $.app.globalData.env
    this.db = database.collection(collectionName)
    this._ = database.command
    this.database = database
  }

  get date() {
    return wx.cloud.database({ env: this.env }).serverDate()
  }
}

```

```js
// user.js
import Base from './base'
import $ from './../utils/tool'
const collectionName = 'user'

export default class extends Base { // 继承上面的base
  constructor() {
    super(collectionName)
  }

  register() {
    return this.db.add({
      data: {
        createTime: this.date,
        encryption: ''
      }
    })
  }

```

3. 关于云开发

对于数据库操作权限，好像有一个这样的坑：

- 如果数据是小程序端创建的，即小程序端直接add的，当在小程序端直接去remove或者update这条记录，将会报错，必须用云函数才可以更新或删除记录

- 如果数据是云函数创建的，在小程序端就可以update和remove那条记录

上面的说法没有做验证，仅是上一次开发的另外一个小程序和本次这个小程序对比总结出来的，懒得验证。


# 项目开源/贡献代码

为了维护一个比较稳的密码管理软件，自己搞一个自己用，大家不放心安全问题的话，也可以拉代码自己本地搭建，当然也欢迎贡献代码，一起维护 ~

## 开源地址

🐈github: [https://github.com/arleyGuoLei/wechat-1password](https://github.com/arleyGuoLei/wechat-1password)

如果觉得项目有帮助，麻烦给个star ~

## 开发环境

拉下来代码之后，初始化一个云开发环境，然后需要建两个数据集合，小程序读取权限都设置为【仅创建者可读写】就行

- user
- password


## 赞赏作者

微信扫码，不支持支付宝赞赏！

![赞赏码](https://user-gold-cdn.xitu.io/2020/2/27/17087517adad1653?w=1360&h=1360&f=png&s=318736)