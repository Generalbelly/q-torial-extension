<template>
  <div class="has-background-neutral-050">
    <the-navbar
      v-show="shouldShowNav"
      @click:tutorials-button="showMain"
      @click:logo="onClickLogo"
    ></the-navbar>
    <tutorials-page
      v-show="shouldShowTutorialsPage"
      @click:close="onTutorialsClickClose"
      @click:add="onClickAdd"
      @select="onSelect"
    ></tutorials-page>
    <tutorial-page
      v-show="shouldShowTutorialPage"
      @click:close="onTutorialClickClose"
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
    }
  },
  computed: {
    ...mapState(['tutorials']),
  },
  watch: {
    shouldShowTutorialsPage(value) {
      if (value && this.tutorials.length === 0) {
        this.listTutorials()
      }
    },
  },
  methods: {
    ...mapActions(['listTutorials']),
    onSelect() {
      this.shouldShowNav = false
      this.shouldShowTutorialsPage = false
      this.shouldShowTutorialPage = true
    },
    onClickLogo() {
      window.open(process.env.VUE_APP_URL, '_blank')
    },
    showMain() {
      this.shouldShowNav = false
      this.shouldShowTutorialPage = false
      this.changeIframeStyle({
        height: '100%',
      })
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
  },
}
</script>
<style>
html {
  background-color: transparent;
}
</style>
