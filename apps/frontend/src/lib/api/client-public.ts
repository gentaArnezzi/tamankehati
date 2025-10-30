'use client';

import { z } from 'zod';
import {
  FloraPublicSchema,
  FaunaPublicSchema,
  PaginatedResponseSchema,
  type FloraPublic,
  type FaunaPublic,
} from '../../types/public';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-zxb9.onrender.com'}';

type PrimitiveParam = string | number | boolean;
type SearchParams = Record<string, PrimitiveParam | PrimitiveParam[] | undefined | null>;

const buildQuery = (params?: SearchParams) => {
  if (!params) return '';
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === undefined || item === null || item === '') return;
        query.append(key, String(item));
      });
    } else if (typeof value === 'boolean') {
      query.append(key, value ? 'true' : 'false');
    } else {
      query.append(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

const fetchAPI = async <T>(endpoint: string, params?: SearchParams): Promise<T> => {
  const queryString = buildQuery(params);
  const url = `${API_BASE_URL}${endpoint}${queryString}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Flora API
export const getFloraList = async (params: SearchParams = {}) => {
  const response = await fetchAPI<{
    items: FloraPublic[];
    total: number;
    page: number;
    size: number;
    pages: number;
  }>('/api/public/flora', params);
  
  return response;
};

// Fauna API
export const getFaunaList = async (params: SearchParams = {}) => {
  const response = await fetchAPI<{
    items: FaunaPublic[];
    total: number;
    page: number;
    size: number;
    pages: number;
  }>('/api/public/fauna', params);
  
  return response;
};
