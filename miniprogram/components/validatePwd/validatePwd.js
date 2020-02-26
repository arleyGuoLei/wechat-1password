import $ from './../../utils/tool'

Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },
  data: {
    password: '',
    autoFocus: false,
    placeholder: '请输入验证主密码'
  },
  lifetimes: {
    attached() {
      setTimeout(() => {
        this.setData({ autoFocus: true })
      }, 2500)
    }
  },
  methods: {
    validate() {
      const { data: { password } } = this
      if (password.length === 0) {
        $.tip('请输入主密码')
        return false
      }
      const encryption = $.store.get('encryption')
      if ($.digest(password) !== encryption) {
        $.tip('主密码错误')
        this.setData({ password: '' })
        const inputComponent = this.selectComponent('#password')
        inputComponent.inputContent({ detail: { value: '' } })
        return false
      }
      this.triggerEvent('validateSuccess', { password })
      wx.setStorageSync('pwd', password)
      this.setData({ show: false, password: '', placeholder: '请输入验证主密码' })
      return true
    },
    quit() {
      this.setData({ show: false, password: '', placeholder: '请输入验证主密码' })
    },
    onInput(e) {
      const { detail: { value } } = e
      this.setData({ password: value })
    }
  }
})
