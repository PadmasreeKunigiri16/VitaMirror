import React from 'react';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, CameraOff, AlertCircle, Loader, CheckCircle, Users } from 'lucide-react';
import type { CameraStatus } from '../hooks/useCamera';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  errorMessage: string | null;
  onStart: () => void;
  faceDetected?: boolean;
  multipleFaces?: boolean;
  statusMessage?: string;
  analysisStatus?: 'idle' | 'analyzing' | 'complete' | 'error';
}

const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  status,
  errorMessage,
  onStart,
  faceDetected = false,
  multipleFaces = false,
  statusMessage = '',
  analysisStatus = 'idle',
}) => {
  const getOverlayColor = () => {
    if (multipleFaces) return '#f59e0b';
    if (faceDetected) return '#10b981';
    if (status === 'active') return '#6366f1';
    return '#64748b';
  };

  const getStatusText = () => {
    if (analysisStatus === 'analyzing') return 'Analyzing...';
    if (analysisStatus === 'complete') return 'Analysis complete';
    if (statusMessage) return statusMessage;
    if (multipleFaces) return 'Multiple faces detected';
    if (faceDetected) return 'Face detected';
    if (status === 'active') return 'Looking for a face...';
    return 'Camera ready';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      {/* Camera frame */}
      <div className="camera-container" style={{
        minHeight: 300,
        boxShadow: faceDetected
          ? `0 0 30px rgba(16, 185, 129, 0.3), var(--shadow-card)`
          : `var(--shadow-card)`,
      }}>
        {status === 'active' ? (
          <>
            <video
              ref={videoRef}
              className="camera-video"
              autoPlay
              playsInline
              muted
            />
            {/* Face detection overlay border */}
            {faceDetected && (
              <div style={{
                position: 'absolute',
                inset: 0,
                border: `2px solid ${getOverlayColor()}`,
                borderRadius: 'var(--radius-xl)',
                pointerEvents: 'none',
                animation: 'fadeIn 0.3s ease',
              }} />
            )}
            {/* Scanning animation when analyzing */}
            {analysisStatus === 'analyzing' && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.08) 50%, transparent 100%)',
                animation: 'scanLine 1.5s ease-in-out infinite',
              }} />
            )}
          </>
        ) : (
          /* Placeholder when camera is off */
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-md)',
            background: 'rgba(10, 11, 30, 0.8)',
          }}>
            {status === 'requesting' ? (
              <>
                <div className="spinner spinner-lg" />
                <p style={{ color: 'var(--color-text-secondary)' }}>Requesting camera…</p>
              </>
            ) : status === 'denied' || status === 'unavailable' || status === 'error' ? (
              <>
                <CameraOff size={48} color="#ef4444" />
                <p style={{ color: '#f87171', textAlign: 'center', padding: '0 1rem' }}>
                  {errorMessage || 'Camera unavailable'}
                </p>
              </>
            ) : (
              <>
                <Camera size={48} color="var(--color-text-muted)" />
                <p style={{ color: 'var(--color-text-secondary)' }}>Camera preview</p>
                <button className="btn btn-primary btn-lg" onClick={onStart} id="start-camera-btn">
                  Start Camera
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Status bar */}
      {status === 'active' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          background: 'var(--color-bg-glass)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
        }}>
          {analysisStatus === 'analyzing' ? (
            <div className="spinner" />
          ) : analysisStatus === 'complete' ? (
            <CheckCircle size={16} color="#10b981" />
          ) : faceDetected ? (
            <span className="status-dot green pulse" />
          ) : (
            <span className="status-dot gray pulse" />
          )}
          <span style={{ color: 'var(--color-text-secondary)' }}>{getStatusText()}</span>
          {multipleFaces && (
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24' }}>
              <Users size={14} />
              Multiple faces
            </span>
          )}
        </div>
      )}

      {/* Error/warning alerts */}
      {status === 'denied' && (
        <div className="alert alert-error">
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Camera Access Denied</strong>
            <p style={{ color: 'inherit', marginTop: '0.25rem', fontSize: '0.8rem' }}>
              Please allow camera access in your browser settings and refresh the page.
            </p>
          </div>
        </div>
      )}
      {status === 'unavailable' && (
        <div className="alert alert-error">
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>No Camera Found</strong>
            <p style={{ color: 'inherit', marginTop: '0.25rem', fontSize: '0.8rem' }}>
              Please connect a camera and try again.
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scanLine {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};

export default CameraView;
