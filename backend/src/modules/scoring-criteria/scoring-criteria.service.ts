import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScoringCriteria } from './entities/scoring-criteria.entity';
import { TaskType } from '../../common/enums/task-type.enum';

@Injectable()
export class ScoringCriteriaService implements OnModuleInit {
    constructor(
        @InjectRepository(ScoringCriteria)
        private criteriaRepository: Repository<ScoringCriteria>,
    ) { }

    async onModuleInit() {
        await this.seedDefaultCriteria();
    }

    async findAll() {
        return this.criteriaRepository.find({
            order: { taskType: 'ASC', criteriaKey: 'ASC' },
        });
    }

    async findByTaskType(taskType: TaskType) {
        const criteria = await this.criteriaRepository.find({
            where: { taskType },
        });

        // Đảm bảo thứ tự: TA → CC → LR → GRA (Gap Analysis luôn ở cuối)
        const ORDER: Record<string, number> = { TA: 0, CC: 1, LR: 2, GRA: 3 };
        criteria.sort((a, b) => (ORDER[a.criteriaKey] ?? 99) - (ORDER[b.criteriaKey] ?? 99));

        return criteria.reduce((acc, curr) => {
            acc[curr.criteriaKey] = curr.description;
            return acc;
        }, {} as Record<string, string>);
    }

    async update(id: string, description: string) {
        await this.criteriaRepository.update(id, { description });
        return this.criteriaRepository.findOne({ where: { id } });
    }

