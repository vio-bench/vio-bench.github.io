export type TechnicalSource = { title: string; url: string };

export interface Tutorial {
  slug: string;
  title: string;
  level: string;
  duration: string;
  summary: string;
  prerequisites: string[];
  objectives: string[];
  sections: {
    title: string;
    body: string[];
    equation?: string;
    equationLatex?: string;
    sources?: TechnicalSource[];
  }[];
  exercise: { question: string; answer: string };
  sources: TechnicalSource[];
}
