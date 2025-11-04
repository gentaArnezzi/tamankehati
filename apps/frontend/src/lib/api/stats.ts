"use client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://38.47.93.167:8080";

export interface StatsData {
  total_flora: number;
  total_fauna: number;
  total_taman: number;
  total_artikel: number;
}

export async function fetchStats(): Promise<StatsData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/public/stats/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    // Return fallback data if API fails
    return {
      total_flora: 320,
      total_fauna: 180,
      total_taman: 52,
      total_artikel: 0,
    };
  }
}
