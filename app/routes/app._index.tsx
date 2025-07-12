import React, { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  Banner,
  Button,
  Card,
  Spinner,
  Toast,
  Frame,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { CheckIcon } from "@shopify/polaris-icons";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChartBarIcon, 
  CubeIcon, 
  EyeIcon, 
  ShoppingCartIcon,
  SparklesIcon,
  CogIcon,
  PlayIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";
import ghostlyStyles from "../styles/ghostly.css?url";
import { createInventoryService, GhostlyStats } from "../services/inventory.server";

export const links = () => [
  { rel: "stylesheet", href: ghostlyStyles },
];

// Loader to fetch initial stats
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const inventoryService = await createInventoryService(request);
    const allProducts = await inventoryService.getAllProducts();
    const outOfStockProducts = inventoryService.getOutOfStockProducts(allProducts);
    
    const stats: GhostlyStats = {
      totalProducts: allProducts.length,
      outOfStockProducts: outOfStockProducts.length,
      hiddenProducts: allProducts.filter(p => p.status === "DRAFT").length,
      lastRunTime: null,
    };

    return json({
      success: true,
      stats,
      recentProducts: allProducts.slice(0, 10),
      outOfStockProducts: outOfStockProducts.slice(0, 5),
    });
  } catch (error: any) {
    return json({
      success: false,
      error: error.message || "Failed to load data",
      stats: {
        totalProducts: 0,
        outOfStockProducts: 0,
        hiddenProducts: 0,
        lastRunTime: null,
      },
      recentProducts: [],
      outOfStockProducts: [],
    });
  }
};

// Premium Animated Counter Component
const AnimatedCounter = ({ 
  value, 
  duration = 2000, 
  delay = 0,
  prefix = "",
  suffix = "",
  className = ""
}: { 
  value: number; 
  duration?: number; 
  delay?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let startTime: number;
      let animationId: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.floor(easeOut * value));

        if (progress < 1) {
          animationId = requestAnimationFrame(animate);
        }
      };

      animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, duration, delay]);

  return (
    <motion.span 
      className={`ghostly-stat-number ${className}`}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
    >
      {prefix}{displayValue.toLocaleString()}{suffix}
    </motion.span>
  );
};

