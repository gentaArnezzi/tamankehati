"use client";

type HttpClientOptions = {
  /**
   * Provide bearer token before each request.
   */
  getAuthToken?: () => string | null;
  /**
   * Provide additional headers (e.g. region scope) before each request.
   */
  getExtraHeaders?: () => Record<string, string | undefined>;
};

export class HttpClient {
  private readonly baseUrl: string;
  private readonly options: HttpClientOptions;

  constructor(baseUrl: string, options: HttpClientOptions = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.options = options;
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = new Headers(init.headers || {});

    if (
      !headers.has("Content-Type") &&
      init.body !== undefined &&
      !(init.body instanceof FormData)
    ) {
      headers.set("Content-Type", "application/json");
    }

    if (typeof window !== "undefined" && this.options.getAuthToken) {
      const token = this.options.getAuthToken();
      console.log(
        "HttpClient - getAuthToken result:",
        token ? token.substring(0, 20) + "..." : "null",
      );
      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
        console.log("HttpClient - Authorization header set");
      }
    }

    if (this.options.getExtraHeaders) {
      const extraHeaders = this.options.getExtraHeaders();
      Object.entries(extraHeaders || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && !headers.has(key)) {
          headers.set(key, String(value));
        }
      });
    }

    console.log("HttpClient request:", {
      url,
      method: init.method || "GET",
      headers: Object.fromEntries(headers.entries()),
    });

    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        headers,
      });
    } catch (networkError) {
      // Check if this is a gallery endpoint - if so, fail silently
      const isGalleryEndpoint = url.includes("/api/v1/galleries");
      if (isGalleryEndpoint && process.env.NODE_ENV === "development") {
        console.debug(
          "Gallery endpoint not available (this is expected if backend is not running)",
        );
      } else {
        console.error("Network error in HttpClient:", networkError);
      }
      const error = new Error(
        `Network error: ${networkError instanceof Error ? networkError.message : "Failed to fetch"}`,
      );
      (error as Error & { status?: number }).status = 0; // Network error
      throw error;
    }

    console.log("HttpClient response:", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    });

    if (!response.ok) {
      // Handle 401 Unauthorized (token expired/invalid)
      if (response.status === 401) {
        // Clear auth data
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          localStorage.removeItem("auth_email");
          
          // Redirect to login page
          console.log("🔒 Token expired or invalid, redirecting to login...");
          window.location.href = "/login";
        }
        
        const error = new Error("Session expired. Please login again.");
        (error as Error & { status?: number }).status = 401;
        throw error;
      }
      
      let message = response.statusText;
      try {
        const errorData = await response.json();

        // Handle different error response formats
        if (typeof errorData === "string") {
          message = errorData;
        } else if (errorData?.message) {
          message = errorData.message;
        } else if (errorData?.detail) {
          // FastAPI validation errors
          if (typeof errorData.detail === "string") {
            message = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            // Pydantic validation errors array
            message = errorData.detail
              .map((err: any) => {
                const loc = err.loc ? err.loc.join(" -> ") : "";
                return `${loc}: ${err.msg}`;
              })
              .join("; ");
          } else {
            message = JSON.stringify(errorData.detail);
          }
        } else if (errorData?.error) {
          message =
            typeof errorData.error === "string"
              ? errorData.error
              : JSON.stringify(errorData.error);
        } else {
          message = JSON.stringify(errorData);
        }
      } catch (parseError) {
        // ignore JSON parsing error and keep statusText
        console.warn("Failed to parse error response:", parseError);
      }

      const error = new Error(
        message || `Request failed with status ${response.status}`,
      );
      (error as Error & { status?: number }).status = response.status;
      throw error;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  }

  get<T>(path: string, params?: Record<string, unknown>) {
    const query = this.buildQuery(params);
    const url = query ? `${path}?${query}` : path;
    return this.request<T>(url, { method: "GET" });
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "POST",
      body:
        body instanceof FormData
          ? body
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
    });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "PUT",
      body:
        body instanceof FormData
          ? body
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
    });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "PATCH",
      body:
        body instanceof FormData
          ? body
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
    });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }

  private buildQuery(params?: Record<string, unknown>) {
    if (!params) return "";
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }
}

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  has_next: boolean;
  has_prev: boolean;
};
