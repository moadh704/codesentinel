import { query } from '../config/database.js';
import { analyzeCode } from '../services/aiService.js';

// @desc    Create new scan + run AI analysis
// @route   POST /api/scan
// @access  Private
export const createScan = async (req, res) => {
  const userId = req.user.id;
  const { title, language, provider, code } = req.body;

  if (!code || !language || !provider) {
    return res.status(400).json({ error: 'code, language and provider are required' });
  }

  const validProviders = ['claude', 'gpt4', 'gemini'];
  if (!validProviders.includes(provider)) {
    return res.status(400).json({ error: 'Invalid provider. Use claude, gpt4 or gemini' });
  }

  let scanId;

  try {
    // 1. Create scan record with pending status
    const scanResult = await query(
      `INSERT INTO scans (user_id, title, language, provider, code, status) 
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [userId, title || null, language, provider, code]
    );
    scanId = scanResult.insertId;

    // 2. Run AI analysis
    const vulnerabilities = await analyzeCode(code, language, provider);

    // 3. Calculate severity counts
    const counts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    for (const vuln of vulnerabilities) {
      const sev = vuln.severity?.toLowerCase();
      if (counts[sev] !== undefined) counts[sev]++;
    }

    const totalIssues = vulnerabilities.length;

    // 4. Update scan with results
    await query(
      `UPDATE scans 
       SET status = 'completed', 
           total_issues = ?, 
           critical_count = ?, 
           high_count = ?, 
           medium_count = ?, 
           low_count = ?
       WHERE id = ?`,
      [totalIssues, counts.critical, counts.high, counts.medium, counts.low, scanId]
    );

    // 5. Insert vulnerabilities
    if (vulnerabilities.length > 0) {
      const values = vulnerabilities.map((v) => [
        scanId,
        v.title,
        v.severity?.toLowerCase() || 'info',
        v.type || 'Unknown',
        v.line_number || null,
        v.description,
        v.vulnerable_code || null,
        v.fix_suggestion || null,
      ]);

      // Batch insert
      const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
      const flatValues = values.flat();

      await query(
        `INSERT INTO vulnerabilities 
         (scan_id, title, severity, type, line_number, description, vulnerable_code, fix_suggestion) 
         VALUES ${placeholders}`,
        flatValues
      );
    }

    // 6. Return the created scan
    const [createdScan] = await query(
      'SELECT * FROM scans WHERE id = ?',
      [scanId]
    );

    res.status(201).json({
      message: 'Scan completed successfully',
      scan: createdScan,
      vulnerabilities,
    });

  } catch (error) {
    console.error('Scan creation error:', error);

    // Mark scan as failed if it was created
    if (scanId) {
      await query(
        "UPDATE scans SET status = 'failed' WHERE id = ?",
        [scanId]
      ).catch(() => {});
    }

    res.status(500).json({
      error: 'Failed to complete scan analysis',
      details: error.message,
    });
  }
};

// @desc    Get all scans for current user
// @route   GET /api/scans
// @access  Private
export const getAllScans = async (req, res) => {
  const userId = req.user.id;
  const { limit = 50, offset = 0 } = req.query;

  try {
    const scans = await query(
      `SELECT id, title, language, provider, status, total_issues, 
              critical_count, high_count, medium_count, low_count, created_at
       FROM scans 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    res.json({ scans, total: scans.length });
  } catch (error) {
    console.error('Get scans error:', error);
    res.status(500).json({ error: 'Failed to fetch scans' });
  }
};

// @desc    Get single scan with vulnerabilities
// @route   GET /api/scans/:id
// @access  Private
export const getScanById = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const scans = await query(
      'SELECT * FROM scans WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (scans.length === 0) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    const scan = scans[0];

    const vulnerabilities = await query(
      'SELECT * FROM vulnerabilities WHERE scan_id = ? ORDER BY severity DESC, line_number ASC',
      [id]
    );

    res.json({
      scan,
      vulnerabilities,
    });
  } catch (error) {
    console.error('Get scan error:', error);
    res.status(500).json({ error: 'Failed to fetch scan details' });
  }
};

// @desc    Delete a scan
// @route   DELETE /api/scans/:id
// @access  Private
export const deleteScan = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const result = await query(
      'DELETE FROM scans WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    res.json({ message: 'Scan deleted successfully' });
  } catch (error) {
    console.error('Delete scan error:', error);
    res.status(500).json({ error: 'Failed to delete scan' });
  }
};

// @desc    Dashboard statistics
// @route   GET /api/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  const userId = req.user.id;

  try {
    // Total scans
    const [totalScans] = await query(
      'SELECT COUNT(*) as total FROM scans WHERE user_id = ?',
      [userId]
    );

    // Total issues
    const [totalIssues] = await query(
      `SELECT COALESCE(SUM(total_issues), 0) as total_issues 
       FROM scans WHERE user_id = ?`,
      [userId]
    );

    // Severity breakdown
    const [severityBreakdown] = await query(
      `SELECT 
         COALESCE(SUM(critical_count), 0) as critical,
         COALESCE(SUM(high_count), 0) as high,
         COALESCE(SUM(medium_count), 0) as medium,
         COALESCE(SUM(low_count), 0) as low
       FROM scans WHERE user_id = ?`,
      [userId]
    );

    // Recent scans (last 5)
    const recentScans = await query(
      `SELECT id, title, language, provider, status, total_issues, created_at
       FROM scans 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [userId]
    );

    // Scans per day (last 7 days)
    const scansPerDay = await query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM scans 
       WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [userId]
    );

    res.json({
      stats: {
        totalScans: totalScans.total || 0,
        totalIssues: totalIssues.total_issues || 0,
        severityBreakdown: {
          critical: severityBreakdown.critical || 0,
          high: severityBreakdown.high || 0,
          medium: severityBreakdown.medium || 0,
          low: severityBreakdown.low || 0,
        },
      },
      recentScans,
      scansPerDay,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};
