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
    },
    cursorSpacing: {
      type: Number,
      value: 84
    },
    tag: {
      type: String,
      value: ''
    },
    isPassword: {
      type: Boolean,
      value: false
    },
    autoFocus: {
      type: Boolean,
      value: false
    }
  },
  data: {
    placeholderValue: ''
  },
  methods: {
    inputContent(e) {
      const { detail: { value } } = e
      const { properties: { tag } } = this
      this.triggerEvent('inputChange', { value, tag })
      if (value !== '') {
        this.setData({ placeholderValue: '' })
      } else {
        this.init()
      }
    },
    init() {
      const { properties: { placeholder, inputValue: value } } = this
      if (typeof value === 'undefined' || value === '') {
        this.setData({ placeholderValue: placeholder })
      }
    }
  },
  lifetimes: {
    attached() {
      this.init()
    }
  },
  observers: {
    inputValue: function(inputValue) {
      if (inputValue !== '') {
        this.setData({ placeholderValue: '' })
      }
    }
  }
})
