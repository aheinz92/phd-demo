export interface Recording {
  id: string;
  artistName: string;
  recordingYear: number;
  colorCode: string;
  albumArt?: string;
  audioSnippet?: string;
}

export interface VariancePoint {
  timePosition: number; // 0-100 percentage
  varianceValue: number; // Height from baseline
}

export interface InterpretationData {
  recording: Recording;
  variancePath: VariancePoint[];
}

export interface TimelineState {
  currentPosition: number;
  isDragging: boolean;
  hasInteracted: boolean;
  isRecordingsSectionVisible: boolean;
}

export interface PieceInfo {
  composer: string;
  title: string;
  movement: string;
  startTime: string;
  endTime: string;
}
