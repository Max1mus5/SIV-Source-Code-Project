
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


function convertToInt(value, fieldName) {
  const intValue = parseInt(value, 10);
  if (isNaN(intValue)) {
      throw new Error(`El campo ${fieldName} debe ser un número.`);
  }
  return intValue;
}

// Función para validar los campos requeridos
function validateRequiredFields(data, requiredFields) {
  requiredFields.forEach(field => {
      if (!data[field]) {
          throw new Error(`El campo ${field} es obligatorio.`);
      }
  });
}



module.exports = {
  validateRequiredFields,
  handleErrorResponse,
  validateRequiredFields,
  convertToInt,
};
