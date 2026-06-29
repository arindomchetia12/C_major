const appPromise = import("../../api-server/dist/app.mjs");

module.exports = async (req, res) => {
  const { default: app } = await appPromise;
  return app(req, res);
};
