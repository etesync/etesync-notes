const createExpoWebpackConfigAsync = require("@expo/webpack-config");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      // Passing true will enable the default Workbox + Expo SW configuration.
      offline: true,
    },
    {
      ...argv,
      workbox: {
        generateSWOptions: {
          importWorkboxFrom: "local",
        },
      },
    }
  );
  // Customize the config before returning it.
  return config;
};