// Premium Stats Card Component
const StatsCard = ({ 
  title, 
  value, 
  icon: IconComponent, 
  trend, 
  color,
  delay = 0 
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: number; isPositive: boolean };
  color: string;
  delay?: number;
}) => {
  return (
    <motion.div
      className="ghostly-stat-card group"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      whileHover={{ 
        scale: 1.05, 
        y: -8,
        transition: { duration: 0.3 }
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <AnimatedCounter 
            value={value} 
            delay={delay + 500}
            className="ghostly-stat-number"
          />
          <p className="ghostly-stat-label">{title}</p>
          {trend && (
            <motion.div 
              className={`flex items-center gap-1 mt-2 text-sm font-semibold ${
                trend.isPositive ? 'text-green-300' : 'text-red-300'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (delay + 1000) / 1000 }}
            >
              <span>{trend.isPositive ? '↗' : '↘'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </motion.div>
          )}
        </div>
        <motion.div 
          className={`ghostly-stat-icon bg-gradient-to-br ${color}`}
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <IconComponent className="w-6 h-6 text-white" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const actionType = formData.get("action");
    
    if (actionType === "run-ghostly") {
      const inventoryService = await createInventoryService(request);
      const result = await inventoryService.runGhostlyProcess();
      
      return json({
        success: true,
        data: result,
        message: `Successfully processed ${result.stats.totalProducts} products. Hidden ${result.results.success.length} out-of-stock products.`
      });
    }
    
    return json({ success: false, message: "Unknown action" });
  } catch (error: any) {
    console.error("Error in action:", error);
    return json({
      success: false,
      error: error.message || "Action failed",
    }, { status: 500 });
  }
};

export default function Index() {
  const { success, stats, recentProducts, outOfStockProducts } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const app = useAppBridge();
  const [isRunning, setIsRunning] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  const handleRunGhostly = () => {
    setIsRunning(true);
    fetcher.submit(
      { action: "run-ghostly" },
      { method: "post" }
    );
  };

  // Handle fetcher completion
  useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      setIsRunning(false);
      const data = fetcher.data as { success?: boolean; message?: string; error?: string };
      if (data.success) {
        setToastMessage(data.message || "Ghostly process completed successfully!");
        setShowToast(true);
      } else {
        setToastMessage(data.error || "Something went wrong");
        setShowToast(true);
      }
    }
  }, [fetcher.data, fetcher.state]);

  const handleSelectProduct = (productId: string) => {
    app.toast.show(`Selected product: ${productId}`);
  };

  const statsData = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: CubeIcon,
      trend: { value: 12, isPositive: true },
      color: "from-blue-500 to-purple-600",
      delay: 0
    },
    {
      title: "Out of Stock", 
      value: stats.outOfStockProducts,
      icon: EyeSlashIcon,
      trend: { value: 8, isPositive: false },
      color: "from-red-500 to-pink-600",
      delay: 200
    },
    {
      title: "Hidden Products",
      value: stats.hiddenProducts,
      icon: SparklesIcon,
      trend: { value: 15, isPositive: true },
      color: "from-purple-500 to-indigo-600",
      delay: 400
    },
    {
      title: "Active Products",
      value: stats.totalProducts - stats.hiddenProducts,
      icon: EyeIcon,
      trend: { value: 23, isPositive: true },
      color: "from-green-500 to-teal-600", 
      delay: 600
    }
  ];

  return (
    <div className="ghostly-page">
      {/* Floating Particles Background */}
      <div className="floating-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>

      <Page>
        <TitleBar title="Ghostly Dashboard" />
        
        {/* Hero Section */}
        <motion.div 
          className="ghostly-hero text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Ghost Mascot positioned safely above title */}
          <motion.div 
            className="ghost-mascot mb-6 relative z-10"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            👻
          </motion.div>
          
          {/* Title and subtitle with proper spacing */}
          <div className="relative z-20 pt-4">
            <motion.h1 
              className="ghostly-hero-title leading-tight overflow-visible"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Welcome to Ghostly
            </motion.h1>
            <motion.p 
              className="ghostly-hero-subtitle"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Transform your Shopify store with the power of ghost commerce. 
              Boost conversions with our premium, AI-powered product optimization.
            </motion.p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="ghostly-stats-grid">
          {statsData.map((stat, index) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              color={stat.color}
              delay={stat.delay}
            />
          ))}
        </div>

        {/* Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          {outOfStockProducts.length === 0 ? (
            <div className="ghostly-empty-state">
              <motion.div 
                className="ghostly-empty-icon"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <SparklesIcon className="w-8 h-8 text-purple-600" />
              </motion.div>
              <h2 className="ghostly-empty-title">Perfect! No Out-of-Stock Products</h2>
              <p className="ghostly-empty-text">
                All your products are properly stocked and visible to customers. 
                Ghostly is keeping your store optimized! ✨
              </p>
              
              <motion.div 
                className="ghostly-action-bar mt-8"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="ghostly-action-text">
                  Run another check to keep your store ghostly-optimized
                </div>
                <motion.button
                  className="ghostly-button-primary"
                  onClick={handleRunGhostly}
                  disabled={isRunning}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isRunning ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <CogIcon className="w-5 h-5 mr-2" />
                    </motion.div>
                  ) : (
                    <SparklesIcon className="w-5 h-5 mr-2" />
                  )}
                  Run Ghostly Check
                </motion.button>
              </motion.div>
            </div>
          ) : (
            <div className="ghostly-product-section">
              <motion.h2 
                className="ghostly-section-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Out of Stock Products ({outOfStockProducts.length})
              </motion.h2>
              
              <motion.div 
                className="ghostly-action-bar mb-6"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="ghostly-action-text">
                  Hide these products from your storefront to improve customer experience
                </div>
                <motion.button
                  className="ghostly-button-primary"
                  onClick={handleRunGhostly}
                  disabled={isRunning}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isRunning ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <CogIcon className="w-5 h-5 mr-2" />
                    </motion.div>
                  ) : (
                    <EyeSlashIcon className="w-5 h-5 mr-2" />
                  )}
                  Hide Out of Stock Products
                </motion.button>
              </motion.div>
              
              <motion.div 
                className="ghostly-table-container"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <table className="ghostly-table">
                  <thead>
                    <tr className="ghostly-table-header">
                      <th className="ghostly-th">
                        <input type="checkbox" className="table-checkbox" />
                      </th>
                      <th className="ghostly-th">Product</th>
                      <th className="ghostly-th">Status</th>
                      <th className="ghostly-th">Inventory</th>
                      <th className="ghostly-th">Variants</th>
                      <th className="ghostly-th">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {outOfStockProducts.map((product: any, index: number) => (
                        <motion.tr
                          key={product.id}
                          className="ghostly-table-row"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        >
                          <td className="ghostly-td">
                            <input type="checkbox" className="table-checkbox" />
                          </td>
                          <td className="ghostly-td">
                            <div className="status-toggle-container">
                              <div className="status-info">
                                <div className="product-info">
                                  <h3 className="product-name">{product.title}</h3>
                                  <p className="product-handle">/{product.handle}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="ghostly-td">
                            <span className="type-badge type-warning">
                              Out of Stock
                            </span>
                          </td>
                          <td className="ghostly-td">
                            <span className="stock-level">
                              {product.totalInventory !== null 
                                ? `${product.totalInventory} units` 
                                : 'Not tracked'
                              }
                            </span>
                          </td>
                          <td className="ghostly-td">
                            <span className="collection-name">
                              {product.variants?.length || 0} variants
                            </span>
                          </td>
                          <td className="ghostly-td">
                            <button 
                              className="collection-action-btn"
                              onClick={() => handleSelectProduct(product.id)}
                            >
                              <span className="collection-badge">View Product</span>
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Toast Messages */}
        {showToast && (
          <Toast
            content={toastMessage}
            onDismiss={() => setShowToast(false)}
          />
        )}
      </Page>
    </div>
  );
}
