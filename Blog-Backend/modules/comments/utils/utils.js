
function handleErrorResponse(res, error, statusCode = 500) {
  console.error(error.message);
  res.status(statusCode).json({ message: error.message });
}