import { 
  DesaSettings, News, Gallery, Event, Organization, Service, 
  ServiceSubmission, Document, Admin, ApiResponse, PaginatedResponse 
} from '../types';
import { generateSlug, generateSubmissionNumber } from '../utils/fileUpload';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Desa Settings Service
export const getDesaSettings = async (): Promise<DesaSettings> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM desa_settings ORDER BY id DESC LIMIT 1'
    );
    
    if (rows.length === 0) {
      // Return default settings if none exist
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
    
    return rows[0] as DesaSettings;
  } catch (error) {
    console.error('Error fetching desa settings:', error);
    throw error;
  }
};

export const updateDesaSettings = async (settings: Partial<DesaSettings>): Promise<ApiResponse<DesaSettings>> => {
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE desa_settings SET 
       nama_desa = COALESCE(?, nama_desa),
       slogan = COALESCE(?, slogan),
       alamat = COALESCE(?, alamat),
       logo = COALESCE(?, logo),
       hero_image = COALESCE(?, hero_image),
       primary_color = COALESCE(?, primary_color),
       secondary_color = COALESCE(?, secondary_color),
       deskripsi = COALESCE(?, deskripsi),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`,
      [
        settings.nama_desa, settings.slogan, settings.alamat,
        settings.logo, settings.hero_image, settings.primary_color,
        settings.secondary_color, settings.deskripsi
      ]
    );

    if (result.affectedRows === 0) {
      // Insert if no settings exist
      await pool.execute(
        `INSERT INTO desa_settings (nama_desa, slogan, alamat, logo, hero_image, primary_color, secondary_color, deskripsi)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          settings.nama_desa || 'Desa Digital',
          settings.slogan || '',
          settings.alamat || '',
          settings.logo || '',
          settings.hero_image || '',
          settings.primary_color || '#3B82F6',
          settings.secondary_color || '#10B981',
          settings.deskripsi || ''
        ]
      );
    }

    const updatedSettings = await getDesaSettings();
    return { success: true, data: updatedSettings };
  } catch (error) {
    console.error('Error updating desa settings:', error);
    return { success: false, message: 'Failed to update settings' };
  }
};

// News Service
export const getNews = async (page: number = 1, limit: number = 10, status: string = 'published'): Promise<PaginatedResponse<News>> => {
  try {
    const offset = (page - 1) * limit;
    
    // Get total count
    const [countRows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM news WHERE status = ?',
      [status]
    );
    const total = countRows[0].total;

    // Get paginated news
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM news WHERE status = ? ORDER BY tanggal DESC, created_at DESC LIMIT ? OFFSET ?',
      [status, limit, offset]
    );

    return {
      data: rows as News[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

export const getNewsBySlug = async (slug: string): Promise<News | null> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM news WHERE slug = ? AND status = "published"',
      [slug]
    );
    
    return rows.length > 0 ? rows[0] as News : null;
  } catch (error) {
    console.error('Error fetching news by slug:', error);
    throw error;
  }
};

export const createNews = async (newsData: Partial<News>): Promise<ApiResponse<News>> => {
  try {
    const slug = generateSlug(newsData.judul!);
    
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO news (judul, slug, konten, gambar, tanggal, penulis, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        newsData.judul,
        slug,
        newsData.konten,
        newsData.gambar || '',
        newsData.tanggal || new Date(),
        newsData.penulis,
        newsData.status || 'draft'
      ]
    );

    return { success: true, message: 'News created successfully', data: { id: result.insertId } as News };
  } catch (error) {
    console.error('Error creating news:', error);
    return { success: false, message: 'Failed to create news' };
  }
};

export const updateNews = async (id: number, newsData: Partial<News>): Promise<ApiResponse<News>> => {
  try {
    const slug = newsData.judul ? generateSlug(newsData.judul) : undefined;
    
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE news SET 
       judul = COALESCE(?, judul),
       slug = COALESCE(?, slug),
       konten = COALESCE(?, konten),
       gambar = COALESCE(?, gambar),
       tanggal = COALESCE(?, tanggal),
       penulis = COALESCE(?, penulis),
       status = COALESCE(?, status),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        newsData.judul, slug, newsData.konten, newsData.gambar,
        newsData.tanggal, newsData.penulis, newsData.status, id
      ]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'News not found' };
    }

    return { success: true, message: 'News updated successfully' };
  } catch (error) {
    console.error('Error updating news:', error);
    return { success: false, message: 'Failed to update news' };
  }
};

