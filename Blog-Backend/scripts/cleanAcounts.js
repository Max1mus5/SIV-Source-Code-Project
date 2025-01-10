const cron = require('node-cron');
const { User } = require('../connection/db/schemas/user-schema/userSchema');

async function cleanupUnverifiedAccounts() {
    try {
        const yesterday = new Date(Date.now() - 86400000);
        const deletedCount = await User.destroy({
            where: {
                isVerified: false,
                createdAt: {
                    [Op.lt]: yesterday
                }
            }
        });
        console.log(`${deletedCount} cuentas no verificadas eliminadas`);
    } catch (error) {
        console.error('Error al limpiar cuentas no verificadas:', error);
    }
}

// Ejecutar la limpieza cada día a la medianoche
cron.schedule('0 0 * * *', cleanupUnverifiedAccounts);