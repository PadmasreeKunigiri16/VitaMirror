import React, { useState } from 'react';
import { Shield, Eye, Database, Trash2, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { listChecks, deleteCheck } from '../services/api';

const PrivacyPage: React.FC = () => {
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [deletedCount, setDeletedCount] = useState(0);

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete ALL wellness check history? This cannot be undone.')) return;
    setDeleteStatus('loading');
    try {
      const result = await listChecks(0, 100);
      let count = 0;
      for (const check of result.checks) {
        await deleteCheck(check.id);
        count++;
      }
      setDeletedCount(count);
      setDeleteStatus('done');
    } catch {
      setDeleteStatus('error');
    }
  };

  return (
    <div style={{ flex: 1, padding: 'var(--spacing-xl) 0' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        {/* Header */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="section-label">Privacy & Data</div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Privacy Notice</h1>
        </div>

        {/* Summary cards */}
        <div className="grid grid-3" style={{ gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
          {[
            { icon: <Eye size={22} color="#6366f1" />, title: 'Local Processing', desc: 'Webcam frames are analyzed in your browser and sent to the local backend. No cloud servers.' },
            { icon: <Database size={22} color="#06b6d4" />, title: 'No Images Stored', desc: 'Raw camera images are never saved. Only wellness indicator metadata is stored.' },
            { icon: <Lock size={22} color="#10b981" />, title: 'Your Control', desc: 'Delete individual checks or all history at any time from this page.' },
          ].map((item) => (
            <div key={item.title} className="card fade-in" style={{ textAlign: 'center' }}>
              <div style={{ margin: '0 auto var(--spacing-sm)', display: 'inline-flex' }}>{item.icon}</div>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.375rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Detailed sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div className="card fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
              <Shield size={20} color="#6366f1" />
              <h2 style={{ fontSize: '1.1rem' }}>What Data Is Collected</h2>
            </div>
            <ul style={{ paddingLeft: 'var(--spacing-lg)', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <li>Fatigue indicator level (low / moderate / elevated)</li>
              <li>Stress-related indicator level (experimental)</li>
              <li>Skin observation labels (brightness, texture, color, redness)</li>
              <li>Raw numeric metrics (EAR value, brow tension)</li>
              <li>Lighting quality assessment</li>
              <li>Timestamp of each check</li>
            </ul>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-md)' }}>
              <strong style={{ color: 'var(--color-text-secondary)' }}>Not collected:</strong> Camera images or video,
              facial images, personal identification information, biometric data, audio.
            </p>
          </div>

          <div className="card fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
              <Database size={20} color="#06b6d4" />
              <h2 style={{ fontSize: '1.1rem' }}>Where Data Is Stored</h2>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>
              All wellness data is stored in a local SQLite database file (<code>vitamirror.db</code>) on your
              machine. Data is never transmitted to external servers or third parties.
            </p>
          </div>

          <div className="card fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
              <AlertTriangle size={20} color="#f59e0b" />
              <h2 style={{ fontSize: '1.1rem' }}>Application Limitations</h2>
            </div>
            <ul style={{ paddingLeft: 'var(--spacing-lg)', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <li>VitaMirror does <strong style={{ color: '#fbbf24' }}>not</strong> diagnose any medical condition</li>
              <li>Indicators are computer-vision approximations, not clinical measurements</li>
              <li>Lighting, camera quality, and device variations significantly affect results</li>
              <li>The stress indicator is highly experimental and not clinically validated</li>
              <li>Skin observations do not identify or diagnose skin diseases</li>
              <li>This application should never replace professional medical advice</li>
            </ul>
          </div>

          {/* Delete all data */}
          <div className="card fade-in" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
              <Trash2 size={20} color="#ef4444" />
              <h2 style={{ fontSize: '1.1rem' }}>Delete All Wellness Data</h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)' }}>
              Permanently delete all wellness checks from the local database. This action cannot be undone.
            </p>

            {deleteStatus === 'done' ? (
              <div className="alert alert-success">
                <CheckCircle size={16} style={{ flexShrink: 0 }} />
                <span>Successfully deleted {deletedCount} wellness check{deletedCount !== 1 ? 's' : ''}.</span>
              </div>
            ) : deleteStatus === 'error' ? (
              <div className="alert alert-error">
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>Failed to delete data. Please try again.</span>
              </div>
            ) : (
              <button
                className="btn btn-danger"
                onClick={handleDeleteAll}
                disabled={deleteStatus === 'loading'}
                id="delete-all-btn"
              >
                <Trash2 size={14} />
                {deleteStatus === 'loading' ? 'Deleting…' : 'Delete All My Data'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
