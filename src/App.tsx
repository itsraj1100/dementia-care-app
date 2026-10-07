/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AppMode, PatientRoute, CaregiverTab, PlanItem, ActivitySession } from './types.ts';
import { useCareStore } from './store/careStore.ts';
import { sound } from './utils/audio.ts';
import { webReminderAdapter } from './services/reminders/webReminderAdapter.ts';
import { careRepository } from './services/repository/careRepository.ts';

// Patient Mode Components
import { PatientTopBar } from './components/patient/PatientTopBar.tsx';
import { PatientHome } from './components/patient/PatientHome.tsx';
import { ReminderPrompt } from './components/patient/ReminderPrompt.tsx';
import { ActivityHub } from './components/patient/ActivityHub.tsx';
import { PhotoRecallScreen } from './components/PhotoRecallScreen.tsx';
import { RoutineOrderScreen } from './components/RoutineOrderScreen.tsx';
import { ObjectMatchScreen } from './components/ObjectMatchScreen.tsx';
import { ComfortCheck } from './components/patient/ComfortCheck.tsx';
import { PatientHelp } from './components/patient/PatientHelp.tsx';
import { MusicMoment } from './components/patient/MusicMoment.tsx';
import { ModeGate } from './components/patient/ModeGate.tsx';

// Caregiver Mode Components
import { CaregiverTopBar } from './components/caregiver/CaregiverTopBar.tsx';
import { CaregiverBottomNav } from './components/caregiver/CaregiverBottomNav.tsx';
import { CaregiverHome } from './components/caregiver/CaregiverHome.tsx';
import { PlanScreen } from './components/caregiver/PlanScreen.tsx';
import { ObserveScreen } from './components/caregiver/ObserveScreen.tsx';
import { GuideScreen } from './components/caregiver/GuideScreen.tsx';
import { FamilyScreen } from './components/caregiver/FamilyScreen.tsx';
import { WeeklySummaryModal } from './components/caregiver/WeeklySummaryModal.tsx';
import { SyncModal } from './components/caregiver/SyncModal.tsx';
import { SettingsScreen } from './components/caregiver/SettingsScreen.tsx';
import { SetupWizardModal } from './components/caregiver/SetupWizardModal.tsx';
import { CaregiverLogin } from './components/caregiver/CaregiverLogin.tsx';
import { PatientPairingModal } from './components/patient/PatientPairingModal.tsx';
import { Toast } from './components/Toast.tsx';

