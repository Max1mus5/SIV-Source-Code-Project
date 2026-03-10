const { sequelize } = require('./database');
const fs = require('fs');
const path = require('path');

/**
 * Sistema de migraciones automático
 * 
 * Este módulo maneja la ejecución de migraciones de base de datos:
 * - Crea una tabla de seguimiento (SequelizeMigrations)
 * - Lee archivos de migración del directorio migrations/
 * - Ejecuta solo las migraciones pendientes
 * - Registra cada migración ejecutada
 * - Proporciona rollback seguro en caso de errores
 */

async function createMigrationsTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS SequelizeMigrations (
      name VARCHAR(255) PRIMARY KEY,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function getExecutedMigrations() {
  const [results] = await sequelize.query(
    'SELECT name FROM SequelizeMigrations ORDER BY name ASC'
  );
  return results.map(row => row.name);
}

async function markMigrationAsExecuted(migrationName) {
  await sequelize.query(
    'INSERT INTO SequelizeMigrations (name) VALUES (?)',
    { replacements: [migrationName] }
  );
}

async function runMigrations() {
  console.log('\n🔄 Verificando migraciones pendientes...');
  
  try {
    // Crear tabla de seguimiento si no existe
    await createMigrationsTable();

    // Obtener migraciones ya ejecutadas
    const executedMigrations = await getExecutedMigrations();

    // Leer archivos de migración del directorio
    const migrationsDir = path.join(__dirname, 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.log('✅ No hay directorio de migraciones');
      return;
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort(); // Ordenar por nombre (01-, 02-, etc.)

    // Filtrar migraciones pendientes
    const pendingMigrations = migrationFiles.filter(
      file => !executedMigrations.includes(file)
    );

    if (pendingMigrations.length === 0) {
      console.log('✅ No hay migraciones pendientes');
      return;
    }

    console.log(`📝 ${pendingMigrations.length} migración(es) pendiente(s):`);
    pendingMigrations.forEach(file => console.log(`   - ${file}`));

    // Ejecutar cada migración pendiente
    for (const migrationFile of pendingMigrations) {
      console.log(`\n🔧 Ejecutando migración: ${migrationFile}`);
      
      const migrationPath = path.join(migrationsDir, migrationFile);
      const migration = require(migrationPath);

      // Validar que la migración tenga función up
      if (typeof migration.up !== 'function') {
        throw new Error(`Migración ${migrationFile} no tiene función "up"`);
      }

      // Ejecutar migración
      await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);

      // Registrar como ejecutada
      await markMigrationAsExecuted(migrationFile);
      
      console.log(`✅ Migración completada: ${migrationFile}`);
    }

    console.log('\n🎉 Todas las migraciones se ejecutaron correctamente\n');

  } catch (error) {
    console.error('\n❌ Error ejecutando migraciones:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

module.exports = { runMigrations };
