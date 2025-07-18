// Database Models TypeScript Interfaces

export interface DesaSettings {
  id: number;
  nama_desa: string;
  slogan: string;
  alamat: string;
  logo: string;
  hero_image: string;
  primary_color: string;
  secondary_color: string;
  deskripsi: string;
  created_at: Date;
  updated_at: Date;
}

export interface News {
  id: number;
  judul: string;
  slug: string;
  konten: string;
  gambar: string;
  tanggal: Date;
  penulis: string;
  status: 'published' | 'draft';
  created_at: Date;
  updated_at: Date;
}

export interface Gallery {
  id: number;
  judul: string;
  deskripsi: string;
  gambar: string;
  kategori: string;
  tanggal: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Event {
  id: number;
  judul: string;
  deskripsi: string;
  tanggal: Date;
  lokasi: string;
  gambar: string;
  created_at: Date;
  updated_at: Date;
}

export interface Organization {
  id: number;
  nama: string;
  jabatan: string;
  foto: string;
  urutan: number;
  created_at: Date;
  updated_at: Date;
}

export interface Service {
  id: number;
  nama: string;
  deskripsi: string;
  persyaratan: string;
  template_dokumen: string;
  created_at: Date;
  updated_at: Date;
}

export interface ServiceSubmission {
  id: number;
  layanan_id: number;
  nomor_pengajuan: string;
  nama: string;
  nik: string;
  file_pendukung: string;
  status: 'pending' | 'diproses' | 'selesai' | 'ditolak';
  catatan: string;
  created_at: Date;
  updated_at: Date;
}

export interface Document {
  id: number;
  judul: string;
  deskripsi: string;
  file_path: string;
  kategori: string;
  ukuran: number;
  created_at: Date;
  updated_at: Date;
}

export interface Admin {
  id: number;
  nama: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface NewsForm {
  judul: string;
  konten: string;
  gambar: FileList | null;
  status: 'published' | 'draft';
}

export interface ServiceSubmissionForm {
  layanan_id: number;
  nama: string;
  nik: string;
  file_pendukung: FileList | null;
}

export interface ContactForm {
  nama: string;
  email: string;
  subjek: string;
  pesan: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}