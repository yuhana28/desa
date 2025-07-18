import { 
  DesaSettings, News, Gallery, Event, Organization, Service, 
  ServiceSubmission, Document, Admin, ApiResponse, PaginatedResponse 
} from '../types';

// API Base URL - should be configured based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to make API requests
const apiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('auth_token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Desa Settings Service
export const getDesaSettings = async (): Promise<DesaSettings> => {
  try {
    // Mock data for local development
    return {
      id: 1,
      nama_desa: 'Desa Maju Sejahtera',
      slogan: 'Menuju Desa Modern dan Sejahtera',
      alamat: 'Jl. Desa Maju No. 123, Kecamatan Sejahtera, Kabupaten Makmur, Provinsi Jaya 12345',
      logo: '/assets/logo-desa.png',
      hero_image: '/assets/hero-village.jpg',
      primary_color: '#3B82F6',
      secondary_color: '#10B981',
      deskripsi: 'Desa Maju Sejahtera adalah desa yang terletak di kawasan strategis dengan potensi alam yang melimpah. Desa ini memiliki sejarah panjang dan kaya akan budaya lokal yang masih dilestarikan hingga saat ini.',
      created_at: new Date(),
      updated_at: new Date()
    };
  } catch (error) {
    console.error('Error fetching desa settings:', error);
    // Return default settings if API fails
    return {
      id: 0,
      nama_desa: 'Desa Digital',
      slogan: 'Menuju Desa Modern dan Sejahtera',
      alamat: 'Alamat Desa',
      logo: '',
      hero_image: '',
      primary_color: '#3B82F6',
      secondary_color: '#10B981',
      deskripsi: 'Deskripsi desa',
      created_at: new Date(),
      updated_at: new Date()
    };
  }
};

export const updateDesaSettings = async (settings: Partial<DesaSettings>): Promise<ApiResponse<DesaSettings>> => {
  try {
    return await apiRequest<ApiResponse<DesaSettings>>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  } catch (error) {
    console.error('Error updating desa settings:', error);
    return { success: false, message: 'Failed to update settings' };
  }
};

// News Service
export const getNews = async (page: number = 1, limit: number = 10, status: string = 'published'): Promise<PaginatedResponse<News>> => {
  try {
    // Mock data for local development
    const mockNews: News[] = [
      {
        id: 1,
        judul: 'Pembangunan Jalan Desa Selesai',
        slug: 'pembangunan-jalan-desa-selesai',
        konten: '<p>Alhamdulillah, pembangunan jalan desa sepanjang 2 km telah selesai dilaksanakan. Proyek ini menggunakan dana desa tahun 2024 dengan total anggaran Rp 500 juta.</p><p>Jalan ini menghubungkan dusun 1 dan dusun 2 yang selama ini kondisinya rusak parah. Dengan selesainya pembangunan ini, diharapkan dapat memperlancar akses masyarakat dan mendukung kegiatan ekonomi desa.</p>',
        gambar: '/assets/news/jalan-desa.jpg',
        tanggal: new Date('2024-01-15'),
        penulis: 'Admin Desa',
        status: 'published',
        created_at: new Date('2024-01-15'),
        updated_at: new Date('2024-01-15')
      },
      {
        id: 2,
        judul: 'Musyawarah Desa Bahas APBDesa 2024',
        slug: 'musyawarah-desa-bahas-apbdesa-2024',
        konten: '<p>Musyawarah Desa (Musdes) untuk membahas APBDesa tahun 2024 telah dilaksanakan pada hari Sabtu, 10 Februari 2024 di Balai Desa.</p><p>Musdes dihadiri oleh perwakilan RT/RW, tokoh masyarakat, dan berbagai elemen masyarakat. Dalam musdes ini dibahas prioritas pembangunan desa untuk tahun 2024.</p>',
        gambar: '/assets/news/musdes.jpg',
        tanggal: new Date('2024-02-10'),
        penulis: 'Sekretaris Desa',
        status: 'published',
        created_at: new Date('2024-02-10'),
        updated_at: new Date('2024-02-10')
      },
      {
        id: 3,
        judul: 'Pelatihan UMKM untuk Ibu-Ibu PKK',
        slug: 'pelatihan-umkm-untuk-ibu-ibu-pkk',
        konten: '<p>Desa mengadakan pelatihan UMKM untuk meningkatkan keterampilan ibu-ibu PKK dalam berwirausaha. Pelatihan ini bekerjasama dengan Dinas Koperasi dan UMKM Kabupaten.</p><p>Materi pelatihan meliputi pengelolaan keuangan, pemasaran online, dan pengembangan produk. Diharapkan setelah pelatihan, ibu-ibu dapat mengembangkan usaha mandiri.</p>',
        gambar: '/assets/news/pelatihan-umkm.jpg',
        tanggal: new Date('2024-02-20'),
        penulis: 'Admin Desa',
        status: 'published',
        created_at: new Date('2024-02-20'),
        updated_at: new Date('2024-02-20')
      }
    ];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = mockNews.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      total: mockNews.length,
      page,
      limit,
      totalPages: Math.ceil(mockNews.length / limit)
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    return {
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 0
    };
  }
};

export const getNewsBySlug = async (slug: string): Promise<News | null> => {
  try {
    // Mock data for local development
    const mockNews: News[] = [
      {
        id: 1,
        judul: 'Pembangunan Jalan Desa Selesai',
        slug: 'pembangunan-jalan-desa-selesai',
        konten: '<p>Alhamdulillah, pembangunan jalan desa sepanjang 2 km telah selesai dilaksanakan. Proyek ini menggunakan dana desa tahun 2024 dengan total anggaran Rp 500 juta.</p><p>Jalan ini menghubungkan dusun 1 dan dusun 2 yang selama ini kondisinya rusak parah. Dengan selesainya pembangunan ini, diharapkan dapat memperlancar akses masyarakat dan mendukung kegiatan ekonomi desa.</p>',
        gambar: '/assets/news/jalan-desa.jpg',
        tanggal: new Date('2024-01-15'),
        penulis: 'Admin Desa',
        status: 'published',
        created_at: new Date('2024-01-15'),
        updated_at: new Date('2024-01-15')
      },
      {
        id: 2,
        judul: 'Musyawarah Desa Bahas APBDesa 2024',
        slug: 'musyawarah-desa-bahas-apbdesa-2024',
        konten: '<p>Musyawarah Desa (Musdes) untuk membahas APBDesa tahun 2024 telah dilaksanakan pada hari Sabtu, 10 Februari 2024 di Balai Desa.</p><p>Musdes dihadiri oleh perwakilan RT/RW, tokoh masyarakat, dan berbagai elemen masyarakat. Dalam musdes ini dibahas prioritas pembangunan desa untuk tahun 2024.</p>',
        gambar: '/assets/news/musdes.jpg',
        tanggal: new Date('2024-02-10'),
        penulis: 'Sekretaris Desa',
        status: 'published',
        created_at: new Date('2024-02-10'),
        updated_at: new Date('2024-02-10')
      },
      {
        id: 3,
        judul: 'Pelatihan UMKM untuk Ibu-Ibu PKK',
        slug: 'pelatihan-umkm-untuk-ibu-ibu-pkk',
        konten: '<p>Desa mengadakan pelatihan UMKM untuk meningkatkan keterampilan ibu-ibu PKK dalam berwirausaha. Pelatihan ini bekerjasama dengan Dinas Koperasi dan UMKM Kabupaten.</p><p>Materi pelatihan meliputi pengelolaan keuangan, pemasaran online, dan pengembangan produk. Diharapkan setelah pelatihan, ibu-ibu dapat mengembangkan usaha mandiri.</p>',
        gambar: '/assets/news/pelatihan-umkm.jpg',
        tanggal: new Date('2024-02-20'),
        penulis: 'Admin Desa',
        status: 'published',
        created_at: new Date('2024-02-20'),
        updated_at: new Date('2024-02-20')
      }
    ];

    return mockNews.find(news => news.slug === slug) || null;
  } catch (error) {
    console.error('Error fetching news by slug:', error);
    return null;
  }
};

export const createNews = async (newsData: Partial<News>): Promise<ApiResponse<News>> => {
  try {
    return await apiRequest<ApiResponse<News>>('/news', {
      method: 'POST',
      body: JSON.stringify(newsData),
    });
  } catch (error) {
    console.error('Error creating news:', error);
    return { success: false, message: 'Failed to create news' };
  }
};

export const updateNews = async (id: number, newsData: Partial<News>): Promise<ApiResponse<News>> => {
  try {
    return await apiRequest<ApiResponse<News>>(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(newsData),
    });
  } catch (error) {
    console.error('Error updating news:', error);
    return { success: false, message: 'Failed to update news' };
  }
};

