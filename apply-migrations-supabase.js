/**
 * Скрипт для применения миграций к удаленной базе данных Supabase
 * Запуск: node apply-migrations-supabase.js
 * 
 * Перед запуском установите необходимые пакеты:
 * npm install dotenv @supabase/supabase-js fs-extra
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config({ path: '.env.production' });

// Создаем клиент Supabase с правами администратора
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Ошибка: не указаны NEXT_PUBLIC_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY в файле .env.production');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Применение миграций с использованием API-запросов
async function createTables() {
  console.log('Создаю таблицы через Supabase API...');
  
  try {
    // Проверяем существующие таблицы
    const { data: existingTables, error: tablesError } = await supabase
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (tablesError) {
      console.log('Не удалось получить список существующих таблиц, создаем все таблицы...');
    } else {
      console.log('Существующие таблицы:', existingTables);
    }
    
    // 1. Создаем таблицу profiles
    try {
      console.log('Создаю таблицу profiles...');
      
      const { error } = await supabase.rpc('create_profiles_table');
      
      if (error) {
        console.log('Создаю таблицу profiles через API...');
        await createTableViaApi('profiles', {
          id: 'id',
          name: 'name',
          email: 'example@mail.com', 
          role: 'job_seeker',
          created_at: new Date().toISOString()
        });
      } else {
        console.log('Таблица profiles успешно создана через RPC.');
      }
    } catch (e) {
      console.log('Ошибка при создании таблицы profiles:', e.message);
    }
    
    // 2. Создаем таблицу jobs
    try {
      console.log('Создаю таблицу jobs...');
      
      const { error } = await supabase.rpc('create_jobs_table');
      
      if (error) {
        console.log('Создаю таблицу jobs через API...');
        await createTableViaApi('jobs', {
          title: 'Test Job',
          company: 'Test Company',
          location: 'Test Location',
          description: 'Test Description',
          type: 'full_time',
          created_at: new Date().toISOString()
        });
      } else {
        console.log('Таблица jobs успешно создана через RPC.');
      }
    } catch (e) {
      console.log('Ошибка при создании таблицы jobs:', e.message);
    }
    
    // 3. Создаем таблицу applications
    try {
      console.log('Создаю таблицу applications...');
      
      const { error } = await supabase.rpc('create_applications_table');
      
      if (error) {
        console.log('Создаю таблицу applications через API...');
        await createTableViaApi('applications', {
          status: 'pending',
          created_at: new Date().toISOString()
        });
      } else {
        console.log('Таблица applications успешно создана через RPC.');
      }
    } catch (e) {
      console.log('Ошибка при создании таблицы applications:', e.message);
    }
    
    // 4. Создаем таблицу notifications
    try {
      console.log('Создаю таблицу notifications...');
      
      const { error } = await supabase.rpc('create_notifications_table');
      
      if (error) {
        console.log('Создаю таблицу notifications через API...');
        await createTableViaApi('notifications', {
          message: 'Test notification',
          type: 'info',
          created_at: new Date().toISOString()
        });
      } else {
        console.log('Таблица notifications успешно создана через RPC.');
      }
    } catch (e) {
      console.log('Ошибка при создании таблицы notifications:', e.message);
    }
    
    // 5. Создаем таблицу messages
    try {
      console.log('Создаю таблицу messages...');
      
      const { error } = await supabase.rpc('create_messages_table');
      
      if (error) {
        console.log('Создаю таблицу messages через API...');
        await createTableViaApi('messages', {
          content: 'Test message',
          created_at: new Date().toISOString()
        });
      } else {
        console.log('Таблица messages успешно создана через RPC.');
      }
    } catch (e) {
      console.log('Ошибка при создании таблицы messages:', e.message);
    }
    
    console.log('Процесс создания таблиц завершен!');
    
  } catch (error) {
    console.error('Произошла ошибка при создании таблиц:', error);
  }
}

// Функция для создания таблицы через API путем вставки записи
async function createTableViaApi(tableName, sampleData) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert([sampleData])
      .select();
    
    if (error) {
      if (error.code === '42P01') {
        console.log(`Таблица ${tableName} не существует. Нужно создать ее через SQL.`);
        return false;
      } else {
        console.log(`Ошибка при вставке в таблицу ${tableName}:`, error.message);
        return false;
      }
    }
    
    console.log(`Данные успешно вставлены в таблицу ${tableName}:`, data);
    return true;
  } catch (error) {
    console.log(`Ошибка при работе с таблицей ${tableName}:`, error.message);
    return false;
  }
}

// Проверяем что таблицы созданы
async function checkTables() {
  const tables = ['profiles', 'jobs', 'applications', 'notifications', 'messages'];
  
  for (const table of tables) {
    try {
      console.log(`Проверяю таблицу ${table}...`);
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        console.log(`Таблица ${table} не найдена или ошибка доступа:`, error.message);
      } else {
        console.log(`Таблица ${table} существует, записей: ${data.length}`);
      }
    } catch (error) {
      console.log(`Ошибка при проверке таблицы ${table}:`, error.message);
    }
  }
}

// Запускаем процесс
async function main() {
  try {
    console.log('Подключаюсь к Supabase...');
    await createTables();
    console.log('Проверяю созданные таблицы...');
    await checkTables();
  } catch (error) {
    console.error('Произошла ошибка:', error);
  }
}

main(); 