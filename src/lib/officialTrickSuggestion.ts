import type { TrickFormSchema } from '@/components/stickable/trick/TrickForm.vue';

// Google Form that backs the public "Suggest an official trick" sheet.
// formResponse endpoint accepts URL-encoded entry.<ID> keys.
// IDs must be filled in once the form fields are mapped — see TODOs below.
const GOOGLE_FORM_ID = 'TODO_FORM_ID';
const GOOGLE_FORM_URL = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/formResponse`;

const ENTRY_IDS = {
  technicalName: 'TODO_entry_technicalName',
  alias: 'TODO_entry_alias',
  startPosition: 'TODO_entry_startPosition',
  endPosition: 'TODO_entry_endPosition',
  difficulty: 'TODO_entry_difficulty',
  description: 'TODO_entry_description',
  establishedBy: 'TODO_entry_establishedBy',
  yearEstablished: 'TODO_entry_yearEstablished',
  tips: 'TODO_entry_tips',
  videos: 'TODO_entry_videos',
} as const;

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

export async function submitOfficialSuggestion(vals: TrickFormSchema): Promise<void> {
  const body = new URLSearchParams();
  body.append(`entry.${ENTRY_IDS.technicalName}`, vals.technicalName);
  if (vals.alias) body.append(`entry.${ENTRY_IDS.alias}`, vals.alias);
  body.append(`entry.${ENTRY_IDS.startPosition}`, vals.startPosition);
  body.append(`entry.${ENTRY_IDS.endPosition}`, vals.endPosition);
  if (typeof vals.difficulty === 'number') {
    body.append(`entry.${ENTRY_IDS.difficulty}`, String(vals.difficulty));
  }
  if (vals.description) body.append(`entry.${ENTRY_IDS.description}`, vals.description);
  if (vals.establishedBy) body.append(`entry.${ENTRY_IDS.establishedBy}`, vals.establishedBy);
  if (typeof vals.yearEstablished === 'number') {
    body.append(`entry.${ENTRY_IDS.yearEstablished}`, String(vals.yearEstablished));
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
