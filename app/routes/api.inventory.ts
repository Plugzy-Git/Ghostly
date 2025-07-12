import { ActionFunctionArgs, json } from "@remix-run/node";
import { createInventoryService, Product } from "../backend/services/inventory.server";

export async function action({ request }: ActionFunctionArgs) {
  const method = request.method;

  switch (method) {
    case "POST":
      return await handleRunGhostly(request);
    default:
      return json({ error: "Method not allowed" }, { status: 405 });
  }
}

async function handleRunGhostly(request: Request) {
  try {
    const inventoryService = await createInventoryService(request);
    const result = await inventoryService.runGhostlyProcess();
    
    return json({
      success: true,
      data: result,
      message: `Successfully processed ${result.stats.totalProducts} products. Hidden ${result.results.success.length} out-of-stock products.`
    });
  } catch (error: any) {
    console.error("Error running Ghostly process:", error);
    
    return json({
      success: false,
      error: error.message || "Failed to run Ghostly process",
    }, { status: 500 });
  }
}

export async function loader({ request }: ActionFunctionArgs) {
  try {
    const inventoryService = await createInventoryService(request);
    const allProducts = await inventoryService.getAllProducts();
    const outOfStockProducts = inventoryService.getOutOfStockProducts(allProducts);
    
    const stats = {
      totalProducts: allProducts.length,
      outOfStockProducts: outOfStockProducts.length,
      hiddenProducts: allProducts.filter((p: Product) => p.status === "DRAFT").length,
      lastRunTime: null, // We'll add this later with database
    };

    return json({
      success: true,
      stats,
      products: allProducts.slice(0, 10), // Return first 10 for preview
      outOfStockProducts: outOfStockProducts.slice(0, 10),
    });
  } catch (error: any) {
    console.error("Error fetching inventory data:", error);
    
    return json({
      success: false,
      error: error.message || "Failed to fetch inventory data",
    }, { status: 500 });
  }
}
