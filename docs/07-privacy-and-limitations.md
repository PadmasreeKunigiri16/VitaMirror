# VitaMirror – Privacy & Limitations

## Privacy Statement

VitaMirror is an educational demonstration application. It processes webcam frames locally and stores only minimal computed wellness metadata.

### What Is Processed
- Short webcam frames captured in the browser
- Frames are sent to the local Python backend for analysis
- Frames are **never stored permanently**
- Analysis results are returned as JSON

### What Is Stored (if you save a check)
- Wellness indicator labels (low/moderate/elevated)
- Numeric metrics (EAR value, brow tension)
- Lighting quality label
- Timestamp

### What Is NOT Stored
- Camera images or video recordings
- Facial images or biometric data
- Personal identification information
- Audio or any other sensor data

### Where Data Lives
All data is stored in `backend/vitamirror.db` (SQLite) on your local machine. No data is sent to external servers.

---

## Medical & Clinical Limitations

### Fatigue Indicator
- Based on EAR (Eye Aspect Ratio) thresholds from academic literature
- Thresholds were developed for drowsiness detection in driving contexts
- NOT validated for general fatigue assessment
- Affected by lighting, camera angle, glasses, contact lenses, individual eye shape

### Stress-Related Indicator
- Uses brow landmark distance as a rough proxy for facial tension
- No clinical validation whatsoever
- Extremely sensitive to face angle and expression habits
- Should be considered a visual curiosity, not a health metric

### Skin Observations
- Computer-vision pixel analysis of face region
- Not a medical skin analysis
- Cannot detect skin diseases, acne, eczema, rosacea, or any condition
- Results are dominated by lighting conditions and camera white balance

### Overall Wellness Score
- A simple rule-based combination of the above indicators
- Not a clinical health score
- Should not be used for any health decision-making

---

## Recommended Usage

VitaMirror is appropriate for:
- Computer vision education and demonstration
- Learning about MediaPipe and OpenCV
- Exploring facial landmark detection
- Academic projects

VitaMirror is NOT appropriate for:
- Any medical decision-making
- Diagnosing fatigue, stress, or skin conditions
- Monitoring patient health
- Any clinical or professional healthcare context

---

## Seeking Help

If you have concerns about your health, please consult a qualified healthcare professional. Do not use VitaMirror as a substitute for professional medical advice, diagnosis, or treatment.
