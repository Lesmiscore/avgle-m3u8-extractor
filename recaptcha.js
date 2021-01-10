const grecaptcha = {
  render: (type, opts) => {
    const { callback } = opts;
    setTimeout(() => {
      callback(grecaptcha.getResponse());
    }, 1);
  },
  getResponse: () => "make it great again",
};
if (window.onloadCallback) {
  window.onloadCallback();
}
