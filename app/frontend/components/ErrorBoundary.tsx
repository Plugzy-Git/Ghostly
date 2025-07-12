import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { Page, Card, Banner, Button } from "@shopify/polaris";

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <Page title="Ghostly - Error">
        <Card>
          <Banner title="Application Error" tone="critical">
            <p>
              <strong>Status:</strong> {error.status} {error.statusText}
            </p>
            <p>
              <strong>Message:</strong> {error.data?.message || "Something went wrong"}
            </p>
            {process.env.NODE_ENV === "development" && (
              <details style={{ marginTop: "1rem" }}>
                <summary>Error Details (Development Only)</summary>
                <pre style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
                  {error.data?.stack || JSON.stringify(error.data, null, 2)}
                </pre>
              </details>
            )}
            <div style={{ marginTop: "1rem" }}>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </Banner>
        </Card>
      </Page>
    );
  }

  // Handle other types of errors
  const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
  
  return (
    <Page title="Ghostly - Error">
      <Card>
        <Banner title="Unexpected Error" tone="critical">
          <p>Ghostly encountered an unexpected error. Please try refreshing the page.</p>
          <p><strong>Error:</strong> {errorMessage}</p>
          {process.env.NODE_ENV === "development" && error instanceof Error && (
            <details style={{ marginTop: "1rem" }}>
              <summary>Stack Trace (Development Only)</summary>
              <pre style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
                {error.stack}
              </pre>
            </details>
          )}
          <div style={{ marginTop: "1rem" }}>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </Banner>
      </Card>
    </Page>
  );
}
