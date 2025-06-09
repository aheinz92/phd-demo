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
  'Vladimir_Horowitz_A_1980_RCA_Victor_Live_-_cut.mp3',
  'Polina_Leschenko_A_2012_Avanti_-_cut.mp3',
  'Yevgeny_Sudbin_A_2005_BIS_-_cut.mp3',
  'Santiago_Rodriguez_A_1993_Elan_-_cut.mp3',
  'Konstantin_Scherbakov_A_1999_Naxos_-_cut.mp3',
  'Kateryna_Titova_A_2007_Sony_-_cut.mp3',
];

const audioFilesB = [
  'Vladimir_Horowitz_B_1980_RCA_Victor_Live_-_cut.mp3',
  'Alexei_Sultanov_B_1997_VAI_Live_-_cut.mp3',
  'Marc-André_Hamelin_B_1994_Port_Royal_-_cut.mp3',
  'Sergio_Fiorentino_B_1994_Appian_-_cut.mp3',
  'Alexis_Weissenberg_B_2009_Deutsche_Grammophon_-_cut.mp3',
  'Kateryna_Titova_B_2007_Sony_-_cut.mp3',
];

interface ParsedFilename {
  pianistFirstName: string; // Added
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

  // Expect: FirstName_LastName_Section_Year_LabelPart1(..._LabelPartN)(_Live)
  // Min parts: FirstName, LastName, Section, Year, LabelPart1 -> 5 parts
  if (parts.length < 5) {
    console.warn(`Could not parse filename: ${filename}. Expected at least 5 parts (FirstName_LastName_Section_Year_Label) after splitting by '_', got ${parts.length}. Parts: ${parts.join(', ')}`);
    return null;
  }

  // parts[0] is FirstName, parts[1] is LastName
  const pianistFirstName = parts[0]; // Retain original case
  const pianistLastName = parts[1]; // Retain original case
  const section = parts[2] as 'A' | 'B'; // Retain original case
  const yearString = parts[3];
  const year = parseInt(yearString, 10);

  if (isNaN(year)) {
    console.warn(`Could not parse year from filename: ${filename}. Part used for year: '${yearString}'`);
    return null;
  }
  // Validate section, even if case is assumed correct from filename
  if (section !== 'A' && section !== 'B') {
    console.warn(`Invalid section parsed from filename: ${filename}. Part used for section: '${parts[2]}', Parsed: '${section}'`);
    return null;
  }

  const labelRelatedParts = parts.slice(4); // Parts for record label and potential 'Live' flag
  let isLive = false;
  let recordLabelParts: string[];

  if (labelRelatedParts.length > 0 && labelRelatedParts[labelRelatedParts.length - 1] === 'Live') {
    isLive = true;
    recordLabelParts = labelRelatedParts.slice(0, -1); // All parts before 'Live'
  } else {
    recordLabelParts = labelRelatedParts; // All parts if 'Live' is not the last or not present
  }
  
  const recordLabel = recordLabelParts.join(' '); // Join with space, retain original case

  return {
    pianistFirstName,
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
  const { pianistFirstName, pianistLastName, section, year, recordLabel, isLive, originalFilename } = parsedInfo;
  // ID generation based on explicit example: pianistLastName-section-year-recordLabel
  const id = `${pianistLastName}-${section}-${year}-${recordLabel}`; // Use original case for section
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
    pianistFirstName,
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