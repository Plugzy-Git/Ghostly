import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { login } from "../config/auth/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function Index() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div style={{ 
      fontFamily: "system-ui, sans-serif", 
      lineHeight: "1.4",
      padding: "2rem",
      maxWidth: "600px",
      margin: "0 auto",
      textAlign: "center"
    }}>
      <div>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#333" }}>
          👻 Ghostly by Plugzy
        </h1>
        <p style={{ fontSize: "1.1rem", marginBottom: "2rem", color: "#666" }}>
          Automatically hide out-of-stock products to keep your store clean and professional.
        </p>
        {showForm && (
          <Form 
            method="post" 
            action="/auth/login"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              maxWidth: "300px",
              margin: "0 auto"
            }}
          >
            <label style={{ textAlign: "left" }}>
              <span style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                Shop domain
              </span>
              <input 
                type="text" 
                name="shop"
                placeholder="my-shop-domain.myshopify.com"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "0.5rem",
                  fontSize: "1rem"
                }}
              />
            </label>
            <button 
              type="submit"
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Install Ghostly
            </button>
          </Form>
        )}
        <div style={{ marginTop: "3rem", textAlign: "left" }}>
          <h3 style={{ marginBottom: "1rem", color: "#333" }}>✨ Key Features:</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ marginBottom: "0.5rem", color: "#666" }}>
              <strong>🔍 Automatic Detection:</strong> Finds all out-of-stock products
            </li>
            <li style={{ marginBottom: "0.5rem", color: "#666" }}>
              <strong>👻 Smart Hiding:</strong> Sets products to DRAFT status
            </li>
            <li style={{ marginBottom: "0.5rem", color: "#666" }}>
              <strong>📊 Dashboard:</strong> View statistics and manage products
            </li>
            <li style={{ marginBottom: "0.5rem", color: "#666" }}>
              <strong>⚡ One-Click Operation:</strong> "Run Ghostly" button
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
