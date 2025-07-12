import { GraphqlQueryError } from "@shopify/shopify-api";
import { authenticate } from "../../config/auth/shopify.server";

export interface Product {
  id: string;
  title: string;
  handle: string;
  status: string;
  totalInventory: number;
  variants: {
    id: string;
    inventoryQuantity: number;
  }[];
}

export interface GhostlyStats {
  totalProducts: number;
  outOfStockProducts: number;
  hiddenProducts: number;
  lastRunTime: string | null;
}

export interface ActionResults {
  success: string[];
  errors: string[];
}

// GraphQL query to fetch products with inventory data
const GET_PRODUCTS_QUERY = `
  query getProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          status
          totalInventory
          variants(first: 100) {
            edges {
              node {
                id
                inventoryQuantity
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// GraphQL mutation to update product status
const UPDATE_PRODUCT_STATUS_MUTATION = `
  mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export class GhostlyInventoryService {
  private graphql: any;
  
  constructor(graphql: any) {
    this.graphql = graphql;
  }

  /**
   * Fetch all products with their inventory data
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      console.log('� Ghostly: Fetching products from Shopify...');
      
      const products: Product[] = [];
      let hasNextPage = true;
      let cursor = null;

      while (hasNextPage) {
        const response: any = await this.graphql(GET_PRODUCTS_QUERY, {
          variables: {
            first: 50,
            after: cursor,
          },
        });

        if (!response?.data?.products) {
          console.error('Invalid GraphQL response structure:', response);
          throw new Error('Invalid response from Shopify GraphQL API');
        }

        const { edges, pageInfo } = response.data.products;

        for (const edge of edges) {
          const node = edge.node;
          products.push({
            id: node.id,
            title: node.title,
            handle: node.handle,
            status: node.status,
            totalInventory: node.totalInventory || 0,
            variants: node.variants.edges.map((v: any) => ({
              id: v.node.id,
              inventoryQuantity: v.node.inventoryQuantity || 0,
            })),
          });
        }

        hasNextPage = pageInfo.hasNextPage;
        cursor = pageInfo.endCursor;
      }

      console.log(`✅ Ghostly: Fetched ${products.length} products successfully`);
      return products;

    } catch (error: any) {
      console.error("❌ Ghostly: Error fetching products:", error);
      
      // Always throw error - no mock data fallback in production
      throw new Error(`Failed to fetch products from Shopify: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Get products that are out of stock
   */
  getOutOfStockProducts(products: Product[]): Product[] {
    return products.filter(product => {
      // Check if total inventory is 0 or if all variants have 0 inventory
      const totalInventory = product.totalInventory;
      const allVariantsEmpty = product.variants.every(
        variant => variant.inventoryQuantity <= 0
      );
      
      return totalInventory <= 0 || allVariantsEmpty;
    });
  }

  /**
   * Hide products by setting their status to DRAFT
   */
  async hideProducts(productIds: string[]): Promise<ActionResults> {
    const results: ActionResults = { success: [], errors: [] };

    if (productIds.length === 0) {
      return results;
    }

    console.log(`👻 Ghostly: Hiding ${productIds.length} products...`);

    for (const productId of productIds) {
      try {
        // In development mode, simulate success
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔄 Dev Mode: Simulating hide for product ${productId}`);
          results.success.push(productId);
          continue;
        }

        const response: any = await this.graphql(UPDATE_PRODUCT_STATUS_MUTATION, {
          variables: {
            input: {
              id: productId,
              status: "DRAFT",
            },
          },
        });

        if (response?.data?.productUpdate?.userErrors?.length > 0) {
          const errorMessage = response.data.productUpdate.userErrors
            .map((error: any) => error.message)
            .join(", ");
          results.errors.push(`${productId}: ${errorMessage}`);
        } else if (response?.data?.productUpdate?.product) {
          results.success.push(productId);
          console.log(`✅ Hidden product: ${productId}`);
        } else {
          results.errors.push(`${productId}: Invalid response structure`);
        }
      } catch (error: any) {
        console.error(`❌ Error hiding product ${productId}:`, error);
        results.errors.push(`${productId}: ${error?.message || 'Unknown error'}`);
      }
    }

    console.log(`✅ Ghostly: Hidden ${results.success.length}/${productIds.length} products`);
    return results;
  }

  /**
   * Show products by setting their status to ACTIVE
   */
  async showProducts(productIds: string[]): Promise<ActionResults> {
    const results: ActionResults = { success: [], errors: [] };

    if (productIds.length === 0) {
      return results;
    }

    console.log(`👻 Ghostly: Showing ${productIds.length} products...`);

    for (const productId of productIds) {
      try {
        // In development mode, simulate success
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔄 Dev Mode: Simulating show for product ${productId}`);
          results.success.push(productId);
          continue;
        }

        const response: any = await this.graphql(UPDATE_PRODUCT_STATUS_MUTATION, {
          variables: {
            input: {
              id: productId,
              status: "ACTIVE",
            },
          },
        });

        if (response?.data?.productUpdate?.userErrors?.length > 0) {
          const errorMessage = response.data.productUpdate.userErrors
            .map((error: any) => error.message)
            .join(", ");
          results.errors.push(`${productId}: ${errorMessage}`);
        } else if (response?.data?.productUpdate?.product) {
          results.success.push(productId);
          console.log(`✅ Showed product: ${productId}`);
        } else {
          results.errors.push(`${productId}: Invalid response structure`);
        }
      } catch (error: any) {
        console.error(`❌ Error showing product ${productId}:`, error);
        results.errors.push(`${productId}: ${error?.message || 'Unknown error'}`);
      }
    }

    console.log(`✅ Ghostly: Showed ${results.success.length}/${productIds.length} products`);
    return results;
  }

  /**
   * Run the complete ghostly process: hide out-of-stock products
   */
  async runGhostlyProcess(): Promise<{
    stats: GhostlyStats;
    hiddenProducts: Product[];
    results: ActionResults;
  }> {
    // Fetch all products
    const allProducts = await this.getAllProducts();
    
    // Find out-of-stock products
    const outOfStockProducts = this.getOutOfStockProducts(allProducts);
    
    // Filter out products that are already hidden (DRAFT status)
    const productsToHide = outOfStockProducts.filter(
      product => product.status === "ACTIVE"
    );
    
    // Hide the products
    const results = await this.hideProducts(
      productsToHide.map(p => p.id)
    );

    // Calculate stats
    const stats: GhostlyStats = {
      totalProducts: allProducts.length,
      outOfStockProducts: outOfStockProducts.length,
      hiddenProducts: results.success.length,
      lastRunTime: new Date().toISOString(),
    };

    return {
      stats,
      hiddenProducts: productsToHide,
      results,
    };
  }

  /**
   * Get mock products for development/testing
   */
  private getMockProducts(): Product[] {
    return [
      {
        id: "gid://shopify/Product/1",
        title: "Ghost T-Shirt",
        handle: "ghost-t-shirt",
        status: "ACTIVE",
        totalInventory: 0,
        variants: [
          {
            id: "gid://shopify/ProductVariant/1",
            inventoryQuantity: 0
          }
        ]
      },
      {
        id: "gid://shopify/Product/2", 
        title: "Spooky Mug",
        handle: "spooky-mug",
        status: "ACTIVE",
        totalInventory: 5,
        variants: [
          {
            id: "gid://shopify/ProductVariant/2",
            inventoryQuantity: 5
          }
        ]
      },
      {
        id: "gid://shopify/Product/3",
        title: "Haunted Hoodie",
        handle: "haunted-hoodie", 
        status: "ACTIVE",
        totalInventory: 0,
        variants: [
          {
            id: "gid://shopify/ProductVariant/3",
            inventoryQuantity: 0
          }
        ]
      },
      {
        id: "gid://shopify/Product/4",
        title: "Phantom Phone Case",
        handle: "phantom-phone-case",
        status: "DRAFT",
        totalInventory: 0,
        variants: [
          {
            id: "gid://shopify/ProductVariant/4", 
            inventoryQuantity: 0
          }
        ]
      }
    ];
  }
}

/**
 * Helper function to create inventory service from request
 */
export async function createInventoryService(request: Request) {
  const { admin } = await authenticate.admin(request);
  return new GhostlyInventoryService(admin.graphql);
}
