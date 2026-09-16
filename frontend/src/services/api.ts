import axios from 'axios';
import type {
  AnalyzeFrameResponse,
  WellnessCheck,
  WellnessCheckCreate,
  WellnessCheckList,
  HealthResponse,
} from '../types/wellness';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Health ──────────────────────────────────
export const checkHealth = async (): Promise<HealthResponse> => {
  const { data } = await api.get<HealthResponse>('/health');
  return data;
};

// ── Analysis ────────────────────────────────
export const analyzeFrame = async (frameData: string): Promise<AnalyzeFrameResponse> => {
  const { data } = await api.post<AnalyzeFrameResponse>('/wellness/analyze', {
    frame_data: frameData,
    timestamp: new Date().toISOString(),
  });
  return data;
};

// ── Wellness Checks CRUD ─────────────────────
export const saveCheck = async (check: WellnessCheckCreate): Promise<WellnessCheck> => {
  const { data } = await api.post<WellnessCheck>('/wellness/checks', check);
  return data;
};

export const listChecks = async (skip = 0, limit = 50): Promise<WellnessCheckList> => {
  const { data } = await api.get<WellnessCheckList>('/wellness/checks', {
    params: { skip, limit },
  });
  return data;
};

export const getCheck = async (id: number): Promise<WellnessCheck> => {
  const { data } = await api.get<WellnessCheck>(`/wellness/checks/${id}`);
  return data;
};

export const deleteCheck = async (id: number): Promise<void> => {
  await api.delete(`/wellness/checks/${id}`);
};

export default api;
