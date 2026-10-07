import { ActivitySession, ActivityConfig, AdaptationRecommendation } from '../../types.ts';

export interface AdaptationMetrics {
  completionRate: number;
  hintsPerRound: number;
  uncomfortableCount: number;
  abandonedCount: number;
}

/**
 * Calculates aggregate metrics across the evaluated session window
 */
export function calculateSessionMetrics(sessions: ActivitySession[]): AdaptationMetrics {
  if (!sessions || sessions.length === 0) {
    return {
      completionRate: 0,
      hintsPerRound: 0,
      uncomfortableCount: 0,
      abandonedCount: 0,
    };
  }

  let totalHints = 0;
  let totalRounds = 0;
  let totalCompletedRounds = 0;
  let uncomfortableCount = 0;
  let abandonedCount = 0;

  for (const sess of sessions) {
    const rounds = sess.roundsTotal > 0 ? sess.roundsTotal : 3;
    const completed = sess.roundsCompleted !== undefined ? sess.roundsCompleted : (sess.completedSuccessfully ? rounds : 0);
    totalRounds += rounds;
    totalCompletedRounds += completed;
    totalHints += sess.hintsUsed || 0;

    if (sess.comfort === 'uncomfortable' || sess.comfortRating === 'uncomfortable') {
      uncomfortableCount++;
    }
    if (sess.abandoned === true) {
      abandonedCount++;
    }
  }

  const completionRate = totalRounds > 0 ? Math.round((totalCompletedRounds / totalRounds) * 100) / 100 : 0;
  const hintsPerRound = totalRounds > 0 ? Math.round((totalHints / totalRounds) * 100) / 100 : 0;

  return {
    completionRate,
    hintsPerRound,
    uncomfortableCount,
    abandonedCount,
  };
}

/**
 * Pure deterministic Adaptation Engine implementing PRD rules
 *
 * Rules:
 * - SWITCH: uncomfortable >= 2 OR abandoned >= 2
 * - REDUCE: level > 1 AND (hintsPerRound >= 1.0 OR completionRate < 0.6)
 * - INCREASE: level < 3 AND 3 completed sessions AND hintsPerRound <= 0.2 AND completionRate === 1 AND uncomfortable === 0
 * - otherwise MAINTAIN
 *
 * Constraints:
 * - level strictly 1–3
 * - one level change per 3 sessions
 * - locked activity never auto-changes
 */
