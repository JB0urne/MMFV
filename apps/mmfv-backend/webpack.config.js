const { composePlugins, withNx } = require('@nx/webpack');

module.exports = composePlugins(withNx(), (config) => {
  // Set webpack mode to production
  config.mode = config.mode || 'production';

  // Ensure entry point is correctly set
  if (config.entry && typeof config.entry === 'object') {
    // Entry is already configured by Nx, ensure it's correct
    const entryKeys = Object.keys(config.entry);
    if (entryKeys.length > 0 && config.entry[entryKeys[0]]) {
      // Entry point is already set correctly by Nx executor
    }
  }

  return config;
});

