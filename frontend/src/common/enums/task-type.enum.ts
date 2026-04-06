export const TaskType = {
    TASK_1_ACADEMIC: 'task_1_academic',
    TASK_1_GENERAL: 'task_1_general',
    TASK_2: 'task_2'
} as const;

export type TaskType = (typeof TaskType)[keyof typeof TaskType];
