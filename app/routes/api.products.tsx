import { LoaderFunctionArgs } from "react-router";
import prisma from "app/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const ids = url.searchParams.get("ids")?.split(",") || [];

    if (ids.length === 0) {
        return Response.json([]);
    }

    try {
        const products = await prisma.product.findMany({
            where: { prodId: { in: ids } },
            select: {
                prodId: true,
                title: true,
                price: true,
                image: true,
                stock: true
            }
        });

        return Response.json(products);
    } catch (error) {
        console.error("Product Fetch Error:", error);
        return Response.json({ error: "Failed to fetch products" }, { status: 500 });
    }
};
