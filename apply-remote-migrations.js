/**
 * Скрипт для применения миграций к удаленной базе данных Supabase
 * Запуск: node apply-remote-migrations.js
 * 
 * Перед запуском установите необходимые пакеты:
 * npm install dotenv pg fs-extra
 */

const { Pool } = require('pg');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config({ path: '.env.production' });

// Парсинг URL подключения к базе данных Supabase
async function getConnectionConfig() {
  // Предполагаем, что у вас есть переменная DATABASE_URL или вы настроите соединение вручную
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    // Парсим DATABASE_URL
    const match = databaseUrl.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (match) {
      return {
        user: match[1],
        password: match[2],
        host: match[3],
        port: parseInt(match[4]),
        database: match[5],
        ssl: { rejectUnauthorized: false }
      };
    }
  }
  
  // Если DATABASE_URL не найден или не в правильном формате, используем ручную конфигурацию
  console.log('DATABASE_URL не найден или имеет неверный формат. Используем ручную конфигурацию.');
  return {
    user: 'postgres',
    password: 'ваш_пароль', // Замените на ваш пароль
    host: 'db.rqxwhzumrcvtfyittrrr.supabase.co',
    port: 5432,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  };
}

// Применение миграций
async function applyMigrations() {
  try {
    // Получаем конфигурацию подключения
    const config = await getConnectionConfig();
    const pool = new Pool(config);
    
    // Тестируем соединение
    try {
      await pool.query('SELECT NOW()');
      console.log('Подключение к базе данных установлено успешно.');
    } catch (connError) {
      console.error('Ошибка подключения к базе данных:', connError);
      process.exit(1);
    }

    // Путь к директории с миграциями
    const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
    
    // Получаем список файлов миграций и сортируем их по имени
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Найдено ${migrationFiles.length} файлов миграций.`);

    // Применяем каждую миграцию по очереди
    for (const file of migrationFiles) {
      console.log(`Применяю миграцию: ${file}`);
      
      // Читаем содержимое файла миграции
      const migrationContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Запускаем транзакцию
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(migrationContent);
        await client.query('COMMIT');
        console.log(`Миграция ${file} успешно применена.`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Ошибка при применении миграции ${file}:`, error);
        process.exit(1);
      } finally {
        client.release();
      }
    }

    console.log('Все миграции успешно применены!');
    pool.end();
  } catch (error) {
    console.error('Произошла ошибка:', error);
    process.exit(1);
  }
}

applyMigrations(); 