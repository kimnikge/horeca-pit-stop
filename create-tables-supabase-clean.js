/**
 * Скрипт для создания таблиц в Supabase через веб-интерфейс
 * Этот скрипт выводит только чистый SQL-код для миграции
 */

const fs = require('fs');
const path = require('path');

// Путь к директории с миграциями
const migrationsDir = path.join(__dirname, 'supabase', 'migrations');

// Получаем список файлов миграций и сортируем их по имени
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort();

// Объединяем содержимое всех файлов миграций
let combinedSQL = '';

for (const file of migrationFiles) {
  // Читаем содержимое файла миграции
  const migrationContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  
  // Добавляем разделитель между файлами для наглядности
  combinedSQL += `-- ================ ${file} ================\n`;
  combinedSQL += migrationContent;
  combinedSQL += '\n\n';
}

// Выводим только SQL-код
console.log(combinedSQL); 