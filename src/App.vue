<template>
  <div>
    <the-navbar
      v-show="showNav"
      @click:tutorials-button="onClickTutorialsButton"
      @click:logo="onClickLogo"
    ></the-navbar>
    <the-main
      :active="showMain"
      @click:close="onClickMainClose"
    >
      <tutorials-page
        @click:add="onClickAdd"
      ></tutorials-page>
    </the-main>
    <the-sidebar
      v-show="showSideNav"
      :is-on-right="showSideNavRight"
      @click:close="onClickSidebarClose"
      @click:switch="onClickSwitch"
    >
      <tutorial-page
        @select:step-element="onSelectStepElement"
      ></tutorial-page>
    </the-sidebar>
  </div>
</template>
<script>
import { mapActions, mapState } from 'vuex';
import TutorialsPage from './components/pages/TutorialsPage';
import TheNavbar from './components/organisms/TheNavbar';
import TheMain from './components/organisms/global/TheMain';
import TheSidebar from './components/organisms/TheSidebar';
import TutorialPage from './components/pages/TutorialPage';

export default {
  name: 'App',
  components: {
    TutorialPage,
    TheSidebar,
    TheMain,
    TheNavbar,
    TutorialsPage,
  },
  data() {
    return {
      showNav: true,
      showSideNav: false,
      showSideNavRight: true,
      showMain: false,
      iframeElement: null,
    };
  },
  watch: {
    showMain(value) {
      if (value) {
        this.changeIframeStyle({
          height: '100%',
        });
      }
    },
    showSideNav(value) {
      if (value) {
        this.changeIframeStyle({
          width: '300px',
          height: '100%',
        });
      }
    },
  },
  mounted() {
    this.iframeElement = window.parent.document.querySelector('iframe#q-torial');
  },
  methods: {
    changeIframeStyle(styles) {
      Object.keys(styles).forEach((attribute) => {
        this.iframeElement.style[attribute] = styles[attribute];
      });
    },
    onClickLogo() {
      window.open(process.env.VUE_APP_URL, '_blank');
    },
    onClickTutorialsButton() {
      this.showNav = false;
      this.showSideNav = false;
      this.showMain = true;
    },
    onClickMainClose() {
      this.showMain = false;
      this.showSideNav = false;
      this.showNav = true;
    },
    onClickSidebarClose() {
      this.showMain = true;
      this.showSideNav = false;
      this.showNav = false;
    },
    onClickAdd() {
      this.showNav = false;
      this.showMain = false;
      this.changeIframeStyle({
        top: '0',
        right: '0',
        left: 'unset',
        bottom: '0',
      });
      this.showSideNav = true;
    },
    onClickSwitch() {
      this.showSideNavRight = !this.showSideNavRight;
      if (this.showSideNavRight) {
        this.changeIframeStyle({
          top: '0',
          right: '0',
          left: 'unset',
          bottom: '0',
        });
      } else {
        this.changeIframeStyle({
          top: '0',
          right: 'unset',
          left: '0',
          bottom: '0',
        });
      }
    },
    onSelectStepElement(cordinates) {

    },
  },
};
</script>
<style>
html {
  background-color: transparent;
}
</style>
