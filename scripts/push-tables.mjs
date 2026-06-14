import mysql from "mysql2/promise";

const DATABASE_URL = "mysql://root:root@localhost:3306/german_learning";

const pool = mysql.createPool(DATABASE_URL);

const statements = [
  `CREATE TABLE IF NOT EXISTS center_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    teacherId BIGINT UNSIGNED NOT NULL,
    centerName VARCHAR(255) NOT NULL,
    centerBio TEXT,
    logo VARCHAR(512),
    status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    adminNotes TEXT,
    reviewedBy BIGINT UNSIGNED,
    reviewedAt TIMESTAMP NULL,
    acceptedTerms TINYINT NOT NULL DEFAULT 0,
    acceptedPrivacy TINYINT NOT NULL DEFAULT 0,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX center_requests_teacherId_idx (teacherId),
    INDEX center_requests_status_idx (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS center_request_emails (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    requestId BIGINT UNSIGNED NOT NULL,
    email VARCHAR(320) NOT NULL,
    INDEX center_request_emails_requestId_idx (requestId)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS center_request_locations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    requestId BIGINT UNSIGNED NOT NULL,
    country VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    INDEX center_request_locations_requestId_idx (requestId)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS center_request_phones (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    requestId BIGINT UNSIGNED NOT NULL,
    countryCode VARCHAR(10) NOT NULL,
    number VARCHAR(50) NOT NULL,
    INDEX center_request_phones_requestId_idx (requestId)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS center_request_albums (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    requestId BIGINT UNSIGNED NOT NULL,
    imageUrl TEXT NOT NULL,
    INDEX center_request_albums_requestId_idx (requestId)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS center_request_documents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    requestId BIGINT UNSIGNED NOT NULL,
    documentUrl TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'other',
    INDEX center_request_documents_requestId_idx (requestId)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

try {
  for (const sql of statements) {
    await pool.execute(sql);
    console.log("OK:", sql.slice(0, 60) + "...");
  }
  console.log("\nAll tables created successfully.");
} catch (err) {
  console.error("Error:", err.message);
} finally {
  await pool.end();
}
