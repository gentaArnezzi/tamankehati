import { mockApi } from "../mock-data";

// Mock public API client for development
export const mockPublicApi = {
  getFlora: async (params?: {
    search?: string;
    wilayah?: string;
    status_iucn?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      return await mockApi.getFlora(params);
    } catch (error) {
      console.error("Mock flora API error:", error);
      return {
        items: [],
        total: 0,
        limit: params?.limit || 10,
        offset: params?.offset || 0,
        has_next: false,
        has_prev: false,
      };
    }
  },

  getFloraById: async (id: string) => {
    try {
      return await mockApi.getFloraById(id);
    } catch (error) {
      console.error("Mock flora by ID API error:", error);
      throw error;
    }
  },

  getFauna: async (params?: {
    search?: string;
    wilayah?: string;
    status_iucn?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      return await mockApi.getFauna(params);
    } catch (error) {
      console.error("Mock fauna API error:", error);
      return {
        items: [],
        total: 0,
        limit: params?.limit || 10,
        offset: params?.offset || 0,
        has_next: false,
        has_prev: false,
      };
    }
  },

  getFaunaById: async (id: string) => {
    try {
      return await mockApi.getFaunaById(id);
    } catch (error) {
      console.error("Mock fauna by ID API error:", error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      return await mockApi.getStats();
    } catch (error) {
      console.error("Mock stats API error:", error);
      return {
        total_flora: 0,
        total_fauna: 0,
        total_taman: 0,
        total_artikel: 0,
      };
    }
  },
};
