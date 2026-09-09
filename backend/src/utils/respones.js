function success(res, data = {}, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

function error(res, message = "Error", errors = {}, statusCode = 400) {
  return res.status(statusCode).json({ success: false, message, errors });
}

module.exports = { success, error };
