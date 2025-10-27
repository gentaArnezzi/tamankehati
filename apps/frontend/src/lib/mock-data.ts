// Mock data service for frontend development
export interface MockFlora {
  id: string;
  nama_ilmiah: string;
  nama_umum: string;
  famili: string;
  status_iucn: string;
  deskripsi: string;
  habitat: string;
  wilayah: string;
  gambar_utama: string;
  status: string;
}

export interface MockFauna {
  id: string;
  nama_ilmiah: string;
  nama_umum: string;
  famili: string;
  status_iucn: string;
  deskripsi: string;
  habitat: string;
  wilayah: string;
  gambar_utama: string;
  status: string;
}

export interface MockStats {
  total_flora: number;
  total_fauna: number;
  total_taman: number;
  total_artikel: number;
}

// Mock Flora Data
export const mockFloraData: MockFlora[] = [
  {
    id: "1",
    nama_ilmiah: "Tectona grandis",
    nama_umum: "Pohon Jati",
    famili: "Lamiaceae",
    status_iucn: "LC",
    deskripsi: "Pohon jati yang terkenal dengan kayunya yang kuat dan tahan lama. Kayu jati sangat dihargai untuk furnitur dan konstruksi.",
    habitat: "Hutan tropis, hutan sekunder",
    wilayah: "Jawa, Bali, Nusa Tenggara",
    gambar_utama: "/images/jati.jpg",
    status: "approved"
  },
  {
    id: "2",
    nama_ilmiah: "Swietenia mahagoni",
    nama_umum: "Pohon Mahoni",
    famili: "Meliaceae",
    status_iucn: "VU",
    deskripsi: "Pohon mahoni dengan kayu berkualitas tinggi. Kayu mahoni digunakan untuk furnitur mewah dan instrumen musik.",
    habitat: "Hutan tropis dataran rendah",
    wilayah: "Sumatra, Kalimantan, Sulawesi",
    gambar_utama: "/images/mahoni.jpg",
    status: "approved"
  },
  {
    id: "3",
    nama_ilmiah: "Albizia chinensis",
    nama_umum: "Pohon Sengon",
    famili: "Fabaceae",
    status_iucn: "LC",
    deskripsi: "Pohon sengon yang cepat tumbuh dan sering digunakan untuk reboisasi. Kayunya digunakan untuk pulp dan kertas.",
    habitat: "Hutan sekunder, lahan terbuka",
    wilayah: "Jawa, Sumatra, Kalimantan",
    gambar_utama: "/images/sengon.jpg",
    status: "approved"
  },
  {
    id: "4",
    nama_ilmiah: "Dipterocarpus grandiflorus",
    nama_umum: "Meranti Merah",
    famili: "Dipterocarpaceae",
    status_iucn: "EN",
    deskripsi: "Pohon meranti yang merupakan spesies endemik hutan tropis. Kayunya sangat berharga untuk konstruksi.",
    habitat: "Hutan tropis primer",
    wilayah: "Sumatra, Kalimantan",
    gambar_utama: "/images/meranti.jpg",
    status: "approved"
  },
  {
    id: "5",
    nama_ilmiah: "Shorea leprosula",
    nama_umum: "Meranti Putih",
    famili: "Dipterocarpaceae",
    status_iucn: "VU",
    deskripsi: "Pohon meranti putih yang tumbuh di hutan tropis. Kayunya digunakan untuk konstruksi dan furnitur.",
    habitat: "Hutan tropis dataran rendah",
    wilayah: "Sumatra, Kalimantan, Sulawesi",
    gambar_utama: "/images/meranti-putih.jpg",
    status: "approved"
  }
];

