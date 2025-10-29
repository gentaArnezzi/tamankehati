'use client';

import { FloraPublic, FaunaPublic, TamanPublic } from '../../types/public';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

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
    const response = await fetch(`${API_BASE_URL}/api/public/flora?limit=${limit}&status_iucn=CR`);
    if (!response.ok) {
      throw new Error(`Failed to fetch flora: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.items.map((item: FloraPublic) => ({
      id: item.id,
      category: 'Flora' as const,
      title: item.nama_umum || item.nama_ilmiah,
      description: item.deskripsi || `Spesies ${item.famili} yang ${item.is_endemic ? 'endemik' : 'dilindungi'}`,
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
    const response = await fetch(`${API_BASE_URL}/api/public/fauna?limit=${limit}&status_iucn=CR`);
    if (!response.ok) {
      throw new Error(`Failed to fetch fauna: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.items.map((item: FaunaPublic) => ({
      id: item.id,
      category: 'Fauna' as const,
      title: item.nama_umum || item.nama_ilmiah,
      description: item.deskripsi || `Spesies ${item.famili} yang ${item.is_endemic ? 'endemik' : 'dilindungi'}`,
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
    const [flora, fauna, parks] = await Promise.all([
      fetchFeaturedFlora(1),
      fetchFeaturedFauna(1),
      fetchFeaturedParks(1)
    ]);
    
    return [...flora, ...fauna, ...parks];
  } catch (error) {
    console.error('Error fetching featured items:', error);
    return [];
  }
}
