<template>
  <div class="has-background-neutral-050" v-if="user">
    <the-navbar
      v-if="shouldShowNav"
      @click:tutorials="onClickTutorials"
      @click:logo="onClickLogo"
    />
    <tutorials-page
      v-if="shouldShowTutorialsPage"
      @click:close="onTutorialsClickClose"
      @click:add="onClickAdd"
      @select:tutorial="onSelectTutorial"
    />
    <tutorial-page
      v-if="shouldShowTutorialPage"
      @click:close="onTutorialClickClose"
    />
  </div>
</template>
<script>
import { mapActions, mapState } from 'vuex';
import TutorialsPage from './components/pages/TutorialsPage';
import TheNavbar from './components/organisms/TheNavbar';
import TutorialPage from './components/pages/TutorialPage';
import iframeStyler from './components/mixins/iframeStyler';

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
      stateRecovered: false,
    };
  },
  computed: {
    ...mapState(['tutorials', 'tutorial', 'navigating', 'previewing', 'user']),
  },
  watch: {
    shouldShowTutorialsPage(value) {
      if (value && this.tutorials.length === 0) {
        this.listTutorials();
      }
    },
    shouldShowNav(value) {
      if (value) {
        this.changeIframeStyle({
          height: '100px',
        });
      } else {
        this.changeIframeStyle({
          height: '100%',
        });
      }
    },
  },
  mounted() {
    this.startWatchingUrlForSPA();
    this.recoverState();
  },
  methods: {
    ...mapActions(['listTutorials', 'syncData', 'setNavigating']),
    async recoverState() {
      await this.syncData();
      if (this.tutorial) {
        this.onSelectTutorial();
      }
      if (this.navigating) {
        this.setNavigating(false);
      }
    },
    onSelectTutorial() {
      this.shouldShowNav = false;
      this.shouldShowTutorialsPage = false;
      this.shouldShowTutorialPage = true;
    },
    onClickLogo() {
      window.open(process.env.VUE_APP_URL, '_blank');
    },
    onClickTutorials() {
      this.shouldShowNav = false;
      this.shouldShowTutorialPage = false;
      this.shouldShowTutorialsPage = true;
    },
    onTutorialsClickClose() {
      this.shouldShowTutorialsPage = false;
      this.shouldShowTutorialPage = false;
      this.shouldShowNav = true;
    },
    onClickAdd() {
      this.shouldShowNav = false;
      this.shouldShowTutorialsPage = false;
      this.shouldShowTutorialPage = true;
    },
    onTutorialClickClose() {
      this.shouldShowTutorialPage = false;
      this.shouldShowTutorialsPage = true;
      this.shouldShowNav = false;
    },
    startWatchingUrlForSPA() {
      window.parent.addEventListener('locationchange', async () => {
        this.recoverState();
      });
    },
  },
};
</script>
<style>
html {
  background-color: transparent;
}
</style>
