Component({
  properties: {
    placeholder: {
      type: String,
      value: ''
    },
    inputValue: {
      type: String,
      value: ''
    },
    maxLength: {
      type: Number,
      value: -1
    }
  },
  data: {
    placeholderValue: ''
  },
  methods: {
    inputContent(e) {
      const { detail: { value } } = e
      this.triggerEvent('inputChange', { value })
      if (value !== '') {
        this.setData({ placeholderValue: '' })
      } else {
        this.init()
      }
    },
    init() {
      const { properties: { placeholder } } = this
      this.setData({ placeholderValue: placeholder })
    }
  },
  lifetimes: {
    attached() {
      this.init()
    }
  }
})
