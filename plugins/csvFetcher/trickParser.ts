import {ConfigEnv, Logger} from "vite";
import {parseTrick, Trick} from "../../src/types/trick";
import {TrickParseError} from "./csvFetcher";
import {readFile} from "node:fs/promises";
import {join} from "node:path";

function hasContentString(str: unknown) {
  return str && typeof str === "string" && str.trim().length > 0;
}

function shouldFetchData(cfg: ConfigEnv, logger: Logger) {
  if (!cfg || cfg.mode === "development") {
    // We are in dev mode. We will use mocking data, EXCEPT if USE_SHEETS_TRICKS=1 is set
    if (process.env["USE_SHEETS_TRICKS"] !== "1") {
      logger.info("Developer Mode detected. Using mocked data for tricks. Set USE_SHEETS_TRICKS=1 to use real data.", {
        timestamp: true,
      });
      return false;
    }
  }
  return true;
}

async function fetchTsvFromSheets(sheetId: string, sheetGid: string) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=tsv&id=${sheetId}&gid=${sheetGid}`;
  const response = await fetch(new URL(url));
  const responseText = await response.text();
  return responseText;
}

async function getTrickDataAsString(cfg: ConfigEnv, logger: Logger): Promise<string> {
  if (!shouldFetchData(cfg, logger)) {
    // Here we use mocking data instead.
    // There should be a file called "predefinedTricks.mock.tsv" in the current directory.
    // It's contents are being returned instead.
    return await readFile(join(__dirname, "./predefinedTricks.mock.tsv"), "utf-8");
  }
  return await fetchTsvFromSheets("1amLK2b6BQkJ10I3LcbUe-D-wgQpHkcgoIrL10TPkHPo", "429137275");
}

export interface TrickData {
  id: string;
  technicalName: string;
  alias: string;
  establishedBy: string;
  yearEstablished: string;
  linkToVideo: string;
  videoStartTime: string;
  videoEndTime: string;
  startPos: string;
  endPos: string;
  difficultyLevel: string;
  description: string;
  tips: string;
  recommendedPrerequisites: string;
}

export async function handleTricks(cfg: ConfigEnv, logger: Logger) {
  try {
    const data = await getTrickDataAsString(cfg, logger);
    const lines = data.split("\r\n");
    // Intentionally starting at 1. We ignore the header
    const errors: TrickParseError[] = [];
    const parsedEntries: Trick[] = [];
    for (let i = 1; i < lines.length; i++) {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const [
        id,
        technicalName,
        alias,
        establishedBy,
        _monthEstablished, // unused
        yearEstablished,
        linkToVideo,
        videoStartTime,
        videoEndTime,
        startPos,
        endPos,
        difficultyLevel,
        description,
        _descriptionEs, // unused
        tips,
        _tipsEs, // unused
        recommendedPrerequisites,
        _dateAdded, // unused
        _isImportant, // unused
        /* eslint-enable @typescript-eslint/no-unused-vars */
      ] = lines[i].split("\t"); // TSV uses Tabs instead of Commas for columns.
      // This is the object we will slowly build
      parseEntry(errors, parsedEntries, {
        id,
        technicalName,
        alias,
        establishedBy,
        yearEstablished,
        linkToVideo,
        videoStartTime,
        videoEndTime,
        startPos,
        endPos,
        difficultyLevel,
        description,
        tips,
        recommendedPrerequisites,
      });
    }

    if (errors.length > 0) {
      logger.warn(
        `${errors.length} Errors occurred while parsing spreadsheet. 'import {errors} from "virtual:csvData"' for more info.`,
        {timestamp: true}
      );
      logger.warn(`${parsedEntries.length} out of ${lines.length - 1} Entries have been parsed correctly.`, {
        timestamp: true,
      });
    }

    return {
      errors,
      parsedEntries,
    };
  } catch (err) {
    logger.error(`Failed to access Google Sheets CSV. Falling back to local mocking data...`, {timestamp: true});
  }
}

export function parseEntry(
  errors: TrickParseError[],
  parsedEntries: Trick[],
  {
    id,
    technicalName,
    alias,
    establishedBy,
    yearEstablished,
    linkToVideo,
    startPos,
    endPos,
    difficultyLevel,
    description,
    tips,
    recommendedPrerequisites,
    videoEndTime,
    videoStartTime,
  }: TrickData
) {
  const unverifiedObject: Partial<Trick> = {};

  /// First, handle all required values
  unverifiedObject.id = parseInt(id);
  if (Number.isNaN(unverifiedObject.id)) {
    errors.push({
      offendingEntryId: undefined,
      reason: "Bad Id",
      message: "Id cannot be parsed as an Integer",
      value: id,
    });
    return;
  }

  unverifiedObject.yearEstablished = parseInt(yearEstablished);
  if (Number.isNaN(unverifiedObject.yearEstablished)) {
    errors.push({
      offendingEntryId: unverifiedObject.id,
      reason: "Bad Year Established",
      message: "Year Established cannot be parsed as an Integer",
      value: yearEstablished,
    });
    return;
  }

  unverifiedObject.difficultyLevel = parseInt(difficultyLevel);
  if (Number.isNaN(unverifiedObject.difficultyLevel)) {
    errors.push({
      offendingEntryId: unverifiedObject.id,
      reason: "Bad Difficulty Level",
      message: "Difficulty Level cannot be parsed as an Integer",
      value: difficultyLevel,
    });
    return;
  }

  if (unverifiedObject.difficultyLevel < 0 || unverifiedObject > 11) {
    errors.push({
      offendingEntryId: unverifiedObject.id,
      reason: "Bad Difficulty Level",
      message: "Difficulty Level must be between 0 and 11",
      value: difficultyLevel,
    });
    return;
  }
  unverifiedObject.description = description;
  if (!hasContentString(description)) {
    errors.push({
      offendingEntryId: unverifiedObject.id,
      reason: "Bad Description",
      message: "Description cannot be empty",
      value: description,
    });
    return;
  }
  // Enums are partially handled here.
  // Here we just check that the value is set.
  // Zod will check the actual value during parse.
  if (!hasContentString(startPos)) {
    errors.push({
      offendingEntryId: unverifiedObject.id,
      reason: "Bad Start Position",
      message: "Start Position cannot be empty",
      value: startPos,
    });
    return;
  }
  unverifiedObject.startPos = startPos as any; // gets verified later

  if (!hasContentString(endPos)) {
    errors.push({
      offendingEntryId: unverifiedObject.id,
      reason: "Bad End Position",
      message: "End Position cannot be empty",
      value: endPos,
    });
    return;
  }
  unverifiedObject.endPos = endPos as any; // gets verified later

  /// TODO: stickFrequency ???

  /// Optional values
  if (hasContentString(tips)) {
    unverifiedObject.tips = tips.split(";").map((e) => e.trim());
  }
  if (hasContentString(alias)) {
    unverifiedObject.alias = alias.trim();
  }
  if (hasContentString(technicalName)) {
    unverifiedObject.technicalName = technicalName.trim();
  }
  if (hasContentString(establishedBy)) {
    unverifiedObject.establishedBy = establishedBy.trim();
  }
  if (hasContentString(recommendedPrerequisites)) {
    const ids = recommendedPrerequisites
      .split(";")
      .map((e) => e.trim())
      .map((e) => parseInt(e));
    if (ids.some((e) => Number.isNaN(e))) {
      errors.push({
        offendingEntryId: unverifiedObject.id,
        reason: "Bad Recommended Prerequisited",
        message: `Some IDs could not be parsed. "${recommendedPrerequisites}" was interpreted as [${ids.join(",")}]`,
        value: recommendedPrerequisites,
      });
      return;
    }
  }
  if (hasContentString(linkToVideo)) {
    unverifiedObject.linkToVideo = linkToVideo.trim();
  }
  if (hasContentString(videoStartTime)) {
    unverifiedObject.videoStartTime = parseInt(videoStartTime.trim());
    if (Number.isNaN(unverifiedObject.videoStartTime)) {
      errors.push({
        offendingEntryId: unverifiedObject.id,
        reason: "Bad Video Start Time",
        message: "Video Start Time could not be interpreted as an integer.",
        value: videoStartTime,
      });
      delete unverifiedObject.videoStartTime;
    }
  }
  if (hasContentString(videoEndTime)) {
    unverifiedObject.videoEndTime = parseInt(videoEndTime.trim());
    if (Number.isNaN(unverifiedObject.videoEndTime)) {
      errors.push({
        offendingEntryId: unverifiedObject.id,
        reason: "Bad Video End Time",
        message: "Video End Time could not be interpreted as an integer.",
        value: videoEndTime,
      });
      delete unverifiedObject.videoEndTime;
    }
  }

  // If we are here, all the "generic" checks (e.g. are required fields present?)
  // were successful. We use Zod to create the object and give us a typed object.
  try {
    const parsedTrick: Trick = parseTrick(unverifiedObject);
    parsedEntries.push(parsedTrick);
  } catch (err) {
    errors.push({
      offendingEntryId: unverifiedObject.id,
      reason: "Zod Parse Failed",
      message: err + "",
      value: unverifiedObject,
    });
    return;
  }
}
