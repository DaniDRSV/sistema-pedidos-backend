const sendSuccess = (res, data, { status = 200, message = 'OK' } = {}) =>
  res.status(status).json({ success: true, message, data });

module.exports = { sendSuccess };
