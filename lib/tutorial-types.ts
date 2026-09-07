export type TechnicalSource = { title: string; url: string };

export interface StudyGuide {
  slug: string;
  title: string;
  summary: string;
  prerequisites: string[];
  readings: {
    title: string;
    url: string;
    source: string;
    locator: string;
    focus: string;
  }[];
  related: TechnicalSource[];
}
