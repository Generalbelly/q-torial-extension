import { mapState } from 'vuex'

export default {
  data() {
    return {
      iframeElement: null,
    }
  },
  mounted() {
    this.iframeElement = window.parent.document.querySelector(
      `iframe#${process.env.VUE_APP_NAME}`
    )
  },
  methods: {
    changeIframeStyle(styles) {
      Object.keys(styles).forEach(attribute => {
        this.iframeElement.style[attribute] = styles[attribute]
      })
    },
    toggleIframe() {
      const displayValue = this.iframeElement.style.display
      this.iframeElement.style.display =
        displayValue === 'none' ? 'block' : 'none'
    },
    showIframe() {
      this.iframeElement.style.display = 'block'
    },
    hideIframe() {
      this.iframeElement.style.display = 'none'
    },
  },
}
