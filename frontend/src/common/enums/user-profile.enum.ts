export const ExamType = {
    ACADEMIC: 'Academic',
    GENERAL: 'General',
} as const;
export type ExamType = (typeof ExamType)[keyof typeof ExamType];

export const StudyPurpose = {
    GRADUATION: 'Graduation',       // Xét tốt nghiệp
    STUDY_ABROAD: 'Study Abroad',     // Du học
    WORK_VISA: 'Immigration',         // Định cư
    JOB_APPLICATION: 'Job Application',// Xin việc/Phỏng vấn
    PROMOTION: 'Career Promotion',    // Thăng tiến sự nghiệp
    PERSONAL_INTEREST: 'Personal',    // Trau dồi cá nhân
} as const;
export type StudyPurpose = (typeof StudyPurpose)[keyof typeof StudyPurpose];

export const WritingFocus = {
    TASK_RESPONSE: 'Task Response',
    COHERENCE_COHESION: 'Coherence & Cohesion',
    LEXICAL_RESOURCE: 'Vocabulary',
    GRAMMAR_ACCURACY: 'Grammar',
    IDEA_GENERATION: 'Ideas',
} as const;
export type WritingFocus = (typeof WritingFocus)[keyof typeof WritingFocus];
