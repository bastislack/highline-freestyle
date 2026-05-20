import type { TrickFormSchema } from '@/components/stickable/trick/TrickForm.vue';

const GOOGLE_FORM_ID = '1FAIpQLSeMFs9g95Ny75s5GaqGi3Bzr_CRoONkm37lh9wNbJ8qtV679Q';
const GOOGLE_FORM_URL = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/formResponse`;

const ENTRY_IDS = {
  technicalName: '29478593',
  alias: '203811440',
  startPosition: '347343332',
  endPosition: '478876493',
  difficulty: '1715844941',
  description: '1893931561',
  establishedBy: '1684010296',
  yearEstablished: '1148698453',
  tips: '571798944',
  videos: '1255335422',
  email: '752159561',
} as const;

// Positions confirmed to exist as options in the Google Form dropdown.
// MUST be kept in sync manually with both the form's dropdown AND the
// DbPositionZod enum. If the app adds a position that is not present here,
// submissions using that position are rejected client-side with
// UnsupportedPositionError instead of silently dropped by Google.
const POSITIONS_IN_GOOGLE_FORM: ReadonlySet<string> = new Set([
  'Back',
  'Backbreaker',
  'Belly',
  'Buddha',
  'Chest',
  'Double Drop-Knee',
  'Drop-Knee',
  'Exposure',
  'Inward Drop-Knee',
  'Knee-Hang',
  'Korean',
  'Leash',
  'Nevermind',
  'Rocket',
  'Shoulder',
  'NH Shoulder',
  'Sit',
  'Stand',
  'Sofa',
  'Soup',
  'Yisus',
]);

function flattenVideos(videos: TrickFormSchema['videos']): string {
  if (!videos || videos.length === 0) return '';
  return videos
    .map((v) => {
      const range = [v.startTime, v.endTime].filter((n) => typeof n === 'number').join('-');
      return range ? `${v.link} (${range}s)` : v.link;
    })
    .join('\n');
}

function flattenTips(tips: TrickFormSchema['tips']): string {
  if (!tips || tips.length === 0) return '';
  return tips.join('\n');
}

export class UnsupportedPositionError extends Error {
  constructor(public readonly position: string) {
    super(`Position "${position}" is not available in the official suggestion form.`);
    this.name = 'UnsupportedPositionError';
  }
}

export async function submitOfficialSuggestion(vals: TrickFormSchema): Promise<void> {
  if (!POSITIONS_IN_GOOGLE_FORM.has(vals.startPosition)) {
    throw new UnsupportedPositionError(vals.startPosition);
  }
  if (!POSITIONS_IN_GOOGLE_FORM.has(vals.endPosition)) {
    throw new UnsupportedPositionError(vals.endPosition);
  }

  const body = new URLSearchParams();
  body.append(`entry.${ENTRY_IDS.email}`, (vals.email ?? '').trim());
  body.append(`entry.${ENTRY_IDS.technicalName}`, vals.technicalName);
  if (vals.alias) body.append(`entry.${ENTRY_IDS.alias}`, vals.alias);
  body.append(`entry.${ENTRY_IDS.startPosition}`, vals.startPosition.toUpperCase());
  body.append(`entry.${ENTRY_IDS.endPosition}`, vals.endPosition.toUpperCase());
  if (typeof vals.difficulty === 'number') {
    body.append(`entry.${ENTRY_IDS.difficulty}`, String(vals.difficulty));
  }
  if (vals.description) body.append(`entry.${ENTRY_IDS.description}`, vals.description);
  if (vals.establishedBy) body.append(`entry.${ENTRY_IDS.establishedBy}`, vals.establishedBy);
  if (typeof vals.yearEstablished === 'number') {
    // Google Form field is a date input; in-app form only collects a year.
    // Submit January 1st of that year as a placeholder date.
    body.append(`entry.${ENTRY_IDS.yearEstablished}`, `${vals.yearEstablished}-01-01`);
  }
  const tipsFlat = flattenTips(vals.tips);
  if (tipsFlat) body.append(`entry.${ENTRY_IDS.tips}`, tipsFlat);
  const videosFlat = flattenVideos(vals.videos);
  if (videosFlat) body.append(`entry.${ENTRY_IDS.videos}`, videosFlat);

  // Google Forms does not return CORS headers, so we cannot read the response.
  // Fire-and-forget submission: this resolves once the request leaves the browser,
  // but does not confirm acceptance by Google.
  await fetch(GOOGLE_FORM_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
}
