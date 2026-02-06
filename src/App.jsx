import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useViewTransitionNavigate } from './hooks/useViewTransitionNavigate';
import { DesktopNav, MobileNav } from './components/Navigation';
import { StudyAideLauncher } from './components/StudyAideLauncher';
import { StudyModeSwitcher } from './components/StudyModeSwitcher';
import { OnboardingWelcome, getHasSeenWelcome } from './components/OnboardingWelcome';
import {
  HomeScreen,
  AllCoursesScreen,
  CourseScreen,
  ProgressScreen,
} from './components/screens';
import { getCourseById } from './data/courses';
import { getRecommendedConceptIds } from './data/questions';
import { studyAides } from './data/student';
import { picmonicsBank } from './data/picmonics';
import { getDueCount } from './utils/studyStats';

// Lazy-loaded screens (Timeline, Recovery, Social — less frequently used)
const TimelineScreen = lazy(() => import('./components/screens/TimelineScreen'));
const RecoveryScreen = lazy(() => import('./components/screens/RecoveryScreen'));
const SocialScreen = lazy(() => import('./components/screens/SocialScreen'));

// Lazy-loaded study aides (loaded when user starts a session)
const StudySessionPlaceholder = lazy(() => import('./components/StudySessionPlaceholder'));
const Flashcards = lazy(() => import('./components/Flashcards'));
const PracticeSession = lazy(() => import('./components/PracticeSession'));
const Picmonics = lazy(() => import('./components/Picmonics'));
const SmartNotes = lazy(() => import('./components/SmartNotes'));
const AITutor = lazy(() => import('./components/AITutor'));

/**
 * Scholar App - Main Application Component
 * 
 * A fitness-inspired academic coaching app that helps students
 * stay on track with their learning goals.
 * URL routes: /, /courses, /courses/:id, /progress, /social, /timeline, /recovery
 */