export function evaluateAdaptation(
  sessions: ActivitySession[],
  config: ActivityConfig
): AdaptationRecommendation {
  const currentLevel = (Math.min(3, Math.max(1, config.currentLevel || 1))) as 1 | 2 | 3;
  const metrics = calculateSessionMetrics(sessions);

  // 1. Locked activity never auto-changes (Case D)
  if (config.isLocked) {
    return {
      action: 'MAINTAIN',
      fromLevel: currentLevel,
      toLevel: currentLevel,
      explanation: 'Activity difficulty is locked by caregiver. Automatic adaptation is paused.',
      metrics,
    };
  }

  // 2. Insufficient history requires 3 sessions (Case E)
  if (!sessions || sessions.length < 3) {
    return {
      action: 'MAINTAIN',
      fromLevel: currentLevel,
      toLevel: currentLevel,
      explanation: `Insufficient history (${sessions?.length || 0}/3 sessions). Maintaining Level ${currentLevel}.`,
      metrics,
    };
  }

  // Use only the last 3 sessions for evaluation window
  const windowSessions = sessions.slice(0, 3);
  const windowMetrics = calculateSessionMetrics(windowSessions);

  // 3. Rule: SWITCH if uncomfortable >= 2 OR abandoned >= 2 (Case C)
  if (windowMetrics.uncomfortableCount >= 2 || windowMetrics.abandonedCount >= 2) {
    return {
      action: 'SWITCH',
      fromLevel: currentLevel,
      toLevel: currentLevel,
      explanation: `Observed tension or abandoned sessions (${windowMetrics.uncomfortableCount} uncomfortable, ${windowMetrics.abandonedCount} abandoned). Suggest switching to a calmer activity.`,
      metrics: windowMetrics,
    };
  }

  // 4. Rule: REDUCE if level > 1 AND (hintsPerRound >= 1.0 OR completionRate < 0.6) (Case A)
  if (currentLevel > 1 && (windowMetrics.hintsPerRound >= 1.0 || windowMetrics.completionRate < 0.6)) {
    const targetLevel = (currentLevel - 1) as 1 | 2 | 3;
    return {
      action: 'REDUCE',
      fromLevel: currentLevel,
      toLevel: targetLevel,
      explanation: `Elevated prompt dependence (${windowMetrics.hintsPerRound} hints/rd) or lower completion (${Math.round(windowMetrics.completionRate * 100)}%). Suggest reducing to Level ${targetLevel} for comfort.`,
      metrics: windowMetrics,
    };
  }

  // 5. Rule: INCREASE if level < 3 AND 3 completed sessions AND hintsPerRound <= 0.2 AND completionRate === 1 AND uncomfortable === 0 (Case B)
  const allThreeCompleted = windowSessions.every((s) => !s.abandoned && s.completedSuccessfully !== false);
  if (
    currentLevel < 3 &&
    allThreeCompleted &&
    windowMetrics.hintsPerRound <= 0.2 &&
    windowMetrics.completionRate === 1 &&
    windowMetrics.uncomfortableCount === 0
  ) {
    const targetLevel = (currentLevel + 1) as 1 | 2 | 3;
    return {
      action: 'INCREASE',
      fromLevel: currentLevel,
      toLevel: targetLevel,
      explanation: `Consistently high recognition and calm completion across 3 sessions (0.2 or fewer hints/rd, 100% completion). Ready for Level ${targetLevel}.`,
      metrics: windowMetrics,
    };
  }

  // 6. Otherwise: MAINTAIN
  return {
    action: 'MAINTAIN',
    fromLevel: currentLevel,
    toLevel: currentLevel,
    explanation: `Engagement and comfort are stable at Level ${currentLevel}. Maintaining current pace.`,
    metrics: windowMetrics,
  };
}

/**
 * Test Fixtures for PRD Cases A, B, C, D, E
 */
