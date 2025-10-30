// src/types/index.ts

import type { User } from "../lib/api-client";

export type { User };

export interface Flora {
  id: number;
  scientific_name: string;
  local_name: string;
  family: string;
  genus: string;
  species: string;
  description: string;
  habitat: string;
  status_iucn: "CR" | "EN" | "VU" | "NT" | "LC" | "DD" | "NE";
  images: string[];
  location: {
    lat: number;
    lng: number;
    province: string;
    district: string;
  };
  status: "draft" | "in_review" | "approved" | "rejected";
  submitted_by?: number;
  submitted_at?: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Fauna {
  id: number;
  scientific_name: string;
  local_name: string;
  family: string;
  genus: string;
  species: string;
  ordo: string;
  description: string;
  habitat: string;
  status_iucn: "CR" | "EN" | "VU" | "NT" | "LC" | "DD" | "NE";
  is_endemic: boolean;
  is_protected: boolean;
  images: string[];
  location: {
    lat: number;
    lng: number;
    province: string;
    district: string;
  };
  status: "draft" | "in_review" | "approved" | "rejected";
  submitted_by?: number;
  submitted_at?: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Zone {
  id: number;
  name: string;
  description: string;
  type: "taman_nasional" | "suaka_margasatwa" | "cagar_alam" | "taman_wisata";
  province: string;
  district: string;
  area_hectares: number;
  established_year: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  boundary: Array<{ lat: number; lng: number }>;
  flora_count?: number;
  fauna_count?: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  category: "news" | "education" | "research" | "conservation";
  tags: string[];
  featured_image: string;
  images: string[];
  status: "draft" | "in_review" | "published";
  published_at?: string;
  submitted_by?: number;
  submitted_at?: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Gallery {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  author_id?: number;
  park_id?: number;
  entity_type?: string; // 'flora', 'fauna', 'park', 'article', 'news'
  entity_id?: number; // ID of the related entity
  status: "draft" | "in_review" | "approved" | "rejected";
  submitted_by?: number;
  submitted_at?: string;
  approved_by?: number;
  approved_at?: string;
  rejected_by?: number;
  rejected_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Form Types
export interface FloraFormData {
  scientific_name: string;
  local_name: string;
  family: string;
  genus: string;
  species: string;
  description: string;
  habitat: string;
  status_iucn: Flora["status_iucn"];
  location: {
    lat: number;
    lng: number;
    province: string;
    district: string;
  };
}

export interface FaunaFormData {
  scientific_name: string;
  local_name: string;
  family: string;
  genus: string;
  species: string;
  ordo: string;
  description: string;
  habitat: string;
  status_iucn: Fauna["status_iucn"];
  is_endemic: boolean;
  is_protected: boolean;
  location: {
    lat: number;
    lng: number;
    province: string;
    district: string;
  };
}

// Search and Filter Types
export interface FloraSearchParams {
  search?: string;
  wilayah?: string;
  status_iucn?: string;
  limit?: number;
  offset?: number;
}

export interface FaunaSearchParams {
  search?: string;
  wilayah?: string;
  ordo?: string;
  status_iucn?: string;
  is_endemic?: boolean;
  is_protected?: boolean;
  limit?: number;
  offset?: number;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  email: string;
  role: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasRole: (role: User["role"]) => boolean;
  hasPermission: (permission: string) => boolean;
}

// Dashboard Types
export interface DashboardStats {
  total_zones: number;
  total_flora: number;
  total_fauna: number;
  total_users: number;
  pending_approvals: number;
  regional_stats: Array<{
    region: string;
    zones: number;
    flora: number;
    fauna: number;
  }>;
}

export interface ActivityFeed {
  id: number;
  type: "flora_added" | "fauna_added" | "article_published" | "user_joined";
  description: string;
  user: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface PendingApproval {
  id: number;
  type: "flora" | "fauna" | "article" | "gallery";
  title: string;
  submitted_by: string;
  submitted_at: string;
  priority: "low" | "medium" | "high";
}

// Map Types
export interface MapView {
  center: [number, number];
  zoom: number;
  bounds?: [[number, number], [number, number]];
}

export interface ZoneMarker {
  zone: Zone;
  isSelected: boolean;
  onClick: (zone: Zone) => void;
}
