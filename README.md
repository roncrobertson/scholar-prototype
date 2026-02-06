# Scholar Prototype

A fitness-inspired academic coaching app built with React, Vite, and Tailwind CSS.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
scholar-prototype/
├── src/
│   ├── components/
│   │   ├── screens/           # Screen components
│   │   │   ├── HomeScreen.jsx
│   │   │   ├── AllCoursesScreen.jsx
│   │   │   ├── CourseScreen.jsx
│   │   │   ├── ProgressScreen.jsx
│   │   │   ├── SocialScreen.jsx
│   │   │   ├── TimelineScreen.jsx
│   │   │   └── RecoveryScreen.jsx
│   │   ├── ActivityRings.jsx  # Fitness-style progress rings
│   │   ├── Navigation.jsx     # Desktop & mobile nav
│   │   └── StudyAideLauncher.jsx
│   ├── data/
│   │   ├── courses.js         # Course data & helpers
│   │   ├── student.js         # Student profile & gamification data
│   │   └── timeline.js        # Semester timeline data
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Tailwind + custom styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Key Features

- **Activity Rings** - Apple Fitness-inspired progress visualization
- **Course Dashboard** - Overview of all courses with mastery tracking
- **Study Aides** - Launch different study tools (flashcards, practice tests, etc.)
- **Challenges** - Gamified goals and streaks
- **Social** - Leaderboards and study groups
- **Recovery** - Track and recover missing work points
- **Timeline** - Semester-wide view of assignments and exams

## Next Steps for Development

### Phase 1: Core Functionality
- [ ] Connect to real LMS data (Blackboard API)
- [ ] Implement actual study aides (flashcards, practice tests)
- [ ] Add authentication and user profiles
- [ ] Real-time mastery tracking

### Phase 2: Intelligence Layer
- [ ] AI-powered "next best action" recommendations
- [ ] Concept graph integration
- [ ] Personalized learning paths
- [ ] Predictive grade trajectories

### Phase 3: Social & Engagement
- [ ] Real study groups with live sessions
- [ ] Peer accountability features
- [ ] Achievement system
- [ ] Notification system

## Design Principles

Based on the Scholar Product Doctrine:

> **Scholar is a memory + decision system that happens to talk.**

Core principles:
1. **Learning orchestration first** - What should I do next?
2. **Persistent learner state** - Track understanding, not just completion
3. **Minimal UI, maximal intelligence** - Let AI handle complexity
4. **Executive function support** - Help students plan and prioritize

## Documentation

Start at **`docs/README.md`** for the doc index. Five primary docs (handoff, roadmap, Picmonic overview, image flow, validation) live in `docs/`; older/reference docs are in `docs/archive/`.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library (optional)

## Contributing

This is a prototype for rapid iteration. Feel free to experiment!