function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigateWithTransition = useViewTransitionNavigate();

  // Derive screen + selectedCourse from URL (so back button and links work)
  const { screen, selectedCourse } = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return { screen: 'home', selectedCourse: null };
    if (path === '/courses') return { screen: 'courses', selectedCourse: null };
    const courseMatch = path.match(/^\/courses\/([^/]+)$/);
    if (courseMatch) {
      const course = getCourseById(courseMatch[1]);
      return { screen: 'course', selectedCourse: course || null };
    }
    if (path === '/progress') return { screen: 'progress', selectedCourse: null };
    if (path === '/social') return { screen: 'social', selectedCourse: null };
    if (path === '/timeline') return { screen: 'timeline', selectedCourse: null };
    if (path === '/recovery') return { screen: 'recovery', selectedCourse: null };
    return { screen: 'home', selectedCourse: null };
  }, [location.pathname]);

  // UI state
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showStudyAides, setShowStudyAides] = useState(false);
  const [activeStudySession, setActiveStudySession] = useState(null);
  const [tutorContext, setTutorContext] = useState(null);
  const [exitSummary, setExitSummary] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);

  // Navigation handlers (update URL)
  // When in study mode, exit first so left nav actually navigates instead of being ignored
  // Use View Transitions API for smooth route changes (Phase 6.6.1)
  const handleNavigate = (screenId) => {
    setShowMobileMenu(false);
    if (activeStudySession) {
      handleExitStudySession();
    }
    const path = screenId === 'home' ? '/' : `/${screenId}`;
    navigateWithTransition(path);
  };

  const handleSelectCourse = (course) => {
    setShowMobileMenu(false);
    if (activeStudySession) {
      handleExitStudySession();
    }
    navigateWithTransition(`/courses/${course.id}`);
  };

  const handleShowStudyAides = (course) => {
    setShowStudyAides(course);
  };

  /** Start a study session directly by aide id (e.g. from Flashcards/Picmonics/Practice Test button). */
  const handleStartStudyAide = (aideId, course) => {
    const aide = studyAides.find((a) => a.id === aideId);
    if (aide) handleStartStudySession(aide, course);
  };

  const handleStartStudySession = (aide, course) => {
    setShowStudyAides(false);
    const sessionOptions = aide?.id === 'practice' && course?.id
      ? { targetConcepts: getRecommendedConceptIds(course, 1) }
      : {};
    setActiveStudySession({ aide, course, sessionOptions });
  };

  const handleExitStudySession = () => {
    const dueCount = getDueCount();
    setExitSummary({ dueCount });
    setActiveStudySession(null);
    setTutorContext(null);
  };

  useEffect(() => {
    if (!exitSummary) return;
    const t = setTimeout(() => setExitSummary(null), 5000);
    return () => clearTimeout(t);
  }, [exitSummary]);

  // First-run welcome modal (Phase 4.3)
  useEffect(() => {
    if (!getHasSeenWelcome()) setShowWelcome(true);
  }, []);

  /** Switch to AI Tutor with concept pre-loaded (from Picmonics/Smart Notes "Explain this"). */
  const handleAskTutor = (context) => {
    setTutorContext(context || null);
    const aide = studyAides.find((a) => a.id === 'tutor');
    if (aide && activeStudySession?.course) {
      setActiveStudySession({ aide, course: activeStudySession.course, sessionOptions: {} });
    }
  };

  /** Switch to another study mode within the same course (in-study nav). */
  const handleSwitchStudyAide = (aideId) => {
    if (!activeStudySession?.course) return;
    const aide = studyAides.find((a) => a.id === aideId);
    if (!aide) return;
    const course = activeStudySession.course;
    const sessionOptions = aide.id === 'practice' && course?.id
      ? { targetConcepts: getRecommendedConceptIds(course, 1) }
      : {};
    setActiveStudySession({ aide, course, sessionOptions });
  };

  // Render the current screen
  const renderContent = () => {
    if (activeStudySession) {
      const { aide, course } = activeStudySession;
      if (aide?.id === 'flashcards') {
        return (
          <Flashcards
            course={course}
            onExit={handleExitStudySession}
          />
        );
      }
      if (aide?.id === 'practice') {
        return (
          <PracticeSession
            course={course}
            onExit={handleExitStudySession}
            sessionOptions={activeStudySession.sessionOptions}
          />
        );
      }
      if (aide?.id === 'picmonics') {
        return (
          <Picmonics
            course={course}
            onExit={handleExitStudySession}
            onAskTutor={handleAskTutor}
          />
        );
      }
      if (aide?.id === 'tutor') {
        return (
          <AITutor
            course={course}
            onExit={handleExitStudySession}
            conceptContext={tutorContext}
            onContextConsumed={() => setTutorContext(null)}
          />
        );
      }
      if (aide?.id === 'summary') {
        return (
          <SmartNotes
            course={course}
            onExit={handleExitStudySession}
            onAskTutor={handleAskTutor}
          />
        );
      }
      return (
        <StudySessionPlaceholder
          aide={aide}
          course={course}
          onExit={handleExitStudySession}
        />
      );
    }

    if (selectedCourse && screen === 'course') {
      return (
        <CourseScreen 
          course={selectedCourse} 
          onShowStudyAides={handleShowStudyAides}
          onStartStudyAide={handleStartStudyAide}
        />
      );
    }

    switch (screen) {
      case 'home':
        return (
          <HomeScreen 
            isMobile={isMobile}
            onShowStudyAides={handleShowStudyAides}
            onStartStudyAide={handleStartStudyAide}
            onNavigate={handleNavigate}
          />
        );
      case 'courses':
        return (
          <AllCoursesScreen 
            onShowStudyAides={handleShowStudyAides}
            onSelectCourse={handleSelectCourse}
          />
        );
      case 'timeline':
        return <TimelineScreen />;
      case 'progress':
        return <ProgressScreen onShowStudyAides={handleShowStudyAides} onStartStudyAide={handleStartStudyAide} />;
      case 'social':
        return <SocialScreen />;
      case 'recovery':
        return <RecoveryScreen />;
      default:
        return (
          <HomeScreen 
            isMobile={isMobile}
            onShowStudyAides={handleShowStudyAides}
            onStartStudyAide={handleStartStudyAide}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-50 to-white ${isMobile ? 'pb-20' : ''}`}>
      {/* Device Toggle: only in dev for layout prototyping */}
      {import.meta.env.DEV && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-1 flex gap-1">
          <button
            onClick={() => setIsMobile(false)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              !isMobile ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Desktop
          </button>
          <button
            onClick={() => setIsMobile(true)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              isMobile ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Mobile
          </button>
        </div>
      )}

      {/* Navigation */}
      {isMobile ? (
        <MobileNav
          screen={screen}
          selectedCourse={selectedCourse}
          showMenu={showMobileMenu}
          onToggleMenu={() => setShowMobileMenu(!showMobileMenu)}
          onNavigate={handleNavigate}
          onSelectCourse={handleSelectCourse}
        />
      ) : (
        <DesktopNav
          screen={screen}
          selectedCourse={selectedCourse}
          onNavigate={handleNavigate}
          onSelectCourse={handleSelectCourse}
        />
      )}

      {/* Main Content — wider for Picmonics; ml uses --sidebar-width for collapsible nav */}
      <main className={`
        ${isMobile ? 'pt-16 px-4 pb-24' : 'ml-[var(--sidebar-width)] p-8 transition-[margin] duration-200'} 
        ${isMobile ? 'max-w-md mx-auto' : activeStudySession?.aide?.id === 'picmonics' ? 'max-w-[90rem]' : 'max-w-4xl'}
      `}>
        {/* Retrieval summary after exiting a study session (Phase 3.4) */}
        {exitSummary && !activeStudySession && (
          <div
            className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
            role="status"
            aria-live="polite"
          >
            <span>
              Session complete. {exitSummary.dueCount} {exitSummary.dueCount === 1 ? 'item' : 'items'} due for review.
            </span>
            <button
              type="button"
              onClick={() => setExitSummary(null)}
              className="shrink-0 rounded-lg px-2 py-1 text-green-700 hover:bg-green-100"
              aria-label="Dismiss"
            >
              Dismiss
            </button>
          </div>
        )}
        {activeStudySession && (
          <div className="mb-4">
            <StudyModeSwitcher
              currentAideId={activeStudySession.aide.id}
              courseLabel={activeStudySession.course?.code || 'course'}
              courseColor={activeStudySession.course?.color}
              onSwitch={handleSwitchStudyAide}
              onExit={handleExitStudySession}
            />
          </div>
        )}
        <Suspense
          fallback={
            <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-gray-100 bg-gray-50/50 py-12" aria-busy="true">
              <span className="text-sm text-gray-500">Loading…</span>
            </div>
          }
        >
          {renderContent()}
        </Suspense>
      </main>

      {/* Study Aide Launcher Modal */}
      {showStudyAides && (
        <StudyAideLauncher 
          course={showStudyAides} 
          onClose={() => setShowStudyAides(false)}
          onStartSession={handleStartStudySession}
        />
      )}

      {/* First-run welcome (Phase 4.3) */}
      {showWelcome && (
        <OnboardingWelcome onDismiss={() => setShowWelcome(false)} />
      )}
    </div>
  );
}

export default App;
