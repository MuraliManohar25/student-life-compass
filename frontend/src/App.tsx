/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { NavTab, AcademicSubTab, StudentSpot } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { CompassAIFAB } from './components/CompassAIFAB';
import { HomeScreen } from './components/HomeScreen';
import { AcademicsScreen } from './components/AcademicsScreen';
import { FinanceScreen } from './components/FinanceScreen';
import { ExploreScreen } from './components/ExploreScreen';
import { InsightsScreen } from './components/InsightsScreen';
import { CompassAIDrawer } from './components/CompassAIDrawer';
import { StudentProfileModal } from './components/StudentProfileModal';
import { SearchModal } from './components/SearchModal';
import { NotificationsModal } from './components/NotificationsModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { SignupScreen } from './components/SignupScreen';
import {
  getSpots,
  getSavedItems,
  saveItem,
  deleteSavedItem,
  createStudySession,
  SpotRecord,
} from './lib/api';

function spotRecordToSpot(record: SpotRecord): StudentSpot {
  return {
    id: `spot-${record.id}`,
    name: record.name,
    category: record.category as StudentSpot['category'],
    categoryLabel: record.category_label,
    rating: record.rating,
    distance: record.distance,
    tags: record.tags || [],
    crowdInfo: record.crowd_info,
    extraBadge: record.extra_badge,
    actionType: (['navigate', 'book_bms', 'call', 'rapido', 'refill'] as const).includes(
      record.action_type as 'navigate'
    )
      ? (record.action_type as StudentSpot['actionType'])
      : 'navigate',
    actionLabel: record.action_label,
    imageUrl: record.image_url,
    alert: record.alert || undefined,
  };
}

function AppShell() {
  const { isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [academicSubTab, setAcademicSubTab] = useState<AcademicSubTab>('sequencer');

  // Spots come from the backend catalog (/explore/spots) with per-user saves.
  const [spots, setSpots] = useState<StudentSpot[]>([]);
  const [spotsLoading, setSpotsLoading] = useState(true);
  const [savedSpotIds, setSavedSpotIds] = useState<Set<string>>(new Set());
  const [spotSaveIds, setSpotSaveIds] = useState<Map<string, number>>(new Map());
  const [saveBusyId, setSaveBusyId] = useState<string | null>(null);

  // Bumped whenever a study session is created outside AcademicsScreen
  // (e.g. Compass AI) so the planner refetches real data.
  const [plannerRefreshKey, setPlannerRefreshKey] = useState(0);

  // Modals & Overlay Drawers
  const [isCompassAIOpen, setIsCompassAIOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setSpotsLoading(true);
    getSpots()
      .then((records) => setSpots(records.map(spotRecordToSpot)))
      .catch(() => setSpots([]))
      .finally(() => setSpotsLoading(false));
    getSavedItems('spot')
      .then((items) => {
        setSavedSpotIds(new Set(items.map((i) => `spot-${i.ref_id}`)));
        setSpotSaveIds(new Map(items.map((i) => [`spot-${i.ref_id}`, i.id])));
      })
      .catch(() => undefined);
  }, [isAuthenticated]);

  const handleToggleSpotSave = useCallback(
    async (spot: StudentSpot) => {
      if (saveBusyId) return;
      setSaveBusyId(spot.id);
      try {
        if (savedSpotIds.has(spot.id)) {
          const saveId = spotSaveIds.get(spot.id);
          if (saveId !== undefined) {
            await deleteSavedItem(saveId);
          }
          setSavedSpotIds((prev) => {
            const next = new Set(prev);
            next.delete(spot.id);
            return next;
          });
          setSpotSaveIds((prev) => {
            const next = new Map(prev);
            next.delete(spot.id);
            return next;
          });
        } else {
          const refId = spot.id.replace(/^spot-/, '');
          const saved = await saveItem({ kind: 'spot', ref_id: refId, title: spot.name });
          setSavedSpotIds((prev) => new Set(prev).add(spot.id));
          setSpotSaveIds((prev) => new Map(prev).set(spot.id, saved.id));
        }
      } catch {
        // Error surfaces via the ExploreScreen toast; state stays unchanged.
        throw new Error('Could not save this spot. Please try again.');
      } finally {
        setSaveBusyId(null);
      }
    },
    [saveBusyId, savedSpotIds, spotSaveIds]
  );

  const handleOpenStudyGuide = () => {
    setCurrentTab('academics');
    setAcademicSubTab('stepguide');
    setIsCompassAIOpen(false);
  };

  // Persists the AI-suggested block to /study-plan. Returns true on success
  // so the drawer shows an honest confirmation instead of a fake one.
  const handleAddAITaskToPlanner = async (title: string): Promise<boolean> => {
    try {
      await createStudySession({
        title,
        scheduled_time: 'Saturday 10:00 AM - 01:00 PM',
        room: 'Odegaard Library (Quiet Zone)',
        tag: 'AI Sequenced',
        status: 'Upcoming',
        duration_minutes: 180,
      });
      setPlannerRefreshKey((k) => k + 1);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col lg:flex-row font-sans selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Mobile/Tablet Top Sticky Header */}
      <Header
        currentTab={currentTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full pt-18 lg:pt-6 pb-24 lg:pb-12 overflow-x-hidden min-h-screen">
        <div className="max-w-[1400px] mx-auto w-full">
          {currentTab === 'home' && (
            <HomeScreen
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenStudyGuide={handleOpenStudyGuide}
              spots={spots}
            />
          )}

          {currentTab === 'academics' && (
            <AcademicsScreen
              initialSubTab={academicSubTab}
              plannerRefreshKey={plannerRefreshKey}
            />
          )}

          {currentTab === 'finance' && <FinanceScreen />}

          {currentTab === 'explore' && (
            <ExploreScreen
              spots={spots}
              savedIds={savedSpotIds}
              saveBusyId={saveBusyId}
              isLoading={spotsLoading}
              onToggleSave={handleToggleSpotSave}
            />
          )}

          {currentTab === 'insights' && (
            <InsightsScreen onOpenStudyGuide={handleOpenStudyGuide} />
          )}
        </div>
      </main>

      {/* Floating Action Button: Ask Compass AI */}
      <CompassAIFAB
        isOpen={isCompassAIOpen}
        onClick={() => setIsCompassAIOpen(true)}
      />

      {/* Sticky Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
      />

      {/* Compass AI Conversational Drawer */}
      <CompassAIDrawer
        isOpen={isCompassAIOpen}
        onClose={() => setIsCompassAIOpen(false)}
        onAddToPlanner={handleAddAITaskToPlanner}
        onOpenStudyGuide={handleOpenStudyGuide}
      />

      {/* Student Profile & Settings Modal */}
      <StudentProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Campus Quick Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={(tab) => setCurrentTab(tab)}
      />

      {/* Campus Activity & Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateToAcademics={() => {
          setCurrentTab('academics');
          setAcademicSubTab('sequencer');
        }}
      />
    </div>
  );
}

type AuthMode = 'login' | 'signup';

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-xs font-medium text-on-surface-variant">Loading Student Compass…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return authMode === 'login' ? (
      <LoginScreen onSwitchToSignup={() => setAuthMode('signup')} />
    ) : (
      <SignupScreen onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  return <AppShell />;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