export const deleteNews = async (id: number): Promise<ApiResponse<boolean>> => {
  try {
    return await apiRequest<ApiResponse<boolean>>(`/news/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    return { success: false, message: 'Failed to delete news' };
  }
};

// Gallery Service
export const getGalleries = async (kategori?: string): Promise<Gallery[]> => {
  try {
    // Mock data for local development
    const mockGalleries: Gallery[] = [
      {
        id: 1,
        judul: 'Kegiatan Gotong Royong',
        deskripsi: 'Masyarakat bergotong royong membersihkan lingkungan desa',
        gambar: '/assets/gallery/gotong-royong.jpg',
        kategori: 'Kegiatan',
        tanggal: new Date('2024-01-20'),
        created_at: new Date('2024-01-20'),
        updated_at: new Date('2024-01-20')
      },
      {
        id: 2,
        judul: 'Pemandangan Sawah',
        deskripsi: 'Hamparan sawah hijau yang indah di desa',
        gambar: '/assets/gallery/sawah.jpg',
        kategori: 'Pemandangan',
        tanggal: new Date('2024-01-25'),
        created_at: new Date('2024-01-25'),
        updated_at: new Date('2024-01-25')
      },
      {
        id: 3,
        judul: 'Balai Desa',
        deskripsi: 'Gedung balai desa yang baru direnovasi',
        gambar: '/assets/gallery/balai-desa.jpg',
        kategori: 'Infrastruktur',
        tanggal: new Date('2024-02-01'),
        created_at: new Date('2024-02-01'),
        updated_at: new Date('2024-02-01')
      }
    ];

    return kategori ? mockGalleries.filter(item => item.kategori === kategori) : mockGalleries;
  } catch (error) {
    console.error('Error fetching galleries:', error);
    return [];
  }
};

export const createGallery = async (galleryData: Partial<Gallery>): Promise<ApiResponse<Gallery>> => {
  try {
    return await apiRequest<ApiResponse<Gallery>>('/galleries', {
      method: 'POST',
      body: JSON.stringify(galleryData),
    });
  } catch (error) {
    console.error('Error creating gallery:', error);
    return { success: false, message: 'Failed to create gallery item' };
  }
};

// Events Service
export const getEvents = async (): Promise<Event[]> => {
  try {
    // Mock data for local development
    return [
      {
        id: 1,
        judul: 'Rapat Koordinasi BPD',
        deskripsi: 'Rapat koordinasi antara BPD dan perangkat desa',
        tanggal: new Date('2024-03-15 09:00:00'),
        lokasi: 'Balai Desa',
        gambar: '/assets/events/rapat-bpd.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        judul: 'Senam Sehat Bersama',
        deskripsi: 'Kegiatan senam sehat untuk semua warga',
        tanggal: new Date('2024-03-20 06:30:00'),
        lokasi: 'Lapangan Desa',
        gambar: '/assets/events/senam.jpg',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const createEvent = async (eventData: Partial<Event>): Promise<ApiResponse<Event>> => {
  try {
    return await apiRequest<ApiResponse<Event>>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return { success: false, message: 'Failed to create event' };
  }
};

// Organization Service
export const getOrganization = async (): Promise<Organization[]> => {
  try {
    // Mock data for local development
    return [
      {
        id: 1,
        nama: 'Budi Santoso',
        jabatan: 'Kepala Desa',
        foto: '/assets/organization/kepala-desa.jpg',
        urutan: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        nama: 'Siti Aminah',
        jabatan: 'Sekretaris Desa',
        foto: '/assets/organization/sekretaris.jpg',
        urutan: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        nama: 'Ahmad Wijaya',
        jabatan: 'Bendahara Desa',
        foto: '/assets/organization/bendahara.jpg',
        urutan: 3,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
  } catch (error) {
    console.error('Error fetching organization:', error);
    return [];
  }
};

export const createOrganization = async (orgData: Partial<Organization>): Promise<ApiResponse<Organization>> => {
  try {
    return await apiRequest<ApiResponse<Organization>>('/organization', {
      method: 'POST',
      body: JSON.stringify(orgData),
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return { success: false, message: 'Failed to create organization member' };
  }
};

// Services
export const getServices = async (): Promise<Service[]> => {
  try {
    // Mock data for local development
    return [
      {
        id: 1,
        nama: 'Surat Keterangan Tidak Mampu',
        deskripsi: 'Surat keterangan untuk warga yang tidak mampu secara ekonomi',
        persyaratan: 'KTP, KK, Surat Pernyataan Tidak Mampu',
        template_dokumen: '/assets/templates/sktm-template.pdf',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        nama: 'Surat Keterangan Domisili',
        deskripsi: 'Surat keterangan tempat tinggal/domisili',
        persyaratan: 'KTP, KK, Surat Pernyataan Domisili',
        template_dokumen: '/assets/templates/domisili-template.pdf',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
};

export const createService = async (serviceData: Partial<Service>): Promise<ApiResponse<Service>> => {
  try {
    return await apiRequest<ApiResponse<Service>>('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  } catch (error) {
    console.error('Error creating service:', error);
    return { success: false, message: 'Failed to create service' };
  }
};

// Service Submissions
export const createServiceSubmission = async (submissionData: Partial<ServiceSubmission>): Promise<ApiResponse<ServiceSubmission>> => {
  try {
    // Mock successful submission
    const mockSubmission: ServiceSubmission = {
      id: Date.now(),
      layanan_id: submissionData.layanan_id || 0,
      nomor_pengajuan: `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      nama: submissionData.nama || '',
      nik: submissionData.nik || '',
      file_pendukung: submissionData.file_pendukung || '',
      status: 'pending',
      catatan: '',
      created_at: new Date(),
      updated_at: new Date()
    };

    return {
      success: true,
      data: mockSubmission,
      message: 'Pengajuan berhasil disubmit'
    };
  } catch (error) {
    console.error('Error creating service submission:', error);
    return { success: false, message: 'Failed to create service submission' };
  }
};

