export interface Recording {
  id: string;
  artistFirstName: string; // Added
  artistLastName: string; // Renamed from artistName
  recordingYear: number;
  colorCode: string;
  graphLineColor?: string; // Added for graph line matching
  albumArt?: string;
  albumArtBack?: string; // Added for back cover image
  audioSnippet?: string;
  recordLabel?: string;
  section?: 'A' | 'B'; // Added to distinguish sections
  isLive: boolean; // Added
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
activeTimelineSection?: 'A' | 'B' | null; // Added to track which timeline highlight is active
}

export interface PieceInfo {
  composer: string;
  title: string;
  movement: string;
  startTime: string;
  endTime: string;
}

export interface RecordingClip {
  id: string;
  pianistFirstName: string; // Added
  pianistLastName: string;
  section: 'A' | 'B';
  year: number;
  recordLabel: string;
  isLive: boolean;
  audioSrc: string;
  frontArtSrc: string;
  backArtSrc: string;
  graphLineColor: string;
}
