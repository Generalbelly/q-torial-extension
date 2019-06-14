<template>
  <div class="has-background-neutral-050">
    <the-navbar
      v-show="shouldShowNav"
      @click:tutorials-button="showMain"
      @click:logo="onClickLogo"
    ></the-navbar>
    <tutorials-page
      v-show="shouldTutorialsPage"
      @click:close="onTutorialsClickClose"
      @click:add="onClickAdd"
      @select="onSelect"
    ></tutorials-page>
    <tutorial-page
      v-show="shouldTutorialPage"
      @click:close="onTutorialClickClose"
    ></tutorial-page>
  </div>
</template>
<script>
import TutorialsPage from './components/pages/TutorialsPage'
import TheNavbar from './components/organisms/TheNavbar'
import TheMain from './components/organisms/global/TheMain'
import TheSidebar from './components/organisms/TheSidebar'
import TutorialPage from './components/pages/TutorialPage'
import WarningMessage from './components/organisms/messages/WarningMessage'
import TipsMessage from './components/organisms/messages/TipsMessage'
import ScreenOverlayLayout from './components/molecules/layouts/ScreenOverlayLayout'
import iframeStyler from './components/mixins/iframeStyler'

export default {
  name: 'App',
  mixins: [iframeStyler],
  components: {
    ScreenOverlayLayout,
    TipsMessage,
    WarningMessage,
    TutorialPage,
    TheSidebar,
    TheMain,
    TheNavbar,
    TutorialsPage,
  },
  data() {
    return {
      shouldShowNav: true,
      shouldTutorialsPage: false,
      shouldTutorialPage: false,
    }
  },
  methods: {
    onSelect() {
      this.shouldShowNav = false
      this.shouldTutorialsPage = false
      this.shouldTutorialPage = true
    },
    onClickLogo() {
      window.open(process.env.VUE_APP_URL, '_blank')
    },
    showMain() {
      this.shouldShowNav = false
      this.shouldTutorialPage = false
      this.changeIframeStyle({
        height: '100%',
      })
      this.shouldTutorialsPage = true
    },
    onTutorialsClickClose() {
      this.shouldTutorialsPage = false
      this.shouldTutorialPage = false
      this.shouldShowNav = true
    },
    onClickAdd() {
      this.shouldShowNav = false
      this.shouldTutorialsPage = false
      this.shouldTutorialPage = true
    },
    onTutorialClickClose() {
      this.shouldTutorialPage = false
      this.shouldTutorialsPage = true
      this.shouldShowNav = false
    },
  },
}
</script>
<style>
html {
  background-color: transparent;
}
</style>
