# VitaMirror – Project Requirements

## Problem Statement

Many people lack quick, accessible ways to check everyday wellness indicators without scheduling a doctor's appointment. VitaMirror demonstrates how computer vision can provide non-diagnostic, educational wellness observations using just a webcam.

## Functional Requirements

### FR-01 Camera Integration
- Application must request and handle camera permissions
- Display live webcam feed with mirrored view
- Handle camera denied, unavailable, and error states gracefully

### FR-02 Face Detection
- Detect presence of a human face in the webcam frame
- Handle no-face and multiple-faces scenarios
- Display appropriate status messages to the user

### FR-03 Wellness Analysis
- Compute Eye Aspect Ratio (EAR) for fatigue indicator
- Compute brow tension proxy for stress-related indicator
- Compute skin brightness, texture, color uniformity, redness for skin observations
- Assess lighting quality
- Produce overall wellness label

### FR-04 Results Display
- Show all indicators with clear, non-clinical labels
- Include disclaimer on every results view
- Provide save, retake, and new check options

### FR-05 History
- Store completed checks in local SQLite database
- Display history list sorted newest first
- Allow individual and bulk deletion
- Show trend chart where >= 2 checks exist

### FR-06 Privacy
- Never store raw camera images
- Provide full data disclosure
- Allow users to delete all history

## Non-Functional Requirements

### NFR-01 Disclaimer
Every view showing wellness indicators must include a non-diagnostic disclaimer.

### NFR-02 Performance
- Analysis response < 5 seconds per frame
- Frontend must remain responsive during analysis

### NFR-03 Security
- Validate all API inputs via Pydantic
- Configure CORS for development origins only
- No API keys or secrets in source code

### NFR-04 Accessibility
- All interactive elements must have IDs for testing
- Color should not be the only indicator of status (badges include text labels)
- Sufficient color contrast for readability

## Out of Scope (v1)
- User authentication and multi-user support
- Cloud deployment
- Mobile native app
- Video recording or streaming
- Wearable device integration
