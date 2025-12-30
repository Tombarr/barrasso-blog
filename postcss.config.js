module.exports = {
  plugins: {
    autoprefixer: {
      // Autoprefixer options
      // See: https://github.com/postcss/autoprefixer#options
      overrideBrowserslist: ['>0.2%', 'not dead', 'not op_mini all'],
    },
  },
};
