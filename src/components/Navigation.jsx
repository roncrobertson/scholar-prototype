import React, { useState, useEffect } from 'react';
import { Home, BookOpen, Calendar, BarChart3, Users, RefreshCw, Flame, Menu, X, PanelLeftClose, PanelLeft } from 'lucide-react';
import { courses } from '../data/courses';
import { student } from '../data/student';

const navItems = [
  { id: 'home', Icon: Home, label: 'Today' },
  { id: 'courses', Icon: BookOpen, label: 'All Courses' },
  { id: 'timeline', Icon: Calendar, label: 'Semester' },
  { id: 'progress', Icon: BarChart3, label: 'Progress' },
  { id: 'social', Icon: Users, label: 'Community' },
  { id: 'recovery', Icon: RefreshCw, label: 'Recovery' },
];

const SIDEBAR_COLLAPSED_KEY = 'scholar-sidebar-collapsed';

/**
 * DesktopNav - Sidebar navigation for desktop view (Phase 6.3: collapsible rail)
 */
export function DesktopNav({ screen, selectedCourse, onNavigate, onSelectCourse }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
    } catch {}
  }, [collapsed]);

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? '5rem' : '16rem');
    return () => document.documentElement.style.removeProperty('--sidebar-width');
  }, [collapsed]);

  const width = collapsed ? 'w-20' : 'w-64';

  return (
    <nav className={`fixed left-0 top-0 bottom-0 ${width} bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-r border-gray-100 dark:border-gray-700 shadow-sm flex flex-col p-4 z-40 transition-all duration-200`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-2 mb-8 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-lg">S</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="font-bold text-gray-900 dark:text-gray-100">Scholar</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Academic Coach</p>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 space-y-1 stagger-children">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`btn-press w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl transition-colors text-left
              ${screen === item.id && !selectedCourse 
                ? 'bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            title={collapsed ? item.label : undefined}
            aria-label={item.label}
          >
            <item.Icon className="w-5 h-5 shrink-0" aria-hidden />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}

        {/* Courses Section */}
        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
          {!collapsed && <p className="px-3 text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Courses</p>}
          {courses.map(course => (
            <button
              key={course.id}
              onClick={() => onSelectCourse(course)}
              className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-xl transition-colors text-left
                ${selectedCourse?.id === course.id 
                  ? 'bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              title={collapsed ? `${course.code}: ${course.name}` : undefined}
              aria-label={`${course.code}: ${course.name}`}
            >
              <span 
                className="w-2 h-2 rounded-full shrink-0" 
                style={{ backgroundColor: course.color }} 
              />
              {!collapsed && (
                <>
                  <span className="text-sm">{course.code}</span>
                  <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{course.grade}%</span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Collapse + User Profile */}
      <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          {!collapsed && <span className="text-sm font-medium">Collapse</span>}
        </button>
        <div className={`flex items-center gap-3 px-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/50 rounded-full flex items-center justify-center shrink-0">
            <span className="text-brand-700 dark:text-brand-300 font-semibold">{student.avatar}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{student.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden />
                {student.streak} day streak
              </p>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

/**
 * MobileNav - Top bar + bottom tab bar for mobile view
 */
export function MobileNav({ 
  screen, 
  selectedCourse, 
  showMenu, 
  onToggleMenu, 
  onNavigate, 
  onSelectCourse 
}) {
  return (
    <>
      {/* Top Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-gray-100">Scholar</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm flex items-center gap-1 text-gray-600 dark:text-gray-300">
            <Flame className="w-4 h-4 text-amber-500" aria-hidden />
            {student.streak}
          </span>
          <button onClick={onToggleMenu} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" aria-label={showMenu ? 'Close menu' : 'Open menu'}>
            {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay — sheet-style with backdrop blur (Phase 6.4) */}
      {showMenu && (
        <div className="fixed inset-0 z-30 pt-16 overflow-auto">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onToggleMenu} aria-hidden />
          <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-xl min-h-full">
          <div className="p-4 space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onToggleMenu();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                  ${screen === item.id ? 'bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300' : 'text-gray-600 dark:text-gray-300'}`}
              >
                <item.Icon className="w-5 h-5 shrink-0" aria-hidden />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
              {courses.map(course => (
                <button
                  key={course.id}
                  onClick={() => {
                    onSelectCourse(course);
                    onToggleMenu();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-900 dark:text-gray-100"
                >
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: course.color }} 
                  />
                  <span>{course.code}: {course.name}</span>
                </button>
              ))}
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Bottom Tab Bar — icon + label per Phase 6.7 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 z-40 flex justify-around py-2 safe-area-pb">
        {[
          { id: 'home', Icon: Home, label: 'Today' },
          { id: 'courses', Icon: BookOpen, label: 'Courses' },
          { id: 'progress', Icon: BarChart3, label: 'Progress' },
          { id: 'social', Icon: Users, label: 'Community' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl min-w-[64px] transition-colors
              ${screen === item.id ? 'bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300' : 'text-gray-500 dark:text-gray-400'}`}
            aria-label={item.label}
            aria-current={screen === item.id ? 'page' : undefined}
          >
            <item.Icon className="w-5 h-5 shrink-0" aria-hidden />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
