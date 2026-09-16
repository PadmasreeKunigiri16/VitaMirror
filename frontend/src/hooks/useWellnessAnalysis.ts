import { useState, useCallback, useRef } from 'react';
import { analyzeFrame, saveCheck } from '../services/api';
import type { AnalyzeFrameResponse, WellnessCheck } from '../types/wellness';

export type AnalysisStatus =
  | 'idle'
  | 'analyzing'
  | 'complete'
  | 'error';

interface UseWellnessAnalysisReturn {
  status: AnalysisStatus;
  result: AnalyzeFrameResponse | null;
  savedCheck: WellnessCheck | null;
  errorMessage: string | null;
  analyze: (frameB64: string) => Promise<void>;
  saveResult: () => Promise<WellnessCheck | null>;
  reset: () => void;
}

export const useWellnessAnalysis = (): UseWellnessAnalysisReturn => {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [result, setResult] = useState<AnalyzeFrameResponse | null>(null);
  const [savedCheck, setSavedCheck] = useState<WellnessCheck | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const latestResult = useRef<AnalyzeFrameResponse | null>(null);

  const analyze = useCallback(async (frameB64: string) => {
    setStatus('analyzing');
    setErrorMessage(null);
    try {
      const response = await analyzeFrame(frameB64);
      setResult(response);
      latestResult.current = response;
      setStatus('complete');
    } catch (err: unknown) {
      const error = err as Error;
      setStatus('error');
      setErrorMessage(error.message || 'Analysis failed. Please check your connection and try again.');
    }
  }, []);

  const saveResult = useCallback(async (): Promise<WellnessCheck | null> => {
    const r = latestResult.current;
    if (!r) return null;
    try {
      const check = await saveCheck({
        fatigue_level: r.fatigue_level,
        stress_level: r.stress_level,
        overall_wellness: r.overall_wellness,
        skin_observations: r.skin_observations
          ? {
              brightness: r.skin_observations.brightness,
              texture_variation: r.skin_observations.texture_variation,
              color_uniformity: r.skin_observations.color_uniformity,
              redness: r.skin_observations.redness,
            }
          : null,
        ear_value: r.ear_value,
        blink_rate: r.blink_rate,
        brow_tension: r.brow_tension,
        lighting_quality: r.lighting_quality,
        face_detected: r.face_detected,
      });
      setSavedCheck(check);
      return check;
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(`Failed to save result: ${error.message}`);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setSavedCheck(null);
    setErrorMessage(null);
    latestResult.current = null;
  }, []);

  return { status, result, savedCheck, errorMessage, analyze, saveResult, reset };
};
