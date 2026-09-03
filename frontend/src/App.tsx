/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavTab, AcademicSubTab, TaskItem, ScheduleBlock, ShoppingItem, StudentSpot } from './types';
import {
  INITIAL_TASKS,
  INITIAL_SCHEDULE,
  INITIAL_SHOPPING_ITEMS,
  INITIAL_STUDENT_SPOTS
} from './data/mockData';
import { Header } from './components/Header';
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

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [academicSubTab, setAcademicSubTab] = useState<AcademicSubTab>('sequencer');
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [schedule, setSchedule] = useState<ScheduleBlock[]>(INITIAL_SCHEDULE);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(INITIAL_SHOPPING_ITEMS);
  const [spots] = useState<StudentSpot[]>(INITIAL_STUDENT_SPOTS);

  // Modals & Overlay Drawers
  const [isCompassAIOpen, setIsCompassAIOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Handlers
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddScheduleItem = (newBlock: ScheduleBlock) => {
    setSchedule((prev) => [...prev, newBlock]);
  };

  const handleToggleShoppingItem = (id: string) => {
    setShoppingItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleOpenStudyGuide = () => {
    setCurrentTab('academics');
    setAcademicSubTab('stepguide');
    setIsCompassAIOpen(false);
  };

  const handleAddAITaskToPlanner = (title: string) => {
    const newBlock: ScheduleBlock = {
      id: `ai-sched-${Date.now()}`,
      timeRange: 'Saturday 10:00 AM - 01:00 PM',
      title,
      location: 'Odegaard Library (Quiet Zone)',
      status: 'AI Sequenced',
      weightBadge: '95% PYQ Weight'
    };
    setSchedule((prev) => [...prev, newBlock]);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-sans selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Fixed Sticky Header */}
      <Header
        currentTab={currentTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full pt-18 pb-24 overflow-x-hidden">
        {currentTab === 'home' && (
          <HomeScreen
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenStudyGuide={handleOpenStudyGuide}
            spots={spots}
          />
        )}

        {currentTab === 'academics' && (
          <AcademicsScreen
            tasks={tasks}
            schedule={schedule}
            onAddScheduleItem={handleAddScheduleItem}
            initialSubTab={academicSubTab}
          />
        )}

        {currentTab === 'finance' && (
          <FinanceScreen
            shoppingItems={shoppingItems}
            onToggleShoppingItem={handleToggleShoppingItem}
          />
        )}

        {currentTab === 'explore' && (
          <ExploreScreen spots={spots} />
        )}

        {currentTab === 'insights' && (
          <InsightsScreen onOpenStudyGuide={handleOpenStudyGuide} />
        )}
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
