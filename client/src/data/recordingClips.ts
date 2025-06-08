import { RecordingClip } from '../types/music';

const imageFiles = [
  'fiorentino back.png',
  'fiorentino front.jpg',
  'hamelin back.jpg',
  'hamelin cover.jpg',
  'horowitz back.jpg',
  'horowitz front.jpg',
  'leschenko back.jpg',
  'leschenko front.jpg',
  'rodriguez back.jpg',
  'rodriguez front.jpg',
  'scherbakov back.jpg',
  'scherbakov front.gif',
  'sudbin back.jpg',
  'sudbin front.jpg',
  'sultanov back.png',
  'sultanov front.jpg',
  'titova back.jpg',
  'titova front.jpg',
  'weissenberg back.jpg',
  'weissenberg front.jpg',
];

const audioFilesA = [
  'horowitz A 1980 rca live - cut.mp3',
  'leschenko A 2012 avanti - cut.mp3',
  'rodriguez A 1993 elan - cut.mp3',
  'scherbakov A 1999 naxos - cut.mp3',
  'sudbin A 2005 BIS - cut.mp3',
  'titova A 2007 sony - cut.mp3',
];

const audioFilesB = [
  'fiorentino B 1994 appian - cut.mp3',
  'hamelin B 1994 port royal - cut.mp3',
  'horowitz B 1980 rca live - cut.mp3',
  'sultanov B 1997 vai live - cut.mp3',
  'titova B 2007 sony - cut.mp3',
  'weissenberg B 2009 dg - cut.mp3',
];

interface ParsedFilename {
  pianistLastName: string;
  section: 'A' | 'B';
  year: number;
  recordLabel: string;
  isLive: boolean;
  originalFilename: string;
}

const parseFilename = (filename: string): ParsedFilename | null => {
  const parts = filename.replace(' - cut.mp3', '').split(' ');
  if (parts.length < 4) return null;

  const pianistLastName = parts[0].toLowerCase();
  const section = parts[1] as 'A' | 'B';
  const year = parseInt(parts[2], 10);
  const recordLabel = parts[3].toLowerCase();
  const isLive = parts.includes('live');

  if (isNaN(year)) return null;

  return {
    pianistLastName,
    section,
    year,
    recordLabel,
    isLive,
    originalFilename: filename,
  };
};

const findArtPath = (pianistLastName: string, type: 'front' | 'back' | 'cover'): string | undefined => {
  const searchTerms = type === 'cover' ? [pianistLastName, 'cover'] : [pianistLastName, type];
  const foundFile = imageFiles.find(file => {
    const lowerFile = file.toLowerCase();
    return searchTerms.every(term => lowerFile.includes(term.toLowerCase()));
  });
  return foundFile ? `client/src/assets/images/${foundFile}` : undefined;
};


const graphLineColors = [
  "#d63384",
  "#57534e",
  "#2e8b57",
  "#8b4513",
  "#4169e1",
  "#9932cc",
];

const createRecordingClip = (parsedInfo: ParsedFilename, audioDir: string, graphLineColor: string): RecordingClip => {
  const { pianistLastName, section, year, recordLabel, isLive, originalFilename } = parsedInfo;
  // ID generation based on explicit example: pianistLastName-section-year-recordLabel
  const id = `${pianistLastName}-${section.toLowerCase()}-${year}-${recordLabel}`;
  const audioSrc = `${audioDir}/${originalFilename}`;

  let frontArtSrc = findArtPath(pianistLastName, 'front');
  if (!frontArtSrc) {
    frontArtSrc = findArtPath(pianistLastName, 'cover');
  }
  if (!frontArtSrc) {
    console.warn(`Front art not found for ${pianistLastName} (section ${section}). Using placeholder.`);
    frontArtSrc = 'client/src/assets/images/placeholder_front.png'; // Placeholder
  }

  let backArtSrc = findArtPath(pianistLastName, 'back');
  if (!backArtSrc) {
    console.warn(`Back art not found for ${pianistLastName} (section ${section}). Using placeholder.`);
    backArtSrc = 'client/src/assets/images/placeholder_back.png'; // Placeholder
  }

  return {
    id,
    pianistLastName,
    section,
    year,
    recordLabel,
    isLive,
    audioSrc,
    frontArtSrc, // Now always a string
    backArtSrc,  // Now always a string
    graphLineColor,
  };
};

export const sectionAClips: RecordingClip[] = audioFilesA
  .map(filename => parseFilename(filename))
  .filter((parsed): parsed is ParsedFilename => parsed !== null)
  .map((parsed, index) => createRecordingClip(parsed, 'client/src/assets/audio/clips for part A', graphLineColors[index % graphLineColors.length]));

export const sectionBClips: RecordingClip[] = audioFilesB
  .map(filename => parseFilename(filename))
  .filter((parsed): parsed is ParsedFilename => parsed !== null)
  .map((parsed, index) => createRecordingClip(parsed, 'client/src/assets/audio/clips for part B', graphLineColors[index % graphLineColors.length]));

// Ensure IDs are unique (simple check, might need more robust for larger datasets)
const allClips = [...sectionAClips, ...sectionBClips];
const idSet = new Set<string>();
allClips.forEach(clip => {
  if (idSet.has(clip.id)) {
    console.warn(`Duplicate ID found: ${clip.id}. Consider making IDs more unique.`);
    // Attempt to make it unique by appending a suffix, though this is a simple fix
    let newId = `${clip.id}-dup`;
    let count = 1;
    while(idSet.has(newId)) {
        newId = `${clip.id}-dup${count++}`;
    }
    clip.id = newId;
  }
  idSet.add(clip.id);
});