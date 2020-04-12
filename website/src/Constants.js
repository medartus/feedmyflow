const Colors = {
  primary: "#008FBF",
  light: "#3DA7CA",
  dark: "#00698C",
  shade1: "#133540",
  shade2: "#003040",
  error: "#F54C4C",
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

const URL_REGEX = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/;

const extractDomain = (url) => (url ? new URL(url).hostname : "");

export {
  Colors,
  defaultAlertProps,
  getWarningProps,
  getDangerProps,
  getSuccessProps,
  extractDomain,
  URL_REGEX,
};
