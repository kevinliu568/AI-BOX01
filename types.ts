
export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ScriptData {
  content: string;
  sources: GroundingSource[];
}
