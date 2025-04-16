export default function AboutPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">О нас</h1>
          
          <div className="prose prose-lg">
            <p>
              Horeca Pit Stop - это специализированная платформа для поиска работы в сфере HoReCa 
              (гостиницы, рестораны, кафе). Мы создали этот сервис, чтобы помочь 
              профессионалам индустрии найти работу своей мечты, а работодателям - 
              подобрать квалифицированный персонал.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Наша миссия</h2>
            <p>
              Мы стремимся сделать процесс поиска работы в сфере HoReCa максимально 
              простым и эффективным. Наша платформа объединяет профессионалов 
              индустрии и работодателей, создавая возможности для взаимовыгодного 
              сотрудничества.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Что мы предлагаем</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Удобный поиск вакансий с расширенными фильтрами</li>
              <li>Создание профессиональных профилей</li>
              <li>Систему откликов на вакансии</li>
              <li>Уведомления о новых вакансиях</li>
              <li>Размещение вакансий для работодателей</li>
              <li>Поиск кандидатов по заданным критериям</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Наши преимущества</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Специализация на сфере HoReCa</li>
              <li>Простой и понятный интерфейс</li>
              <li>Быстрая регистрация и начало работы</li>
              <li>Безопасность данных пользователей</li>
              <li>Поддержка клиентов</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 