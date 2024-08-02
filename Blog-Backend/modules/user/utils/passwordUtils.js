const { User } = require('../../../connection/db/schemas/user-schema/userSchema');

//search by token
async function searchByToken(token) {
    try {
        //search by token
        const user = await User.findOne({ where: { validationToken: token } });
        if (!user) throw new Error('Token no válido.');
        let datauser = user.dataValues;
        if(!Date.now().toString() > datauser.tokenExpiration){
            await  User.destroy({ where: { name: datauser.name } });
            throw new Error('Token expirado, cuenta eliminada.');
        }
        //actualizar base dee datos y vaciar espacios de token
        let tokeknNull = await User.update({ validationToken: null, tokenExpiration: null }, { where: { name:datauser.name } });
        console.log(tokeknNull);
        return datauser;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = searchByToken;