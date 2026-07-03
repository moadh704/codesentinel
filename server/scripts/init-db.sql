-- CodeSentinel Database Schema
-- Run: mysql -u root -p codesentinel < init-db.sql

CREATE DATABASE IF NOT EXISTS codesentinel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE codesentinel;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Scans table
CREATE TABLE IF NOT EXISTS scans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255),
  language VARCHAR(50) NOT NULL,
  provider ENUM('claude', 'gpt4', 'gemini') NOT NULL,
  code TEXT NOT NULL,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  total_issues INT DEFAULT 0,
  critical_count INT DEFAULT 0,
  high_count INT DEFAULT 0,
  medium_count INT DEFAULT 0,
  low_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Vulnerabilities table
CREATE TABLE IF NOT EXISTS vulnerabilities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  scan_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  severity ENUM('critical', 'high', 'medium', 'low', 'info') NOT NULL,
  type VARCHAR(100) NOT NULL,
  line_number INT,
  description TEXT NOT NULL,
  vulnerable_code TEXT,
  fix_suggestion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Indexes for performance
CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_created_at ON scans(created_at);
CREATE INDEX idx_vulns_scan_id ON vulnerabilities(scan_id);
CREATE INDEX idx_vulns_severity ON vulnerabilities(severity);

-- Optional: Add updated_at triggers if needed later