export const deleteNews = async (id: number): Promise<ApiResponse<boolean>> => {
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM news WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'News not found' };
    }

    return { success: true, message: 'News deleted successfully' };
  } catch (error) {
    console.error('Error deleting news:', error);
    return { success: false, message: 'Failed to delete news' };
  }
};

// Gallery Service
export const getGalleries = async (kategori?: string): Promise<Gallery[]> => {
  try {
    let query = 'SELECT * FROM galleries ORDER BY tanggal DESC, created_at DESC';
    let params: any[] = [];

    if (kategori) {
      query = 'SELECT * FROM galleries WHERE kategori = ? ORDER BY tanggal DESC, created_at DESC';
      params = [kategori];
    }

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows as Gallery[];
  } catch (error) {
    console.error('Error fetching galleries:', error);
    throw error;
  }
};

export const createGallery = async (galleryData: Partial<Gallery>): Promise<ApiResponse<Gallery>> => {
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO galleries (judul, deskripsi, gambar, kategori, tanggal)
       VALUES (?, ?, ?, ?, ?)`,
      [
        galleryData.judul,
        galleryData.deskripsi || '',
        galleryData.gambar,
        galleryData.kategori || '',
        galleryData.tanggal || new Date()
      ]
    );

    return { success: true, message: 'Gallery item created successfully', data: { id: result.insertId } as Gallery };
  } catch (error) {
    console.error('Error creating gallery:', error);
    return { success: false, message: 'Failed to create gallery item' };
  }
};

// Events Service
export const getEvents = async (): Promise<Event[]> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM events ORDER BY tanggal DESC'
    );
    return rows as Event[];
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const createEvent = async (eventData: Partial<Event>): Promise<ApiResponse<Event>> => {
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO events (judul, deskripsi, tanggal, lokasi, gambar)
       VALUES (?, ?, ?, ?, ?)`,
      [
        eventData.judul,
        eventData.deskripsi || '',
        eventData.tanggal,
        eventData.lokasi || '',
        eventData.gambar || ''
      ]
    );

    return { success: true, message: 'Event created successfully', data: { id: result.insertId } as Event };
  } catch (error) {
    console.error('Error creating event:', error);
    return { success: false, message: 'Failed to create event' };
  }
};

// Organization Service
export const getOrganization = async (): Promise<Organization[]> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM organisasi ORDER BY urutan ASC, created_at ASC'
    );
    return rows as Organization[];
  } catch (error) {
    console.error('Error fetching organization:', error);
    throw error;
  }
};

export const createOrganization = async (orgData: Partial<Organization>): Promise<ApiResponse<Organization>> => {
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO organisasi (nama, jabatan, foto, urutan)
       VALUES (?, ?, ?, ?)`,
      [
        orgData.nama,
        orgData.jabatan,
        orgData.foto || '',
        orgData.urutan || 0
      ]
    );

    return { success: true, message: 'Organization member created successfully', data: { id: result.insertId } as Organization };
  } catch (error) {
    console.error('Error creating organization:', error);
    return { success: false, message: 'Failed to create organization member' };
  }
};

// Services
export const getServices = async (): Promise<Service[]> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM layanan ORDER BY created_at DESC'
    );
    return rows as Service[];
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

export const createService = async (serviceData: Partial<Service>): Promise<ApiResponse<Service>> => {
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO layanan (nama, deskripsi, persyaratan, template_dokumen)
       VALUES (?, ?, ?, ?)`,
      [
        serviceData.nama,
        serviceData.deskripsi || '',
        serviceData.persyaratan || '',
        serviceData.template_dokumen || ''
      ]
    );

    return { success: true, message: 'Service created successfully', data: { id: result.insertId } as Service };
  } catch (error) {
    console.error('Error creating service:', error);
    return { success: false, message: 'Failed to create service' };
  }
};

