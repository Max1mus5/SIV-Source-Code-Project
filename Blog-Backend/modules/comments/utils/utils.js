
function handleErrorResponse(res, error, statusCode = 500) {
  console.error(error.message);
  res.status(statusCode).json({ message: error.message });
}

function validateRequiredFields(data, requiredFields) {
  requiredFields.forEach(field => {
      if (!data[field]) {
          throw new Error(`El campo ${field} es requerido.`);
      }
  });
}

module.exports = {
  handleErrorResponse,
  validateRequiredFields
};