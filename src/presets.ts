import { buildRGXStep1, RGXStep1 } from "./init";
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
const anyCharacterExcept = (
  exception: string,
  ...extra: string[]
): RGXStep1 => {
  const anyExcept = `[^${[exception, ...extra].join("")}]`;
  return buildRGXStep1(withNonCaptureGrouping(anyExcept));
};

// matches a single character for any digit
const anyDigitString = "[0123456789]";
const anyDigit = formatPreset(anyDigitString);
const anyDigitExcept = formatExcept(anyDigitString);

// matches a single character for any lowercase letter
const lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";
const anyLowerCaseString = `[${lowerCaseLetters}]`;
const anyLowerCase = formatPreset(anyLowerCaseString);
const anyLowerCaseExcept = formatExcept(anyLowerCaseString);

// matches a single character for any uppercase letter
const upperCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const anyUpperCaseString = `[${upperCaseLetters}]`;
const anyUpperCase = formatPreset(anyUpperCaseString);
const anyUpperCaseExcept = formatExcept(anyUpperCaseString);

// matches a single character for any possible letter, lower or upper case
export const lettersWithAnyCase = lowerCaseLetters + upperCaseLetters;
const anyLetterString = `[${lettersWithAnyCase}]`;
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
