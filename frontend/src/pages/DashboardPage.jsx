import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Upload, History, LogOut,
  FileUp, RotateCcw, CheckCircle, AlertCircle,
  Trash2, ExternalLink, RefreshCw,
} from 'lucide-react';
import {
  getDashboard, uploadFile, getUploads, restoreHomepage,
  cleanAllUploads, deleteUpload, logout,
} from '../services/api';
import SpotlightCard from '../components/ui/SpotlightCard';
import GlowButton from '../components/ui/GlowButton';
import { FadeIn } from '../components/ui/motion';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'edit', label: 'Edit Homepage', icon: Upload },
  { id: 'history', label: 'Upload History', icon: History },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadMsg, setUploadMsg] = useState('');
  const [restoreStatus, setRestoreStatus] = useState('idle');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
    if (activeTab === 'history') {
      fetchUploads();
    }
  }, [activeTab]);

  const fetchDashboard = () => {
    getDashboard().then(setDashboardData).catch(err => {
      if (err.message.includes('Unauthorized') || err.message.includes('401')) {
        navigate('/admin/login');
      }
    });
  };

  const fetchUploads = () => {
    getUploads().then(res => setUploads(res.data || [])).catch(console.error);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploadStatus('loading');
    setUploadMsg('');
    try {
      const res = await uploadFile(file);
      setUploadStatus('success');
      setUploadMsg(`File berhasil diupload: ${res.stored_filename}`);
      setFile(null);
      document.getElementById('fileInput').value = '';
      fetchDashboard();
      if (activeTab === 'history') fetchUploads();
    } catch (err) {
      setUploadStatus('error');
      setUploadMsg(err.message);
    }
  };

  const handleRestore = async () => {
    if (!window.confirm('Yakin ingin merestore homepage ke default?')) return;

    setRestoreStatus('loading');
    try {
      await restoreHomepage();
      setRestoreStatus('idle');
      alert('Homepage berhasil direstore ke default');
      fetchDashboard();
    } catch (err) {
      setRestoreStatus('idle');
      alert('Gagal restore: ' + err.message);
    }
  };

  const handleCleanAll = async () => {
    if (!window.confirm('⚠️ PERINGATAN: Yakin ingin menghapus SEMUA file shell/deface dan membersihkan seluruh riwayat upload?')) return;

    setRestoreStatus('loading');
    try {
      const res = await cleanAllUploads();
      alert(res?.message || 'Semua skrip deface & riwayat upload berhasil dibersihkan!');
      fetchUploads();
      fetchDashboard();
    } catch (err) {
      alert('Gagal membersihkan: ' + err.message);
    } finally {
      setRestoreStatus('idle');
    }
  };

  const handleDeleteSingle = async (id, originalName) => {
    if (!window.confirm(`Hapus file "${originalName}" dari server?`)) return;

    try {
      await deleteUpload(id);
      fetchUploads();
      fetchDashboard();
    } catch (err) {
      alert('Gagal menghapus file: ' + err.message);
    }
  };

  const isAdmin = dashboardData?.user?.role === 'admin';

  return (
    <div className="page-bg" style={{ minHeight: 'calc(100vh - 4rem)' }}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>{isAdmin ? 'Admin Dashboard' : 'Participant Dashboard'}</h1>
            <p>Selamat datang, {dashboardData?.user?.username || 'User'}</p>
          </div>
          <GlowButton variant="ghost" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </GlowButton>
        </div>
      </div>

      <div className="container mt-8 mb-8">
        {/* Tabs */}
        <div className="dashboard-tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`dashboard-tab${activeTab === id ? ' active' : ''}`}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Icon size={15} />
                {label}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid-3">
                <SpotlightCard className="stat-card">
                  <p className="stat-card__label">Total Uploads</p>
                  <p className="stat-card__value">{dashboardData?.stats?.total_uploads || 0}</p>
                </SpotlightCard>
                <SpotlightCard className="stat-card">
                  <p className="stat-card__label">Last Upload</p>
                  <p className="stat-card__value stat-card__value--sm">
                    {dashboardData?.stats?.last_upload_time
                      ? new Date(dashboardData.stats.last_upload_time).toLocaleString()
                      : 'Belum ada'}
                  </p>
                </SpotlightCard>
                <SpotlightCard className="stat-card">
                  <p className="stat-card__label">Homepage Status</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
                    <div className={`status-dot ${dashboardData?.stats?.is_defaced ? 'status-dot--warn' : 'status-dot--ok'}`} />
                    <p className="stat-card__value stat-card__value--sm" style={{ margin: 0 }}>
                      {dashboardData?.stats?.is_defaced ? 'Modified (Defaced)' : 'Default'}
                    </p>
                  </div>
                </SpotlightCard>
              </div>
            </motion.div>
          )}

          {activeTab === 'edit' && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="grid-2"
              style={{ alignItems: 'start' }}
            >
              <SpotlightCard>
                <h3 className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileUp size={20} color="var(--primary)" />
                  Upload Konten Baru
                </h3>
                <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
                  Upload file untuk mengubah tampilan beranda. Sistem tidak memvalidasi
                  ekstensi file - termasuk <code>.html</code>, <code>.txt</code>, <code>.php</code>.
                </p>

                <form onSubmit={handleUpload}>
                  <div className="form-group">
                    <input
                      id="fileInput"
                      type="file"
                      className="form-input"
                      accept=".html,.htm,.txt,.php,.jpg,.jpeg,.png,.gif"
                      onChange={handleFileChange}
                      disabled={uploadStatus === 'loading'}
                    />
                  </div>

                  {uploadStatus === 'success' && (
                    <div className="alert alert-success mt-4">
                      <CheckCircle size={18} />
                      {uploadMsg}
                    </div>
                  )}
                  {uploadStatus === 'error' && (
                    <div className="alert alert-error mt-4">
                      <AlertCircle size={18} />
                      {uploadMsg}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                    <GlowButton
                      type="submit"
                      variant="primary"
                      disabled={!file || uploadStatus === 'loading'}
                    >
                      {uploadStatus === 'loading' ? 'Mengunggah...' : 'Upload File'}
                    </GlowButton>
                    {isAdmin && (
                      <GlowButton
                        type="button"
                        variant="danger"
                        onClick={handleRestore}
                        disabled={restoreStatus === 'loading'}
                      >
                        <RotateCcw size={16} />
                        Restore Homepage
                      </GlowButton>
                    )}
                  </div>
                </form>
              </SpotlightCard>

              <SpotlightCard>
                <h3 className="mb-4">Live Preview</h3>
                <div className="preview-frame">
                  <iframe
                    src="/"
                    title="Homepage Preview"
                  />
                </div>
              </SpotlightCard>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <SpotlightCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <History size={20} color="var(--primary)" />
                    Riwayat Upload ({uploads.length} file)
                  </h3>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <GlowButton
                      variant="ghost"
                      onClick={() => { fetchUploads(); fetchDashboard(); }}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      <RefreshCw size={14} /> Refresh
                    </GlowButton>

                    {isAdmin && (
                      <GlowButton
                        variant="danger"
                        onClick={handleCleanAll}
                        disabled={restoreStatus === 'loading' || uploads.length === 0}
                        style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
                      >
                        <Trash2 size={14} />
                        Bersihkan Semua File Deface
                      </GlowButton>
                    )}
                  </div>
                </div>

                {uploads.length === 0 ? (
                  <p className="text-muted" style={{ padding: '1.5rem 0', textAlign: 'center' }}>
                    Belum ada file / skrip deface yang diupload.
                  </p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Filename Original</th>
                          <th>Stored Filename</th>
                          <th>Waktu</th>
                          <th>Size</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploads.map(u => (
                          <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>
                              <span style={{ fontWeight: 600 }}>{u.original_filename}</span>
                            </td>
                            <td><code>{u.stored_filename}</code></td>
                            <td>{new Date(u.uploaded_at).toLocaleString()}</td>
                            <td>{u.file_size ? `${(u.file_size / 1024).toFixed(1)} KB` : '-'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <a
                                  href={`/uploads/${u.stored_filename}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="action-btn"
                                  title="Buka / Eksekusi File di Tab Baru"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    color: 'var(--primary)',
                                    fontSize: '0.8rem',
                                    background: 'var(--primary-dim)',
                                    padding: '0.3rem 0.6rem',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-glow)'
                                  }}
                                >
                                  <ExternalLink size={12} /> Buka
                                </a>

                                {isAdmin && (
                                  <button
                                    onClick={() => handleDeleteSingle(u.id, u.original_filename)}
                                    title="Hapus File Ini"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      color: 'var(--accent)',
                                      fontSize: '0.8rem',
                                      background: 'var(--accent-dim)',
                                      padding: '0.3rem 0.6rem',
                                      borderRadius: '6px',
                                      border: '1px solid rgba(255,51,51,0.2)',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Trash2 size={12} /> Hapus
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SpotlightCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
