import { RecordingClip } from '../types/music';

const imageFiles = [
  'fiorentino_back.png',
  'fiorentino_front.jpg',
  'hamelin_back.jpg',
  'hamelin_cover.jpg',
  'horowitz_back.jpg',
  'horowitz_front.jpg',
  'leschenko_back.jpg',
  'leschenko_front.jpg',
  'rodriguez_back.jpg',
  'rodriguez_front.jpg',
  'scherbakov_back.jpg',
  'scherbakov_front.gif',
  'sudbin_back.jpg',
  'sudbin_front.jpg',
  'sultanov_back.png',
  'sultanov_front.jpg',
  'titova_back.jpg',
  'titova_front.jpg',
  'weissenberg_back.jpg',
  'weissenberg_front.jpg',
];

const audioFilesA = [
  'horowitz_A_1980_rca_live_-_cut.mp3',
  'leschenko_A_2012_avanti_-_cut.mp3',
  'rodriguez_A_1993_elan_-_cut.mp3',
  'scherbakov_A_1999_naxos_-_cut.mp3',
  'sudbin_A_2005_BIS_-_cut.mp3',
  'titova_A_2007_sony_-_cut.mp3',
];

const audioFilesB = [
  'fiorentino_B_1994_appian_-_cut.mp3',
  'hamelin_B_1994_port_royal_-_cut.mp3',
  'horowitz_B_1980_rca_live_-_cut.mp3',
  'sultanov_B_1997_vai_live_-_cut.mp3',
  'titova_B_2007_sony_-_cut.mp3',
  'weissenberg_B_2009_dg_-_cut.mp3',
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
  // Adjusted to handle underscores and the specific suffix pattern
  const cleanedFilename = filename.replace(/_-_cut\.mp3$/, ''); // Remove specific suffix
  const parts = cleanedFilename.split('_');

  // Example: "horowitz_A_1980_rca_live"
  // parts[0] = horowitz
  // parts[1] = A
  // parts[2] = 1980
  // parts[3] = rca
  // parts[4] = live (optional)
  // Minimum parts: pianist, section, year, label = 4
  if (parts.length < 4) {
    console.warn(`Could not parse filename: ${filename}. Expected at least 4 parts after splitting by '_', got ${parts.length}`);
    return null;
  }

  const pianistLastName = parts[0].toLowerCase();
  const section = parts[1].toUpperCase() as 'A' | 'B'; // Ensure section is uppercase 'A' or 'B'
  const year = parseInt(parts[2], 10);
  const recordLabel = parts[3].toLowerCase();
  // Check if 'live' is present as one of the later parts
  const isLive = parts.slice(4).includes('live');


  if (isNaN(year)) {
    console.warn(`Could not parse year from filename: ${filename}. Part used: ${parts[2]}`);
    return null;
  }
  if (section !== 'A' && section !== 'B') {
    console.warn(`Invalid section parsed from filename: ${filename}. Part used: ${parts[1]}, Parsed: ${section}`);
    return null;
  }


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
  return foundFile ? `/assets/images/${foundFile}` : undefined; // Changed path
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
    frontArtSrc = '/assets/images/placeholder_front.png'; // Changed path
  }

  let backArtSrc = findArtPath(pianistLastName, 'back');
  if (!backArtSrc) {
    console.warn(`Back art not found for ${pianistLastName} (section ${section}). Using placeholder.`);
    backArtSrc = '/assets/images/placeholder_back.png'; // Changed path
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
  .map((parsed, index) => createRecordingClip(parsed, '/assets/audio/clips_for_part_A', graphLineColors[index % graphLineColors.length])); // Changed path

export const sectionBClips: RecordingClip[] = audioFilesB
  .map(filename => parseFilename(filename))
  .filter((parsed): parsed is ParsedFilename => parsed !== null)
  .map((parsed, index) => createRecordingClip(parsed, '/assets/audio/clips_for_part_B', graphLineColors[index % graphLineColors.length])); // Changed path

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