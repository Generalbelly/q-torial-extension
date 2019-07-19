<template>
  <div class="has-background-neutral-050">
    <the-navbar
      v-show="shouldShowNav"
      @click:tutorials="onClickTutorials"
      @click:logo="onClickLogo"
    ></the-navbar>
    <tutorials-page
      v-show="shouldShowTutorialsPage"
      @click:close="onTutorialsClickClose"
      @click:add="onClickAdd"
      @select:tutorial="onSelectTutorial"
    ></tutorials-page>
    <tutorial-page
      v-show="shouldShowTutorialPage"
      @click:close="onTutorialClickClose"
      @click:navigate="onClickNavigate"
    ></tutorial-page>
  </div>
</template>
<script>
import { mapActions, mapState } from 'vuex'
import TutorialsPage from './components/pages/TutorialsPage'
import TheNavbar from './components/organisms/TheNavbar'
import TutorialPage from './components/pages/TutorialPage'
import iframeStyler from './components/mixins/iframeStyler'

export default {
  name: 'App',
  mixins: [iframeStyler],
  components: {
    TutorialPage,
    TheNavbar,
    TutorialsPage,
  },
  data() {
    return {
      shouldShowNav: true,
      shouldShowTutorialsPage: false,
      shouldShowTutorialPage: false,
      navigating: false,
    }
  },
  computed: {
    ...mapState(['tutorials', 'tutorial']),
  },
  watch: {
    shouldShowTutorialsPage(value) {
      if (value && this.tutorials.length === 0) {
        this.listTutorials()
      }
    },
    shouldShowNav(value) {
      if (value) {
        this.changeIframeStyle({
          height: '100px',
        })
      } else {
        this.changeIframeStyle({
          height: '100%',
        })
      }
    },
  },
  mounted() {
    this.startWatchingUrlForSPA()
    this.recoverState()
  },
  methods: {
    ...mapActions(['listTutorials', 'syncData']),
    async recoverState() {
      await this.syncData()
      if (this.tutorial) {
        this.onSelectTutorial()
      }
      if (this.navigating) {
        this.showIframe()
        this.navigating = false
      }
    },
    onSelectTutorial() {
      this.shouldShowNav = false
      this.shouldShowTutorialsPage = false
      this.shouldShowTutorialPage = true
    },
    onClickLogo() {
      window.open(process.env.VUE_APP_URL, '_blank')
    },
    onClickTutorials() {
      this.shouldShowNav = false
      this.shouldShowTutorialPage = false
      this.shouldShowTutorialsPage = true
    },
    onTutorialsClickClose() {
      this.shouldShowTutorialsPage = false
      this.shouldShowTutorialPage = false
      this.shouldShowNav = true
    },
    onClickAdd() {
      this.shouldShowNav = false
      this.shouldShowTutorialsPage = false
      this.shouldShowTutorialPage = true
    },
    onTutorialClickClose() {
      this.shouldShowTutorialPage = false
      this.shouldShowTutorialsPage = true
      this.shouldShowNav = false
    },
    onClickNavigate() {
      this.navigating = true
      this.hideIframe()
    },
    startWatchingUrlForSPA() {
      window.parent.addEventListener('locationchange', async () => {
        this.recoverState()
      })
    },
  },
}
</script>
<style>
html {
  background-color: transparent;
}
</style>
