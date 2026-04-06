
export enum TaskType {
    TASK_1_ACADEMIC = 'task_1_academic',
    TASK_1_GENERAL = 'task_1_general',
    TASK_2 = 'task_2',
}

export enum PromptSubType {
    // Task 1 Academic
    LINE = 'line',
    BAR = 'bar',
    PIE = 'pie',
    TABLE = 'table',
    MIXED = 'mixed',
    PROCESS = 'process',
    MAP = 'map',
    
    // Task 1 General
    FORMAL = 'formal',
    SEMI_FORMAL = 'semi_formal',
    INFORMAL = 'informal',
    
    // Task 2 Essay Types
    OPINION = 'opinion',
    DISCUSSION = 'discussion',
    PROBLEM_SOLUTION = 'problem_solution',
    ADVANTAGES_DISADVANTAGES = 'advantages_disadvantages',
    TWO_PART = 'two_part'
}
