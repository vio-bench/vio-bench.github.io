export type TechnicalSource = { title: string; url: string };

export type TutorialBlock =
  | { type: "paragraph"; text: string; references?: TechnicalSource[] }
  | { type: "equation"; latex: string }
  | { type: "figure"; src: string; alt: string; caption: string; width: number; height: number };

export interface TutorialSection {
  id: string;
  title: string;
  paragraphs: string[];
  equationLatex?: string;
  content?: TutorialBlock[];
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
    url?: string;
    source: string;
    locator: string;
    focus: string;
  }[];
  related: TechnicalSource[];
}
