import { prisma } from '../db/prismaClient.js';
import { logJSONStringify } from '../js/utils.js';

export const prismaQueriesTest = async () => {
    // log('Я ЗДЕСЬ')

    // const users = await prisma.comment.findMany({
    //     // include: { comments: true },
    //     distinct: ['authorId']
    // });
    // console.log("🚀 ~ users:", users);

    // logJSONStringify("usersPrisma", usersPrisma);

    const uniqueUser = await prisma.user.findUnique({
        where: { id: 2 },
        include: { comments: true },
    });

    const firstComment = await prisma.comment.findFirstOrThrow({
        where: { authorId: 2 },
    });

    const item = await prisma.user.upsert({
        where: { id: 4 },
        update: {
            username: 'Misha'
        },
        create: {
            username: 'Mish_created',
            password: '123'
        }
    });
    // console.log("🚀 ~ item:", item);

    // logJSONStringify('firstComment', firstComment);

    // const createdUser = await prisma.user.create({
    //     data: {
    //         username: 'MMM',
    //         password: '#r42423432432432432',
    //         isMember: true
    //     },
    // });

    // logJSONStringify('createdUser', createdUser);

    const usersTake = await prisma.user.findMany({
        skip: 5,
        take: 10,
        select: {
            id: true,
            username: true,
        },
    });

    // logJSONStringify("usersTake", usersTake);

    // const result = await prisma.user.createMany({
    //     data: [
    //         { username: 'Grish' },
    //         { username: 'Grish' }
    //     ],
    //     skipDuplicates: true
    // });
    // console.log("🚀 ~ result:", result);

    // const updatedItem = await prisma.user.update({
    //     where: { id: 66 },
    //     data: {
    //         username: 'Grishko',
    //         // другие поля
    //     }
    // });

    // const updatedItems = await prisma.user.updateMany({
    //     where: { isMember: false },
    //     data: {
    //         isMember: true,
    //         // другие поля
    //     }
    // });

    // const deletedItems = await prisma.user.deleteMany({
    //     where: { isMember: false }
    // });

    // const count = await prisma.user.count({
    //     where: { isAdmin: false }
    // });
    // console.log("🚀 ~ count:", count);

    // const result = await prisma.game.aggregate({
    //     _sum: { price: true },
    //     _avg: { price: true },
    //     _max: { price: true },
    //     _min: { price: true },
    //     where: { name: { in: ['Warcraft'] } }
    // });
    // console.log("🚀 ~ result:", result);
};
