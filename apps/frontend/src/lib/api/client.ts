import { HttpClient } from '../http-client';
import { PublicStatsSchema } from '../../types/public';
import { z } from 'zod';

const client = new HttpClient(process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-zxb9.onrender.com');

export const getParkStats = async (parkId: number) => {
  const response = await client.get(`/api/public/stats/park/${parkId}`);
  return PublicStatsSchema.parse(response);
};

export const getAvailableRegions = async (): Promise<{ id: number; name: string; code: string }[]> => {
  const response = await client.get('/api/public/stats/regions') as any;
  return response.regions || [];
};
