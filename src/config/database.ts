import mysql from 'mysql2/promise';

export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

// Database configuration
const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'desa_digital',
  port: parseInt(process.env.DB_PORT || '3306')
};

// Create connection pool
export const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
});

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Database schema creation
export const createTables = async () => {
  const connection = await pool.getConnection();
  
  try {
    // Create desa_settings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS desa_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nama_desa VARCHAR(255) NOT NULL,
        slogan TEXT,
        alamat TEXT,
        logo VARCHAR(255),
        hero_image VARCHAR(255),
        primary_color VARCHAR(7) DEFAULT '#3B82F6',
        secondary_color VARCHAR(7) DEFAULT '#10B981',
        deskripsi TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create news table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS news (
        id INT PRIMARY KEY AUTO_INCREMENT,
        judul VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        konten LONGTEXT NOT NULL,
        gambar VARCHAR(255),
        tanggal DATE NOT NULL,
        penulis VARCHAR(255) NOT NULL,
        status ENUM('published', 'draft') DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_tanggal (tanggal)
      )
    `);

    // Create galleries table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS galleries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        judul VARCHAR(255) NOT NULL,
        deskripsi TEXT,
        gambar VARCHAR(255) NOT NULL,
        kategori VARCHAR(100),
        tanggal DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_kategori (kategori)
      )
    `);

    // Create events table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id INT PRIMARY KEY AUTO_INCREMENT,
        judul VARCHAR(255) NOT NULL,
        deskripsi TEXT,
        tanggal DATETIME NOT NULL,
        lokasi VARCHAR(255),
        gambar VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_tanggal (tanggal)
      )
    `);

    // Create organisasi table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS organisasi (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nama VARCHAR(255) NOT NULL,
        jabatan VARCHAR(255) NOT NULL,
        foto VARCHAR(255),
        urutan INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_urutan (urutan)
      )
    `);

    // Create layanan table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS layanan (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nama VARCHAR(255) NOT NULL,
        deskripsi TEXT,
        persyaratan TEXT,
        template_dokumen VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create pengajuan_layanan table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS pengajuan_layanan (
        id INT PRIMARY KEY AUTO_INCREMENT,
        layanan_id INT NOT NULL,
        nomor_pengajuan VARCHAR(50) UNIQUE NOT NULL,
        nama VARCHAR(255) NOT NULL,
        nik VARCHAR(16) NOT NULL,
        file_pendukung VARCHAR(255),
        status ENUM('pending', 'diproses', 'selesai', 'ditolak') DEFAULT 'pending',
        catatan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (layanan_id) REFERENCES layanan(id) ON DELETE CASCADE,
        INDEX idx_status (status),
        INDEX idx_nomor (nomor_pengajuan)
      )
    `);

    // Create dokumen table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS dokumen (
        id INT PRIMARY KEY AUTO_INCREMENT,
        judul VARCHAR(255) NOT NULL,
        deskripsi TEXT,
        file_path VARCHAR(255) NOT NULL,
        kategori VARCHAR(100),
        ukuran INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_kategori (kategori)
      )
    `);

    // Create admins table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nama VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    connection.release();
  }
};

export default pool;