export default function App() {
  const {
    state,
    activeCircleId,
    currentUser,
    acknowledgeAlert,
    markPlanItemDone,
    markPlanItemLater,
    recordHelpEvent,
    recordComfortRating,
    recordActivitySession,
    recordAdaptationDecision,
    savePlanItem,
    deletePlanItem,
    publishPlan,
    updateActivityConfig,
    saveMemory,
    toggleTaskCompleted,
    updateSettings,
    triggerSyncNow,
    resetDemoData,
  } = useCareStore();

  // App starts in Patient Mode by default as confirmed in Phase 1
  const [appMode, setAppMode] = useState<AppMode>('patient');
  const [patientRoute, setPatientRoute] = useState<PatientRoute>('home');
  const [caregiverTab, setCaregiverTab] = useState<CaregiverTab>('home');

  // Currently active reminder item when in P-02
  const [activeReminderItem, setActiveReminderItem] = useState<PlanItem | null>(null);

  // Completed activity ID to record in P-07
  const [completedActivityId, setCompletedActivityId] = useState<string>('object-match');
  const [pendingSessionData, setPendingSessionData] = useState<Partial<ActivitySession> | null>(null);

  // Caregiver Modals
  const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);

  // Dark Mode handling
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('care_loop_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Floating Toast
  const [toastData, setToastData] = useState<{
    visible: boolean;
    titleAs: string;
    subtitleEn: string;
  }>({
    visible: false,
    titleAs: '',
    subtitleEn: '',
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('care_loop_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('care_loop_theme', 'light');
    }
  }, [darkMode]);

  const showToast = (titleAs: string, subtitleEn: string) => {
    setToastData({ visible: true, titleAs, subtitleEn });
    setTimeout(() => {
      setToastData((prev) => ({ ...prev, visible: false }));
    }, 4000);
  };

  // Foreground reminder checking via isolated Web Reminder Adapter
  useEffect(() => {
    const published = state.publishedPlanItems || state.planItems.filter((p) => !p.isDraft);
    webReminderAdapter.start(() => published);
    const unsub = webReminderAdapter.subscribe((item) => {
      sound.stopSpeaking();
      setActiveReminderItem(item);
      setAppMode('patient');
      setPatientRoute('reminder');
    });
    return () => {
      unsub();
      webReminderAdapter.stop();
    };
  }, [state.publishedPlanItems, state.planItems]);

  // Patient screens read published plan items only (draft edits remain local to caregiver)
  const publishedPlanItems = state.publishedPlanItems || state.planItems.filter((p) => !p.isDraft);
  const nextSupportItem = publishedPlanItems.find((p) => p.status === 'upcoming') || publishedPlanItems[0];

  const handleFireNextReminder = () => {
    sound.playChime('chime');
    const fired = webReminderAdapter.fireNextReminder(publishedPlanItems);
    if (fired) {
      setActiveReminderItem(fired);
      setAppMode('patient');
      setPatientRoute('reminder');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePublishPlanWithFeedback = () => {
    publishPlan();
    showToast(
      'নতুন পৰিকল্পনা প্ৰকাশ কৰা হʼল',
      `Plan Version ${state.settings.planVersion + 1} published & applied to Aita's tablet.`
    );
  };

  // Handlers for Patient Mode Navigation
  const handleOpenActivities = () => {
    sound.stopSpeaking();
    setPatientRoute('activities');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectActivity = (route: PatientRoute) => {
    sound.stopSpeaking();
    setPatientRoute(route);
    setCompletedActivityId(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriggerReminder = (item: PlanItem) => {
    sound.stopSpeaking();
    setActiveReminderItem(item);
    setPatientRoute('reminder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReminderDone = () => {
    if (activeReminderItem) {
      markPlanItemDone(activeReminderItem.id);
      showToast('ৰিমাইণ্ডাৰ সম্পন্ন কৰা হʼল', 'Routine marked as completed gracefully.');
    }
    setPatientRoute('home');
  };

  const handleReminderLater = () => {
    if (activeReminderItem) {
      markPlanItemLater(activeReminderItem.id);
      showToast('ৰিমাইণ্ডাৰ পাছত কৰা হʼব', 'Reminder deferred. Will prompt again soon.');
    }
    setPatientRoute('home');
  };

  const handleOpenHelp = () => {
    sound.stopSpeaking();
    recordHelpEvent();
    setPatientRoute('help');
  };

  const handleFinishActivityToCheckIn = (sessionData?: Partial<ActivitySession>) => {
    sound.stopSpeaking();
    if (sessionData) {
      setPendingSessionData(sessionData);
      if (sessionData.activityId) {
        setCompletedActivityId(sessionData.activityId);
      }
    }
    setPatientRoute('comfort');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleActivityAbandon = (partialData?: Partial<ActivitySession>) => {
    sound.stopSpeaking();
    if (partialData) {
      recordActivitySession({
        ...partialData,
        abandoned: true,
        completedSuccessfully: false,
        comfort: 'uncomfortable',
        completedAt: new Date().toISOString(),
      });
    }
    setPendingSessionData(null);
    setPatientRoute('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleComfortCheckComplete = (feeling: 'good' | 'ok' | 'uncomfortable') => {
    const finalSession: Partial<ActivitySession> = {
      ...(pendingSessionData || {}),
      activityId: completedActivityId,
      activityType: pendingSessionData?.activityType || completedActivityId,
      comfort: feeling,
      comfortRating: feeling,
      completedAt: new Date().toISOString(),
    };
    recordActivitySession(finalSession);
    setPendingSessionData(null);
    setPatientRoute('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleComfortCheckSkip = () => {
    if (pendingSessionData) {
      recordActivitySession({
        ...pendingSessionData,
        activityId: completedActivityId,
        activityType: pendingSessionData?.activityType || completedActivityId,
        completedAt: new Date().toISOString(),
      });
      setPendingSessionData(null);
    }
    setPatientRoute('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Local demo pairing never contacts an unconfigured or unauthenticated Firebase project.
  const pairDevice = async (code: string) => {
    if (!currentUser) {
      if (code !== (state.settings.activePairingCode || '492817')) {
        return { success: false, error: 'Invalid local pairing code.' };
      }
      return {
        success: true,
        circleId: 'circle-demo-local',
        circleName: state.settings.circleName || 'Devi Family Care Circle',
        personName: state.settings.patientPersonName || 'Lakshmi Devi (Aita)',
        caregiverPin: state.settings.caregiverPin,
      };
    }
    return careRepository.verifyAndPairDevice(code, 'device-primary-tablet');
  };

  // Handlers for Mode Switching
  const handleOpenModeGate = () => {
    sound.stopSpeaking();
    setPatientRoute('mode-gate');
  };

  const handleModeGateSuccess = () => {
    setAppMode('caregiver');
    setCaregiverTab('home');
    setPatientRoute('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchToPatientMode = () => {
    sound.stopSpeaking();
    setAppMode('patient');
    setPatientRoute('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get Caregiver TopBar title based on tab
  const getCaregiverTitle = () => {
    switch (caregiverTab) {
      case 'plan':
        return 'Care Plan & Schedule';
      case 'observe':
        return 'Observer & Adaptation';
      case 'guide':
        return 'Caregiver Knowledge Guide';
      case 'family':
        return 'Family Circle & Tasks';
      case 'settings':
        return 'Caregiver Settings & Demo';
      case 'login':
        return 'Caregiver Account (C-01)';
      default:
        return 'Caregiver Dashboard';
    }
  };

  return (
    <div
      style={{
        fontSize: `${state.settings.fontScale * 100}%`,
      }}
      className={`min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0f172a] text-[#0d1c2f] dark:text-[#f1f5f9] transition-colors duration-200 ${
        state.settings.highContrast ? 'contrast-125' : ''
      }`}
    >
      {/* PATIENT MODE */}
      {appMode === 'patient' && (
        <>
          <PatientTopBar
            isOffline={state.settings.isSimulatedOffline}
            darkMode={darkMode}
            isDevicePaired={state.settings.isDevicePaired}
            circleName={state.settings.circleName}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            onOpenModeGate={handleOpenModeGate}
            onOpenPairing={() => setIsPairingModalOpen(true)}
          />

          <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-12">
            {/* P-01: Patient Home */}
            {patientRoute === 'home' && (
              <PatientHome
                nextItem={nextSupportItem}
                personName={state.settings.patientPersonName}
                planVersion={state.settings.planVersion}
                onOpenActivities={handleOpenActivities}
                onTriggerReminder={handleTriggerReminder}
                onOpenHelp={handleOpenHelp}
              />
            )}

            {/* P-02: Reminder Prompt */}
            {patientRoute === 'reminder' && activeReminderItem && (
              <ReminderPrompt
                item={activeReminderItem}
                onDone={handleReminderDone}
                onLater={handleReminderLater}
                onHelp={handleOpenHelp}
              />
            )}

            {/* P-03: Activity Hub */}
            {patientRoute === 'activities' && (
              <ActivityHub
                onSelectActivity={handleSelectActivity}
                onBackToHome={() => setPatientRoute('home')}
                onHelp={handleOpenHelp}
              />
            )}

            {/* P-04: Photo Recall */}
            {patientRoute === 'photo-recall' && (
              <PhotoRecallScreen
                level={state.activityConfigs.find((c) => c.id === 'photo-recall')?.currentLevel || 1}
                onBackToHome={() => handleActivityAbandon({ activityId: 'photo-recall', activityType: 'photo-recall' })}
                onNotifyCaregiver={handleOpenHelp}
                onDone={handleFinishActivityToCheckIn}
              />
            )}

            {/* P-05: Routine Order */}
            {patientRoute === 'routine-order' && (
              <RoutineOrderScreen
                level={state.activityConfigs.find((c) => c.id === 'routine-order')?.currentLevel || 1}
                onBackToHome={() => handleActivityAbandon({ activityId: 'routine-order', activityType: 'routine-order' })}
                onNotifyCaregiver={handleOpenHelp}
                onDone={handleFinishActivityToCheckIn}
              />
            )}

            {/* P-06: Object Match */}
            {patientRoute === 'object-match' && (
              <ObjectMatchScreen
                level={state.activityConfigs.find((c) => c.id === 'object-match')?.currentLevel || 2}
                onBackToHome={() => handleActivityAbandon({ activityId: 'object-match', activityType: 'object-match' })}
                onNotifyCaregiver={handleOpenHelp}
                onDone={handleFinishActivityToCheckIn}
              />
            )}

            {/* P-09: Music Moment */}
            {patientRoute === 'music-moment' && (
              <MusicMoment
                onBackToHome={() => handleActivityAbandon({ activityId: 'music-moment', activityType: 'music-moment' })}
                onDone={handleFinishActivityToCheckIn}
                onHelp={handleOpenHelp}
              />
            )}

            {/* P-07: Comfort Check */}
            {patientRoute === 'comfort' && (
              <ComfortCheck
                activityId={completedActivityId}
                onComplete={handleComfortCheckComplete}
                onSkip={handleComfortCheckSkip}
              />
            )}

            {/* P-08: Patient Help */}
            {patientRoute === 'help' && (
              <PatientHelp
                isOffline={state.settings.isSimulatedOffline}
                onDismiss={() => setPatientRoute('home')}
              />
            )}

            {/* M-01: Mode Gate PIN */}
            {patientRoute === 'mode-gate' && (
              <ModeGate
                correctPin={state.settings.caregiverPin}
                onSuccess={handleModeGateSuccess}
                onCancel={() => setPatientRoute('home')}
              />
            )}
          </main>
        </>
      )}

      {/* CAREGIVER MODE */}
      {appMode === 'caregiver' && (
        <>
          <CaregiverTopBar
            title={getCaregiverTitle()}
            isOffline={state.settings.isSimulatedOffline}
            outboxCount={state.outbox.length}
            lastSynced={state.settings.lastSyncedTimestamp}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            onPreviewAita={handleSwitchToPatientMode}
            onOpenSyncModal={() => setIsSyncModalOpen(true)}
            onOpenSettings={() => setCaregiverTab('settings')}
            onOpenLogin={() => setCaregiverTab('login')}
          />

          <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-24">
            {/* C-01: Caregiver Login / Account */}
            {caregiverTab === 'login' && (
              <CaregiverLogin
                onBack={() => setCaregiverTab('home')}
                onSuccess={() => setCaregiverTab('home')}
                onLaunchSetup={() => {
                  setCaregiverTab('home');
                  setIsSetupWizardOpen(true);
                }}
              />
            )}

            {/* C-03: Caregiver Home */}
            {caregiverTab === 'home' && (
              <CaregiverHome
                planItems={state.planItems}
                alerts={state.alerts}
                settings={state.settings}
                onAcknowledgeAlert={acknowledgeAlert}
                onPreviewAita={handleSwitchToPatientMode}
                onFireReminder={(item) => {
                  const published = (state.publishedPlanItems || state.planItems.filter((p) => !p.isDraft)).find(
                    (p) => p.id === item.id
                  ) || item;
                  setActiveReminderItem(published);
                  setAppMode('patient');
                  setPatientRoute('reminder');
                }}
                onFireNextReminder={handleFireNextReminder}
                onGoToPlan={() => setCaregiverTab('plan')}
              />
            )}

            {/* C-04: Plan & Item Editor */}
            {caregiverTab === 'plan' && (
              <PlanScreen
                planItems={state.planItems}
                memories={state.memories}
                settings={state.settings}
                onSaveItem={savePlanItem}
                onDeleteItem={deletePlanItem}
                onPublishPlan={handlePublishPlanWithFeedback}
              />
            )}

            {/* C-06: Observe & Adaptation */}
            {caregiverTab === 'observe' && (
              <ObserveScreen
                metrics={state.metrics}
                activityConfigs={state.activityConfigs}
                adaptationDecisions={state.adaptationDecisions}
                onRecordDecision={recordAdaptationDecision}
                onUpdateActivityConfig={updateActivityConfig}
                onOpenWeeklySummary={() => setIsWeeklySummaryOpen(true)}
              />
            )}

            {/* C-08: Guide */}
            {caregiverTab === 'guide' && <GuideScreen />}

            {/* C-09: Family Circle & Tasks */}
            {caregiverTab === 'family' && (
              <FamilyScreen
                memories={state.memories}
                members={state.familyMembers}
                tasks={state.familyTasks}
                onSaveMemory={saveMemory}
                onToggleTask={toggleTaskCompleted}
              />
            )}

            {/* C-13: Settings & Interactive Demo Panel */}
            {caregiverTab === 'settings' && (
              <SettingsScreen
                settings={state.settings}
                planItems={state.planItems}
                onUpdateSettings={updateSettings}
                onFireReminder={(item) => {
                  setActiveReminderItem(item);
                  setAppMode('patient');
                  setPatientRoute('reminder');
                }}
                onResetDemoData={resetDemoData}
                onSwitchToPatientMode={handleSwitchToPatientMode}
                onOpenSetupWizard={() => setIsSetupWizardOpen(true)}
              />
            )}
          </main>

          {/* Bottom Navigation for Caregiver */}
          <CaregiverBottomNav
            activeTab={caregiverTab}
            onSelectTab={(tab) => setCaregiverTab(tab)}
          />

          {/* Modal Overlays for Caregiver */}
          {isWeeklySummaryOpen && (
            <WeeklySummaryModal
              isOpen={isWeeklySummaryOpen}
              metrics={state.metrics}
              planItems={state.planItems}
              onClose={() => setIsWeeklySummaryOpen(false)}
            />
          )}

          {isSyncModalOpen && (
            <SyncModal
              isOpen={isSyncModalOpen}
              settings={state.settings}
              outbox={state.outbox}
              onTriggerSync={triggerSyncNow}
              onToggleSimulatedOffline={(offline) =>
                updateSettings({ isSimulatedOffline: offline })
              }
              onClose={() => setIsSyncModalOpen(false)}
            />
          )}

          {isSetupWizardOpen && (
            <SetupWizardModal
              isOpen={isSetupWizardOpen}
              circleId={activeCircleId}
              initialPin={state.settings.caregiverPin}
              onComplete={(setupData) => {
                updateSettings({
                  caregiverPin: setupData.pin,
                  circleName: setupData.circleName,
                  patientPersonName: setupData.personName,
                  activePairingCode: setupData.pairingCode,
                });
                setIsSetupWizardOpen(false);
                showToast('ছেট-আপ সম্পূৰ্ণ হʼল', `Setup complete. Circle & PIN ${setupData.pin} saved.`);
              }}
              onPairPatientAndLaunch={async (code, setupData) => {
                const res = await pairDevice(code);
                if (!res.success) {
                  showToast('ডিভাইচ সংলগ্ন নহʼল', res.error || 'Could not pair the device.');
                  return;
                }
                updateSettings({
                  isDevicePaired: true,
                  pairedCircleId: res.circleId || activeCircleId,
                  circleName: res.circleName || setupData.circleName || state.settings.circleName,
                  patientPersonName: res.personName || setupData.personName || state.settings.patientPersonName,
                  caregiverPin: res.caregiverPin || setupData.pin || state.settings.caregiverPin,
                  activePairingCode: code,
                });
                setIsSetupWizardOpen(false);
                showToast('ডিভাইচ সংলগ্ন হʼল', 'Tablet paired! Welcome to Patient Home.');
                handleSwitchToPatientMode();
              }}
              onClose={() => setIsSetupWizardOpen(false)}
            />
          )}
        </>
      )}

      {/* Patient Device Pairing Modal */}
      {isPairingModalOpen && (
        <PatientPairingModal
          isOpen={isPairingModalOpen}
          activePairingCode={state.settings.activePairingCode || (currentUser ? undefined : '492817')}
          onPair={async (code) => {
            const res = await pairDevice(code);
            if (res.success) {
              updateSettings({
                isDevicePaired: true,
                pairedCircleId: res.circleId,
                circleName: res.circleName || state.settings.circleName,
                patientPersonName: res.personName || state.settings.patientPersonName,
                caregiverPin: res.caregiverPin || state.settings.caregiverPin,
                activePairingCode: code,
              });
              showToast('ডিভাইচ সংলগ্ন হʼল', `Tablet paired with ${res.circleName || 'Family Circle'}`);
            }
            return res;
          }}
          onClose={() => setIsPairingModalOpen(false)}
        />
      )}

      {/* Floating Toast Notification */}
      <Toast
        visible={toastData.visible}
        titleAs={toastData.titleAs}
        subtitleEn={toastData.subtitleEn}
        onDismiss={() => setToastData((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
