export type TechnicalSource = { title: string; url: string };

export interface TutorialSection {
  id: string;
  title: string;
  paragraphs: string[];
  equationLatex?: string;
  references: TechnicalSource[];
}

export interface TutorialChapter {
  slug: string;
  title: string;
  summary: string;
  prerequisites: string[];
  sections: TutorialSection[];
  readings: {
    title: string;
    url: string;
    source: string;
    locator: string;
    focus: string;
  }[];
  related: TechnicalSource[];
}
