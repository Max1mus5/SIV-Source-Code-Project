/**
 * Migración: Agregar campos para sistema de borradores
 * 
 * Esta migración agrega los campos necesarios para soportar borradores:
 * - resume: Resumen del post
 * - category_id: ID de la categoría
 * - estado: Estado del post (draft/published)
 * - Modifica hashBlockchain para permitir NULL (borradores no se minan)
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('  ➜ Agregando columna "resume"...');
      await queryInterface.addColumn('Posts', 'resume', {
        type: Sequelize.TEXT,
        allowNull: true,
      }, { transaction });

      console.log('  ➜ Agregando columna "category_id"...');
      await queryInterface.addColumn('Posts', 'category_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }, { transaction });

      console.log('  ➜ Agregando columna "estado"...');
      await queryInterface.addColumn('Posts', 'estado', {
        type: Sequelize.STRING,
        defaultValue: 'draft',
        allowNull: false,
      }, { transaction });

      // SQLite no soporta ALTER COLUMN directamente
      // Necesitamos recrear la tabla
      console.log('  ➜ Modificando columna "hashBlockchain" para permitir NULL...');
      
      // Obtener estructura actual de la tabla
      const tableInfo = await queryInterface.describeTable('Posts');
      
      // Crear tabla temporal con la nueva estructura
      await queryInterface.sequelize.query(`
        CREATE TABLE Posts_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          autor_id INTEGER NOT NULL,
          date VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          content VARCHAR(255) NOT NULL,
          likes INTEGER DEFAULT 0,
          post_image VARCHAR(255),
          hashBlockchain VARCHAR(255),
          comments INTEGER,
          resume TEXT,
          category_id INTEGER,
          estado VARCHAR(255) DEFAULT 'draft' NOT NULL,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL,
          FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE SET NULL ON UPDATE CASCADE
        );
      `, { transaction });

      // Copiar datos existentes
      console.log('  ➜ Copiando datos existentes...');
      await queryInterface.sequelize.query(`
        INSERT INTO Posts_new (id, autor_id, date, title, content, likes, post_image, hashBlockchain, comments, createdAt, updatedAt, estado)
        SELECT id, autor_id, date, title, content, likes, post_image, hashBlockchain, comments, createdAt, updatedAt, 'published'
        FROM Posts;
      `, { transaction });

      // Eliminar tabla antigua y renombrar la nueva
      await queryInterface.sequelize.query('DROP TABLE Posts;', { transaction });
      await queryInterface.sequelize.query('ALTER TABLE Posts_new RENAME TO Posts;', { transaction });

      console.log('  ✓ Migración completada exitosamente');
      await transaction.commit();
    } catch (error) {
      console.error('  ✗ Error en migración:', error.message);
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('  ➜ Revirtiendo migración...');
      
      // Recrear tabla sin los campos nuevos
      await queryInterface.sequelize.query(`
        CREATE TABLE Posts_old (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          autor_id INTEGER NOT NULL,
          date VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          content VARCHAR(255) NOT NULL,
          likes INTEGER DEFAULT 0,
          post_image VARCHAR(255),
          hashBlockchain VARCHAR(255) NOT NULL,
          comments INTEGER,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL
        );
      `, { transaction });

      // Copiar solo posts publicados (los únicos que tendrían hash)
      await queryInterface.sequelize.query(`
        INSERT INTO Posts_old (id, autor_id, date, title, content, likes, post_image, hashBlockchain, comments, createdAt, updatedAt)
        SELECT id, autor_id, date, title, content, likes, post_image, hashBlockchain, comments, createdAt, updatedAt
        FROM Posts
        WHERE hashBlockchain IS NOT NULL;
      `, { transaction });

      await queryInterface.sequelize.query('DROP TABLE Posts;', { transaction });
      await queryInterface.sequelize.query('ALTER TABLE Posts_old RENAME TO Posts;', { transaction });

      console.log('  ✓ Rollback completado');
      await transaction.commit();
    } catch (error) {
      console.error('  ✗ Error en rollback:', error.message);
      await transaction.rollback();
      throw error;
    }
  }
};
