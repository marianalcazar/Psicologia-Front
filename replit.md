# Therapy Session Simulator

## Overview
An Angular-based therapy session simulator that provides a professional interface for practicing therapeutic skills. The application features a visual design for patient interactions, session checklists, and animated avatars - all ready for backend integration.

**Status**: Visual design and UI components complete. Backend integration pending (as per project requirements).

**Last Updated**: October 16, 2025

## Project Architecture

### Technology Stack
- **Framework**: Angular 17+ with standalone components
- **UI Library**: Angular Material
- **Styling**: Custom SCSS with healthcare theme (calming blues and greens)
- **HTTP Client**: Angular HttpClient for API integration
- **Animations**: CSS keyframe animations for avatar

### Component Structure
```
src/app/
├── components/
│   ├── animated-avatar/        # SVG avatar with talking/blinking animations
│   ├── patient-profile/         # Displays patient data from backend
│   ├── checklist-sidebar/       # 5-point therapy session checklist with progress
│   ├── conversation-display/    # Message bubbles and therapist input
│   └── session-view/            # Main container integrating all components
├── services/
│   └── therapy-api.ts           # API service with mock endpoints (ready for backend)
└── app.ts                       # Main app component
```

## Features Implemented

### 1. Animated Avatar Component
- SVG-based patient avatar with facial features
- CSS animations for:
  - Mouth movement (talking state)
  - Eye blinking (periodic animation)
  - Natural eye movement
- Toggleable talking state via `@Input`

### 2. Patient Profile Card
- Displays patient information:
  - Name and session number
  - Profession
  - Main concerns (displayed as chips)
  - Treatment goals (bullet list)
  - Last session summary
- Data structure ready for backend API integration

### 3. Session Checklist Sidebar
- 5 therapy criteria with descriptions:
  1. Initial Summary
  2. Topic Development
  3. Empathy & Active Listening
  4. Therapeutic Intervention
  5. Homework & Closure
- Visual progress bar
- Completion counter
- Individual item status indicators

### 4. Conversation Display
- Message bubbles for patient and therapist
- Distinct styling for each sender
- Timestamp display
- Multi-line text input for therapist responses
- Keyboard shortcut (Ctrl+Enter) to send
- "Complete Session" button for submission

### 5. Session View (Main Layout)
- Responsive 3-column grid layout:
  - Left: Patient profile + Animated avatar
  - Center: Conversation area
  - Right: Checklist sidebar
- Loading overlay for async operations
- Professional header with gradient

### 6. API Service Layer
- Mock endpoints implemented for testing:
  - `getPatientDataMock()` - Returns sample patient data
  - `getPatientResponseMock()` - Simulates patient responses
  - `submitSessionMock()` - Returns mock scoring/feedback
- Real API methods defined (ready for backend URLs):
  - `getPatientData(patientId)`
  - `sendTherapistMessage(sessionId, message)`
  - `submitSession(sessionId, messages)`

## Backend Integration Points

### Expected API Endpoints
The frontend is configured to work with these backend endpoints (update `apiUrl` in therapy-api.ts):

1. **GET** `/api/patient/{patientId}` - Load patient data
   - Returns: Patient object with name, sessionNumber, concerns, goals, etc.

2. **POST** `/api/session/{sessionId}/message` - Send therapist message
   - Body: `{ message: string }`
   - Returns: Message object (patient response)

3. **POST** `/api/session/{sessionId}/submit` - Submit complete session
   - Body: `{ messages: Message[] }`
   - Returns: Scoring and checklist results

### Checklist Completion
As per project requirements, checklist items will be evaluated by the backend when the session is submitted. The backend should return:
```typescript
{
  success: boolean,
  score: number,
  feedback: string,
  checklistResults: {
    'initial-summary': boolean,
    'topic-development': boolean,
    'empathy-listening': boolean,
    'therapeutic-intervention': boolean,
    'session-closure': boolean
  }
}
```

## Visual Design

### Color Palette (Healthcare Theme)
- Primary Blue: `#2196F3` (trust, calm)
- Accent Green: `#4CAF50` (growth, wellness)
- Background: `#f5f8fa` (light, clean)
- Patient Messages: Purple gradient (`#667eea` to `#764ba2`)
- Therapist Messages: Light blue (`#e3f2fd`)

### Responsive Breakpoints
- Desktop (1400px+): 3-column grid layout
- Tablet (768px-1400px): Single column stacked
- Mobile (<768px): Optimized spacing and typography

## Development Setup

### Install Dependencies
```bash
cd therapy-session-simulator
npm install
```

### Run Development Server
```bash
ng serve
```
The app runs on `http://localhost:5000` (configured for Replit)

### Build for Production
```bash
ng build --configuration production
```

## Configuration Notes

### Angular.json Important Settings
- **Port**: 5000 (required for Replit)
- **Host**: 0.0.0.0 (allows external access)
- **Allowed Hosts**: ["all"] (enables iframe proxy)

### App Config Providers
- `provideHttpClient()` - For API calls
- `provideAnimationsAsync()` - For Angular Material
- `provideRouter(routes)` - For routing (future expansion)

## Known Limitations / Future Enhancements

### Current Scope (Visual Design Only)
✅ Complete visual design and UI components
✅ Component structure and data flow ready
✅ Mock API service for testing
✅ Professional healthcare theme
✅ Responsive layout

### Pending Backend Integration
- Connect to real patient data API endpoints
- Implement actual checklist scoring logic (backend-driven)
- Add session state persistence
- Implement user authentication (if needed)

### Suggested Future Features (Beyond MVP)
- Real-time checklist validation as therapist types
- Session save/load for incomplete sessions
- Performance dashboard with historical scores
- Session playback and review with annotations
- Multiple difficulty levels or patient scenarios
- Text-to-speech for patient responses

## Architect Review Notes

**Date**: October 16, 2025

**Findings**:
- ✅ Component architecture well-organized and follows Angular best practices
- ✅ Visual design professional with appropriate healthcare theme
- ✅ Responsive layout works across devices
- ✅ Avatar animations smooth and effective
- ⚠️ Checklist updates are backend-driven (as per requirements)
- ⚠️ Patient data loading uses mock for now (backend integration pending)

**Recommendations for Backend Team**:
1. Implement real-time checklist evaluation API
2. Add session persistence endpoints
3. Consider WebSocket for live patient responses
4. Add unit tests for session orchestration logic

## User Requirements Summary

From the initial request:
- ✅ Angular-based application
- ✅ Simple animated avatar (talking animation)
- ✅ Patient data loaded from backend (API service ready)
- ✅ Session checklist with 5 therapy criteria
- ✅ Professional visual design
- ✅ Scoring evaluated on backend after session completion

**Note**: As specified by the user, this implementation focuses on the visual design. All functionality (patient loading, response generation, scoring) is designed to integrate with backend services.
