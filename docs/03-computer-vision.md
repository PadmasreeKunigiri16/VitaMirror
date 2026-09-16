# VitaMirror – Computer Vision Pipeline

## Overview

VitaMirror uses a multi-step computer vision pipeline to extract wellness indicators from a webcam frame.

```
Base64 JPEG Frame (Browser)
        │
        ▼
┌───────────────────┐
│  Decode & Resize  │  OpenCV – decode base64, resize to 640×480
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Lighting Quality  │  HSV V-channel mean luminance → good/fair/poor
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Face Detection   │  MediaPipe FaceMesh – up to 2 faces
│  & 468 Landmarks  │  Detection confidence ≥ 0.5
└───────────────────┘
        │
        ├──────────────────────────────┐
        ▼                              ▼
┌───────────────────┐      ┌──────────────────────┐
│  EAR Computation  │      │   Skin ROI Analysis  │
│  (Eye Aspect Ratio│      │   (Center face crop) │
│  Brow Tension     │      │                      │
│  Mouth Openness)  │      └──────────────────────┘
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Indicator Labels  │  low / moderate / elevated
│ Overall Wellness  │  good / fair / poor
└───────────────────┘
        │
        ▼
   JSON Response
```

## Fatigue Indicator

### Algorithm
Based on **Eye Aspect Ratio (EAR)** (Soukupová & Čech, 2016):

```
EAR = (||p2 - p6|| + ||p3 - p5||) / (2 × ||p1 - p4||)
```

Where p1–p6 are the 6 key eye landmarks from MediaPipe FaceMesh.

### Thresholds (Approximate)

| EAR Value | Label |
|-----------|-------|
| > 0.27 | Low (eyes open) |
| 0.20 – 0.27 | Moderate (partially closed) |
| < 0.20 | Elevated (eyes drooping) |

Yawn proxy (mouth openness > 15%) can elevate the indicator.

### Disclaimer
EAR thresholds are approximations derived from drowsiness-detection research. They are NOT clinically validated for medical fatigue assessment.

## Stress-Related Indicator (Experimental)

### Algorithm
Measures normalized inner-brow distance:

```
norm_tension = dist(left_inner_brow, right_inner_brow) / jaw_width
```

### Thresholds

| Normalized Distance | Label |
|--------------------|-------|
| > 0.28 | Low |
| 0.18 – 0.28 | Moderate |
| < 0.18 | Elevated |

### Disclaimer
Brow furrowing is a rough proxy for facial tension. This is NOT a validated stress measurement. Results are highly sensitive to face angle, expression habits, and image quality.

## Skin Observations

### Metrics

| Metric | Method | Labels |
|--------|--------|--------|
| Brightness | Mean grayscale pixel value | low / moderate / normal / high |
| Texture Variation | Laplacian variance (sharpness of face crop) | smooth / moderate / high |
| Color Uniformity | Coefficient of variation across RGB channels | high / moderate / low |
| Redness | R/G channel ratio in face ROI | low / moderate / elevated |

### Disclaimer
All skin observations are experimental computer-vision measurements. Lighting and camera quality significantly affect readings. These observations do not diagnose skin diseases.

## MediaPipe Landmark Indices

| Region | Indices |
|--------|---------|
| Left eye | 362, 385, 387, 263, 373, 380 |
| Right eye | 33, 160, 158, 133, 153, 144 |
| Left inner brow | 336 |
| Right inner brow | 107 |
| Jaw left | 234 |
| Jaw right | 454 |
| Mouth top | 13 |
| Mouth bottom | 14 |
