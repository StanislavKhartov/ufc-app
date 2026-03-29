# Лабораторная работа: Модуль справочной информации бизнес-приложения

**Выполнил:** Хартов Станислав Валерьевич  
**Студент:** 3 курс, 2 группа  

---

## Шаг 1: Описание справочников

В рамках работы разработаны два взаимосвязанных справочника для информационной системы UFC.

### 1. Справочник «Бойцы» (Fighters)
Содержит подробные сведения о спортсменах.
*   **Full Name** (text): Имя и фамилия.
*   **Height_cm** (numeric): Рост в сантиметрах (тип с фиксированной запятой).
*   **Weight_kg** (numeric): Вес в килограммах (тип с фиксированной запятой).
*   **Bio** (text): Многострочное поле для биографии.
*   **is_deleted** (bool): Техническое поле для «мягкого удаления».
*   **last_modified_id** (uuid): Ссылка на ID предыдущей версии записи (логика версионирования).

### 2. Справочник «Матчи» (Matches)
Хранит историю и расписание поединков.
*   **Tournament_name** (text): Название события.
*   **Event_date** (date): Дата проведения боя.
*   **Fighter_1_id / Fighter_2_id** (uuid): Внешние ключи (Foreign Keys) к справочнику бойцов.
*   **Status** (text): Текущий статус (Scheduled / Completed).
*   **Notes** (text): Многострочные заметки к матчу.

**Связь:** Поля `fighter_1_id` и `fighter_2_id` в таблице матчей ссылаются на `id` в таблице бойцов. Хранение организовано через UUID (хэш-идентификаторы), что исключает ошибки при совпадении имен.

---

## Шаг 2: Схема базы данных

**СУБД:** Supabase (PostgreSQL).  
В базе данных реализованы внешние ключи для обеспечения целостности данных и индексы для быстрого поиска.

### Визуальная схема (ER-диаграмма)
<img width="959" height="633" alt="image" src="https://github.com/user-attachments/assets/ce831b0c-64f1-4d67-9a02-1f0a5a469433" />

### SQL Структура
```sql
-- Таблица Fighters
CREATE TABLE fighters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    height_cm NUMERIC(10, 1),
    weight_kg NUMERIC(10, 2),
    bio TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    last_modified_id UUID
);

-- Таблица Matches
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_name TEXT,
    event_date DATE,
    fighter_1_id UUID REFERENCES fighters(id),
    fighter_2_id UUID REFERENCES fighters(id),
    status TEXT,
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    last_modified_id UUID
);
```
## Шаг 3: Техническая реализация приложения

Приложение разработано как **Web-ориентированный толстый клиент** (Fat Client). Вся основная логика обработки данных, фильтрации, сортировки и валидации сосредоточена в коде браузерного приложения (Angular), в то время как база данных (Supabase/PostgreSQL) используется как надежное хранилище с доступом через API.

### 🛠 Технологический стек
*   **Frontend**: Angular 19 (Standalone Components, Signals).
*   **Стиль**: SCSS с использованием CSS-переменных и Flexbox/Grid.
*   **База данных**: Supabase (PostgreSQL) с поддержкой UUID и Numeric типов.
*   **Язык**: TypeScript.

### 📂 Файловая структура модуля
*   `app.ts` — Главный контроллер: управление состоянием вкладок, сортировка и модальные окна.
*   `app.html` — Разметка интерфейса.
*   `data.service.ts` — Слой связи с Supabase API (CRUD операции).
*   `security/security.ts` — Логика валидации и санитайзинга.
*   `models/` — Интерфейсы данных `Fighter` и `Match`.

## 🚀 Инструкция по запуску проекта

Для запуска приложения вам понадобятся установленные **Node.js** (версия 18+) и **Angular CLI**.

### 1. Подготовка окружения
Если у вас еще не установлен Angular CLI, установите его глобально через терминал:
```bash
npm install -g @angular/cli
```
### 2. Клонирование и установка зависимостей
Склонируйте репозиторий и перейдите в папку проекта:

```bash
git clone <ссылка_на_репозиторий>
cd ufc-app
```
### 3. Настройка базы данных (Supabase)
Приложение является "толстым клиентом" и работает напрямую с облачной базой данных. Чтобы оно заработало у вас, необходимо:
* Создать проект на supabase.com.
* Перейти в раздел SQL Editor и выполнить SQL-скрипт, указанный в разделе "Шаг 2" этого README (он создаст таблицы и наполнит их данными).
* В настройках проекта Supabase (Settings -> API) скопируйте Project URL и anon public key.
### 4. Конфигурация приложения
Откройте файл src/app/services/data.service.ts и вставьте ваши ключи в конструктор:

```TypeScript
this.supabase = createClient(
  'ВАШ_PROJECT_URL', 
  'ВАШ_ANON_KEY'
);
```
### 5. Запуск
Запустите локальный сервер разработки:

```Bash
ng serve -o
```
После компиляции приложение автоматически откроется в браузере по адресу http://localhost:4200/.