// Service Submissions
export const createServiceSubmission = async (submissionData: Partial<ServiceSubmission>): Promise<ApiResponse<ServiceSubmission>> => {
  try {
    const nomorPengajuan = generateSubmissionNumber();
    
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO pengajuan_layanan (layanan_id, nomor_pengajuan, nama, nik, file_pendukung, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [
        submissionData.layanan_id,
        nomorPengajuan,
        submissionData.nama,
        submissionData.nik,
        submissionData.file_pendukung || ''
      ]
    );

    return { 
      success: true, 
      message: 'Service submission created successfully',
      data: { 
        id: result.insertId,
        nomor_pengajuan: nomorPengajuan 
      } as ServiceSubmission 
    };
  } catch (error) {
    console.error('Error creating service submission:', error);
    return { success: false, message: 'Failed to create service submission' };
  }
};

export const getServiceSubmissions = async (): Promise<ServiceSubmission[]> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ps.*, l.nama as layanan_nama 
       FROM pengajuan_layanan ps 
       JOIN layanan l ON ps.layanan_id = l.id 
       ORDER BY ps.created_at DESC`
    );
    return rows as ServiceSubmission[];
  } catch (error) {
    console.error('Error fetching service submissions:', error);
    throw error;
  }
};

export const updateServiceSubmissionStatus = async (id: number, status: string, catatan?: string): Promise<ApiResponse<boolean>> => {
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE pengajuan_layanan SET status = ?, catatan = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, catatan || '', id]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Submission not found' };
    }

    return { success: true, message: 'Submission status updated successfully' };
  } catch (error) {
    console.error('Error updating submission status:', error);
    return { success: false, message: 'Failed to update submission status' };
  }
};

// Documents Service
export const getDocuments = async (kategori?: string): Promise<Document[]> => {
  try {
    let query = 'SELECT * FROM dokumen ORDER BY created_at DESC';
    let params: any[] = [];

    if (kategori) {
      query = 'SELECT * FROM dokumen WHERE kategori = ? ORDER BY created_at DESC';
      params = [kategori];
    }

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows as Document[];
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
};

export const createDocument = async (documentData: Partial<Document>): Promise<ApiResponse<Document>> => {
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO dokumen (judul, deskripsi, file_path, kategori, ukuran)
       VALUES (?, ?, ?, ?, ?)`,
      [
        documentData.judul,
        documentData.deskripsi || '',
        documentData.file_path,
        documentData.kategori || '',
        documentData.ukuran || 0
      ]
    );

    return { success: true, message: 'Document created successfully', data: { id: result.insertId } as Document };
  } catch (error) {
    console.error('Error creating document:', error);
    return { success: false, message: 'Failed to create document' };
  }
};

// Auth Service
export const login = async (email: string, password: string): Promise<ApiResponse<{ admin: Admin; token: string }>> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return { success: false, message: 'Invalid credentials' };
    }

    const admin = rows[0] as Admin;
    const isValidPassword = await verifyPassword(password, admin.password);

    if (!isValidPassword) {
      return { success: false, message: 'Invalid credentials' };
    }

    const token = generateToken(admin);
    
    // Don't return password
    const { password: _, ...adminWithoutPassword } = admin;
    
    return { 
      success: true, 
      data: { 
        admin: adminWithoutPassword as Admin, 
        token 
      } 
    };
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, message: 'Login failed' };
  }
};

export const createAdmin = async (adminData: Partial<Admin>): Promise<ApiResponse<Admin>> => {
  try {
    const hashedPassword = await hashPassword(adminData.password!);
    
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO admins (nama, email, password)
       VALUES (?, ?, ?)`,
      [adminData.nama, adminData.email, hashedPassword]
    );

    return { success: true, message: 'Admin created successfully', data: { id: result.insertId } as Admin };
  } catch (error) {
    console.error('Error creating admin:', error);
    return { success: false, message: 'Failed to create admin' };
  }
};

// Statistics Service
export const getStatistics = async () => {
  try {
    const [newsCount] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM news');
    const [galleryCount] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM galleries');
    const [eventsCount] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM events');
    const [submissionsCount] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM pengajuan_layanan');
    const [documentsCount] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM dokumen');

    return {
      news: newsCount[0].count,
      gallery: galleryCount[0].count,
      events: eventsCount[0].count,
      submissions: submissionsCount[0].count,
      documents: documentsCount[0].count,
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