import { RGXUnit, buildRGXStep1 } from "./init";
import { withNonCaptureGrouping } from "./formatText";

const formatPreset = (presetCharacter: string) =>
  buildRGXStep1(withNonCaptureGrouping(presetCharacter));
const formatExcept = (baseString: string) => (
  exception: string,
  ...extra: string[]
) => {
  const lettersToRemove = [exception, ...extra].join("");
  const removeRegex = new RegExp(`[${lettersToRemove}]`, "g");
  const updatedBaseString = baseString.replace(removeRegex, "");
  return formatPreset(updatedBaseString);
};

//const formatPresetExcept =
const anyCharacter = formatPreset(".");
const anyCharacterExcept = (exception: string, ...extra: string[]): RGXUnit => {
  const anyExcept = `[^${[exception, ...extra].join("")}]`;
  return buildRGXStep1(withNonCaptureGrouping(anyExcept));
};

// matches a single character for any digit
const anyDigitString = "[0123456789]";
const anyDigit = formatPreset(anyDigitString);
const anyDigitExcept = formatExcept(anyDigitString);

// matches a single character for any lowercase letter
const anyLowerCaseString = "[abcdefghijklmnopqrstuvwxyz]";
const anyLowerCase = formatPreset(anyLowerCaseString);
const anyLowerCaseExcept = formatExcept(anyLowerCaseString);

// matches a single character for any uppercase letter
const anyUpperCaseString = "[ABCDEFGHIJKLMNOPQRSTUVWXYZ]";
const anyUpperCase = formatPreset(anyUpperCaseString);
const anyUpperCaseExcept = formatExcept(anyUpperCaseString);

// matches a single character for any possible letter, lower or upper case
const anyLetterString =
  "[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ]";
const anyLetter = formatPreset(anyLetterString);
const anyLetterExcept = formatExcept(anyLetterString);

const presets = {
  anyCharacter,
  anyCharacterExcept,
  anyDigit,
  anyDigitExcept,
  anyLowerCase,
  anyLowerCaseExcept,
  anyUpperCase,
  anyUpperCaseExcept,
  anyLetter,
  anyLetterExcept,
};
export default presets;
