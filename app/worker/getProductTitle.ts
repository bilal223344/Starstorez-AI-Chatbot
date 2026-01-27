import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getProductTitle() {
    const products = await prisma.product.findMany({
        select: {
            title: true,
            description: true,
            tags: true,
            collection: true,
            options: true,
            price: true,
            variants: {
                select: {
                    title: true
                }
            }
        }
    });

    console.dir(products, { depth: null });

}

getProductTitle();