// modules/user/controller.js
const { sequelize } = require('../../../connection/db/database'); // Sequelize User model
const { User: UserSchema} = require('../../../connection/db/schemas/user-schema/userSchema'); // Sequelize User schema
const User = require('../model/userModel'); // Class User
const { hashPassword, validatePassword, validateEmail } = require('../utils/userUtils');

// validate Unique Username
const validateUniqueUsername = async (  name ) => {
    const user = await UserSchema.findOne({ where: { name } });
    return user ? false : true;
  };
  
  // validate unique Email
  const validateUniqueEmail = async (email) => {
    const user = await UserSchema.findOne({ where: { email } });
    return user ? false : true;
  }

class UserController {
    async createUser(userData) {
        const transaction = await sequelize.transaction();
        try {
            if(! await validateUniqueUsername(userData.username)){
                throw new Error("Username already exists.");
            }

            if (!validatePassword(userData.password)) {
                throw new Error("Password must contain 8 characters, 1 uppercase, 1 number, and 1 special character.");
            }

            if (!validateEmail(userData.email)) {
                throw new Error("Invalid email.");
            }

            if(! await validateUniqueEmail(userData.email)){
                throw new Error("Email already exists.");
            }

            const hashedPassword = await hashPassword(userData.password);
            const newUser = new User(null, userData.username, userData.email, hashedPassword, userData.bio, userData.role);

            const user = await UserSchema.create({
                name: newUser.username,
                email: newUser.email,
                password: newUser.password,
                bio: newUser.bio || '',
                role: newUser.role || 'reader'
            }, { transaction });

            newUser.id = user.id; // Set the ID of the class instance
            await transaction.commit();
            return newUser;
        } catch (error) {
            await transaction.rollback();
            throw new Error(error.message);
        }
    }

    async findUserById(userId) {
        try {
            const user = await UserSchema.findByPk(userId);
            if (user) {
                return new User(user.id, user.username, user.email, user.password, user.bio, user.role);
            }
            return null;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async findUserByUsername(username) {
        try {
            const user = await UserSchema.findOne({ where: { username } });
            if (user) {
                return new User(user.id, user.username, user.email, user.password, user.bio, user.role);
            }
            return null;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async updateUser(userId, updateData) {
        const transaction = await sequelize.transaction();
        try {
            const user = await UserSchema.update(updateData, { where: { id: userId }, transaction });
            await transaction.commit();
            return user;
        } catch (error) {
            await transaction.rollback();
            throw new Error(error.message);
        }
    }

    async deleteUser(userId) {
        const transaction = await sequelize.transaction();
        try {
            await UserSchema.destroy({ where: { id: userId }, transaction });
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw new Error(error.message);
        }
    }
}

module.exports = new UserController();
