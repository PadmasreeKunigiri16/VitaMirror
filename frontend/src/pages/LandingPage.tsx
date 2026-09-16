import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Eye, Brain, Sparkles, Shield, ChevronRight,
  AlertTriangle, Zap, Star, ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: <Eye size={28} color="#6366f1" />,
    title: 'Fatigue Insights',
    desc: 'Eye Aspect Ratio (EAR) analysis and blink-related observations provide an experimental estimate of fatigue-related visual cues.',
    badge: 'CV-Powered',
  },
  {
    icon: <Brain size={28} color="#06b6d4" />,
    title: 'Stress-Related Indicators',
    desc: 'Experimental brow-tension proxy via facial landmark geometry. Clearly labeled non-diagnostic and non-clinical.',
    badge: 'Experimental',
  },
  {
    icon: <Sparkles size={28} color="#10b981" />,
    title: 'Skin Observations',
    desc: 'Brightness, texture variation, color uniformity, and redness observations from the visible face region.',
    badge: 'Observational',
  },
  {
    icon: <Shield size={28} color="#f59e0b" />,
    title: 'Privacy First',
    desc: 'Frames are analyzed locally. No images are stored permanently. Only metadata wellness indicators are saved.',
    badge: 'Local Processing',
  },
];

const steps = [
  { num: '01', title: 'Allow Camera', desc: 'Grant browser camera permission – processing happens on your device.' },
  { num: '02', title: 'Face Detection', desc: 'MediaPipe FaceMesh locates 468 facial landmarks in real time.' },
  { num: '03', title: 'Analysis', desc: 'Computer vision algorithms compute EAR, brow geometry, and skin ROI observations.' },
  { num: '04', title: 'Results', desc: 'Non-diagnostic wellness indicators displayed with full explanations.' },
];

const LandingPage: React.FC = () => {
  return (
    <div style={{ flex: 1 }}>
      {/* ── Hero ──────────────────────────────── */}
      <section style={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        background: 'var(--gradient-hero)',
        position: 'relative',
        overflow: 'hidden',
        padding: 'var(--spacing-2xl) 0',
      }}>
        {/* Background glow orbs */}
        <div style={{
          position: 'absolute', top: '20%', left: '5%', width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '5%', width: 350, height: 350,
          background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.375rem 1rem',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 'var(--radius-full)',
              marginBottom: 'var(--spacing-xl)',
            }}>
              <Zap size={14} color="#818cf8" />
              <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600 }}>
                AI-Powered Computer Vision Wellness
              </span>
            </div>

            <h1 style={{ marginBottom: 'var(--spacing-lg)', lineHeight: 1.1 }}>
              Meet{' '}
              <span className="gradient-text">VitaMirror</span>
            </h1>

            <p style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--spacing-xl)',
              maxWidth: 600,
              margin: '0 auto var(--spacing-xl)',
              lineHeight: 1.7,
            }}>
              AI-powered computer vision for everyday wellness insights.
              VitaMirror uses your webcam to observe visible facial cues
              and provide <strong style={{ color: 'var(--color-text-primary)' }}>
                non-diagnostic wellness indicators
              </strong> for fatigue, stress, and skin health.
            </p>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/check" className="btn btn-primary btn-lg" id="hero-get-started-btn">
                Start Wellness Check
                <ArrowRight size={18} />
              </Link>
              <Link to="/dashboard" className="btn btn-secondary btn-lg" id="hero-dashboard-btn">
                View Dashboard
              </Link>
            </div>

            {/* Disclaimer banner */}
            <div className="alert alert-warning" style={{ marginTop: 'var(--spacing-xl)', textAlign: 'left', maxWidth: 600, margin: 'var(--spacing-xl) auto 0' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: '0.8rem' }}>
                <strong>Educational / Demo Application.</strong> VitaMirror does not diagnose
                medical conditions, mental health disorders, or skin diseases.
                Always consult a qualified healthcare professional.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────── */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 'var(--spacing-2xl)' }}>
            <div className="section-label">How It Works</div>
            <h2>Computer Vision Pipeline</h2>
            <p style={{ maxWidth: 500, margin: '0 auto' }}>
              Four steps from webcam to wellness insights using OpenCV and MediaPipe.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--spacing-lg)',
          }}>
            {steps.map((step) => (
              <div key={step.num} className="card fade-in" style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: 'var(--spacing-sm)',
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-xs)' }}>{step.title}</h3>
                <p style={{ fontSize: '0.875rem' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: 'var(--spacing-2xl)' }}>
            <div className="section-label">Features</div>
            <h2>What VitaMirror Observes</h2>
          </div>
          <div className="grid grid-2" style={{ gap: 'var(--spacing-lg)' }}>
            {features.map((f) => (
              <div key={f.title} className="card card-gradient fade-in">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)' }}>
                  <div style={{
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 'var(--radius-md)',
                    flexShrink: 0,
                  }}>
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: '0.375rem' }}>
                      <h3 style={{ fontSize: '1.05rem' }}>{f.title}</h3>
                      <span className="badge badge-unknown" style={{ fontSize: '0.7rem' }}>{f.badge}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy ───────────────────────────── */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="container" style={{ maxWidth: 700, textAlign: 'center' }}>
          <div className="section-label">Privacy</div>
          <h2>Your Privacy Matters</h2>
          <p style={{ marginBottom: 'var(--spacing-xl)' }}>
            VitaMirror processes webcam frames locally via your browser.
            No raw images are stored permanently. Only aggregated wellness indicator
            metadata is saved to the local database if you choose to save a result.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
            {['No images stored', 'Local processing', 'Delete anytime', 'Open source'].map((t) => (
              <span key={t} className="badge badge-good">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────── */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{
            background: 'var(--gradient-card)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--spacing-2xl)',
            boxShadow: 'var(--shadow-glow)',
          }}>
            <Star size={32} color="#6366f1" style={{ marginBottom: 'var(--spacing-md)' }} />
            <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Ready to get started?</h2>
            <p style={{ marginBottom: 'var(--spacing-xl)', maxWidth: 400, margin: '0 auto var(--spacing-xl)' }}>
              Run your first wellness check in under 60 seconds. No signup required.
            </p>
            <Link to="/check" className="btn btn-primary btn-lg" id="cta-btn">
              Start Free Wellness Check
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        padding: 'var(--spacing-xl)',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        fontSize: '0.8rem',
      }}>
        <p>
          VitaMirror is an educational demonstration application.
          It does not provide medical advice and should not be used as a substitute for professional healthcare.
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          Built with Python · FastAPI · OpenCV · MediaPipe · React · TypeScript
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
