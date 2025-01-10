const { sequelize } = require('../../../connection/db/database'); // Sequelize User model
const { User: UserSchema} = require('../../../connection/db/schemas/user-schema/userSchema'); // Sequelize User schema
const UserInstance = require('../model/userInstance');
const { hashPassword, validatePassword, validateEmail, filterData, validateRole } = require('../utils/userUtils');
const searchByToken = require('../utils/passwordUtils')
const {sendVerificationEmail} = require('../../../connection/utils/recoverPassword')
const {generateToken} = require('../../../connection/middlewares/JWTmiddleware');

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

//region Register User
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

            //token for verify account
            let token = generateToken({username:userData.username, email:userData.email}, process.env.JWT_SECRET, 1200 );
            let tokenExpiration = new Date(Date.now() + 86400000).toISOString();  // 24 H
            const hashedPassword = await hashPassword(userData.password);
            const role = userData.role && userData.role.trim() !== '' ? userData.role : 'reader';
            const newUser = UserInstance.createUser(// make a new user and return it whit his instances
                null,
                userData.username,
                userData.email,
                hashedPassword,
                userData.bio,
                role,
                userData.profileImage, 
            );

            newUser.validationToken = token;
            newUser.tokenExpiration = tokenExpiration;


            if (role === 'author') {
                newUser.posts = []; 
            }

            const user = await UserSchema.create({
                name: newUser.username,
                email: newUser.email,
                password: newUser.password,
                bio: newUser.bio || '',
                role: newUser.role || 'reader',
                profileImage: newUser.profileImage || '',
                favorites: newUser.roleInstance.favorites || [],
                posts: newUser.roleInstance.posts || [],
                isVerified: false,
                validationToken: newUser.validationToken,
                tokenExpiration: newUser.tokenExpiration
            }, { transaction });
            newUser.id = user.id; // Set the ID of the class instance

            await transaction.commit();

            /* eliminar cuenta despues de 24H */
            this.scheduleAccountDeletion(user.id, tokenExpiration);

            
            let info = await sendVerificationEmail(newUser.email, newUser.validationToken);
            console.log("correo enviado correctamente.\n");
            return newUser;
        } catch (error) {
            await transaction.rollback();
            throw new Error(error.message);
        }
    }

    async scheduleAccountDeletion(userId, expirationDate) {
        const deleteDelay = new Date(expirationDate) - Date.now();
        setTimeout(async () => {
            try {
                const user = await UserSchema.findByPk(userId);
                if (user && !user.isVerified) {
                    await user.destroy();
                    console.log(`Usuario no verificado ${userId} eliminado automáticamente`);
                }
            } catch (error) {
                console.error('Error al eliminar cuenta no verificada:', error);
            }
        }, deleteDelay);
    }


    // region Find Usernmae
    async findUserByUsername(name) {
        try {
            const user = await UserSchema.findOne({ where: { name } });
            if (user) {
                const roleInstance = UserInstance.createUser(
                    user.id,
                    user.username,
                    user.email,
                    user.password,
                    user.bio,
                    user.role,
                    user.profileImage
                );
                return roleInstance.toJSON();
            }
            return null;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async verifyToken(token) {
        const transaction = await sequelize.transaction();
        try {
            const user = await searchByToken(token);
            
            if (!user) {
                throw new Error('Token no válido.');
            }

            await UserSchema.update(
                {
                    isVerified: true,
                    validationToken: null,
                    tokenExpiration: null
                },
                {
                    where: { id: user.id },
                    transaction
                }
            );

            await transaction.commit();
            return `¡Hola ${user.name}! Tu cuenta ha sido verificada con éxito.`;
        } catch (error) {
            await transaction.rollback();
            throw new Error(error.message);
        }
    }


    async updateUser(updateData) {
        const transaction = await sequelize.transaction();
        try {
            const name = updateData.username;

            if (updateData.password) {
                if (!validatePassword(updateData.password)) {
                    throw new Error("Password must contain 8 characters, 1 uppercase, 1 number, and 1 special character.");
                }
                updateData.password = await hashPassword(updateData.password);
            }

            if (updateData.email && !validateEmail(updateData.email)) {
                throw new Error("Invalid email format.");
            }

            if (updateData.role && !validateRole(updateData.role)) {
                throw new Error("Invalid role.");
            }

            //filter data sended
            const filteredUpdateData = await filterData(UserSchema,updateData);

            const [rowsUpdated] = await UserSchema.update(
                filteredUpdateData,
                {
                    where: { name: name },
                    returning: true,
                    transaction
                }
            );

            await transaction.commit();
            return filteredUpdateData;
        } catch (error) {
            await transaction.rollback();
            throw new Error(error.message);
        }
    }

    async deleteUser(userId) {
        const transaction = await sequelize.transaction();
        try {
            await UserSchema.destroy({ where: { name: userId }, transaction });
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw new Error(error.message);
        }
    }
}

module.exports = new UserController();
