export interface DISCScores {
  D: number;
  I: number;
  S: number;
  C: number;
}

export interface DISCResults {
  disc_type: string;
  scores: DISCScores;
  raw_scores: DISCScores;
  answers_summary: Array<{ question_id: number; answer: number }>;
  summary: string;
  assessment_date?: string;
}