// Mock Fauna Data
export const mockFaunaData: MockFauna[] = [
  {
    id: "1",
    nama_ilmiah: "Panthera tigris sumatrae",
    nama_umum: "Harimau Sumatera",
    famili: "Felidae",
    status_iucn: "CR",
    deskripsi: "Harimau endemik Sumatera yang terancam punah. Merupakan subspesies harimau terkecil di dunia.",
    habitat: "Hutan tropis, rawa gambut",
    wilayah: "Sumatra",
    gambar_utama: "/images/harimau-sumatera.jpg",
    status: "approved"
  },
  {
    id: "2",
    nama_ilmiah: "Elephas maximus",
    nama_umum: "Gajah Sumatera",
    famili: "Elephantidae",
    status_iucn: "EN",
    deskripsi: "Gajah Asia yang hidup di hutan Sumatera. Populasinya terus menurun akibat hilangnya habitat.",
    habitat: "Hutan tropis, rawa gambut",
    wilayah: "Sumatra",
    gambar_utama: "/images/gajah-sumatera.jpg",
    status: "approved"
  },
  {
    id: "3",
    nama_ilmiah: "Pongo abelii",
    nama_umum: "Orangutan Sumatera",
    famili: "Hominidae",
    status_iucn: "CR",
    deskripsi: "Orangutan endemik Sumatera yang terancam punah. Merupakan salah satu kera besar yang paling terancam.",
    habitat: "Hutan tropis dataran rendah",
    wilayah: "Sumatra",
    gambar_utama: "/images/orangutan.jpg",
    status: "approved"
  },
  {
    id: "4",
    nama_ilmiah: "Rhinoceros sondaicus",
    nama_umum: "Badak Jawa",
    famili: "Rhinocerotidae",
    status_iucn: "CR",
    deskripsi: "Badak Jawa yang merupakan mamalia terlangka di dunia. Hanya tersisa di Taman Nasional Ujung Kulon.",
    habitat: "Hutan tropis dataran rendah",
    wilayah: "Jawa",
    gambar_utama: "/images/badak-jawa.jpg",
    status: "approved"
  }
];

// Mock Stats Data
export const mockStatsData: MockStats = {
  total_flora: 5,
  total_fauna: 4,
  total_taman: 8,
  total_artikel: 12
};

// Mock API functions
export const mockApi = {
  getFlora: async (params?: {
    search?: string;
    wilayah?: string;
    status_iucn?: string;
    limit?: number;
    offset?: number;
  }) => {
    let filteredData = [...mockFloraData];
    
    // Apply search filter
    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredData = filteredData.filter(item =>
        item.nama_umum.toLowerCase().includes(search) ||
        item.nama_ilmiah.toLowerCase().includes(search) ||
        item.famili.toLowerCase().includes(search)
      );
    }
    
    // Apply IUCN status filter
    if (params?.status_iucn) {
      filteredData = filteredData.filter(item => item.status_iucn === params.status_iucn);
    }
    
    // Apply wilayah filter
    if (params?.wilayah) {
      filteredData = filteredData.filter(item => 
        item.wilayah.toLowerCase().includes(params.wilayah!.toLowerCase())
      );
    }
    
    const total = filteredData.length;
    const limit = params?.limit || 10;
    const offset = params?.offset || 0;
    
    // Apply pagination
    const items = filteredData.slice(offset, offset + limit);
    
    return {
      items,
      total,
      limit,
      offset,
      has_next: offset + limit < total,
      has_prev: offset > 0
    };
  },
  
  getFloraById: async (id: string) => {
    const item = mockFloraData.find(item => item.id === id);
    if (!item) {
      throw new Error("Flora not found");
    }
    return item;
  },
  
  getFauna: async (params?: {
    search?: string;
    wilayah?: string;
    status_iucn?: string;
    limit?: number;
    offset?: number;
  }) => {
    let filteredData = [...mockFaunaData];
    
    // Apply search filter
    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredData = filteredData.filter(item =>
        item.nama_umum.toLowerCase().includes(search) ||
        item.nama_ilmiah.toLowerCase().includes(search) ||
        item.famili.toLowerCase().includes(search)
      );
    }
    
    // Apply IUCN status filter
    if (params?.status_iucn) {
      filteredData = filteredData.filter(item => item.status_iucn === params.status_iucn);
    }
    
    // Apply wilayah filter
    if (params?.wilayah) {
      filteredData = filteredData.filter(item => 
        item.wilayah.toLowerCase().includes(params.wilayah!.toLowerCase())
      );
    }
    
    const total = filteredData.length;
    const limit = params?.limit || 10;
    const offset = params?.offset || 0;
    
    // Apply pagination
    const items = filteredData.slice(offset, offset + limit);
    
    return {
      items,
      total,
      limit,
      offset,
      has_next: offset + limit < total,
      has_prev: offset > 0
    };
  },
  
  getFaunaById: async (id: string) => {
    const item = mockFaunaData.find(item => item.id === id);
    if (!item) {
      throw new Error("Fauna not found");
    }
    return item;
  },
  
  getStats: async () => {
    return mockStatsData;
  }
};
