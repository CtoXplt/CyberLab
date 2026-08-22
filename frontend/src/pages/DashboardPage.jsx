import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Upload, History, LogOut,
  FileUp, RotateCcw, CheckCircle, AlertCircle,
  Trash2, ExternalLink, RefreshCw, Gift, QrCode,
  KeyRound, ShieldAlert, Sparkles, Image as ImageIcon,
  Terminal, Lock, Unlock, Download, Check, HelpCircle
} from 'lucide-react';
import {
  getDashboard, uploadFile, getUploads, restoreHomepage,
  cleanAllUploads, deleteUpload, logout, getBountyConfig,
  updateBountyConfig, uploadBountyQr, deleteBountyQr,
  submitBountyFlag, getCardDownloadUrl
} from '../services/api';
import SpotlightCard from '../components/ui/SpotlightCard';
import GlowButton from '../components/ui/GlowButton';
import FlipCard from '../components/ui/FlipCard';
import { FadeIn, StaggerContainer, StaggerItem } from '../components/ui/motion';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadMsg, setUploadMsg] = useState('');
  const [restoreStatus, setRestoreStatus] = useState('idle');

  // Admin Bounty Management State
  const [bountyConfig, setBountyConfig] = useState(null);
  const [bountyFlag, setBountyFlag] = useState('');
  const [bountyComment, setBountyComment] = useState('');
  const [bountyCipherType, setBountyCipherType] = useState('xor_hex');
  const [bountyCipherKey, setBountyCipherKey] = useState('SPADE2026');
  const [bountyActive, setBountyActive] = useState(true);
  const [qrFile, setQrFile] = useState(null);
  const [bountySaveStatus, setBountySaveStatus] = useState('idle');
  const [bountySaveMsg, setBountySaveMsg] = useState('');
  const [qrUploadStatus, setQrUploadStatus] = useState('idle');
  const [qrUploadMsg, setQrUploadMsg] = useState('');

  // Participant Bounty Submission State
  const [partFlagInput, setPartFlagInput] = useState('');
  const [partSubmitStatus, setPartSubmitStatus] = useState('idle');
  const [partSubmitResult, setPartSubmitResult] = useState(null);
  const [partSubmitError, setPartSubmitError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
    if (activeTab === 'history') {
      fetchUploads();
    }
    if (activeTab === 'bounty' || activeTab === 'overview') {
      fetchBountySettings();
    }
  }, [activeTab]);

  const fetchDashboard = () => {
    getDashboard().then(res => setDashboardData(res?.data || res)).catch(err => {
      if (err.message.includes('Unauthorized') || err.message.includes('401')) {
        navigate('/admin/login');
      }
    });
  };

  const fetchUploads = () => {
    getUploads().then(res => setUploads(res?.data?.data || res?.data || [])).catch(console.error);
  };

  const fetchBountySettings = () => {
    getBountyConfig().then(envelope => {
      const res = envelope?.data || envelope;
      setBountyConfig(res);
      setBountyFlag(res?.flag || '');
      setBountyComment(res?.command_comment || '');
      setBountyCipherType(res?.cipher_type || 'xor_hex');
      setBountyCipherKey(res?.cipher_key || 'SPADE2026');
      setBountyActive(res?.is_active !== false);
    }).catch(() => {
      // Ignored for non-admin or if not accessible
    });
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
      const envelope = await uploadFile(file);
      const res = envelope?.data || envelope;
      setUploadStatus('success');
      setUploadMsg(`File berhasil diupload: ${res?.stored_filename || res?.original_filename || 'file'}`);
      fetchDashboard();
      setFile(null);
      const inputEl = document.getElementById('fileInput');
      if (inputEl) inputEl.value = '';
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
      alert(res?.message || res?.data?.message || 'Semua skrip deface & riwayat upload berhasil dibersihkan!');
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

  // Helper XOR Hex generator in JS
  const generateXorHex = (text, key) => {
    let out = '';
    const kLen = key.length || 1;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i) ^ key.charCodeAt(i % kLen);
      out += code.toString(16).padStart(2, '0');
    }
    return out;
  };

  const handleGenerateCipherComment = () => {
    if (!bountyFlag) {
      alert('Isi flag terlebih dahulu');
      return;
    }
    let commentText = '';
    if (bountyCipherType === 'base64') {
      const b64 = btoa(bountyFlag);
      commentText = `BASE64-PAYLOAD: ${b64} | Algorithm: Base64`;
    } else if (bountyCipherType === 'xor_hex') {
      const cipherHex = generateXorHex(bountyFlag, bountyCipherKey || 'SPADE2026');
      commentText = `CIPHER: ${cipherHex} | Key: "${bountyCipherKey || 'SPADE2026'}" | Algorithm: XOR(text, key) -> Hex`;
    } else if (bountyCipherType === 'rot13_hex') {
      const rot13 = (str) => str.replace(/[a-zA-Z]/g, c => String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26));
      const hex = Array.from(rot13(bountyFlag)).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
      commentText = `ROT13-HEX: ${hex} | Recipe: From Hex -> ROT13`;
    } else if (bountyCipherType === 'base85') {
      commentText = `BASE85-PAYLOAD: <~9jqo^BlbD-1cj~> | Algorithm: ASCII85`;
    } else {
      commentText = `FLAG_CMD: echo "${bountyFlag}"`;
    }
    setBountyComment(commentText);
  };

  // Admin Save Bounty Config
  const handleSaveBountyConfig = async (e) => {
    e.preventDefault();
    setBountySaveStatus('loading');
    setBountySaveMsg('');

    try {
      const res = await updateBountyConfig({
        flag: bountyFlag,
        command_comment: bountyComment,
        cipher_type: bountyCipherType,
        cipher_key: bountyCipherKey,
        is_active: bountyActive ? 1 : 0
      });
      setBountySaveStatus('success');
      setBountySaveMsg(res?.message || 'Pengaturan Bounty & Metadata Kartu S berhasil disimpan!');
      fetchBountySettings();
    } catch (err) {
      setBountySaveStatus('error');
      setBountySaveMsg(err.message || 'Gagal menyimpan pengaturan.');
    }
  };

  // Admin Upload QR DANA
  const handleUploadQr = async (e) => {
    e.preventDefault();
    if (!qrFile) return;

    setQrUploadStatus('loading');
    setQrUploadMsg('');
    try {
      const res = await uploadBountyQr(qrFile);
      setQrUploadStatus('success');
      setQrUploadMsg(res?.message || 'Foto QR DANA berhasil diunggah!');
      setQrFile(null);
      const inputEl = document.getElementById('qrFileInput');
      if (inputEl) inputEl.value = '';
      fetchBountySettings();
    } catch (err) {
      setQrUploadStatus('error');
      setQrUploadMsg(err.message || 'Gagal mengunggah QR.');
    }
  };

  const handleDeleteQr = async () => {
    if (!window.confirm('Yakin ingin menghapus foto QR DANA?')) return;
    try {
      await deleteBountyQr();
      alert('Foto QR DANA berhasil dihapus.');
      fetchBountySettings();
    } catch (err) {
      alert('Gagal menghapus QR: ' + err.message);
    }
  };

  // Participant Submit Flag Kartu S
  const handleParticipantSubmitBounty = async (e) => {
    e.preventDefault();
    if (!partFlagInput) return;

    setPartSubmitStatus('loading');
    setPartSubmitError('');
    try {
      const envelope = await submitBountyFlag(partFlagInput);
      setPartSubmitStatus('success');
      setPartSubmitResult(envelope?.data || envelope);
    } catch (err) {
      setPartSubmitStatus('error');
      setPartSubmitError(err.message || 'Flag Kartu S salah. Periksa kembali analisis metadata/cipher Anda.');
    }
  };

  const isAdmin = dashboardData?.user?.role === 'admin';
  const hasUploaded = (dashboardData?.stats?.total_uploads || 0) > 0;

  const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'edit', label: 'Edit Homepage', icon: Upload },
    { id: 'history', label: 'Upload History', icon: History },
    {
      id: 'bounty',
      label: isAdmin ? 'Bounty & Kartu S' : 'Bounty Reward (Kartu S)',
      icon: Gift,
      badge: !isAdmin ? (hasUploaded ? 'UNLOCKED' : 'LOCKED') : null,
      badgeType: !isAdmin && !hasUploaded ? 'warn' : 'ok'
    },
  ];

  return (
    <div className="page-bg" style={{ minHeight: 'calc(100vh - 4rem)' }}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>{isAdmin ? 'Admin Control Center' : 'Participant Dashboard'}</h1>
            <p>Selamat datang, <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{dashboardData?.user?.username || 'User'}</span> ({dashboardData?.user?.role || 'participant'})</p>
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
          {TABS.map(({ id, label, icon: Icon, badge, badgeType }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`dashboard-tab${activeTab === id ? ' active' : ''}`}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Icon size={15} />
                {label}
                {badge && (
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '0.12rem 0.4rem',
                    borderRadius: '4px',
                    background: badgeType === 'warn' ? 'rgba(255, 68, 68, 0.2)' : 'var(--primary)',
                    color: badgeType === 'warn' ? '#ff8888' : '#000',
                    border: badgeType === 'warn' ? '1px solid rgba(255, 68, 68, 0.4)' : 'none',
                    fontWeight: 700
                  }}>
                    {badge}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid-3 mb-6">
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

              {/* Participant Mission Progress Banner */}
              {!isAdmin && (
                <SpotlightCard style={{ border: '1px solid var(--border-glow)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Gift size={20} color="var(--primary)" />
                        <h3 style={{ margin: 0 }}>Progress Tantangan CTF</h3>
                      </div>
                      <p className="text-secondary" style={{ fontSize: '0.9rem', margin: 0 }}>
                        {hasUploaded
                          ? '🎉 Anda telah berhasil mengunggah file! Tantangan Final (Kartu S) telah TERBUKA untuk memperebutkan Barcode DANA.'
                          : 'Tahap 2: Unggah file shell/deface di menu "Edit Homepage" untuk membuka Tantangan Final Kartu S & klaim Bounty DANA.'}
                      </p>
                    </div>
                    <GlowButton
                      variant={hasUploaded ? 'primary' : 'outline'}
                      onClick={() => setActiveTab(hasUploaded ? 'bounty' : 'edit')}
                    >
                      {hasUploaded ? '🔥 Buka Tantangan Kartu S' : 'Menuju Edit Homepage'}
                    </GlowButton>
                  </div>
                </SpotlightCard>
              )}
            </motion.div>
          )}

          {/* TAB 2: EDIT HOMEPAGE (FILE UPLOAD) */}
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
                  Upload Konten Baru (Deface / Shell)
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
                      <div>
                        <p style={{ margin: 0, fontWeight: 600 }}>{uploadMsg}</p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                          Tantangan Kartu S (Bounty Reward) telah aktif di tab Bounty!
                        </p>
                      </div>
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

          {/* TAB 3: UPLOAD HISTORY */}
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

          {/* TAB 4: BOUNTY & KARTU S */}
          {activeTab === 'bounty' && (
            <motion.div
              key="bounty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {isAdmin ? (
                /* ================= ADMIN VIEW: CRUD BOUNTY ================= */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <SpotlightCard>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <Gift size={24} color="var(--primary)" />
                      <div>
                        <h2 style={{ margin: 0 }}>Pengaturan Bounty & Kartu S (Admin)</h2>
                        <p className="text-secondary" style={{ fontSize: '0.9rem', margin: 0 }}>
                          Kelola foto Barcode QR DANA, Flag Kartu S, Tipe Cipher (Stream XOR / Hex / ROT13), dan metadata foto secara real-time.
                        </p>
                      </div>
                    </div>
                  </SpotlightCard>

                  <div className="grid-2" style={{ alignItems: 'start' }}>
                    {/* SECTION 1: QR CODE DANA CRUD */}
                    <SpotlightCard>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <QrCode size={20} color="var(--primary)" />
                        Foto Barcode / QR Code DANA
                      </h3>
                      <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                        Peserta yang berhasil menyelesaikan tantangan Kartu S akan melihat Barcode DANA ini untuk klaim hadiah uang.
                      </p>

                      {/* Current QR Preview */}
                      <div style={{
                        background: 'rgba(0,0,0,0.6)',
                        border: '1px dashed var(--border-glow)',
                        borderRadius: '10px',
                        padding: '1.25rem',
                        textAlign: 'center',
                        marginBottom: '1.25rem'
                      }}>
                        {bountyConfig?.qr_exists ? (
                          <div>
                            <img
                              src={bountyConfig.qr_url}
                              alt="QR DANA Aktif"
                              style={{
                                maxWidth: '200px',
                                maxHeight: '200px',
                                borderRadius: '8px',
                                border: '2px solid var(--primary)',
                                boxShadow: '0 0 15px var(--primary-glow)',
                                display: 'inline-block'
                              }}
                            />
                            <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.5rem', fontWeight: 600 }}>
                              ✅ Barcode DANA Aktif
                            </p>
                          </div>
                        ) : (
                          <div style={{ padding: '1.5rem 0', color: 'var(--text-muted)' }}>
                            <QrCode size={40} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
                            <p style={{ margin: 0, fontSize: '0.85rem' }}>Belum ada foto QR DANA yang diupload.</p>
                          </div>
                        )}
                      </div>

                      {/* Upload QR Form */}
                      <form onSubmit={handleUploadQr}>
                        <div className="form-group">
                          <label className="form-label" htmlFor="qrFileInput" style={{ fontSize: '0.85rem' }}>
                            Upload / Ganti Foto QR DANA
                          </label>
                          <input
                            id="qrFileInput"
                            type="file"
                            className="form-input"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={(e) => e.target.files && setQrFile(e.target.files[0])}
                            disabled={qrUploadStatus === 'loading'}
                          />
                        </div>

                        {qrUploadStatus === 'success' && (
                          <div className="alert alert-success mt-2 mb-2" style={{ fontSize: '0.85rem' }}>
                            <CheckCircle size={16} /> {qrUploadMsg}
                          </div>
                        )}
                        {qrUploadStatus === 'error' && (
                          <div className="alert alert-error mt-2 mb-2" style={{ fontSize: '0.85rem' }}>
                            <AlertCircle size={16} /> {qrUploadMsg}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                          <GlowButton
                            type="submit"
                            variant="primary"
                            disabled={!qrFile || qrUploadStatus === 'loading'}
                            style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}
                          >
                            <Upload size={14} />
                            {qrUploadStatus === 'loading' ? 'Mengunggah...' : 'Unggah Foto QR'}
                          </GlowButton>

                          {bountyConfig?.qr_exists && (
                            <GlowButton
                              type="button"
                              variant="danger"
                              onClick={handleDeleteQr}
                              style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}
                            >
                              <Trash2 size={14} /> Hapus QR
                            </GlowButton>
                          )}
                        </div>
                      </form>
                    </SpotlightCard>

                    {/* SECTION 2: EDIT FLAG & CIPHER METADATA */}
                    <SpotlightCard>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Terminal size={20} color="var(--primary)" />
                        Konfigurasi Flag & Metadata Kartu S
                      </h3>
                      <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                        Ubah flag, pilih teknik kriptografi/cipher (lebih sulit dari Base64 biasa), dan edit comment metadata yang disisipkan ke file <code>card_s.png</code>.
                      </p>

                      <form onSubmit={handleSaveBountyConfig}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.85rem' }}>Flag Kartu S</label>
                          <input
                            type="text"
                            className="form-input"
                            value={bountyFlag}
                            onChange={(e) => setBountyFlag(e.target.value)}
                            placeholder="CTF{sp4d3_m4st3r_b0unty_x0r_c1ph3r_2026}"
                            required
                          />
                        </div>

                        <div className="grid-2" style={{ gap: '0.75rem' }}>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>Metode Enkripsi / Cipher</label>
                            <select
                              className="form-input"
                              value={bountyCipherType}
                              onChange={(e) => setBountyCipherType(e.target.value)}
                              style={{ background: '#000', color: 'var(--text-primary)' }}
                            >
                              <option value="xor_hex">XOR Cipher + Hex Stream (Menengah-Tinggi)</option>
                              <option value="base64">Base64 Encoding (Standar / Mudah)</option>
                              <option value="rot13_hex">ROT13 + Hex Obfuscation</option>
                              <option value="base85">ASCII85 / Base85</option>
                              <option value="custom">Custom Command / Text</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>Cipher Key (untuk XOR)</label>
                            <input
                              type="text"
                              className="form-input"
                              value={bountyCipherKey}
                              onChange={(e) => setBountyCipherKey(e.target.value)}
                              placeholder="SPADE2026"
                              disabled={bountyCipherType !== 'xor_hex'}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={handleGenerateCipherComment}
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--border-glow)',
                              color: 'var(--primary)',
                              borderRadius: '4px',
                              padding: '0.25rem 0.6rem',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <Sparkles size={12} /> Auto-Generate Cipher Metadata
                          </button>
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.85rem' }}>
                            Comment / Metadata Text pada Foto Kartu S
                          </label>
                          <textarea
                            className="form-input"
                            rows={3}
                            value={bountyComment}
                            onChange={(e) => setBountyComment(e.target.value)}
                            placeholder="CIPHER: 3e3a3f3b... | Key: SPADE2026 | Algorithm: XOR-HEX"
                            required
                            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                          />
                        </div>

                        {bountySaveStatus === 'success' && (
                          <div className="alert alert-success mt-2 mb-2" style={{ fontSize: '0.85rem' }}>
                            <CheckCircle size={16} /> {bountySaveMsg}
                          </div>
                        )}
                        {bountySaveStatus === 'error' && (
                          <div className="alert alert-error mt-2 mb-2" style={{ fontSize: '0.85rem' }}>
                            <AlertCircle size={16} /> {bountySaveMsg}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <GlowButton
                            type="submit"
                            variant="primary"
                            disabled={bountySaveStatus === 'loading'}
                            style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
                          >
                            <Check size={14} />
                            {bountySaveStatus === 'loading' ? 'Menyimpan...' : 'Simpan & Re-inject ke Kartu S'}
                          </GlowButton>

                          <a
                            href={getCardDownloadUrl('card_s.png')}
                            download
                            className="glow-btn glow-btn--outline"
                            style={{ fontSize: '0.85rem', padding: '0.45rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Download size={14} /> Unduh & Uji Card S
                          </a>
                        </div>
                      </form>
                    </SpotlightCard>
                  </div>
                </div>
              ) : !hasUploaded ? (
                /* ================= PARTICIPANT VIEW: LOCKED STATE (NOT YET UPLOADED) ================= */
                <SpotlightCard style={{ textAlign: 'center', padding: '3.5rem 1.5rem', border: '1px dashed rgba(255, 68, 68, 0.35)' }}>
                  <div style={{
                    display: 'inline-flex',
                    padding: '1.25rem',
                    borderRadius: '50%',
                    background: 'rgba(255, 68, 68, 0.1)',
                    color: 'var(--accent)',
                    marginBottom: '1.25rem',
                    border: '1px solid rgba(255, 68, 68, 0.3)',
                    boxShadow: '0 0 20px rgba(255, 68, 68, 0.2)'
                  }}>
                    <Lock size={40} />
                  </div>

                  <h2 style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>
                    🔒 Tantangan Kartu S Terkunci
                  </h2>
                  <p className="text-secondary" style={{ maxWidth: '560px', margin: '0 auto 1.75rem auto', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    Anda belum menyelesaikan <strong>Tahap 2 (File Upload Vulnerability)</strong>. Silakan unggah file deface / shell terlebih dahulu di tab <strong>Edit Homepage</strong> untuk membuka tantangan Kartu S dan klaim hadiah Barcode DANA.
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <GlowButton variant="primary" onClick={() => setActiveTab('edit')}>
                      <FileUp size={16} /> Menuju Tab Edit Homepage (Upload File)
                    </GlowButton>
                  </div>
                </SpotlightCard>
              ) : (
                /* ================= PARTICIPANT VIEW: KARTU S CHALLENGE (UNLOCKED) ================= */
                <div>
                  <SpotlightCard className="mb-6">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Gift size={26} color="var(--primary)" />
                        <div>
                          <h2 style={{ margin: 0 }}>Tantangan Final: Kartu S (Bounty Reward 💰)</h2>
                          <p className="text-secondary" style={{ margin: 0, fontSize: '0.9rem' }}>
                            Pecahkan cipher pada Kartu Spade (S) untuk membuka Barcode DANA dan klaim hadiah uang tunai!
                          </p>
                        </div>
                      </div>
                      <span className="badge badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Sparkles size={14} /> Bounty Stage
                      </span>
                    </div>

                    <div className="instruction-box">
                      <h4 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Terminal size={16} color="var(--primary)" />
                        Instruksi Analisis Kartu S:
                      </h4>
                      <ol style={{ fontSize: '0.9rem' }}>
                        <li>Klik kartu Spade di bawah untuk membalik dan mengunduh file <code>card_s.png</code>.</li>
                        <li>Gunakan tools analisis metadata seperti <code>exiftool -Comment card_s.png</code> atau <code>strings card_s.png</code>.</li>
                        <li>Perhatikan petunjuk cipher/key yang tertera di metadata (Stream XOR Cipher, ROT13, Base64, dsb).</li>
                        <li>Dekripsi ciphertext menggunakan key/resep yang sesuai untuk mendapatkan Flag final.</li>
                        <li>Masukkan Flag berformat <code>CTF&#123;...&#125;</code> pada form di bawah untuk menampilkan <strong>Barcode DANA</strong>!</li>
                      </ol>
                    </div>
                  </SpotlightCard>

                  <div className="grid-2" style={{ alignItems: 'start' }}>
                    {/* Kartu S FlipCard */}
                    <SpotlightCard style={{ textAlign: 'center' }}>
                      <h3 className="mb-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <ImageIcon size={20} color="var(--primary)" />
                        Aset Kartu Spade (S)
                      </h3>

                      <div style={{ maxWidth: '280px', margin: '0 auto' }}>
                        <FlipCard
                          imageUrl={getCardDownloadUrl('card_s.png')}
                          downloadUrl={getCardDownloadUrl('card_s.png')}
                          name="Spade (Bounty Card)"
                          label="S"
                        />
                      </div>
                    </SpotlightCard>

                    {/* Submit Flag & Claim Reward */}
                    <SpotlightCard>
                      <h3 className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <KeyRound size={20} color="var(--primary)" />
                        Submit Flag Kartu S & Klaim Hadiah
                      </h3>

                      <AnimatePresence mode="wait">
                        {partSubmitStatus === 'success' && partSubmitResult ? (
                          <motion.div
                            key="bounty-reward"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                              background: 'rgba(0, 255, 65, 0.05)',
                              border: '1px solid var(--primary)',
                              borderRadius: '12px',
                              padding: '1.5rem',
                              textAlign: 'center'
                            }}
                          >
                            <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', background: 'var(--primary-dim)', color: 'var(--primary)', marginBottom: '1rem' }}>
                              <Sparkles size={32} />
                            </div>

                            <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>
                              {partSubmitResult.title || '🎉 Selamat! Flag Kartu S Benar!'}
                            </h3>
                            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                              {partSubmitResult.instructions || 'Silakan scan Barcode QR DANA di bawah ini untuk klaim hadiah Anda!'}
                            </p>

                            {partSubmitResult.has_qr && partSubmitResult.qr_url ? (
                              <div style={{
                                display: 'inline-block',
                                padding: '1rem',
                                background: '#ffffff',
                                borderRadius: '12px',
                                boxShadow: '0 0 25px var(--primary-glow)',
                                marginBottom: '1rem'
                              }}>
                                <img
                                  src={partSubmitResult.qr_url}
                                  alt="Barcode QR DANA Hadiah"
                                  style={{
                                    maxWidth: '220px',
                                    maxHeight: '220px',
                                    display: 'block'
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="alert alert-warning" style={{ margin: '1rem 0' }}>
                                <AlertCircle size={18} />
                                QR Code DANA sedang disiapkan oleh Admin. Silakan hubungi admin untuk klaim bounty Anda.
                              </div>
                            )}

                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Buka aplikasi DANA di ponsel Anda → Pilih <strong>Scan / Bayar</strong> → Scan barcode di atas.
                            </p>
                          </motion.div>
                        ) : (
                          <motion.form
                            key="bounty-form"
                            onSubmit={handleParticipantSubmitBounty}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <div className="form-group">
                              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                                Masukkan Flag Kartu S
                              </label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="CTF{...}"
                                value={partFlagInput}
                                onChange={(e) => setPartFlagInput(e.target.value)}
                                disabled={partSubmitStatus === 'loading'}
                                required
                              />
                            </div>

                            {partSubmitStatus === 'error' && (
                              <div className="alert alert-error mt-2 mb-3" style={{ fontSize: '0.85rem' }}>
                                <AlertCircle size={16} />
                                {partSubmitError}
                              </div>
                            )}

                            <GlowButton
                              type="submit"
                              variant="primary"
                              disabled={!partFlagInput || partSubmitStatus === 'loading'}
                              style={{ width: '100%', marginTop: '0.5rem' }}
                            >
                              <Sparkles size={16} />
                              {partSubmitStatus === 'loading' ? 'Memverifikasi Flag...' : 'Klaim Hadiah Barcode DANA'}
                            </GlowButton>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </SpotlightCard>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
