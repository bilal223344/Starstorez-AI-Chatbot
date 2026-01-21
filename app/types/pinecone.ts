export interface PineconeProductInput {
  id: string;          // Shopify GID
  title: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  price: number;
  handle: string;
  url: string;
  image: string;
  collections: string[];
  inventoryQuantity: number;
  metafields?: Record<string, any>;
  variantsJson?: string;
}