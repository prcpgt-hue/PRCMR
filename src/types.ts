export interface Photo {
  id: string;
  url: string;
  caption: string;
  tags: string[];
  date: string;
  category: 'Ceremony' | 'Reception' | 'Portraits' | 'Details';
}

export interface AnalysisResult {
  tags: string[];
  description: string;
}
