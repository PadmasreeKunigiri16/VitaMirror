import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Eye, Brain, Sparkles, Clock, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { listChecks, checkHealth } from '../services/api';
import type { WellnessCheck } from '../types/wellness';
import IndicatorBadge from '../components/IndicatorBadge';

const DashboardPage: React.FC = () => {
  const [checks, setChecks] = useState<WellnessCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        await checkHealth();
        setApiOnline(true);
        const result = await listChecks(0, 5);
        setChecks(result.checks);
      } catch {
        setApiOnline(false);
        setError('Cannot connect to the VitaMirror backend. Please ensure the server is running on port 8000.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const latest = checks[0] || null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  return (
    <div style={{ flex: 1, padding: 'var(--spacing-xl) 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
          <div>
            <div className="section-label">Dashboard</div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '0.375rem' }}>
              Wellness Overview
            </h1>
            <p style={{ fontSize: '0.875rem' }}>Your latest wellness indicators at a glance.</p>
          </div>
          <Link to="/check" className="btn btn-primary" id="dashboard-start-check-btn">
            <Plus size={16} />
            New Wellness Check
          </Link>
        </div>

        {/* API status banner */}
        {apiOnline === false && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <Activity size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 'var(--spacing-md)' }}>
            <div className="spinner spinner-lg" />
            <span style={{ color: 'var(--color-text-secondary)' }}>Loading dashboard…</span>
          </div>
        ) : (
          <>
            {/* Latest check summary */}
            {latest ? (
              <div className="card card-gradient fade-in" style={{ marginBottom: 'var(--spacing-xl)', boxShadow: 'var(--shadow-glow)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '0.375rem' }}>Latest Wellness Check</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                      <Clock size={12} />
                      {formatDate(latest.created_at)}
                    </div>
                  </div>
                  <IndicatorBadge level={latest.overall_wellness} label="Overall" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--spacing-md)' }}>
                  {/* Fatigue */}
                  <div style={{ padding: 'var(--spacing-md)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--spacing-sm)' }}>
                      <Eye size={16} color="#6366f1" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fatigue</span>
                    </div>
                    <IndicatorBadge level={latest.fatigue_level} />
                    {latest.ear_value !== null && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>
                        EAR: {latest.ear_value?.toFixed(3)}
                      </p>
                    )}
                  </div>

                  {/* Stress */}
                  <div style={{ padding: 'var(--spacing-md)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--spacing-sm)' }}>
                      <Brain size={16} color="#06b6d4" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Stress</span>
                    </div>
                    <IndicatorBadge level={latest.stress_level} />
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>Experimental indicator</p>
                  </div>

                  {/* Skin */}
                  <div style={{ padding: 'var(--spacing-md)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--spacing-sm)' }}>
                      <Sparkles size={16} color="#10b981" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Skin</span>
                    </div>
                    {latest.skin_observations ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          Brightness: {latest.skin_observations['brightness'] || '—'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          Redness: {latest.skin_observations['redness'] || '—'}
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>No data</span>
                    )}
                  </div>

                  {/* Lighting */}
                  <div style={{ padding: 'var(--spacing-md)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--spacing-sm)' }}>
                      <TrendingUp size={16} color="#f59e0b" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Lighting</span>
                    </div>
                    <IndicatorBadge level={latest.lighting_quality || 'unknown'} />
                  </div>
                </div>

                <div style={{ marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--color-border)' }}>
                  <Link to={`/history/${latest.id}`} className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
                    View Full Result
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              /* Empty state */
              <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', marginBottom: 'var(--spacing-xl)' }}>
                <Activity size={48} color="var(--color-text-muted)" style={{ margin: '0 auto var(--spacing-md)' }} />
                <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>No wellness checks yet</h3>
                <p style={{ marginBottom: 'var(--spacing-xl)' }}>
                  Run your first wellness check to see indicators here.
                </p>
                <Link to="/check" className="btn btn-primary btn-lg" id="empty-start-check-btn">
                  Start First Check
                  <ArrowRight size={18} />
                </Link>
              </div>
            )}

            {/* Recent history */}
            {checks.length > 1 && (
              <div className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                  <h3 style={{ fontSize: '1rem' }}>Recent Checks</h3>
                  <Link to="/history" style={{ fontSize: '0.875rem' }}>View all →</Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  {checks.slice(1).map((check) => (
                    <Link
                      key={check.id}
                      to={`/history/${check.id}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div className="card" style={{ padding: 'var(--spacing-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                          <Clock size={14} color="var(--color-text-muted)" />
                          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                            {formatDate(check.created_at)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <IndicatorBadge level={check.fatigue_level} label="Fatigue" />
                          <IndicatorBadge level={check.stress_level} label="Stress" />
                          <IndicatorBadge level={check.overall_wellness} label="Overall" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="alert alert-info" style={{ marginTop: 'var(--spacing-xl)' }}>
              <Activity size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: '0.8rem' }}>
                VitaMirror provides experimental, non-diagnostic wellness observations based on computer vision.
                These indicators do not constitute medical advice. Consult a qualified healthcare professional for health concerns.
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
