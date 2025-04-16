/**
 * Скрипт для создания таблиц в Supabase через веб-интерфейс
 * Этот скрипт просто выводит SQL-код, который нужно выполнить в интерфейсе Supabase
 */

const fs = require('fs');
const path = require('path');

// Путь к директории с миграциями
const migrationsDir = path.join(__dirname, 'supabase', 'migrations');

// Получаем список файлов миграций и сортируем их по имени
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort();

console.log(`Найдено ${migrationFiles.length} файлов миграций.`);
console.log('\n=== SQL-код для выполнения в веб-интерфейсе Supabase ===\n');

// Объединяем содержимое всех файлов миграций
let combinedSQL = '';

for (const file of migrationFiles) {
  console.log(`-- Файл: ${file}`);
  
  // Читаем содержимое файла миграции
  const migrationContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  
  // Добавляем разделитель между файлами для наглядности
  combinedSQL += `\n-- ================ ${file} ================\n`;
  combinedSQL += migrationContent;
  combinedSQL += '\n\n';
}

// Выводим инструкцию по использованию
console.log(combinedSQL);

console.log('\n=== Инструкция по выполнению SQL в Supabase ===');
console.log('1. Войдите в проект Supabase: https://app.supabase.com/project/rqxwhzumrcvtfyittrrr');
console.log('2. Перейдите в раздел "SQL Editor"');
console.log('3. Создайте новый запрос ("New query")');
console.log('4. Вставьте весь SQL-код, скопированный выше');
console.log('5. Нажмите "Run" для выполнения запроса');
console.log('6. Проверьте, что все таблицы созданы в разделе "Table editor"'); 