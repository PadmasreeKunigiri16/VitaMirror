import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Square, RefreshCw, Camera, Zap, AlertTriangle } from 'lucide-react';
import CameraView from '../components/CameraView';
import { useCamera } from '../hooks/useCamera';
import { useWellnessAnalysis } from '../hooks/useWellnessAnalysis';

type CheckPhase =
  | 'idle'
  | 'camera_starting'
  | 'camera_ready'
  | 'detecting'
  | 'analyzing'
  | 'complete'
  | 'error';

const WellnessCheckPage: React.FC = () => {
  const navigate = useNavigate();
  const { videoRef, status: cameraStatus, errorMessage, startCamera, stopCamera, captureFrame } = useCamera();
  const { status: analysisStatus, result, savedCheck, errorMessage: analysisError, analyze, saveResult, reset } = useWellnessAnalysis();

  const [phase, setPhase] = useState<CheckPhase>('idle');
  const [faceDetected, setFaceDetected] = useState(false);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [captureCount, setCaptureCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start camera
  const handleStartCamera = useCallback(async () => {
    setPhase('camera_starting');
    await startCamera();
  }, [startCamera]);

  // When camera becomes active → start detecting
  useEffect(() => {
    if (cameraStatus === 'active') {
      setPhase('camera_ready');
      setStatusMsg('Camera ready. Click "Start Analysis" when ready.');
    } else if (cameraStatus === 'denied' || cameraStatus === 'unavailable' || cameraStatus === 'error') {
      setPhase('error');
    }
  }, [cameraStatus]);

  // Live analysis loop
  const startAnalysis = useCallback(() => {
    if (cameraStatus !== 'active') return;
    setPhase('detecting');
    setStatusMsg('Looking for a face…');
    setCaptureCount(0);

    intervalRef.current = setInterval(async () => {
      const frame = captureFrame();
      if (!frame) return;

      setCaptureCount((c) => c + 1);
      setPhase('analyzing');
      setStatusMsg('Analyzing…');

      await analyze(frame);
    }, 2500); // analyze every 2.5 seconds
  }, [cameraStatus, captureFrame, analyze]);

  // Update state from analysis result
  useEffect(() => {
    if (result) {
      setFaceDetected(result.face_detected);
      setMultipleFaces(result.multiple_faces);
      setStatusMsg(result.status_message || 'Analysis complete');
      if (result.success && result.face_detected) {
        setPhase('analyzing');
      }
    }
  }, [result]);

  const stopAnalysis = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPhase('camera_ready');
    setStatusMsg('Analysis paused.');
  }, []);

  const handleComplete = useCallback(async () => {
    stopAnalysis();
    setPhase('complete');
  }, [stopAnalysis]);

  const handleSaveAndView = useCallback(async () => {
    const saved = await saveResult();
    stopCamera();
    if (saved) {
      navigate(`/history/${saved.id}`);
    } else {
      navigate('/dashboard');
    }
  }, [saveResult, stopCamera, navigate]);

  const handleRetake = useCallback(() => {
    stopAnalysis();
    reset();
    setFaceDetected(false);
    setMultipleFaces(false);
    setStatusMsg('');
    setPhase('camera_ready');
  }, [stopAnalysis, reset]);

  const handleStop = useCallback(() => {
    stopAnalysis();
    stopCamera();
    reset();
    setPhase('idle');
  }, [stopAnalysis, stopCamera, reset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div style={{ flex: 1, padding: 'var(--spacing-xl) 0' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="section-label">Wellness Check</div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Camera Analysis</h1>
          <p style={{ fontSize: '0.875rem', marginTop: '0.375rem' }}>
            Position your face in the camera frame for wellness analysis.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 'var(--spacing-xl)', alignItems: 'start' }}>
          {/* Camera */}
          <div>
            <CameraView
              videoRef={videoRef}
              status={cameraStatus}
              errorMessage={errorMessage}
              onStart={handleStartCamera}
              faceDetected={faceDetected}
              multipleFaces={multipleFaces}
              statusMessage={statusMsg}
              analysisStatus={phase === 'analyzing' ? 'analyzing' : phase === 'complete' ? 'complete' : 'idle'}
            />

            {/* Controls */}
            {cameraStatus === 'active' && (
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                {(phase === 'camera_ready' || phase === 'detecting') && (
                  <button className="btn btn-primary" onClick={startAnalysis} id="start-analysis-btn">
                    <Zap size={16} />
                    Start Analysis
                  </button>
                )}
                {phase === 'analyzing' && (
                  <>
                    <button className="btn btn-secondary" onClick={stopAnalysis} id="pause-btn">
                      <Square size={16} />
                      Pause
                    </button>
                    <button className="btn btn-primary" onClick={handleComplete} id="complete-btn">
                      Complete Check
                    </button>
                  </>
                )}
                {phase === 'complete' && (
                  <>
                    <button className="btn btn-primary" onClick={handleSaveAndView} id="save-result-btn">
                      Save & View Results
                    </button>
                    <button className="btn btn-secondary" onClick={handleRetake} id="retake-btn">
                      <RefreshCw size={16} />
                      Retake
                    </button>
                  </>
                )}
                {phase !== 'idle' && (
                  <button className="btn btn-danger" onClick={handleStop} id="stop-btn">
                    <Square size={16} />
                    Stop
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar – live results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {/* Instructions */}
            <div className="card" style={{ fontSize: '0.875rem' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: 'var(--spacing-sm)' }}>Tips for best results</h3>
              <ul style={{ paddingLeft: 'var(--spacing-md)', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <li>Ensure good lighting on your face</li>
                <li>Face the camera directly</li>
                <li>Keep your face fully in frame</li>
                <li>Avoid excessive movement</li>
                <li>Remain still for 10–15 seconds</li>
              </ul>
            </div>

            {/* Live indicator preview */}
            {result && result.face_detected && (
              <div className="card card-gradient fade-in">
                <h3 style={{ fontSize: '0.95rem', marginBottom: 'var(--spacing-md)' }}>
                  Live Indicators
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                    (frame #{captureCount})
                  </span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Fatigue</span>
                    <span className={`badge badge-${result.fatigue_level}`}>
                      {result.fatigue_level}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Stress</span>
                    <span className={`badge badge-${result.stress_level}`}>
                      {result.stress_level}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Overall</span>
                    <span className={`badge badge-${result.overall_wellness}`}>
                      {result.overall_wellness}
                    </span>
                  </div>
                  {result.ear_value !== null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>EAR</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                        {result.ear_value?.toFixed(3)}
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Lighting</span>
                    <span className={`badge badge-${result.lighting_quality === 'good' ? 'low' : result.lighting_quality === 'poor' ? 'elevated' : 'moderate'}`}>
                      {result.lighting_quality}
                    </span>
                  </div>
                </div>

                {result.skin_observations && (
                  <>
                    <div className="divider" style={{ margin: 'var(--spacing-sm) 0' }} />
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>Skin Observations</p>
                    {Object.entries(result.skin_observations)
                      .filter(([k]) => k !== 'note')
                      .map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.2rem' }}>
                          <span style={{ textTransform: 'capitalize' }}>{k.replace('_', ' ')}</span>
                          <span style={{ color: 'var(--color-text-primary)' }}>{v}</span>
                        </div>
                      ))}
                  </>
                )}
              </div>
            )}

            {/* Error */}
            {analysisError && (
              <div className="alert alert-error">
                <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.8rem' }}>{analysisError}</span>
              </div>
            )}

            {/* Disclaimer */}
            <div className="alert alert-info" style={{ fontSize: '0.75rem' }}>
              <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                All indicators are experimental and non-diagnostic. Not a substitute for medical advice.
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .container > div[style*="grid"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WellnessCheckPage;
