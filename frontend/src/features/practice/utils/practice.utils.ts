import { TaskType } from '@/common/enums/task-type.enum';

export const formatPrompt = (text: string) => {
  if (!text) return '';
  return text.replace(/(^|\n)([\s\-\*]*)([a-z])/g, (_match, p1, p2, p3) => {
    return p1 + p2 + p3.toUpperCase();
  });
};

export const typeConfig: Record<string, { label: string; bg: string }> = {
  grammar: { label: 'Grammar', bg: 'bg-red-100 text-red-700' },
  vocabulary: { label: 'Vocabulary', bg: 'bg-indigo-100 text-indigo-700' },
  cohesion: { label: 'Cohesion', bg: 'bg-amber-100 text-amber-700' },
  task: { label: 'Task Response', bg: 'bg-emerald-100 text-emerald-700' },
};

export const taskTypeLabel: Record<string, { text: string; color: string }> = {
  [TaskType.TASK_1_ACADEMIC]: { text: 'Task 1 Aca', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
  [TaskType.TASK_1_GENERAL]: { text: 'Task 1 Gen', color: 'bg-teal-50 text-teal-600 border-teal-200' },
  [TaskType.TASK_2]: { text: 'Task 2', color: 'bg-violet-50 text-violet-600 border-violet-200' },
};
