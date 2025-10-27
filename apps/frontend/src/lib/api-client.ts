'use client';

import { HttpClient, PaginatedResponse } from './http-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
console.log('API_BASE_URL:', API_BASE_URL);
const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';
const AUTH_EMAIL_KEY = 'auth_email';

const privateClient = new HttpClient(API_BASE_URL, {
  getAuthToken: () => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  },
  getExtraHeaders: () => {
    if (typeof window === 'undefined') return {};
    const rawUser = window.localStorage.getItem(AUTH_USER_KEY);
    if (!rawUser) return {};
    try {
      const user = JSON.parse(rawUser) as User | null;
      if (user?.role === 'regional_admin' && user.park_id) {
        return { 'X-Park-Scope': String(user.park_id) };
      }
    } catch {
      // ignore JSON parse error
    }
    return {};
  },
});

type WorkflowStatus = 'draft' | 'in_review' | 'approved' | 'rejected';

type TokenResponse = {
  access_token: string;
  token_type?: string;
  user_id?: number;
  email?: string;
  role?: string;
  name?: string;
  profile_picture_url?: string | null;
  // Legacy support for nested user object
  user?: UserResponse;
};

type UserResponse = {
  id: number;
  email: string;
  display_name?: string | null;
  role: 'super_admin' | 'regional_admin';
  park_id?: number | null;
  profile_picture_url?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

type ParkSummary = {
  id: number;
  name: string;
  slug: string;
  status: string;
  area_ha?: number;
  description?: string;
  sk_penetapan?: string;
  pengelola?: string;
  tipe_ekoregion?: string;
  kondisi_fisik?: string;
  nilai_penting?: string;
  sejarah?: string;
  visi?: string;
  misi?: string;
  nilai_dasar?: string;
  created_at?: string;
  updated_at?: string;
};

type RegionSummary = {
  id: number;
  name: string;
  code: string;
  timezone?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

type UserDetailResponse = {
  id: number;
  email: string;
  display_name?: string | null;
  full_name?: string | null;
  role: 'super_admin' | 'regional_admin';
  park_id?: number | null;
  profile_picture_url?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  park?: ParkSummary;
  region?: RegionSummary;
};

type FloraAdminResponse = {
  id: number;
  scientific_name?: string | null;
  local_name?: string | null;
  family?: string | null;
  genus?: string | null;
  description?: string | null;
  habitat?: string | null;  // Added habitat field
  is_endemic?: boolean;
  iucn_status?: string | null;
  morphology?: string | null;
  benefits?: string | null;
  park_id: number;
  park?: {
    id: number;
    name: string;
    // region_id: number;  // Removed - using user-based access control
  } | null;
  status: WorkflowStatus;
  submitted_by?: number | null;
  approved_by?: number | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  wilayah?: string | null;
  gambar_utama?: string | null;
  // region_code?: string | null;  // Removed - using user-based access control
};

type FaunaAdminResponse = {
  id: number;
  scientific_name?: string | null;
  local_name?: string | null;
  family?: string | null;
  genus?: string | null;
  species?: string | null;
  ordo?: string | null;
  description?: string | null;
  habitat?: string | null;
  diet?: string | null;
  behavior?: string | null;
  morphology?: string | null;
  local_id?: string | null;
  image_url?: string | null;
  habitat_sumber_makanan?: string | null;
  status_hama?: string | null;
  tingkat_hama?: string | null;
  is_endemic?: boolean;
  iucn_status?: string | null;
  gambar_utama?: string | null;
  park_id: number;
  park?: {
    id: number;
    name: string;
    // region_id: number;  // Removed - using user-based access control
  } | null;
  status: WorkflowStatus;
  submitted_by?: number | null;
  approved_by?: number | null;
  rejected_by?: number | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  wilayah?: string | null;
  // region_code?: string | null;  // Removed - using user-based access control
};

type ActivityAdminResponse = {
  id: number;
  title: string;
  description?: string | null;
  activity_date: string;
  location?: string | null;
  park_id: number;
  park?: {
    id: number;
    name: string;
    // region_id: number;  // Removed - using user-based access control
  } | null;
  status: WorkflowStatus;
  created_by?: number | null;
  approved_by?: number | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ArticleAdminResponse = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  category?: string | null;
  author_id: number;
  // region_code?: string | null;  // Removed - using user-based access control
  status: WorkflowStatus | 'published';
  featured_image?: string | null;
  submitted_by?: number | null;
  submitted_at?: string | null;
  approved_by?: number | null;
  approved_at?: string | null;
  rejected_by?: number | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
};

type GalleryAdminResponse = {
  id: number;
  title: string;
  description?: string | null;
  image_url: string;
  author_id: number;
  // region_code?: string | null;  // Removed - using user-based access control
  status: WorkflowStatus | 'published';
  submitted_by?: number | null;
  submitted_at?: string | null;
  approved_by?: number | null;
  approved_at?: string | null;
  rejected_by?: number | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
};

type ZoneResponse = {
  id: number;
  name: string;
  // region_code: string;  // Removed - using user-based access control
  status: 'draft' | 'in_review' | 'approved' | 'rejected';
  submitted_by?: number | null;
  approved_by?: number | null;
  rejected_by?: number | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ApprovalEntityType = 'flora' | 'fauna' | 'artikel' | 'galeri' | 'taman' | 'kegiatan';

type ApprovalItemResponse = {
  entity_type: ApprovalEntityType;
  entity_id: number;
  title: string;
  thumbnail_url?: string | null;
  status: string;
  submitted_at?: string | null;
  updated_at?: string | null;
  metadata: {
    // region_code?: string | null;  // Removed - using user-based access control
    submitted_by?: number | null;
    approved_by?: number | null;
  };
};

type ApprovalListResponse = {
  items: ApprovalItemResponse[];
  total: number;
  counts: Record<ApprovalEntityType, number> & Record<string, number>;
  has_next: boolean;
};

type DashboardResponse = {
  total_flora?: number;
  total_fauna?: number;
  total_zones?: number;
  total_users?: number;
  total_observasi?: number;
  total_taman?: number;
  pending_approvals?: number;
  user_breakdown?: Array<{
    user_id: string;
    flora: number;
    fauna: number;
    zones: number;
  }>;
};

export interface User {
  id: string;
  email: string;
  nama?: string;
  display_name?: string | null;
  role: 'super_admin' | 'regional_admin';
  park_id?: number;
  profile_picture_url?: string | null;
  // region_code?: string | null;  // Removed - using user-based access control
  // wilayah?: string | null;  // Removed - using user-based access control
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserDetail extends User {
  park?: {
    id: number;
    name: string;
    slug: string;
    status: string;
    area_ha?: number;
    description?: string;
    sk_penetapan?: string;
    pengelola?: string;
    tipe_ekoregion?: string;
    kondisi_fisik?: string;
    nilai_penting?: string;
    sejarah?: string;
    visi?: string;
    misi?: string;
    nilai_dasar?: string;
    created_at?: string;
    updated_at?: string;
  };
  region?: {
    id: number;
    name: string;
    code: string;
    timezone?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
  };
}

export interface Flora {
  id: string;
  nama_ilmiah: string;      // Frontend Indonesian, maps to scientific_name in backend
  nama_umum?: string;       // Frontend Indonesian, maps to local_name in backend
  famili?: string;          // Frontend Indonesian, maps to family in backend
  genus?: string;
  status_iucn?: string;     // Frontend Indonesian, maps to iucn_status in backend
  deskripsi?: string;       // Frontend Indonesian, maps to description in backend
  morfologi?: string;       // Frontend Indonesian, maps to morphology in backend
  manfaat?: string;         // Frontend Indonesian, maps to benefits in backend
  is_endemic?: boolean;
  park_id?: number;
  park?: {
    id: number;
    name: string;
    region_id: number;
  };
  habitat?: string;
  wilayah?: string;
  region_code?: string;
  status: WorkflowStatus;
  submitted_by?: number;
  approved_by?: number;
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  created_at?: string;
  updated_at?: string;
  rejection_reason?: string | null;
  gambar_utama?: string;
}

export interface Fauna {
  id: string;
  nama_ilmiah: string;      // Frontend Indonesian, maps to scientific_name in backend
  nama_umum?: string;       // Frontend Indonesian, maps to local_name in backend
  family?: string;          // Frontend Indonesian, maps to family in backend
  genus?: string;          // Frontend Indonesian, maps to genus in backend
  species?: string;        // Frontend Indonesian, maps to species in backend
  ordo?: string;
  status_iucn?: string;     // Frontend Indonesian, maps to iucn_status in backend
  deskripsi?: string;       // Frontend Indonesian, maps to description in backend
  habitat?: string;         // Frontend Indonesian, maps to habitat in backend
  diet?: string;           // Frontend Indonesian, maps to diet in backend
  behavior?: string;       // Frontend Indonesian, maps to behavior in backend
  morphology?: string;     // Frontend Indonesian, maps to morphology in backend
  local_id?: string;       // Frontend Indonesian, maps to local_id in backend
  image_url?: string;      // Frontend Indonesian, maps to image_url in backend
  habitat_sumber_makanan?: string;
  status_hama?: string;
  tingkat_hama?: string;
  is_endemic?: boolean;
  park_id?: number;
  park?: {
    id: number;
    name: string;
    // region_id: number;  // Removed - using user-based access control
  };
  wilayah?: string;
  // region_code?: string;  // Removed - using user-based access control
  status: WorkflowStatus;
  submitted_by?: number;
  approved_by?: number;
  rejected_by?: number;    // Frontend Indonesian, maps to rejected_by in backend
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  created_at?: string;
  updated_at?: string;
  rejection_reason?: string | null;
  gambar_utama?: string;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  activity_date: string;
  location?: string;
  park_id: number;
  park?: {
    id: number;
    name: string;
    // region_id: number;  // Removed - using user-based access control
  };
  status: WorkflowStatus;
  created_by?: string;
  approved_by?: string;
  created_at?: string;
  updated_at?: string;
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string | null;
}


export interface Observasi {
  id: string;
  jenis: 'flora' | 'fauna';
  nama_spesies: string;
  nama_ilmiah?: string;
  lokasi: {
    type: 'Point';
    coordinates: [number, number];
  };
  deskripsi?: string;
  media?: string[];
  tanggal_observasi: string;
  wilayah: string;
  status: WorkflowStatus;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  spesies_id?: string;
  gambar_utama?: string;
  famili?: string;
  status_iucn?: string;
  habitat?: string;
}

export interface Taman {
  id: string;
  nama: string;
  wilayah: string;
  luas_ha?: number;
  deskripsi?: string;
  created_at?: string;
  updated_at?: string;
  status?: 'draft' | 'in_review' | 'approved' | 'rejected';
  submitted_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  submitted_by?: string | null;
  approved_by?: string | null;
  rejected_by?: string | null;
}

export type ZoneUploadResponse = {
  summary: {
    created: number;
    errors: number;
    simplify_tolerance: number;
  };
  zones: Array<{
    id: number;
    name: string;
    // region_code: string;  // Removed - using user-based access control
    status: 'draft' | 'in_review' | 'approved' | 'rejected';
  }>;
  errors: string[];
};

export interface ApprovalQueueItem {
  entityType: ApprovalEntityType;
  entityId: number;
  title: string;
  status: string;
  submittedAt?: string | null;
  updatedAt?: string | null;
  regionCode?: string | null;
  submittedBy?: number | null;
  approvedBy?: number | null;
  thumbnailUrl?: string | null;
}

export interface DashboardStats {
  total_flora: number;
  total_fauna: number;
  total_zones: number;
  total_users: number;
  total_observasi?: number;
  total_taman?: number;
  pending_approvals: number;
  pending_approval?: number;
  total_announcements?: number;
  regional_breakdown: Array<{
    // region_code: string;  // Removed - using user-based access control
    flora: number;
    fauna: number;
    zones: number;
  }>;
}

export interface ActivityLog {
  id: string;
  type: string;
  description: string;
  user: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const mapUser = (user: UserResponse): User => ({
  id: String(user.id),
  email: user.email,
  nama: user.display_name ?? user.email,
  display_name: user.display_name ?? undefined,
  role: user.role,
  park_id: user.park_id ?? undefined,
  profile_picture_url: user.profile_picture_url ?? null,
  is_active: user.is_active,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

const mapUserDetail = (user: UserDetailResponse): UserDetail => ({
  id: String(user.id),
  email: user.email,
  nama: user.display_name ?? user.email,
  display_name: user.display_name ?? undefined,
  role: user.role,
  park_id: user.park_id ?? undefined,
  profile_picture_url: user.profile_picture_url ?? null,
  is_active: user.is_active,
  created_at: user.created_at,
  updated_at: user.updated_at,
  park: user.park ? {
    id: user.park.id,
    name: user.park.name,
    slug: user.park.slug,
    status: user.park.status,
    area_ha: user.park.area_ha,
    description: user.park.description,
    sk_penetapan: user.park.sk_penetapan,
    pengelola: user.park.pengelola,
    tipe_ekoregion: user.park.tipe_ekoregion,
    kondisi_fisik: user.park.kondisi_fisik,
    nilai_penting: user.park.nilai_penting,
    sejarah: user.park.sejarah,
    visi: user.park.visi,
    misi: user.park.misi,
    nilai_dasar: user.park.nilai_dasar,
    created_at: user.park.created_at,
    updated_at: user.park.updated_at,
  } : undefined,
  region: user.region ? {
    id: user.region.id,
    name: user.region.name,
    code: user.region.code,
    timezone: user.region.timezone,
    is_active: user.region.is_active,
    created_at: user.region.created_at,
    updated_at: user.region.updated_at,
  } : undefined,
});

const mapFlora = (flora: FloraAdminResponse): Flora => ({
  id: String(flora.id),
  nama_ilmiah: flora.scientific_name ?? 'Tidak diketahui',
  nama_umum: flora.local_name ?? undefined,
  famili: flora.family ?? undefined,
  genus: flora.genus ?? undefined,
  status_iucn: flora.iucn_status ?? undefined,
  deskripsi: flora.description ?? undefined,
  morfologi: flora.morphology ?? undefined,
  manfaat: flora.benefits ?? undefined,
  is_endemic: flora.is_endemic ?? false,
  habitat: flora.habitat ?? undefined,  // Added habitat mapping
  wilayah: flora.wilayah ?? undefined,
  park_id: flora.park_id,  // Added park_id mapping
  park: flora.park ? {  // Added park mapping
    id: flora.park.id,
    name: flora.park.name,
    region_id: 0  // Legacy field, not used anymore
  } : undefined,
    // region_code: flora.region_code ?? undefined,  // Removed - using user-based access control
  status: flora.status,
  submitted_by: flora.submitted_by ?? undefined,
  approved_by: flora.approved_by ?? undefined,
  created_at: flora.created_at ?? flora.submitted_at ?? undefined,
  updated_at: flora.updated_at ?? flora.approved_at ?? flora.submitted_at ?? undefined,
  rejection_reason: flora.rejection_reason ?? undefined,
  gambar_utama: flora.gambar_utama ?? undefined,
});

const mapFauna = (fauna: FaunaAdminResponse): Fauna => ({
  id: String(fauna.id),
  nama_ilmiah: fauna.scientific_name ?? 'Tidak diketahui',
  nama_umum: fauna.local_name ?? undefined,
  family: fauna.family ?? undefined,
  genus: fauna.genus ?? undefined,
  species: fauna.species ?? undefined,
  ordo: fauna.ordo ?? undefined,
  status_iucn: fauna.iucn_status ?? undefined,
  deskripsi: fauna.description ?? undefined,
  habitat: fauna.habitat ?? undefined,
  diet: fauna.diet ?? undefined,
  behavior: fauna.behavior ?? undefined,
  morphology: fauna.morphology ?? undefined,
  local_id: fauna.local_id ?? undefined,
  image_url: fauna.image_url ?? undefined,
  habitat_sumber_makanan: fauna.habitat_sumber_makanan ?? undefined,
  status_hama: fauna.status_hama ?? undefined,
  tingkat_hama: fauna.tingkat_hama ?? undefined,
  is_endemic: fauna.is_endemic ?? false,
  park_id: fauna.park_id,
  park: fauna.park ?? undefined,
  wilayah: fauna.wilayah ?? undefined,
  // region_code: fauna.region_code ?? undefined,  // Removed - using user-based access control
  status: fauna.status,
  submitted_by: fauna.submitted_by ?? undefined,
  approved_by: fauna.approved_by ?? undefined,
  rejected_by: fauna.rejected_by ?? undefined,
  submitted_at: fauna.submitted_at ?? undefined,
  approved_at: fauna.approved_at ?? undefined,
  rejected_at: fauna.rejected_at ?? undefined,
  created_at: fauna.created_at ?? fauna.submitted_at ?? undefined,
  updated_at: fauna.updated_at ?? fauna.approved_at ?? fauna.submitted_at ?? undefined,
  rejection_reason: fauna.rejection_reason ?? undefined,
  gambar_utama: fauna.gambar_utama ?? undefined,
});

const mapActivity = (activity: ActivityAdminResponse): Activity => ({
  id: String(activity.id),
  title: activity.title,
  description: activity.description ?? undefined,
  activity_date: activity.activity_date,
  location: activity.location ?? undefined,
  park_id: activity.park_id,
  park: activity.park ? {
    id: activity.park.id,
    name: activity.park.name,
    // region_id: activity.park.region_id,  // Removed - using user-based access control
  } : undefined,
  status: activity.status,
  created_by: activity.created_by ? String(activity.created_by) : undefined,
  approved_by: activity.approved_by ? String(activity.approved_by) : undefined,
  created_at: activity.created_at ?? undefined,
  updated_at: activity.updated_at ?? undefined,
  submitted_at: activity.submitted_at ?? undefined,
  approved_at: activity.approved_at ?? undefined,
  rejected_at: activity.rejected_at ?? undefined,
  rejection_reason: activity.rejection_reason ?? undefined,
});


const mapZoneToTaman = (zone: ZoneResponse): Taman => ({
  id: String(zone.id),
  nama: zone.name,
  wilayah: '', // region_code removed - using user-based access control
  status: zone.status,
  created_at: zone.created_at ?? undefined,
  updated_at: zone.updated_at ?? undefined,
  submitted_at: zone.submitted_at ?? null,
  approved_at: zone.approved_at ?? null,
  rejected_at: zone.rejected_at ?? null,
  rejection_reason: zone.rejection_reason ?? null,
  submitted_by: zone.submitted_by != null ? String(zone.submitted_by) : null,
  approved_by: zone.approved_by != null ? String(zone.approved_by) : null,
  rejected_by: zone.rejected_by != null ? String(zone.rejected_by) : null,
});

export interface Zone {
  id: string;
  name: string;
  // region_code: string;  // Removed - using user-based access control
  status: ZoneResponse['status'];
}

const mapZone = (zone: ZoneResponse): Zone => ({
  id: String(zone.id),
  name: zone.name,
  // region_code: zone.region_code,  // Removed - using user-based access control
  status: zone.status,
});

const toPaginated = <T, R>(
  response: PaginatedResponse<R>,
  mapper: (item: R) => T,
) => ({
  items: response.items.map(mapper),
  total: response.total,
  limit: response.limit,
  offset: response.offset,
  hasNext: response.has_next,
  hasPrev: response.has_prev,
});

export const authApi = {
  login: (email: string, password: string) =>
    privateClient.post<TokenResponse>('/api/v1/auth/login', { email, password }),

  logout: () => privateClient.post<void>('/api/v1/auth/logout'),

  getProfile: async () => {
    try {
      const response = await privateClient.get<UserResponse>('/api/v1/users/me');
      return mapUser(response);
    } catch (error) {
      // Fallback jika /me gagal, coba /users/{id} dengan uid dari token
      console.warn('Fallback to /users/{id} for getProfile:', error);
      const userId = 2; // Ambil dari token atau state, sementara hardcode
      const response = await privateClient.get<UserResponse>(`/api/v1/users/${userId}`);
      return mapUser(response);
    }
  },
};

type UserListParams = {
  limit?: number;
  offset?: number;
  q?: string;
  is_active?: boolean;
  sort?: string;
};

export const userApi = {
  list: async (params?: UserListParams) => {
    const response = await privateClient.get<UserResponse[]>('/api/v1/users/', params);
    return response.map(mapUser);
  },

  findByEmail: async (email: string) => {
    const response = await privateClient.get<UserResponse[]>('/api/v1/users/', {
      q: email,
      limit: 10,
      offset: 0,
    });

    const matched = response.find((item) => item.email?.toLowerCase() === email.toLowerCase());
    return matched ? mapUser(matched) : null;
  },

  getById: async (id: string | number) => {
    const response = await privateClient.get<UserResponse>(`/api/v1/users/${id}`);
    return mapUser(response);
  },

  getDetail: async (id: string | number, include?: string) => {
    const params = include ? { include } : {};
    const response = await privateClient.get<UserDetailResponse>(`/api/v1/users/${id}`, params);
    return mapUserDetail(response);
  },

  create: async (payload: { email: string; password: string; nama?: string; role: User['role'] }) => {
    const response = await privateClient.post<UserResponse>('/api/v1/users/', {
      email: payload.email,
      password: payload.password,
      display_name: payload.nama,
      role: payload.role,
    });
    return mapUser(response);
  },

  update: async (
    id: string | number,
    payload: Partial<{ nama: string; password: string }>
  ) => {
    const response = await privateClient.put<UserResponse>(`/api/v1/users/${id}`, {
      display_name: payload.nama,
      password: payload.password,
    });
    return mapUser(response);
  },

  updateRole: async (id: string | number, role: User['role']) => {
    const response = await privateClient.put<UserResponse>(`/api/v1/users/${id}/role`, { role });
    return mapUser(response);
  },

  activate: (id: string | number) => privateClient.put<void>(`/api/v1/users/${id}/activate`),
  deactivate: (id: string | number) => privateClient.put<void>(`/api/v1/users/${id}/deactivate`),
  delete: (id: string | number) => privateClient.delete<void>(`/api/v1/users/${id}`),
};

// Zone API removed - zones functionality removed

export const floraApi = {
  list: async (params?: { search?: string; status?: WorkflowStatus; limit?: number; offset?: number }) => {
    const query: Record<string, unknown> = { ...params };
    if (params?.status) {
      query.status_filter = params.status;
      delete query.status;
    }
    if (params?.search) {
      query.q = params.search;
      delete query.search;
    }
    const response = await privateClient.get<PaginatedResponse<FloraAdminResponse>>('/api/v1/flora/', query);
    return toPaginated(response, mapFlora);
  },

  getById: async (id: string | number) => {
    const response = await privateClient.get<FloraAdminResponse>(`/api/v1/flora/${id}`);
    return mapFlora(response);
  },

  create: async (payload: Partial<Flora>) => {
    const response = await privateClient.post<FloraAdminResponse>('/api/v1/flora/', {
      park_id: payload.park_id || 1, // Default to park 1 if not specified
      scientific_name: payload.nama_ilmiah,
      local_name: payload.nama_umum,
      family: payload.famili,
      genus: payload.genus,
      description: payload.deskripsi,
      habitat: payload.habitat,  // Added habitat field
      morphology: payload.morfologi,
      benefits: payload.manfaat,
      is_endemic: payload.is_endemic || false,
      iucn_status: payload.status_iucn ? payload.status_iucn : undefined,
      gambar_utama: payload.gambar_utama,
      status: payload.status, // Add status field
    });
    return mapFlora(response);
  },

  update: async (id: string | number, payload: Partial<Flora>) => {
    const response = await privateClient.put<FloraAdminResponse>(`/api/v1/flora/${id}`, {
      park_id: payload.park_id,
      scientific_name: payload.nama_ilmiah,
      local_name: payload.nama_umum,
      family: payload.famili,
      genus: payload.genus,
      description: payload.deskripsi,
      habitat: payload.habitat,  // Added habitat field
      morphology: payload.morfologi,
      benefits: payload.manfaat,
      is_endemic: payload.is_endemic,
      iucn_status: payload.status_iucn ? payload.status_iucn : undefined,
      gambar_utama: payload.gambar_utama,
      status: payload.status, // Add status field
    });
    return mapFlora(response);
  },

  delete: async (id: string | number) => {
    await privateClient.delete(`/api/v1/flora/${id}`);
    return true;
  },
  
  submit: async (id: string | number) => {
    const response = await privateClient.post<FloraAdminResponse>(`/api/v1/flora/${id}/submit`);
    return mapFlora(response);
  },
  
  approve: async (id: string | number) => {
    const response = await privateClient.post<FloraAdminResponse>(`/api/v1/flora/${id}/approve`);
    return mapFlora(response);
  },
  
  reject: async (id: string | number, reason: string) => {
    const response = await privateClient.post<FloraAdminResponse>(`/api/v1/flora/${id}/reject`, { reason });
    return mapFlora(response);
  }
};

export const faunaApi = {
  list: async (params?: { search?: string; status?: WorkflowStatus; limit?: number; offset?: number }) => {
    const query: Record<string, unknown> = { ...params };
    if (params?.status) {
      query.status_filter = params.status;
      delete query.status;
    }
    if (params?.search) {
      query.q = params.search;
      delete query.search;
    }
    const response = await privateClient.get<PaginatedResponse<FaunaAdminResponse>>('/api/v1/fauna/', query);
    console.log('faunaApi.list response:', response);
    const result = toPaginated(response, mapFauna);
    console.log('faunaApi.list mapped result:', result);
    return result;
  },

  getById: async (id: string | number) => {
    const response = await privateClient.get<FaunaAdminResponse>(`/api/v1/fauna/${id}`);
    return mapFauna(response);
  },

  create: async (payload: Partial<Fauna>) => {
    const requestBody = {
      park_id: payload.park_id || 1, // Default to park 1 if not specified
      scientific_name: payload.nama_ilmiah,
      local_name: payload.nama_umum,
      ordo: payload.ordo,
      description: payload.deskripsi,
      habitat_sumber_makanan: payload.habitat_sumber_makanan,
      status_hama: payload.status_hama,
      tingkat_hama: payload.tingkat_hama,
      is_endemic: payload.is_endemic === true, // Ensure boolean conversion
      iucn_status: payload.status_iucn ? payload.status_iucn : undefined,
      gambar_utama: payload.gambar_utama,
      status: payload.status, // Add status field
    };
    console.log('Fauna create payload.is_endemic:', payload.is_endemic);
    console.log('Fauna create requestBody.is_endemic:', requestBody.is_endemic);
    const response = await privateClient.post<FaunaAdminResponse>('/api/v1/fauna/', requestBody);
    return mapFauna(response);
  },

  update: async (id: string | number, payload: Partial<Fauna>) => {
    const response = await privateClient.put<FaunaAdminResponse>(`/api/v1/fauna/${id}`, {
      park_id: payload.park_id,
      scientific_name: payload.nama_ilmiah,
      local_name: payload.nama_umum,
      ordo: payload.ordo,
      description: payload.deskripsi,
      habitat_sumber_makanan: payload.habitat_sumber_makanan,
      status_hama: payload.status_hama,
      tingkat_hama: payload.tingkat_hama,
      is_endemic: payload.is_endemic,
      iucn_status: payload.status_iucn ? payload.status_iucn : undefined,
      gambar_utama: payload.gambar_utama,
      status: payload.status, // Add status field
    });
    return mapFauna(response);
  },

  remove: (id: string | number) => privateClient.delete<void>(`/api/v1/fauna/${id}`),
  submit: (id: string | number) => privateClient.post<void>(`/api/v1/fauna/${id}/submit`),
  approve: (id: string | number) =>
    privateClient.post<void>(`/api/v1/fauna/${id}/approve`),
  reject: (id: string | number, reason: string) =>
    privateClient.post<void>(`/api/v1/fauna/${id}/reject`, { reason }),
};

// Taman API removed - zones functionality removed


export const galleryApi = {
  list: (params?: { limit?: number; offset?: number }) =>
    privateClient.get<PaginatedResponse<GalleryAdminResponse>>('/api/v1/galleries/', params),
  getById: (id: string | number) => privateClient.get<GalleryAdminResponse>(`/api/v1/galleries/${id}`),
  getByEntity: async (entityType: string, entityId: string | number) => {
    const response = await privateClient.get<{
      success: boolean;
      data: Array<{
        id: number;
        title: string;
        description: string;
        image_url: string;
        entity_type: string;
        entity_id: number;
        status: string;
        created_at: string;
        updated_at: string;
      }>;
      total: number;
      entity_type: string;
      entity_id: number;
    }>(`/api/v1/galleries/entity/${entityType}/${entityId}`);
    return response;
  },
  create: (payload: Partial<GalleryAdminResponse>) =>
    privateClient.post<GalleryAdminResponse>('/api/v1/galleries/', payload),
  update: (id: string | number, payload: Partial<GalleryAdminResponse>) =>
    privateClient.put<GalleryAdminResponse>(`/api/v1/galleries/${id}`, payload),
  remove: (id: string | number) => privateClient.delete<void>(`/api/v1/galleries/${id}`),
  submit: (id: string | number) => privateClient.post<void>(`/api/v1/galleries/${id}/submit`),
  approve: (id: string | number, notes?: string) =>
    privateClient.post<void>(`/api/v1/galleries/${id}/approve`, notes ? { notes } : undefined),
  reject: (id: string | number, reason: string) =>
    privateClient.post<void>(`/api/v1/galleries/${id}/reject`, { notes: reason }),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return privateClient.post<{ success: boolean; filename: string; url: string; size: number; message: string }>('/api/v1/upload/gallery-image', formData);
  },
};

export const articleApi = {
  list: (params?: { limit?: number; offset?: number; status?: WorkflowStatus }) =>
    privateClient.get<PaginatedResponse<ArticleAdminResponse>>('/api/v1/articles/', params),
  getById: (id: string | number) => privateClient.get<ArticleAdminResponse>(`/api/v1/articles/${id}`),
  create: (payload: Partial<ArticleAdminResponse>) =>
    privateClient.post<ArticleAdminResponse>('/api/v1/articles/', payload),
  update: (id: string | number, payload: Partial<ArticleAdminResponse>) =>
    privateClient.put<ArticleAdminResponse>(`/api/v1/articles/${id}`, payload),
  remove: (id: string | number) => privateClient.delete<void>(`/api/v1/articles/${id}`),
  submit: (id: string | number) => privateClient.post<void>(`/api/v1/articles/${id}/submit`),
  approve: (id: string | number, notes?: string) =>
    privateClient.post<void>(`/api/v1/articles/${id}/approve`, notes ? { notes } : undefined),
  reject: (id: string | number, reason: string) =>
    privateClient.post<void>(`/api/v1/articles/${id}/reject`, { notes: reason }),
};

export const dashboardApi = {
  getStats: async () => {
    const response = await privateClient.get<any>('/api/v1/dashboard/');
    
    // Prioritize direct/flat format if pending_approvals exists
    if ('pending_approvals' in response) {
      return {
        total_flora: response.total_flora ?? response.stats?.flora?.total ?? 0,
        total_fauna: response.total_fauna ?? response.stats?.fauna?.total ?? 0,
        total_zones: response.total_zones ?? 0,
        total_users: response.total_users ?? response.stats?.users?.total ?? 0,
        total_observasi: response.total_observasi ?? 0,
        total_taman: response.total_taman ?? response.stats?.parks?.total ?? 0,
        pending_approvals: response.pending_approvals ?? 0,
        pending_approval: response.pending_approval ?? response.pending_approvals ?? 0,
        regional_breakdown: response.regional_breakdown ?? [],
        total_announcements: response.total_announcements ?? 0,
      } satisfies DashboardStats;
    } else if (response.stats) {
      // Fallback to nested format only if flat format not available
      const stats = response.stats;
      return {
        total_flora: stats.flora?.total ?? 0,
        total_fauna: stats.fauna?.total ?? 0,
        total_zones: 0,
        total_users: stats.users?.total ?? 0,
        total_observasi: 0,
        total_taman: stats.parks?.total ?? 0,
        pending_approvals: (stats.flora?.in_review ?? 0) + (stats.fauna?.in_review ?? 0) + (stats.articles?.in_review ?? 0) + (stats.galleries?.in_review ?? 0),
        pending_approval: (stats.flora?.in_review ?? 0) + (stats.fauna?.in_review ?? 0) + (stats.articles?.in_review ?? 0) + (stats.galleries?.in_review ?? 0),
        regional_breakdown: [],
        total_announcements: stats.galleries?.total ?? 0,
      } satisfies DashboardStats;
    } else {
      // Final fallback for empty response
      return {
        total_flora: 0,
        total_fauna: 0,
        total_zones: 0,
        total_users: 0,
        total_observasi: 0,
        total_taman: 0,
        pending_approvals: 0,
        pending_approval: 0,
        regional_breakdown: [],
        total_announcements: 0,
      } satisfies DashboardStats;
    }
  },
};

// Parks API
export interface Park {
  id: number;
  name: string;
  slug: string;
  status: string;
  area_ha: number | null;
  description: string | null;
  provinsi: string | null;
  kota_kabupaten: string | null;
  kecamatan: string | null;
  desa_kelurahan: string | null;
  sk_penetapan: string | null;
  pengelola: string | null;
  tipe_ekoregion: string | null;
  kondisi_fisik: string | null;
  nilai_penting: string | null;
  sejarah: string | null;
  visi: string | null;
  misi: string | null;
  nilai_dasar: string | null;
  created_at: string;
  updated_at: string;
  submitted_by?: number | null;
  submitted_at?: string | null;
  approved_by?: number | null;
  approved_at?: string | null;
  rejected_at?: string | null;
}

export interface ParkListResponse {
  items: Park[];
  total: number;
  limit: number;
  offset: number;
  has_next: boolean;
  has_prev: boolean;
}

export const parksApi = {
  list: async (params?: { search?: string; region?: string; limit?: number; offset?: number }) => {
    // Map frontend params to backend params
    const backendParams: any = {};
    if (params?.region) {
      // backendParams.region_id = parseInt(params.region);  // Removed - using user-based access control
    }
    if (params?.limit) {
      backendParams.limit = params.limit;
    }
    if (params?.offset) {
      backendParams.skip = params.offset;
    }
    
    const response = await privateClient.get<Park[]>('/api/v1/parks/', backendParams);
    return { items: response, total: response.length, limit: params?.limit || 100, offset: 0, has_next: false, has_prev: false };
  },
  
  getById: async (id: string | number) => {
    const response = await privateClient.get<Park>(`/api/public/parks/${id}`);
    return response;
  },

  create: async (data: { 
    name: string; 
    slug: string;
    sk_penetapan?: string;
    pengelola?: string;
    area_ha?: number | null;
    kondisi_fisik?: string;
    nilai_penting?: string;
    tipe_ekoregion?: string;
    description: string; 
    sejarah?: string;
    visi?: string;
    misi?: string;
    nilai_dasar?: string;
    provinsi?: string;
    kota_kabupaten?: string;
    kecamatan?: string;
    desa_kelurahan?: string;
    status: string 
  }) => {
    const response = await privateClient.post<Park>('/api/v1/parks/', data);
    return response;
  },

  update: async (id: string | number, data: {
    name?: string;
    slug?: string;
    sk_penetapan?: string;
    pengelola?: string;
    area_ha?: number | null;
    kondisi_fisik?: string;
    nilai_penting?: string;
    tipe_ekoregion?: string;
    description?: string;
    sejarah?: string;
    visi?: string;
    misi?: string;
    nilai_dasar?: string;
    provinsi?: string;
    kota_kabupaten?: string;
    kecamatan?: string;
    desa_kelurahan?: string;
    status?: string; // Add status field
  }) => {
    const response = await privateClient.put<Park>(`/api/v1/parks/${id}`, data);
    return response;
  },
  
  getStats: async (id: string | number) => {
    const response = await privateClient.get<any>(`/api/public/parks/${id}/stats`);
    return response;
  },
  
  uploadShapefile: async (variables: { file: File; name_field?: string; simplify_tolerance?: number }) => {
    const formData = new FormData();
    formData.append('file', variables.file);
    if (variables.name_field) formData.append('name_field', variables.name_field);
    if (variables.simplify_tolerance !== undefined) formData.append('simplify_tolerance', String(variables.simplify_tolerance));
    const response = await privateClient.post<any>(
      `/api/v1/parks/upload-shapefile`,
      formData
    );
    return response;
  },
};

// Zones API removed - zones functionality removed

// Regions API
export interface Region {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Regions API removed - using park-based scoping instead

export const activitiesApi = {
  list: async (params?: { search?: string; park_id?: number; status?: WorkflowStatus; limit?: number; offset?: number }) => {
    const query: Record<string, unknown> = { ...params };
    if (params?.status) {
      query.status_filter = params.status;
      delete query.status;
    }
    if (params?.search) {
      query.q = params.search;
      delete query.search;
    }
    const response = await privateClient.get<PaginatedResponse<ActivityAdminResponse>>('/api/v1/activities/', query);
    return toPaginated(response, mapActivity);
  },

  getById: async (id: string | number) => {
    const response = await privateClient.get<ActivityAdminResponse>(`/api/v1/activities/${id}`);
    return mapActivity(response);
  },

  create: async (payload: Partial<Activity>) => {
    const response = await privateClient.post<ActivityAdminResponse>('/api/v1/activities/', {
      park_id: payload.park_id,
      title: payload.title,
      description: payload.description,
      activity_date: payload.activity_date,
      location: payload.location,
    });
    return mapActivity(response);
  },

  update: async (id: string | number, payload: Partial<Activity>) => {
    const response = await privateClient.put<ActivityAdminResponse>(`/api/v1/activities/${id}`, {
      park_id: payload.park_id,
      title: payload.title,
      description: payload.description,
      activity_date: payload.activity_date,
      location: payload.location,
    });
    return mapActivity(response);
  },

  delete: async (id: string | number) => {
    await privateClient.delete(`/api/v1/activities/${id}`);
    return true;
  },
  
  submit: async (id: string | number) => {
    const response = await privateClient.post<ActivityAdminResponse>(`/api/v1/activities/${id}/submit`);
    return mapActivity(response);
  },
  
  approve: async (id: string | number) => {
    const response = await privateClient.post<ActivityAdminResponse>(`/api/v1/activities/${id}/approve`);
    return mapActivity(response);
  },
  
  reject: async (id: string | number, reason: string) => {
    const response = await privateClient.post<ActivityAdminResponse>(`/api/v1/activities/${id}/reject`, { reason });
    return mapActivity(response);
  }
};

export interface ParkGroupItem {
  entityType: 'flora' | 'fauna' | 'artikel' | 'galeri' | 'kegiatan';
  entityId: number;
  title: string;
  status: string;
  submittedAt?: string | null;
  updatedAt?: string | null;
  thumbnailUrl?: string | null;
}

export interface ParkGroup {
  parkId: number;
  parkName: string;
  items: ParkGroupItem[];
  totalItems: number;
  floraCount: number;
  faunaCount: number;
  artikelCount: number;
  galeriCount: number;
  kegiatanCount: number;
}

export interface GroupedApprovalsResponse {
  groups: ParkGroup[];
  totalParks: number;
  totalItems: number;
}

export const approvalsApi = {
  list: async (params?: { entity_type?: ApprovalEntityType; limit?: number }) => {
    const response = await privateClient.get<ApprovalListResponse>('/api/v1/approvals/', params);
    return {
      items: response.items.map((item) => ({
        entityType: item.entity_type,
        entityId: item.entity_id,
        title: item.title,
        status: item.status,
        submittedAt: item.submitted_at ?? null,
        updatedAt: item.updated_at ?? null,
        // regionCode: item.metadata?.region_code ?? null,  // Removed - using user-based access control
        submittedBy: item.metadata?.submitted_by ?? null,
        approvedBy: item.metadata?.approved_by ?? null,
        thumbnailUrl: item.thumbnail_url ?? null,
      })) satisfies ApprovalQueueItem[],
      total: response.total,
      counts: response.counts,
      hasNext: response.has_next,
    };
  },
  
  // Get approvals grouped by park
  listGrouped: async (): Promise<GroupedApprovalsResponse> => {
    const response = await privateClient.get<{
      groups: Array<{
        park_id: number;
        park_name: string;
        items: Array<{
          entity_type: string;
          entity_id: number;
          title: string;
          status: string;
          submitted_at?: string | null;
          updated_at?: string | null;
          thumbnail_url?: string | null;
        }>;
        total_items: number;
        flora_count: number;
        fauna_count: number;
        artikel_count: number;
        galeri_count: number;
        kegiatan_count: number;
      }>;
      total_parks: number;
      total_items: number;
    }>('/api/v1/approvals/grouped');
    
    return {
      groups: response.groups.map(g => ({
        parkId: g.park_id,
        parkName: g.park_name,
        items: g.items.map(item => ({
          entityType: item.entity_type as any,
          entityId: item.entity_id,
          title: item.title,
          status: item.status,
          submittedAt: item.submitted_at ?? null,
          updatedAt: item.updated_at ?? null,
          thumbnailUrl: item.thumbnail_url ?? null,
        })),
        totalItems: g.total_items,
        floraCount: g.flora_count,
        faunaCount: g.fauna_count,
        artikelCount: g.artikel_count,
        galeriCount: g.galeri_count,
        kegiatanCount: g.kegiatan_count,
      })),
      totalParks: response.total_parks,
      totalItems: response.total_items,
    };
  },
  
  // Bulk approve all items from a park
  bulkApprove: async (parkId: number, entityTypes?: Array<'flora' | 'fauna' | 'kegiatan'>) => {
    const response = await privateClient.post<{
      approved_count: number;
      failed_count: number;
      details: Record<string, number>;
    }>('/api/v1/approvals/bulk-approve', {
      park_id: parkId,
      entity_types: entityTypes ?? null,
    });
    
    return {
      approvedCount: response.approved_count,
      failedCount: response.failed_count,
      details: response.details,
    };
  },
};

export const authStorage = {
  saveToken(token: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  },
  clearToken() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  },
  saveEmail(email: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(AUTH_EMAIL_KEY, email);
  },
  clearEmail() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(AUTH_EMAIL_KEY);
  },
  readEmail(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(AUTH_EMAIL_KEY);
  },
  saveUser(user: User) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  },
  clearUser() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(AUTH_USER_KEY);
  },
  readUser(): User | null {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },
};

export const parksApprovalApi = {
  listPending: async () => {
    const response = await privateClient.get<Park[]>('/api/v1/parks/pending-approval');
    return response;
  },
  
  approve: async (parkId: number) => {
    const response = await privateClient.post<{ message: string; id: number; name: string; status: string; approved_by: number; approved_at: string }>(`/api/v1/parks/${parkId}/approve`);
    return response;
  },

  reject: async (parkId: number, reason?: string) => {
    const response = await privateClient.post<{ message: string; id: number; name: string; status: string; rejected_by: number; rejected_at: string }>(`/api/v1/parks/${parkId}/reject`, {
      rejection_reason: reason
    });
    return response;
  },
};

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  resource?: string | null;
  resource_id?: number | null;
  region_code?: string | null;
  is_read: boolean;
  created_at: string;
  from_user_id?: number | null;
}

export interface NotificationListResponse {
  items: Notification[];
  total: number;
  limit: number;
  offset: number;
  has_next: boolean;
  has_prev: boolean;
}

export const notificationsApi = {
  list: async (params?: { limit?: number; offset?: number; unread_only?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    if (params?.unread_only) queryParams.set('unread_only', 'true');
    
    const response = await privateClient.get<NotificationListResponse>(
      `/api/v1/notifications/?${queryParams.toString()}`
    );
    return response;
  },

  get: async (notificationId: number) => {
    const response = await privateClient.get<Notification>(
      `/api/v1/notifications/${notificationId}`
    );
    return response;
  },

  markAsRead: async (notificationId: number) => {
    await privateClient.post(`/api/v1/notifications/${notificationId}/read`);
  },

  markAllAsRead: async () => {
    await privateClient.post('/api/v1/notifications/mark-all-read');
  },

  getUnreadCount: async () => {
    const response = await privateClient.get<{ count: number }>(
      '/api/v1/notifications/unread-count'
    );
    return response;
  },
};

// Alias for backward compatibility
export const tamanApi = parksApi;