export const ADAPTATION_TEST_FIXTURES = {
  // Case A: high hints -> REDUCE
  caseA_highHints: {
    name: 'Case A: High Hints',
    expectedAction: 'REDUCE' as const,
    expectedToLevel: 1 as const,
    config: {
      id: 'object-match' as const,
      nameAs: 'বস্তুৰ মিল',
      nameEn: 'Object Match',
      currentLevel: 2 as const,
      suggestedAction: 'MAINTAIN' as const,
      explanationSentence: '',
      avgHintsPerRound: 0,
      completionRate: 0,
      isLocked: false,
    },
    sessions: [
      {
        id: 's-a1',
        circleId: 'test',
        activityId: 'object-match',
        level: 2 as const,
        roundsTotal: 3,
        roundsCompleted: 3,
        hintsUsed: 4, // 1.33 hints/round
        wrongTaps: 2,
        abandoned: false,
        comfort: 'ok' as const,
        completedAt: '2026-10-04T00:00:00Z',
        durationSeconds: 50,
        completedSuccessfully: true,
      },
      {
        id: 's-a2',
        circleId: 'test',
        activityId: 'object-match',
        level: 2 as const,
        roundsTotal: 3,
        roundsCompleted: 3,
        hintsUsed: 3, // 1.0 hint/round
        wrongTaps: 1,
        abandoned: false,
        comfort: 'ok' as const,
        completedAt: '2026-10-04T01:00:00Z',
        durationSeconds: 45,
        completedSuccessfully: true,
      },
      {
        id: 's-a3',
        circleId: 'test',
        activityId: 'object-match',
        level: 2 as const,
        roundsTotal: 3,
        roundsCompleted: 3,
        hintsUsed: 4, // 1.33 hints/round
        wrongTaps: 2,
        abandoned: false,
        comfort: 'ok' as const,
        completedAt: '2026-10-04T02:00:00Z',
        durationSeconds: 55,
        completedSuccessfully: true,
      },
    ] as ActivitySession[],
  },

  // Case B: low hints + 100% completion -> INCREASE
  caseB_lowHints_perfectCompletion: {
    name: 'Case B: Low Hints + 100% Completion',
    expectedAction: 'INCREASE' as const,
    expectedToLevel: 2 as const,
    config: {
      id: 'object-match' as const,
      nameAs: 'বস্তুৰ মিল',
      nameEn: 'Object Match',
      currentLevel: 1 as const,
      suggestedAction: 'MAINTAIN' as const,
      explanationSentence: '',
      avgHintsPerRound: 0,
      completionRate: 0,
      isLocked: false,
    },
    sessions: [
      {
        id: 's-b1',
        circleId: 'test',
        activityId: 'object-match',
        level: 1 as const,
        roundsTotal: 3,
        roundsCompleted: 3,
        hintsUsed: 0,
        wrongTaps: 0,
        abandoned: false,
        comfort: 'good' as const,
        completedAt: '2026-10-04T00:00:00Z',
        durationSeconds: 30,
        completedSuccessfully: true,
      },
      {
        id: 's-b2',
        circleId: 'test',
        activityId: 'object-match',
        level: 1 as const,
        roundsTotal: 3,
        roundsCompleted: 3,
        hintsUsed: 0,
        wrongTaps: 0,
        abandoned: false,
        comfort: 'good' as const,
        completedAt: '2026-10-04T01:00:00Z',
        durationSeconds: 28,
        completedSuccessfully: true,
      },
      {
        id: 's-b3',
        circleId: 'test',
        activityId: 'object-match',
        level: 1 as const,
        roundsTotal: 3,
        roundsCompleted: 3,
        hintsUsed: 1, // total hints across 9 rounds = 1/9 = 0.11 <= 0.2
        wrongTaps: 0,
        abandoned: false,
        comfort: 'good' as const,
        completedAt: '2026-10-04T02:00:00Z',
        durationSeconds: 32,
        completedSuccessfully: true,
      },
    ] as ActivitySession[],
  },

  // Case C: 2 uncomfortable sessions -> SWITCH
  caseC_twoUncomfortable: {
    name: 'Case C: 2 Uncomfortable Sessions',
    expectedAction: 'SWITCH' as const,
    expectedToLevel: 2 as const,
    config: {
      id: 'object-match' as const,
      nameAs: 'বস্তুৰ মিল',
      nameEn: 'Object Match',
      currentLevel: 2 as const,
      suggestedAction: 'MAINTAIN' as const,
      explanationSentence: '',
      avgHintsPerRound: 0,
      completionRate: 0,
      isLocked: false,
    },
    sessions: [
      {
        id: 's-c1',
        circleId: 'test',
        activityId: 'object-match',
        level: 2 as const,
        roundsTotal: 3,
        roundsCompleted: 3,
        hintsUsed: 0,
        wrongTaps: 0,
        abandoned: false,
        comfort: 'uncomfortable' as const,
        completedAt: '2026-10-04T00:00:00Z',
        durationSeconds: 25,
        completedSuccessfully: true,
      },
      {
        id: 's-c2',
        circleId: 'test',
        activityId: 'object-match',
        level: 2 as const,
        roundsTotal: 3,
        roundsCompleted: 3,
        hintsUsed: 0,
        wrongTaps: 0,
        abandoned: false,
        comfort: 'uncomfortable' as const,
        completedAt: '2026-10-04T01:00:00Z',
        durationSeconds: 26,
        completedSuccessfully: true,
      },
      {
        id: 's-c3',
        circleId: 'test',
        activityId: 'object-match',
        level: 2 as const,
        roundsTotal: 3,
        roundsCompleted: 3,
        hintsUsed: 0,
        wrongTaps: 0,
        abandoned: false,
        comfort: 'good' as const,
        completedAt: '2026-10-04T02:00:00Z',
        durationSeconds: 30,
        completedSuccessfully: true,
      },
    ] as ActivitySession[],
  },

  // Case D: locked activity -> MAINTAIN
  caseD_lockedActivity: {
    name: 'Case D: Locked Activity',
    expectedAction: 'MAINTAIN' as const,
    expectedToLevel: 2 as const,
    config: {
      id: 'object-match' as const,
      nameAs: 'বস্তুৰ মিল',
      nameEn: 'Object Match',
      currentLevel: 2 as const,
      suggestedAction: 'MAINTAIN' as const,
      explanationSentence: '',
      avgHintsPerRound: 0,
      completionRate: 0,
      isLocked: true, // LOCKED
    },
    sessions: [
      {
        id: 's-d1',
        circleId: 'test',
        activityId: 'object-match',
        level: 2 as const,
        roundsTotal: 3,
        roundsCompleted: 1,
        hintsUsed: 5, // Would trigger REDUCE if unlocked
        wrongTaps: 3,
        abandoned: false,
        comfort: 'ok' as const,
        completedAt: '2026-10-04T00:00:00Z',
        durationSeconds: 60,
        completedSuccessfully: false,
      },
      {
        id: 's-d2',
        circleId: 'test',
        activityId: 'object-match',
        level: 2 as const,
        roundsTotal: 3,
        roundsCompleted: 1,
        hintsUsed: 4,
        wrongTaps: 2,
        abandoned: false,
        comfort: 'ok' as const,
        completedAt: '2026-10-04T01:00:00Z',
        durationSeconds: 58,
        completedSuccessfully: false,
      },
      {
        id: 's-d3',
        circleId: 'test',
        activityId: 'object-match',
        level: 2 as const,
        roundsTotal: 3,
        roundsCompleted: 1,
        hintsUsed: 5,
        wrongTaps: 3,
        abandoned: false,
        comfort: 'ok' as const,
        completedAt: '2026-10-04T02:00:00Z',
        durationSeconds: 62,
        completedSuccessfully: false,
      },
    ] as ActivitySession[],
  },

  // Case E: insufficient history -> MAINTAIN
  caseE_insufficientHistory: {
    name: 'Case E: Insufficient History (<3 sessions)',
    expectedAction: 'MAINTAIN' as const,
    expectedToLevel: 2 as const,
    config: {
      id: 'object-match' as const,
      nameAs: 'বস্তুৰ মিল',
      nameEn: 'Object Match',
      currentLevel: 2 as const,
      suggestedAction: 'MAINTAIN' as const,
      explanationSentence: '',
      avgHintsPerRound: 0,
      completionRate: 0,
      isLocked: false,
    },
    sessions: [
      {
        id: 's-e1',
        circleId: 'test',
        activityId: 'object-match',
        level: 2 as const,
        roundsTotal: 3,
        roundsCompleted: 3,
        hintsUsed: 0,
        wrongTaps: 0,
        abandoned: false,
        comfort: 'good' as const,
        completedAt: '2026-10-04T00:00:00Z',
        durationSeconds: 30,
        completedSuccessfully: true,
      },
      {
        id: 's-e2',
        circleId: 'test',
        activityId: 'object-match',
        level: 2 as const,
        roundsTotal: 3,
        roundsCompleted: 3,
        hintsUsed: 0,
        wrongTaps: 0,
        abandoned: false,
        comfort: 'good' as const,
        completedAt: '2026-10-04T01:00:00Z',
        durationSeconds: 30,
        completedSuccessfully: true,
      },
      // Only 2 sessions, not 3
    ] as ActivitySession[],
  },
};

export interface TestResult {
  name: string;
  passed: boolean;
  expectedAction: string;
  actualAction: string;
  expectedLevel: number;
  actualLevel: number;
  details: string;
}

/**
 * Executes test fixtures and returns structured pass/fail results
 */
export function runAdaptationTests(): { passed: boolean; results: TestResult[] } {
  const results: TestResult[] = [];
  let allPassed = true;

  for (const [key, testCase] of Object.entries(ADAPTATION_TEST_FIXTURES)) {
    const outcome = evaluateAdaptation(testCase.sessions, testCase.config);
    const actionMatches = outcome.action === testCase.expectedAction;
    const levelMatches = outcome.toLevel === testCase.expectedToLevel;
    const passed = actionMatches && levelMatches;

    if (!passed) allPassed = false;

    results.push({
      name: testCase.name,
      passed,
      expectedAction: testCase.expectedAction,
      actualAction: outcome.action,
      expectedLevel: testCase.expectedToLevel,
      actualLevel: outcome.toLevel,
      details: outcome.explanation,
    });
  }

  return { passed: allPassed, results };
}
