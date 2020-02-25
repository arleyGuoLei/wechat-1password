const app = getApp()

Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar
  }
})
