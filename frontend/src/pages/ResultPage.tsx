import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Eye, Brain, Sparkles, AlertTriangle, Trash2, Clock } from 'lucide-react';
import { getCheck, deleteCheck } from '../services/api';
import type { WellnessCheck } from '../types/wellness';
import IndicatorBadge from '../components/IndicatorBadge';

const ResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [check, setCheck] = useState<WellnessCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const data = await getCheck(Number(id));
        setCheck(data);
      } catch {
        setError('Wellness check not found.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!check || !window.confirm('Delete this wellness check? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteCheck(check.id);
      navigate('/history');
    } catch {
      setError('Failed to delete. Please try again.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 'var(--spacing-md)' }}>
        <div className="spinner spinner-lg" />
        <span>Loading result…</span>
      </div>
    );
  }

  if (error || !check) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-xl)', textAlign: 'center' }}>
        <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto var(--spacing-md)' }} />
        <h2>{error || 'Result not found'}</h2>
        <Link to="/history" className="btn btn-secondary" style={{ marginTop: 'var(--spacing-xl)' }}>
          ← Back to History
        </Link>
      </div>
    );
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      weekday: 'short', month: 'long', day: 'numeric',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  return (
    <div style={{ flex: 1, padding: 'var(--spacing-xl) 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
          <div>
            <Link to="/history" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)' }}>
              <ArrowLeft size={14} /> Back to History
            </Link>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Wellness Check Complete</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.375rem' }}>
              <Clock size={12} />
              {formatDate(check.created_at)}
            </div>
          </div>
          <button className="btn btn-danger" onClick={handleDelete} disabled={deleting} id="delete-check-btn">
            <Trash2 size={14} />
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>

        {/* Overall badge */}
        <div className="card card-gradient fade-in" style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)', boxShadow: 'var(--shadow-glow)', padding: 'var(--spacing-2xl)' }}>
          <CheckCircle size={40} color="#10b981" style={{ margin: '0 auto var(--spacing-md)' }} />
          <h2 style={{ marginBottom: 'var(--spacing-sm)' }}>Overall Wellness</h2>
          <IndicatorBadge level={check.overall_wellness} />
          {check.lighting_quality && (
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-sm)' }}>
              Lighting: {check.lighting_quality}
            </p>
          )}
        </div>

        {/* Indicators grid */}
        <div className="grid grid-3" style={{ gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
          {/* Fatigue */}
          <div className="card fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
              <Eye size={20} color="#6366f1" />
              <h3 style={{ fontSize: '1rem' }}>Fatigue</h3>
            </div>
            <IndicatorBadge level={check.fatigue_level} />
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-sm)', lineHeight: 1.5 }}>
              Based on Eye Aspect Ratio (EAR) analysis of facial landmarks.
            </p>
            {check.ear_value !== null && (
              <div style={{ marginTop: 'var(--spacing-sm)', padding: '0.5rem 0.75rem', background: 'rgba(99,102,241,0.08)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                EAR value: <code style={{ color: 'var(--color-primary-light)' }}>{check.ear_value?.toFixed(4)}</code>
              </div>
            )}
          </div>

          {/* Stress */}
          <div className="card fade-in" style={{ animationDelay: '0.1s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
              <Brain size={20} color="#06b6d4" />
              <h3 style={{ fontSize: '1rem' }}>Stress-Related</h3>
            </div>
            <IndicatorBadge level={check.stress_level} />
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-sm)', lineHeight: 1.5 }}>
              Experimental brow-tension proxy via facial landmark geometry.
            </p>
            {check.brow_tension !== null && (
              <div style={{ marginTop: 'var(--spacing-sm)', padding: '0.5rem 0.75rem', background: 'rgba(6,182,212,0.08)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                Brow tension: <code style={{ color: '#67e8f9' }}>{check.brow_tension?.toFixed(4)}</code>
              </div>
            )}
          </div>

          {/* Skin */}
          <div className="card fade-in" style={{ animationDelay: '0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
              <Sparkles size={20} color="#10b981" />
              <h3 style={{ fontSize: '1rem' }}>Skin Observations</h3>
            </div>
            {check.skin_observations ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {Object.entries(check.skin_observations)
                  .filter(([k]) => k !== 'note')
                  .map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                        {key.replace('_', ' ')}
                      </span>
                      <span style={{ color: 'var(--color-text-primary)' }}>{val}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>No skin data recorded.</span>
            )}
          </div>
        </div>

        {/* What was observed */}
        <div className="card fade-in" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>What VitaMirror Observed</h3>
          <ul style={{ color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: 'var(--spacing-md)' }}>
            <li>Eye activity and openness (Eye Aspect Ratio)</li>
            <li>Brow landmark distances (stress-related proxy)</li>
            <li>Visible skin region brightness and color characteristics</li>
            <li>Texture variation in face region</li>
            <li>Overall lighting conditions</li>
          </ul>
        </div>

        {/* Disclaimer */}
        <div className="alert alert-warning fade-in" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '0.8rem' }}>
            <strong>Important Disclaimer</strong>
            <p style={{ color: 'inherit', marginTop: '0.375rem' }}>
              VitaMirror provides experimental, non-diagnostic wellness observations based on computer vision.
              It does not diagnose medical or psychological conditions. Consult a qualified healthcare professional
              for any health concerns.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          <Link to="/check" className="btn btn-primary" id="new-check-btn">
            New Wellness Check
          </Link>
          <Link to="/history" className="btn btn-secondary" id="view-history-btn">
            View History
          </Link>
          <Link to="/dashboard" className="btn btn-secondary" id="back-dashboard-btn">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
