import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, logFirestoreError, OperationType } from '../firebase/firebaseClient.ts';
import {
  PlanItem,
  MemoryItem,
  ActivitySession,
  HelpEvent,
  CaregiverAlert,
  WeeklySummaryDoc,
  CareCircleDoc,
  OutboxItem,
  CareCirclePerson,
  CareCircleConsent,
  ActivePairingCode,
  PairingCodeDoc,
  PatientDeviceRecord,
} from '../../types.ts';

export const careRepository = {
  /**
   * Retrieves or creates root Care Circle record
   */
  async getCareCircle(circleId: string): Promise<CareCircleDoc | null> {
    const ref = doc(db, 'careCircles', circleId);
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data() as CareCircleDoc;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `careCircles/${circleId}`);
    }
  },

  async createCareCircle(circleId: string, name: string, primaryCaregiverUid: string): Promise<CareCircleDoc> {
    const ref = doc(db, 'careCircles', circleId);
    const circleData: CareCircleDoc = {
      id: circleId,
      name,
      primaryCaregiverUid,
      memberUids: [primaryCaregiverUid],
      planVersion: 1,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(ref, circleData, { merge: true });
      return circleData;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `careCircles/${circleId}`);
    }
  },

  /**
   * C-02 Setup Wizard persistence
   */
  async saveSetupWizardData(
    circleId: string,
    data: {
      circleName: string;
      person: CareCirclePerson;
      consent: CareCircleConsent;
      caregiverPin: string;
      pairingCode: ActivePairingCode;
    }
  ): Promise<void> {
    const circleRef = doc(db, 'careCircles', circleId);
    const currentUser = auth.currentUser;
    const uid = currentUser?.uid || data.consent.consentedByUid || 'primary-caregiver';

    try {
      await setDoc(
        circleRef,
        {
          id: circleId,
          name: data.circleName,
          person: data.person,
          consent: data.consent,
          caregiverPin: data.caregiverPin,
          activePairingCode: data.pairingCode,
          primaryCaregiverUid: uid,
          memberUids: [uid],
          planVersion: 1,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Create lookup document in pairingCodes/{code}
      const codeRef = doc(db, 'pairingCodes', data.pairingCode.code);
      const pairingDoc: PairingCodeDoc = {
        id: data.pairingCode.code,
        circleId,
        circleName: data.circleName,
        personName: data.person.name,
        caregiverPin: data.caregiverPin,
        expiresAt: data.pairingCode.expiresAt,
        createdAt: data.pairingCode.createdAt,
        createdByUid: data.consent.consentedByUid || uid,
        used: false,
      };
      await setDoc(codeRef, pairingDoc, { merge: true });

      // Create initial patient device record
      const deviceRef = doc(db, 'careCircles', circleId, 'devices', 'device-primary-tablet');
      const deviceDoc: PatientDeviceRecord = {
        deviceId: 'device-primary-tablet',
        circleId,
        deviceType: 'tablet',
        pairedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      };
      await setDoc(deviceRef, deviceDoc, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `careCircles/${circleId}`);
    }
  },

  /**
   * Deterministic 6-digit code generator for device pairing
   */
  async generatePairingCode(
    circleId: string,
    circleName: string,
    personName: string,
    caregiverPin: string,
    createdByUid: string
  ): Promise<ActivePairingCode> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const activeCode: ActivePairingCode = {
      code,
      expiresAt,
      createdAt,
      used: false,
    };

    try {
      const codeRef = doc(db, 'pairingCodes', code);
      await setDoc(
        codeRef,
        {
          id: code,
          circleId,
          circleName,
          personName,
          caregiverPin,
          expiresAt,
          createdAt,
          createdByUid,
          used: false,
        },
        { merge: true }
      );

      const circleRef = doc(db, 'careCircles', circleId);
      await setDoc(circleRef, { activePairingCode: activeCode }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `pairingCodes/${code}`);
    }

    return activeCode;
  },

  /**
   * Verifies pairing code and pairs patient device
   */
  async verifyAndPairDevice(
    code: string,
    deviceId: string
  ): Promise<{
    success: boolean;
    circleId?: string;
    circleName?: string;
    personName?: string;
    caregiverPin?: string;
    error?: string;
  }> {
    const cleanCode = code.replace(/\s+/g, '').trim();
    if (!cleanCode) {
      return { success: false, error: 'Pairing code is required.' };
    }

    const codeRef = doc(db, 'pairingCodes', cleanCode);
    try {
      const snap = await getDoc(codeRef);
      if (!snap.exists()) {
        return { success: false, error: 'Invalid pairing code. Please verify the 6-digit code.' };
      }

      const data = snap.data() as PairingCodeDoc;
      if (data.used) {
        return { success: false, error: 'This pairing code has already been used.' };
      }

      const expires = new Date(data.expiresAt).getTime();
      if (Date.now() > expires) {
        return { success: false, error: 'Pairing code has expired (15-min limit). Please request a new code from the caregiver.' };
      }

      // Mark pairing code as used
      await setDoc(codeRef, { used: true }, { merge: true });

      // Register device in circle's devices subcollection
      const deviceRef = doc(db, 'careCircles', data.circleId, 'devices', deviceId);
      await setDoc(
        deviceRef,
        {
          deviceId,
          circleId: data.circleId,
          deviceType: 'tablet',
          pairedAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return {
        success: true,
        circleId: data.circleId,
        circleName: data.circleName,
        personName: data.personName,
        caregiverPin: data.caregiverPin,
      };
    } catch (err) {
      logFirestoreError(err, OperationType.GET, `pairingCodes/${cleanCode}`);
      return { success: false, error: 'Could not connect to Firestore to verify code.' };
    }
  },

  async updateCirclePlanVersion(circleId: string, planVersion: number): Promise<void> {
    const ref = doc(db, 'careCircles', circleId);
    try {
      await setDoc(ref, { planVersion }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `careCircles/${circleId}`);
    }
  },

  /**
   * Plan Items repository
   */
  async getPlan(circleId: string): Promise<PlanItem[]> {
    const colRef = collection(db, 'careCircles', circleId, 'planItems');
    try {
      const snap = await getDocs(colRef);
      return snap.docs.map((d) => d.data() as PlanItem);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `careCircles/${circleId}/planItems`);
    }
  },

  async savePlanItem(circleId: string, item: PlanItem): Promise<void> {
    const itemRef = doc(db, 'careCircles', circleId, 'planItems', item.id);
    try {
      await setDoc(itemRef, item, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `careCircles/${circleId}/planItems/${item.id}`);
    }
  },

  async deletePlanItem(circleId: string, itemId: string): Promise<void> {
    const itemRef = doc(db, 'careCircles', circleId, 'planItems', itemId);
    try {
      await deleteDoc(itemRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `careCircles/${circleId}/planItems/${itemId}`);
    }
  },

  /**
   * Memories repository
   */
  async getMemories(circleId: string): Promise<MemoryItem[]> {
    const colRef = collection(db, 'careCircles', circleId, 'memories');
    try {
      const snap = await getDocs(colRef);
      return snap.docs.map((d) => d.data() as MemoryItem);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `careCircles/${circleId}/memories`);
    }
  },

  async saveMemory(circleId: string, memory: MemoryItem): Promise<void> {
    const memRef = doc(db, 'careCircles', circleId, 'memories', memory.id);
    try {
      await setDoc(memRef, memory, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `careCircles/${circleId}/memories/${memory.id}`);
    }
  },

  /**
   * Activity Sessions repository
   */
  async saveSession(circleId: string, session: ActivitySession): Promise<void> {
    const sessRef = doc(db, 'careCircles', circleId, 'activitySessions', session.id);
    try {
      await setDoc(sessRef, session, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `careCircles/${circleId}/activitySessions/${session.id}`);
    }
  },

  async getObservations(circleId: string, maxSessions = 50): Promise<ActivitySession[]> {
    const colRef = collection(db, 'careCircles', circleId, 'activitySessions');
    const q = query(colRef, orderBy('completedAt', 'desc'), limit(maxSessions));
    try {
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as ActivitySession);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `careCircles/${circleId}/activitySessions`);
    }
  },

  /**
   * Help Events repository
   */
  async saveHelpEvent(circleId: string, helpEvent: HelpEvent): Promise<void> {
    const ref = doc(db, 'careCircles', circleId, 'helpEvents', helpEvent.id);
    try {
      await setDoc(ref, helpEvent, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `careCircles/${circleId}/helpEvents/${helpEvent.id}`);
    }
  },

  /**
   * Alerts repository
   */
  async getAlerts(circleId: string): Promise<CaregiverAlert[]> {
    const colRef = collection(db, 'careCircles', circleId, 'alerts');
    try {
      const snap = await getDocs(colRef);
      return snap.docs.map((d) => d.data() as CaregiverAlert);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `careCircles/${circleId}/alerts`);
    }
  },

  async saveAlert(circleId: string, alert: CaregiverAlert): Promise<void> {
    const ref = doc(db, 'careCircles', circleId, 'alerts', alert.id);
    try {
      await setDoc(ref, alert, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `careCircles/${circleId}/alerts/${alert.id}`);
    }
  },

  /**
   * Summaries repository
   */
  async saveSummary(circleId: string, summary: WeeklySummaryDoc): Promise<void> {
    const ref = doc(db, 'careCircles', circleId, 'summaries', summary.id);
    try {
      await setDoc(ref, summary, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `careCircles/${circleId}/summaries/${summary.id}`);
    }
  },

  /**
   * Real-time listeners for Caregiver synchronization
   */
  listenToAlerts(circleId: string, onUpdate: (alerts: CaregiverAlert[]) => void) {
    const colRef = collection(db, 'careCircles', circleId, 'alerts');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const alerts = snapshot.docs.map((d) => d.data() as CaregiverAlert);
        onUpdate(alerts);
      },
      (error) => {
        logFirestoreError(error, OperationType.LIST, `careCircles/${circleId}/alerts`);
      }
    );
  },

  listenToPlan(circleId: string, onUpdate: (items: PlanItem[]) => void) {
    const colRef = collection(db, 'careCircles', circleId, 'planItems');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as PlanItem);
        onUpdate(items);
      },
      (error) => {
        logFirestoreError(error, OperationType.LIST, `careCircles/${circleId}/planItems`);
      }
    );
  },

  listenToSessions(circleId: string, onUpdate: (sessions: ActivitySession[]) => void) {
    const colRef = collection(db, 'careCircles', circleId, 'activitySessions');
    const q = query(colRef, orderBy('completedAt', 'desc'), limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
        const sessions = snapshot.docs.map((d) => d.data() as ActivitySession);
        onUpdate(sessions);
      },
      (error) => {
        logFirestoreError(error, OperationType.LIST, `careCircles/${circleId}/activitySessions`);
      }
    );
  },

  /**
   * Dispatches a single pending outbox operation to Firestore
   */
  async syncOutboxItem(circleId: string, item: OutboxItem): Promise<void> {
    switch (item.type) {
      case 'PLAN_ITEM_UPSERT':
        if (item.payload?.item) {
          await this.savePlanItem(circleId, item.payload.item as PlanItem);
        }
        break;

      case 'PLAN_ITEM_DELETE':
        if (item.entityId) {
          await this.deletePlanItem(circleId, item.entityId);
        }
        break;

      case 'PLAN_PUBLISH':
        if (item.payload?.planVersion) {
          await this.updateCirclePlanVersion(circleId, item.payload.planVersion as number);
        }
        if (Array.isArray(item.payload?.planItems)) {
          for (const planItem of item.payload.planItems as PlanItem[]) {
            await this.savePlanItem(circleId, planItem);
          }
        }
        break;

      case 'SESSION_RECORDED':
        if (item.payload) {
          const session: ActivitySession = {
            id: item.entityId || 'sess-' + Date.now(),
            circleId,
            activityId: (item.payload.activityId as string) || 'object-match',
            activityType: (item.payload.activityType as string) || (item.payload.activityId as string) || 'object-match',
            level: (item.payload.level || 1) as 1 | 2 | 3,
            roundsTotal: item.payload.roundsTotal || 3,
            roundsCompleted: item.payload.roundsCompleted !== undefined ? item.payload.roundsCompleted : 3,
            hintsUsed: item.payload.hintsUsed || 0,
            wrongTaps: item.payload.wrongTaps || 0,
            abandoned: item.payload.abandoned || false,
            comfort: item.payload.comfort || item.payload.comfortRating || item.payload.feeling,
            comfortRating: item.payload.comfortRating || item.payload.comfort || item.payload.feeling,
            startedAt: item.payload.startedAt,
            completedAt: (item.payload.completedAt as string) || (item.payload.timestamp as string) || new Date().toISOString(),
            durationSeconds: (item.payload.durationSeconds as number) || 45,
            completedSuccessfully: item.payload.completedSuccessfully !== false && !item.payload.abandoned,
          };
          await this.saveSession(circleId, session);
        }
        break;

      case 'ADAPTATION_DECISION_RECORDED':
        if (item.payload) {
          const decRef = doc(db, 'careCircles', circleId, 'adaptationDecisions', item.entityId);
          try {
            await setDoc(decRef, item.payload, { merge: true });
          } catch (err) {
            logFirestoreError(err, OperationType.WRITE, `careCircles/${circleId}/adaptationDecisions/${item.entityId}`);
          }
        }
        break;

      case 'REMINDER_EVENT_RECORDED':
        if (item.payload?.item) {
          await this.savePlanItem(circleId, item.payload.item as PlanItem);
        } else if (item.payload?.itemId && item.payload?.status) {
          const itemRef = doc(db, 'careCircles', circleId, 'planItems', item.payload.itemId);
          try {
            await setDoc(itemRef, { status: item.payload.status === 'later' ? 'missed' : item.payload.status }, { merge: true });
          } catch (err) {
            logFirestoreError(err, OperationType.WRITE, `careCircles/${circleId}/planItems/${item.payload.itemId}`);
          }
        }
        break;

      case 'HELP_EVENT_RECORDED':
        if (item.payload) {
          const helpEvent: HelpEvent = {
            id: item.entityId || 'help-' + Date.now(),
            circleId,
            triggeredAt: (item.payload.timestamp as string) || new Date().toISOString(),
            screenSource: (item.payload.screenSource as string) || 'tablet',
            resolved: false,
          };
          await this.saveHelpEvent(circleId, helpEvent);

          if (item.payload.alert) {
            await this.saveAlert(circleId, item.payload.alert as CaregiverAlert);
          }
        }
        break;

      default:
        // Generic metadata or unhandled types complete cleanly
        break;
    }
  },
};
