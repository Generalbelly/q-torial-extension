import { mapState } from 'vuex';

export default {
  data() {
    return {
      iframeElement: null,
    };
  },
  methods: {
    getIframeElement() {
      if (!this.iframeElement) {
        this.iframeElement = window.parent.document.querySelector(
          `iframe#${process.env.VUE_APP_NAME}`
        );
      }
      return this.iframeElement;
    },
    changeIframeStyle(styles) {
      Object.keys(styles).forEach(attribute => {
        this.getIframeElement().style[attribute] = styles[attribute];
      });
    },
    toggleIframe() {
      const displayValue = this.getIframeElement().style.display;
      this.getIframeElement().style.display =
        displayValue === 'none' ? 'block' : 'none';
    },
    showIframe() {
      this.getIframeElement().style.display = 'block';
    },
    hideIframe() {
      this.getIframeElement().style.display = 'none';
    },
  },
};
