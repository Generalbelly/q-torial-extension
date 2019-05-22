<template>
  <div class="has-background-neutral-050">
    <the-navbar v-show="showNav" @click:tutorials-button="onClickTutorialsButton" @click:logo="onClickLogo"></the-navbar>
    <the-main :active="showMain" @click:close="onClickMainClose">
      <tutorials-page @click:add="onClickAdd"></tutorials-page>
    </the-main>
    <the-sidebar
      :class="showSideNavRight ? 'is-fixed-top-right' : 'is-fixed-top-left'"
      v-show="showSideNav"
      :is-on-right="showSideNavRight"
      @click:close="onClickSidebarClose"
      @click:switch="onClickSwitch"
    >
      <tutorial-page @select:step-element="onSelectStepElement" @click:step-type="onClickStepType"></tutorial-page>
    </the-sidebar>
    <tips-message class="is-fixed-top-right" :active="showClickToAddStepMessage" @close="onCloseClickToAddStepMessage">
      Click to select and edit text.<br />
      Selections start small.<br />
      The more you click, the larger your section to edit will become.<br />
      To select a different small section, press cancel and click a new section.
    </tips-message>
    <warning-message class="is-fixed-top-right" :active="showNoStepAddedYetMessage" @close="showNoStepAddedYetMessage = false">
      You haven't added any steps yet.
    </warning-message>
  </div>
</template>
<script>
import TutorialsPage from './components/pages/TutorialsPage';
import TheNavbar from './components/organisms/TheNavbar';
import TheMain from './components/organisms/global/TheMain';
import TheSidebar from './components/organisms/TheSidebar';
import TutorialPage from './components/pages/TutorialPage';
import WarningMessage from './components/organisms/messages/WarningMessage';
import TipsMessage from './components/organisms/messages/TipsMessage';

export default {
  name: 'App',
  components: {
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
      showNav: true,
      showSideNav: false,
      showSideNavRight: true,
      showMain: false,
      iframeElement: null,
      showClickToAddStepMessage: false,
      showNoStepAddedYetMessage: false,
    };
  },
  // watch: {
  //   showMain(value) {
  //     if (value) {
  //       this.changeIframeStyle({
  //         height: '100%',
  //       });
  //     }
  //   },
  //   showSideNav(value) {
  //     if (value) {
  //       this.changeIframeStyle({
  //         width: '300px',
  //         height: '100%',
  //       });
  //     }
  //   },
  // },
  mounted() {
    this.iframeElement = window.parent.document.querySelector('iframe#q-torial');
  },
  methods: {
    changeIframeStyle(styles) {
      Object.keys(styles).forEach(attribute => {
        this.iframeElement.style[attribute] = styles[attribute];
      });
    },
    onClickLogo() {
      window.open(process.env.VUE_APP_URL, '_blank');
    },
    onClickTutorialsButton() {
      this.showNav = false;
      this.showSideNav = false;
      this.changeIframeStyle({
        height: '100%',
      });
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
      // this.changeIframeStyle({
      //   top: '0',
      //   right: '0',
      //   left: 'unset',
      //   bottom: '0',
      // });
      this.showSideNav = true;
    },
    onClickSwitch() {
      this.showSideNavRight = !this.showSideNavRight;
      // if (this.showSideNavRight) {
      //   this.changeIframeStyle({
      //     top: '0',
      //     right: '0',
      //     left: 'unset',
      //     bottom: '0',
      //   });
      // } else {
      //   this.changeIframeStyle({
      //     top: '0',
      //     right: 'unset',
      //     left: '0',
      //     bottom: '0',
      //   });
      // }
    },
    onClickStepType() {
      this.showClickToAddStepMessage = true;
      this.showSideNav = false;
    },
    onCloseClickToAddStepMessage() {
      this.showClickToAddStepMessage = false;
      this.changeIframeStyle({
        display: 'none',
      });
    },
    onSelectStepElement() {},
  },
};
</script>
<style>
html {
  background-color: transparent;
}
</style>
