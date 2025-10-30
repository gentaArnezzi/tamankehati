'use client';

import { FloraPublic, FaunaPublic, TamanPublic } from '../../types/public';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://tamankehati-backend-pxnu.onrender.com';

export interface FeaturedItem {
  id: string | number;
  category: 'Flora' | 'Fauna' | 'Konservasi';
  title: string;
  description: string;
  image: string;
  link: string;
}

export async function fetchFeaturedFlora(limit: number = 1): Promise<FeaturedItem[]> {
  try {
    // Try to fetch flora with IUCN status first (CR, EN, VU), then fallback to any flora
    let response = await fetch(`${API_BASE_URL}/api/public/flora?limit=${limit}&sort=created_at_desc`);
    if (!response.ok) {
      throw new Error(`Failed to fetch flora: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // If no data, return empty
    if (!data.items || data.items.length === 0) {
      console.warn('No flora data available');
      return [];
    }
    
    return data.items.map((item: FloraPublic) => ({
      id: item.id,
      category: 'Flora' as const,
      title: item.nama_umum || item.nama_ilmiah,
      description: item.deskripsi?.substring(0, 100) || `Spesies ${item.famili || 'flora'} ${item.is_endemic ? 'endemik Indonesia' : 'yang dilindungi'}`,
      image: item.gambar_utama || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=400&fit=crop',
      link: `/flora/${item.id}`
    }));
  } catch (error) {
    console.error('Error fetching featured flora:', error);
    return [];
  }
}

export async function fetchFeaturedFauna(limit: number = 1): Promise<FeaturedItem[]> {
  try {
    // Fetch fauna sorted by most recent
    const response = await fetch(`${API_BASE_URL}/api/public/fauna?limit=${limit}&sort=created_at_desc`);
    if (!response.ok) {
      throw new Error(`Failed to fetch fauna: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // If no data, return empty
    if (!data.items || data.items.length === 0) {
      console.warn('No fauna data available');
      return [];
    }
    
    return data.items.map((item: FaunaPublic) => ({
      id: item.id,
      category: 'Fauna' as const,
      title: item.nama_umum || item.nama_ilmiah,
      description: item.deskripsi?.substring(0, 100) || `Spesies ${item.famili || 'fauna'} ${item.is_endemic ? 'endemik Indonesia' : 'yang dilindungi'}`,
      image: item.gambar_utama || 'https://images.unsplash.com/photo-1551739440-5dd934d3a94a?w=600&h=400&fit=crop',
      link: `/fauna/${item.id}`
    }));
  } catch (error) {
    console.error('Error fetching featured fauna:', error);
    return [];
  }
}

export async function fetchFeaturedParks(limit: number = 1): Promise<FeaturedItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/public/parks?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch parks: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.items.map((item: TamanPublic) => ({
      id: item.id,
      category: 'Konservasi' as const,
      title: item.name,
      description: item.description || `Taman nasional di ${item.provinsi || 'Indonesia'}`,
      image: item.gambar_utama || 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop',
      link: `/taman/${item.id}`
    }));
  } catch (error) {
    console.error('Error fetching featured parks:', error);
    return [];
  }
}

export async function fetchFeaturedItems(): Promise<FeaturedItem[]> {
  try {
    // Fetch more flora and fauna for better variety (2 flora + 1 fauna = 3 species)
    const [flora, fauna] = await Promise.all([
      fetchFeaturedFlora(2),
      fetchFeaturedFauna(1)
    ]);
    
    // Return only species (flora and fauna), not parks
    return [...flora, ...fauna];
  } catch (error) {
    console.error('Error fetching featured items:', error);
    return [];
  }
}

