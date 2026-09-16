// API types matching backend Pydantic schemas

export type IndicatorLevel = 'low' | 'moderate' | 'elevated' | 'unknown';
export type WellnessLevel = 'good' | 'fair' | 'poor' | 'unknown';
export type LightingQuality = 'good' | 'fair' | 'poor' | 'unknown';

export interface SkinObservations {
  brightness: string;
  texture_variation: string;
  color_uniformity: string;
  redness: string;
  note?: string;
}

export interface AnalyzeFrameResponse {
  success: boolean;
  face_detected: boolean;
  multiple_faces: boolean;
  lighting_quality: LightingQuality;
  fatigue_level: IndicatorLevel;
  stress_level: IndicatorLevel;
  overall_wellness: WellnessLevel;
  ear_value: number | null;
  blink_rate: number | null;
  brow_tension: number | null;
  skin_observations: SkinObservations | null;
  status_message: string;
  disclaimer: string;
  error: string | null;
}

export interface WellnessCheck {
  id: number;
  created_at: string;
  fatigue_level: IndicatorLevel;
  stress_level: IndicatorLevel;
  overall_wellness: WellnessLevel;
  skin_observations: Record<string, string> | null;
  ear_value: number | null;
  blink_rate: number | null;
  brow_tension: number | null;
  skin_brightness: number | null;
  skin_texture_variance: number | null;
  skin_redness: number | null;
  lighting_quality: string | null;
  face_detected: boolean;
  notes: string | null;
}

export interface WellnessCheckCreate {
  fatigue_level: IndicatorLevel;
  stress_level: IndicatorLevel;
  overall_wellness: WellnessLevel;
  skin_observations?: Record<string, string> | null;
  ear_value?: number | null;
  blink_rate?: number | null;
  brow_tension?: number | null;
  skin_brightness?: number | null;
  skin_texture_variance?: number | null;
  skin_redness?: number | null;
  lighting_quality?: string | null;
  face_detected?: boolean;
  notes?: string | null;
}

export interface WellnessCheckList {
  checks: WellnessCheck[];
  total: number;
}

export interface HealthResponse {
  status: string;
  version: string;
  service: string;
}
