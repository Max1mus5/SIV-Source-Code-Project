const { sequelize } = require('../../connection/db/database');

const setupTestDb = async () => {
    await sequelize.sync({ force: true });
};

const teardownTestDb = async () => {
    await sequelize.close();
};

const clearTable = async (Model) => {
    await Model.destroy({ where: {}, truncate: true });
};

module.exports = { setupTestDb, teardownTestDb, clearTable };
