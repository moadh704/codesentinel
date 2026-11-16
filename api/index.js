const ready = import('../server/src/server.js');

module.exports = async (req, res) => {
  const { default: app } = await ready;
  return app(req, res);
};
