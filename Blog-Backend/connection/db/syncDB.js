const { sequelize } = require('./database.js');

sequelize.sync({ force: true })
  .then(() => {
    console.log('Database synchronized');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error synchronizing database:', err);
    process.exit(1);
  });
