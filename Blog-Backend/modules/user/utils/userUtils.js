const bcrypt = require('bcryptjs');

// verify password (8 char, 1 uppercase, 1 number, 1 special char)
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
  return passwordRegex.test(password);
};

// Function to hash password
const hashPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 16);
  return hashedPassword;
};

// verify Email
const validateEmail = (email) => {
  const emailRegex = /^[\w\.-]+@(gmail|hotmail|utp)\.(com|org|net|gov|edu|info|biz|io|co|tv|[a-zA-Z]{2,3})\.?[a-zA-Z]{0,3}$/;
  return emailRegex.test(email.toLowerCase());
}

const validateRole = (role) => {
  const roles = ['reader', 'autor', 'admin'];
  return roles.includes(role);
}

 /* filtrer data function */
const filterData = async (transaction, userSchema, updateData) => {
  const user = await userSchema.findOne({ where: { name: updateData.username } });
  const filteredData = {};
  for (const key in updateData) {
    if (updateData[key] !== undefined && updateData[key] !== null && updateData[key] !== "") {
      filteredData[key] = user[key];
    } 
    filteredData[key] = updateData[key];
  }
  return filteredData;
}











module.exports = {
  hashPassword, 
  validatePassword,
  validateEmail,
  filterData,
  validateRole
};