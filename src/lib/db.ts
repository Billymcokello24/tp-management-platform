import Dexie, { Table } from 'dexie';

export interface OfflineLessonPlan {
  id: string; // uuid generated locally if new
  studentId: string;
  subject: string;
  classForm: string;
  stream: string | null;
  topic: string;
  subTopic: string | null;
  date: string; // ISO string
  startTime: string | null;
  endTime: string | null;
  duration: string | null;
  objectives: string;
  introduction: string;
  developmentSteps: any; // JSON
  conclusion: string;
  methods: string[];
  resources: string;
  assessment: string | null;
  assignment: string | null;
  reflection: string | null;
  status: string; // 'DRAFT' | 'SUBMITTED'
  syncStatus: 'synced' | 'pending' | 'failed';
  updatedAt: number;
}

export interface OfflineAssessment {
  id: string;
  studentId: string;
  lecturerId: string;
  status: string;
  // Assessment fields
  schemeOfWorkMark: number;
  lessonPlanObjectives: number;
  lessonPlanActivities: number;
  lessonPlanSequence: number;
  introductionMark: number;
  logicalPresentation: number;
  contentRelevance: number;
  contentAdequacy: number;
  teachingStrategies: number;
  teachingSkills: number;
  contentMastery: number;
  communicationMark: number;
  chalkboardUse: number;
  resourceTiming: number;
  resourceAppropriateness: number;
  resourceInnovativeness: number;
  learnerControl: number;
  learnerParticipation: number;
  groupWork: number;
  teacherLearnerRapport: number;
  closureSkills: number;
  concludingActivities: number;
  assignmentMark: number;
  personalityMark: number;
  selfAppraisalMark: number;
  totalMarks: number;
  generalComments: string | null;
  areasOfStrength: string | null;
  areasOfImprovement: string | null;
  // GPS
  submissionLatitude: number | null;
  submissionLongitude: number | null;
  isGeoVerified: boolean;
  geoVerificationNote: string | null;
  
  syncStatus: 'synced' | 'pending' | 'failed';
  updatedAt: number;
}

export interface OfflineSupervisionLog {
  id: string;
  lecturerId: string;
  studentId: string;
  schoolId: string;
  checkInTime: string; // ISO string
  checkOutTime: string | null;
  checkInLatitude: number;
  checkInLongitude: number;
  checkOutLatitude: number | null;
  checkOutLongitude: number | null;
  durationMinutes: number | null;
  notes: string | null;
  
  syncStatus: 'synced' | 'pending' | 'failed';
  updatedAt: number;
}

export interface SyncQueueItem {
  id: string;
  type: 'LESSON_PLAN' | 'ASSESSMENT' | 'SUPERVISION_LOG';
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  createdAt: number;
  retryCount: number;
}

export class TPMSDatabase extends Dexie {
  lessonPlans!: Table<OfflineLessonPlan, string>;
  assessments!: Table<OfflineAssessment, string>;
  supervisionLogs!: Table<OfflineSupervisionLog, string>;
  syncQueue!: Table<SyncQueueItem, string>;

  constructor() {
    super('TPMSDatabase');
    this.version(1).stores({
      lessonPlans: 'id, studentId, status, syncStatus, updatedAt',
      assessments: 'id, studentId, lecturerId, status, syncStatus, updatedAt',
      supervisionLogs: 'id, lecturerId, studentId, schoolId, syncStatus, updatedAt',
      syncQueue: 'id, type, operation, createdAt'
    });
  }
}

export const db = new TPMSDatabase();