export const getServiceSubmissions = async (): Promise<ServiceSubmission[]> => {
  try {
    return await apiRequest<ServiceSubmission[]>('/service-submissions');
  } catch (error) {
    console.error('Error fetching service submissions:', error);
    return [];
  }
};

export const updateServiceSubmissionStatus = async (id: number, status: string, catatan?: string): Promise<ApiResponse<boolean>> => {
  try {
    return await apiRequest<ApiResponse<boolean>>(`/service-submissions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, catatan }),
    });
  } catch (error) {
    console.error('Error updating submission status:', error);
    return { success: false, message: 'Failed to update submission status' };
  }
};

// Documents Service
export const getDocuments = async (kategori?: string): Promise<Document[]> => {
  try {
    const params = kategori ? `?kategori=${encodeURIComponent(kategori)}` : '';
    return await apiRequest<Document[]>(`/documents${params}`);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

export const createDocument = async (documentData: Partial<Document>): Promise<ApiResponse<Document>> => {
  try {
    return await apiRequest<ApiResponse<Document>>('/documents', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  } catch (error) {
    console.error('Error creating document:', error);
    return { success: false, message: 'Failed to create document' };
  }
};

// Auth Service
export const login = async (email: string, password: string): Promise<ApiResponse<{ admin: Admin; token: string }>> => {
  try {
    // Mock login for demo
    if (email === 'admin@desa.go.id' && password === 'admin123') {
      const mockAdmin: Admin = {
        id: 1,
        nama: 'Administrator',
        email: 'admin@desa.go.id',
        password: '',
        created_at: new Date(),
        updated_at: new Date()
      };

      const token = btoa(JSON.stringify({ id: 1, email, timestamp: Date.now() }));
      localStorage.setItem('auth_token', token);

      return {
        success: true,
        data: { admin: mockAdmin, token },
        message: 'Login berhasil'
      };
    } else {
      return {
        success: false,
        message: 'Email atau password salah'
      };
    }
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, message: 'Login failed' };
  }
};

export const createAdmin = async (adminData: Partial<Admin>): Promise<ApiResponse<Admin>> => {
  try {
    return await apiRequest<ApiResponse<Admin>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return { success: false, message: 'Failed to create admin' };
  }
};

// Statistics Service
export const getStatistics = async () => {
  try {
    // Mock statistics
    return {
      news: 3,
      gallery: 6,
      events: 4,
      submissions: 3,
      documents: 4,
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return {
      news: 0,
      gallery: 0,
      events: 0,
      submissions: 0,
      documents: 0,
    };
  }
};