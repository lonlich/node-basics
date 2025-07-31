// db/prismaClient.js
import { PrismaClient } from '../generated/prisma/index.js';
import { faker } from '@faker-js/faker';
export const prisma = new PrismaClient();

async function generateFakeComments(amount = 10000) {
    console.log(`Генерируем и вставляем ${amount} комментариев...`);

    // Предполагается, что у тебя уже есть пользователи (user) в БД
    const users = await prisma.user.findMany({
        select: { id: true },
        take: 10, // например, берем 10 пользователей
    });

    if (users.length === 0) {
        console.error('Нет пользователей в базе. Сначала создай пользователей.');
        return;
    }

    // Генерируем пачками для ускорения вставки (batch insert)
    const batchSize = 1000;
    for (let i = 0; i < amount; i += batchSize) {
        const batch = [];

        for (let j = 0; j < batchSize && i + j < amount; j++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];

            batch.push({
                content: faker.lorem.sentences(2),
                authorId: randomUser.id,
                createdAt: faker.date.past(1), // в прошлом году
            });
        }

        await prisma.comment.createMany({
            data: batch,
            skipDuplicates: true, // если есть уникальные ограничения
        });

        console.log(`Вставлено ${i + batch.length} из ${amount}`);
    }

    console.log('Генерация и вставка комментариев завершены.');
}

generateFakeComments()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
