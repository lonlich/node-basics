# Prisma Cheat Sheet 🧠

## 🏗️ Основные методы Prisma Client

### 🔍 Получение данных

#### `findMany`
Получить все записи, с фильтрацией и связями:
```ts
const users = await prisma.user.findMany({
  where: { isMember: true },
  include: { comments: true },
  orderBy: { id: 'desc' },
  take: 10,
});



#### `findUnique`
Получить одну запись по уникальному полю (@id, @unique):

const user = await prisma.user.findUnique({
  where: { id: 1 },
});

#### `findFirst`
Получить первую подходящую запись:

const firstUser = await prisma.user.findFirst({
  where: { isMember: true },
});

### 🔍 Создание

#### 'create'
Создать одну запись:

await prisma.user.create({
  data: {
    username: 'admin',
    password: 'hashed',
  },
});

### `createMany`
Создать сразу несколько:

await prisma.user.createMany({
  data: [
    { username: 'one', password: 'p1' },
    { username: 'two', password: 'p2' },
  ],
});


### 🛠 Обновление

#### 'update'
Обновить запись по уникальному полю:

await prisma.user.update({
  where: { id: 1 },
  data: { isMember: true },
});

#### 'updateMany'
Обновить несколько записей:

await prisma.user.updateMany({
  where: { isMember: false },
  data: { isMember: true },
});

### ❌ 'Удаление'

#### 'delete'
Удалить одну запись:

await prisma.user.delete({
  where: { id: 1 },
});

#### 'deleteMany'
Удалить несколько:

await prisma.user.deleteMany({
  where: { isMember: false },
});

### 🔢 Подсчёт

#### 'count'
Подсчитать количество:

const count = await prisma.user.count({
  where: { isMember: true },
});

### 🔧 Полезные параметры

where: фильтрация

include: загрузка связанных таблиц

select: выбор только нужных полей

orderBy: сортировка

take: ограничение количества

skip: пропуск (например для пагинации)

distinct: уникальные значения


### 📚 Пример сложного запроса

const data = await prisma.user.findMany({
  where: {
    isMember: true,
    username: { startsWith: 'a' },
  },
  include: {
    comments: {
      where: { createdAt: { gte: new Date('2024-01-01') } },
    },
  },
  orderBy: { id: 'desc' },
  take: 5,
});

###🧱 Связи в Prisma

prisma

model User {
  id       Int       @id @default(autoincrement())
  username String
  comments Comment[]
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
}
🔗 Команды CLI
bash


npx prisma init            # Инициализация
npx prisma migrate dev     # Создание миграции
npx prisma db push         # Применение schema без миграции
npx prisma studio          # GUI интерфейс
npx prisma generate        # Генерация клиента

💡 Совет:
Используй include для загрузки связей, а select — для ограничения полей в ответе.