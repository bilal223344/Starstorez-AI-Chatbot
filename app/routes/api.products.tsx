import { data, type LoaderFunctionArgs } from "react-router";
import prisma from "../db.server";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const url = new URL(request.url);
  const idsParam = url.searchParams.get("ids");

  if (!idsParam) {
    return data({ products: [] }, { headers: corsHeaders() });
  }

  const ids = idsParam.split(",").filter(Boolean);

  if (ids.length === 0) {
    return data({ products: [] }, { headers: corsHeaders() });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        prodId: {
          in: ids,
        },
      },
      select: {
        prodId: true,
        title: true,
        price: true,
        image: true,
        handle: true,
        description: true,
        stock: true, // Added stock to selection as it is used in frontend
      },
    });

    return data({ products }, { headers: corsHeaders() });
  } catch (error) {
    console.error("Error fetching products:", error);
    return data({ products: [], error: "Failed to fetch products" }, { status: 500, headers: corsHeaders() });
  }
};
