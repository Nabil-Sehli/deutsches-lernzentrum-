import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, TRPCClientError, loggerLink, retryLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../api/router";
import type { ReactNode } from "react";
import { toast } from "sonner";

export const trpc = createTRPCReact<AppRouter>();

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
        onError: (error: unknown) => {
          if (error instanceof TRPCClientError) {
            toast.error(error.message);
          } else if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error("An unexpected error occurred");
          }
        },
      },
    },
  });
}

export const queryClient = createQueryClient();

const trpcClient = trpc.createClient({
  links: [
    loggerLink({
      enabled: () => import.meta.env.DEV,
    }),
    retryLink({
      retry: (opts) => {
        if (opts.error instanceof TRPCClientError) {
          return opts.error.data?.code === "INTERNAL_SERVER_ERROR" && opts.attempts < 3;
        }
        return opts.attempts < 3;
      },
    }),
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

export function TRPCProvider({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
