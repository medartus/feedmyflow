const Colors = {
  primary: "#008FBF",
  light: "#3DA7CA",
  dark: "#00698C",
  shade1: "#133540",
  shade2: "#003040",
  error: "#F54C4C",
};

const AboutData = {
  usage: [
    "1 - Log in / Sign in with ==Linkedin== on the home page 📑",
    "2 - ==Schedule your post== by clicking on the new post button, or by clicking on any day you would like your post to be scheduled 📅",
    "3 - Configure your post according to the ==guide below==, and you’re done! 👍",
  ],
  guide: [
    "1 - The 2 ==required fields== to schedule a post are content and date ⌚",
    "2 - You can also add a ==title, a link and a description==, the post will look like the picture on the right 👉",
    "3 - Note that you can ==update/delete== your post anytime by clicking on it on the calendar 💪",
  ],
  team: [
    "We are a team of passionate CS students from France 🥐",
    "We wanted to solve a simple problem which is automating Linkedin posting for free, and this is where [it all started](https://github.com/medartus/feedmyflow) ! 🚀",
    "We love challenging our skills so checkout our other projects [Swizzl](www.swizzl.fr), [BikeStations](https://bikestations.netlify.com/) and [Loa](https://loabot.netlify.com/) 🤖",
  ],
};

const defaultAlertProps = {
  show: false,
  warning: true,
  showCancel: true,
  title: "",
  confirmBtnBsStyle: "danger",
  onConfirm: () => {},
  onCancel: () => {},
  focusCancelBtn: true,
};

const getWarningProps = (title, onConfirm) => ({
  show: true,
  warning: true,
  confirmBtnCssClass: "alert-btn",
  title,
  onConfirm,
});

const getDangerProps = (
  title,
  confirmBtnText,
  cancelBtnText,
  onConfirm,
  onCancel
) => ({
  show: true,
  danger: true,
  showCancel: true,
  cancelBtnCssClass: "alert-btn",
  confirmBtnCssClass: "alert-btn danger-btn",
  cancelBtnText,
  confirmBtnText,
  title,
  onConfirm,
  onCancel,
});

const getSuccessProps = (title, onConfirm) => ({
  show: true,
  success: true,
  confirmBtnCssClass: "alert-btn",
  title,
  onConfirm,
});

const URL_REGEX = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

const extractDomain = (url) => (url ? new URL(url).hostname : "");

export {
  Colors,
  AboutData,
  defaultAlertProps,
  getWarningProps,
  getDangerProps,
  getSuccessProps,
  extractDomain,
  URL_REGEX,
};
