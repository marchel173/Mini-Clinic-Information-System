const { error } = require("../utils/response");

// Centralized error handler. Any error passed via next(err) or thrown
// inside an asyncHandler-wrapped controller ends up here.
function errorHandler(err, req, res, next) {
  console.error(err);

  // PostgreSQL unique violation
  if (err.code === "23505") {
    return error(res, "Data sudah ada (duplikat)", { detail: err.detail }, 409);
  }

  // PostgreSQL foreign key violation
  if (err.code === "23503") {
    return error(
      res,
      "Data terkait tidak ditemukan",
      { detail: err.detail },
      409,
    );
  }

  const statusCode = err.statusCode || 500;
  return error(
    res,
    err.message || "Terjadi kesalahan pada server",
    err.errors || {},
    statusCode,
  );
}

function notFound(req, res) {
  return error(res, `Endpoint ${req.originalUrl} tidak ditemukan`, {}, 404);
}

module.exports = { errorHandler, notFound };
