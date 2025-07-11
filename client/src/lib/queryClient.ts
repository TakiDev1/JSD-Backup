import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  throwOnError: boolean = true,
): Promise<Response> {
  console.log(`API Request: ${method} ${url}`, data ? data : "no data");
  
  try {
    // Always include Content-Type for consistency, and always include credentials
    const headers = {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest" // Help identify AJAX requests server-side
    };
    
    // Log session cookie to help debug auth issues
    const cookies = document.cookie;
    if (cookies) {
      console.log(`API Request has cookies: ${cookies.includes('connect.sid')}`);
    }
    
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include", // Always include credentials
      cache: "no-cache", // Don't use cache for POST/PUT/DELETE
      mode: "same-origin", // Restrict to same origin for security
    });
    
    console.log(`API Response: ${method} ${url} - Status: ${res.status}`, {
      hasSetCookie: res.headers.has('set-cookie'),
      contentType: res.headers.get('content-type')
    });
    
    // More detailed error logging with as much info as possible
    if (!res.ok) {
      try {
        const errorData = await res.clone().json();
        console.error(`API Error (${res.status}):`, errorData);
      } catch (jsonError) {
        try {
          const errorText = await res.clone().text();
          console.error(`API Error (${res.status}): ${errorText}`);
        } catch (e) {
          console.error(`API Error (${res.status}): Could not parse error response`);
        }
      }
    }

    if (throwOnError) {
      await throwIfResNotOk(res);
    }
    return res;
  } catch (error) {
    console.error(`API Request Failed: ${method} ${url}`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
