
/**
 * Maneja la respuesta en caso de error en una solicitud HTTP.
 * @param {Response} res - El objeto de respuesta HTTP.
 * @param {Error} error - El error capturado.
 * @param {number} [statusCode=500] - El código de estado HTTP, por defecto 500.
 */
function handleErrorResponse(res, error, statusCode = 500) {
  console.error(error.message);
  res.status(statusCode).json({ message: error.message });
}

/**
* Valida que los campos requeridos estén presentes en el objeto de datos.
* @param {Object} data - El objeto de datos a validar.
* @param {Array<string>} requiredFields - Los campos que se deben validar.
* @throws {Error} Si algún campo requerido no está presente.
*/
function validateRequiredFields(data, requiredFields) {
  requiredFields.forEach(field => {
      if (!data[field]) {
          throw new Error(`El campo ${field} es requerido.`);
      }
  });
}

/**
* Convierte un valor a número entero y maneja posibles errores.
* @param {any} value - El valor a convertir.
* @param {string} fieldName - El nombre del campo, usado para mensajes de error.
* @returns {number} El valor convertido.
* @throws {Error} Si la conversión falla.
*/
function convertToInt(value, fieldName) {
  const intValue = parseInt(value, 10);
  if (isNaN(intValue)) {
      throw new Error(`El campo ${fieldName} debe ser un número.`);
  }
  return intValue;
}

module.exports = {
  handleErrorResponse,
  validateRequiredFields,
  convertToInt,
};
