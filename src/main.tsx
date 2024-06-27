import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

// Import the generated route tree
import { Toaster } from "@/components/ui/sonner";
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;

const queryClient = new QueryClient();
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster
          position="bottom-right"
          style={{ bottom: "80px" }}
          closeButton
          duration={100000000} // do not auto-hide
          gap={8}
          toastOptions={{
            classNames: {
              closeButton:
                "absolute right-0 top-0 bg-background border rounded-full left-auto -mx-4 shadow-sm",
            },
          }}
        />
      </QueryClientProvider>
    </StrictMode>,
  );
}