    /**
     * Seed dữ liệu mặc định (chạy một lần khi DB còn trống).
     * Nguồn: .agent/scoring_criteria/{task_2, task_1_academic, task_1_general}.md
     * Mỗi file được tách thành 4 record riêng: TA, CC, LR, GRA.
     * Phần Gap Analysis được gắn vào record GRA (tiêu chí cuối cùng).
     */
    private async seedDefaultCriteria() {
        const count = await this.criteriaRepository.count();
        if (count > 0) return;

        const defaultCriteria = [
            // ── TASK 2 ──────────────────────────────────────────────────────────────
            {
                taskType: TaskType.TASK_2,
                criteriaKey: 'TA',
                description: `1. TASK RESPONSE (TR):
- PENALTY RULES: If the essay is completely off-topic or memorized, TR is 2.0 or 3.0. If any part of the prompt is completely ignored, TR CANNOT exceed 5.0.
- Band 4.0: Responds to the task only in a minimal way or the answer is tangential. The position is unclear. Main ideas are difficult to identify, repetitive, or irrelevant.
- Band 5.0: Addresses the task only partially. Expresses a position but the development is not always clear. Main ideas are limited and not sufficiently developed.
- Band 6.0: Addresses all parts, but some are covered more fully than others. A position is presented, but conclusions may be unclear. Main ideas are present but may lack adequate development.
- Band 7.0: Addresses all parts equally. Presents a CLEAR and CONSISTENT position throughout. Main ideas are extended and supported.
- Band 8.0/9.0: Fully addresses all parts with a well-developed, highly relevant, and exceptionally supported response.`,
            },
            {
                taskType: TaskType.TASK_2,
                criteriaKey: 'CC',
                description: `2. COHERENCE AND COHESION (CC):
- Band 4.0: Information and ideas are not arranged coherently. No clear progression. Uses some basic cohesive devices but they are inaccurate or repetitive. May not write in paragraphs.
- Band 5.0: Presents information with some organization but lacks overall progression. Inadequate, inaccurate, or over-use of cohesive devices. Paragraphing is inadequate.
- Band 6.0: Has a clear overall progression. Uses cohesive devices effectively, but cohesion may be mechanical. Paragraphing is used but not always logically.
- Band 7.0: Logically organizes information with a clear progression. Uses a range of cohesive devices appropriately. Each paragraph has a CLEAR central topic.
- Band 8.0/9.0: Sequences information logically and seamlessly. Manages all aspects of cohesion perfectly.`,
            },
            {
                taskType: TaskType.TASK_2,
                criteriaKey: 'LR',
                description: `3. LEXICAL RESOURCE (LR):
- Band 4.0: Uses only basic vocabulary, often repetitively or inappropriately. Has limited control of word formation/spelling; errors cause strain for the reader.
- Band 5.0: Uses a limited range of vocabulary, minimally adequate for the task. Noticeable errors in spelling and word formation that may cause some difficulty for the reader.
- Band 6.0: Uses an adequate range of vocabulary. Attempts less common vocabulary but with noticeable inaccuracies. Errors do not impede communication.
- Band 7.0: Uses a sufficient range of vocabulary for flexibility. Uses less common items with awareness of style. Occasional minor errors.
- Band 8.0/9.0: Uses a wide vocabulary fluently to convey precise meanings. Errors are extremely rare.`,
            },
            {
                taskType: TaskType.TASK_2,
                criteriaKey: 'GRA',
                description: `4. GRAMMATICAL RANGE AND ACCURACY (GRA):
- Band 4.0: Uses a very limited range of structures. Rare use of subordinate clauses. Errors predominate and punctuation is often faulty.
- Band 5.0: Uses a limited range of structures. Attempts complex sentences but these tend to be less accurate than simple sentences. Frequent grammatical errors.
- Band 6.0: Uses a mix of simple and complex sentence forms. Makes some errors in grammar and punctuation, but they rarely reduce communication.
- Band 7.0: Uses a variety of complex structures. Produces frequent error-free sentences. Good control of grammar.
- Band 8.0/9.0: Wide range of structures. The vast majority of sentences are error-free.

--- ACTIONABLE MENTOR FEEDBACK ---
Provide a "Gap Analysis". Identify the student's current overall band score. Clearly state the TOP 3 specific, actionable steps tailored to their current level that they must take to achieve the NEXT band score. Ensure the tone is encouraging but highly objective.`,
            },

            // ── TASK 1 ACADEMIC ─────────────────────────────────────────────────────
            {
                taskType: TaskType.TASK_1_ACADEMIC,
                criteriaKey: 'TA',
                description: `1. TASK ACHIEVEMENT (TA):
- PENALTY RULES: If there is NO clear overview summarizing the main trends/differences, TA is CAPPED at 5.0. If the student includes personal opinions outside the provided data, heavily penalize TA.
- Band 4.0: Attempts to address the task but does not cover all key features. The format may be inappropriate. May just mechanically list data without any analysis.
- Band 5.0: Generally addresses the task but recounts details mechanically. There is NO clear overview. There may be no data (numbers) to support the description.
- Band 6.0: Presents an overview with appropriately selected info. Highlights key features, but details may be irrelevant, inappropriate, or inaccurate.
- Band 7.0: Presents a CLEAR overview of main trends or stages. Clearly presents and highlights key features, but could be more fully extended.
- Band 8.0/9.0: Covers all requirements sufficiently with a comprehensive overview and highly accurate highlighting of key features.`,
            },
            {
                taskType: TaskType.TASK_1_ACADEMIC,
                criteriaKey: 'CC',
                description: `2. COHERENCE AND COHESION (CC):
- Band 4.0: Information is not arranged coherently. No clear progression. Repetitive cohesive devices.
- Band 5.0: Presents information with some organization but lacks overall progression. Inadequate or over-use of cohesive devices. Paragraphing is poor.
- Band 6.0: Arranges information coherently. Uses cohesive devices effectively but sometimes mechanically.
- Band 7.0: Logically organizes information. Uses a range of cohesive devices appropriately. Data is grouped logically into body paragraphs.
- Band 8.0/9.0: Sequences information logically and seamlessly. Paragraphing is used skillfully to group data comparisons.`,
            },
            {
                taskType: TaskType.TASK_1_ACADEMIC,
                criteriaKey: 'LR',
                description: `3. LEXICAL RESOURCE (LR):
- Band 4.0: Basic vocabulary used repetitively. High rate of spelling errors causing strain.
- Band 5.0: Limited vocabulary minimally adequate for data description. Noticeable spelling/word formation errors.
- Band 6.0: Adequate vocabulary for data description. Attempts less common vocabulary but with some inaccuracy.
- Band 7.0: Sufficient range for flexibility. Uses less common lexical items (specific verbs, adverbs of degree) with awareness of style and collocation.
- Band 8.0/9.0: Wide vocabulary used fluently to convey precise comparisons and trends. Rare errors.`,
            },
            {
                taskType: TaskType.TASK_1_ACADEMIC,
                criteriaKey: 'GRA',
                description: `4. GRAMMATICAL RANGE AND ACCURACY (GRA):
- STRICT CHECK: Verify correct use of tenses matching the timeframe of the chart. Verify the use of passive voice for Process/Map diagrams.
- Band 4.0: Very limited structures. Errors predominate.
- Band 5.0: Limited range. Complex sentences are attempted but often inaccurate. Frequent errors cause some difficulty.
- Band 6.0: Mix of simple/complex forms. Some errors that rarely reduce communication.
- Band 7.0: Variety of complex structures. Frequent error-free sentences. Good control.
- Band 8.0/9.0: Wide range of structures. Majority of sentences are completely error-free.

--- ACTIONABLE MENTOR FEEDBACK ---
Provide a "Gap Analysis". Identify the student's current overall band score. Clearly state the TOP 3 specific, actionable steps tailored to their current level that they must take to achieve the NEXT band score. Ensure the tone is encouraging but highly objective.`,
            },

            // ── TASK 1 GENERAL ───────────────────────────────────────────────────────
            {
                taskType: TaskType.TASK_1_GENERAL,
                criteriaKey: 'TA',
                description: `1. TASK ACHIEVEMENT (TA):
- PENALTY RULES: You MUST verify that ALL THREE bullet points are addressed. If any bullet point is completely missing, TA is CAPPED at 5.0.
- TONE PENALTY: Determine the required tone (Formal, Semi-formal, Informal). If the tone is totally inappropriate, TA is capped at 5.0.
- Band 4.0: Attempts to address the task but does not cover all bullet points. The format may be inappropriate. The tone is completely inappropriate.
- Band 5.0: Generally addresses the task. Bullet points may be inadequately covered. The purpose of the letter may be unclear at times. The tone may be variable or inconsistent.
- Band 6.0: Presents a purpose that is generally clear. Tone may be inconsistent. Highlights all bullet points, but details may be irrelevant or inaccurate.
- Band 7.0: Presents a clear purpose. The tone is consistent and appropriate throughout. Clearly presents and highlights all bullet points.
- Band 8.0/9.0: Presents a clear purpose with a consistent, highly appropriate tone. Effectively extends all bullet points.`,
            },
            {
                taskType: TaskType.TASK_1_GENERAL,
                criteriaKey: 'CC',
                description: `2. COHERENCE AND COHESION (CC):
- STRICT CHECK: Verify correct letter formatting (appropriate salutation and sign-off).
- Band 4.0: No clear progression. Inaccurate or repetitive cohesive devices.
- Band 5.0: Some organization but lacks overall progression. Inadequate or over-use of cohesive devices. Paragraphing is poor.
- Band 6.0: Arranges info coherently. Uses cohesive devices effectively but mechanically.
- Band 7.0: Logically organizes information. Uses a range of cohesive devices appropriately. Paragraphing clearly aligns with the bullet points.
- Band 8.0/9.0: Sequences information logically and seamlessly. Manages cohesion flawlessly.`,
            },
            {
                taskType: TaskType.TASK_1_GENERAL,
                criteriaKey: 'LR',
                description: `3. LEXICAL RESOURCE (LR):
- STRICT CHECK: Evaluate vocabulary based on tone (Idioms/phrasal verbs for Informal; Professional collocations for Formal).
- Band 4.0: Basic vocabulary. Spelling errors cause strain for the reader.
- Band 5.0: Limited vocabulary. Noticeable spelling/word formation errors that cause some difficulty.
- Band 6.0: Adequate vocabulary. Attempts less common words with inaccuracies.
- Band 7.0: Sufficient range for flexibility. Uses less common lexical items with awareness of style (tone) and collocation.
- Band 8.0/9.0: Wide vocabulary used fluently. Skillful use of uncommon lexical items perfectly matching the tone.`,
            },
            {
                taskType: TaskType.TASK_1_GENERAL,
                criteriaKey: 'GRA',
                description: `4. GRAMMATICAL RANGE AND ACCURACY (GRA):
- Band 4.0: Very limited structures. Errors predominate. Punctuation is faulty.
- Band 5.0: Limited range. Attempts complex sentences but with high inaccuracy.
- Band 6.0: Mix of simple/complex forms. Some errors that rarely reduce communication.
- Band 7.0: Variety of complex structures. Frequent error-free sentences.
- Band 8.0/9.0: Wide range of structures. Majority of sentences are completely error-free.

--- ACTIONABLE MENTOR FEEDBACK ---
Provide a "Gap Analysis". Identify the student's current overall band score. Clearly state the TOP 3 specific, actionable steps tailored to their current level that they must take to achieve the NEXT band score. Ensure the tone is encouraging but highly objective.`,
            },
        ];

        for (const criteria of defaultCriteria) {
            await this.criteriaRepository.save(this.criteriaRepository.create(criteria));
        }
    }
}
