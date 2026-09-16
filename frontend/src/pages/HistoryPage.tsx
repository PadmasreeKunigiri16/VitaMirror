import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, Trash2, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { listChecks, deleteCheck } from '../services/api';
import type { WellnessCheck } from '../types/wellness';
import IndicatorBadge from '../components/IndicatorBadge';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const LEVEL_TO_NUM: Record<string, number> = {
  low: 1, good: 1,
  moderate: 2, fair: 2,
  elevated: 3, poor: 3,
  unknown: 0,
};

const HistoryPage: React.FC = () => {
  const [checks, setChecks] = useState<WellnessCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = async () => {
    try {
      const result = await listChecks(0, 50);
      setChecks(result.checks);
    } catch {
      setError('Failed to load history. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this check?')) return;
    setDeleting(id);
    try {
      await deleteCheck(id);
      setChecks((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError('Failed to delete.');
    } finally {
      setDeleting(null);
    }
  };

  // Chart data – reverse so oldest first
  const chartData = [...checks].reverse().map((c) => ({
    date: new Date(c.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    fatigue: LEVEL_TO_NUM[c.fatigue_level] ?? 0,
    stress: LEVEL_TO_NUM[c.stress_level] ?? 0,
  }));

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
            <div className="section-label">History</div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Wellness History</h1>
            <p style={{ fontSize: '0.875rem', marginTop: '0.375rem' }}>
              {checks.length} check{checks.length !== 1 ? 's' : ''} recorded
            </p>
          </div>
          <Link to="/check" className="btn btn-primary" id="history-new-check-btn">
            + New Check
          </Link>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, gap: 'var(--spacing-md)' }}>
            <div className="spinner spinner-lg" />
            <span>Loading history…</span>
          </div>
        ) : checks.length === 0 ? (
          /* Empty state */
          <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
            <Activity size={48} color="var(--color-text-muted)" style={{ margin: '0 auto var(--spacing-md)' }} />
            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>No history yet</h3>
            <p style={{ marginBottom: 'var(--spacing-xl)' }}>Complete a wellness check to see your history here.</p>
            <Link to="/check" className="btn btn-primary btn-lg" id="empty-history-check-btn">Start Wellness Check</Link>
          </div>
        ) : (
          <>
            {/* Trend chart */}
            {chartData.length >= 2 && (
              <div className="card fade-in" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                  <TrendingUp size={18} color="var(--color-primary-light)" />
                  <h3 style={{ fontSize: '1rem' }}>Trend (1 = Low / 2 = Moderate / 3 = Elevated)</h3>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis domain={[0, 3]} ticks={[1, 2, 3]} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#0f1030', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }}
                      formatter={(v, name) => {
                        const labels: Record<number, string> = { 0: 'Unknown', 1: 'Low', 2: 'Moderate', 3: 'Elevated' };
                        return [labels[Number(v)] || v, name];
                      }}
                    />
                    <Line type="monotone" dataKey="fatigue" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} name="Fatigue" />
                    <Line type="monotone" dataKey="stress" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3, fill: '#06b6d4' }} name="Stress" />
                  </LineChart>
                </ResponsiveContainer>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-sm)' }}>
                  Trend chart shows fatigue and stress-related indicators over time. Lower values are better.
                </p>
              </div>
            )}

            {/* Check list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {checks.map((check) => (
                <Link
                  key={check.id}
                  to={`/history/${check.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    className="card"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 'var(--spacing-sm)',
                      cursor: 'pointer',
                      transition: 'background var(--transition-fast)',
                    }}
                    id={`history-item-${check.id}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--gradient-card)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Activity size={16} color="var(--color-primary-light)" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                          Wellness Check #{check.id}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                          <Clock size={10} />
                          {formatDate(check.created_at)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                      <IndicatorBadge level={check.fatigue_level} label="Fatigue" />
                      <IndicatorBadge level={check.stress_level} label="Stress" />
                      <IndicatorBadge level={check.overall_wellness} label="Overall" />
                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                        onClick={(e) => handleDelete(check.id, e)}
                        disabled={deleting === check.id}
                        id={`delete-${check.id}-btn`}
                      >
                        <Trash2 size={12} />
                      </button>
                      <ChevronRight size={16} color="var(--color-text-muted)" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
