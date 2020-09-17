import { RXPStep1 } from "./init";

// Provide common regex tools, such as matching any number, letter, etc.

const formatPreset = (presetCharacter: string) => new RXPStep1(presetCharacter);
const formatExcept = (baseString: string) => (
  exception: string,
  ...extra: string[]
) => {
  const allExceptions = [exception, ...extra];
  const invalidCharacters = allExceptions.filter(
    (x) => !baseString.includes(x)
  );
  if (invalidCharacters.length > 0) {
    throw new Error(
      `The characters ${invalidCharacters} are not valid for removal from this RXP unit. Only the following characters may be provided for removal: ${baseString}`
    );
  }
  const lettersToRemove = allExceptions.join("");
  const removeRegex = new RegExp(`[${lettersToRemove}]`, "g");
  const updatedBaseString = baseString.replace(removeRegex, "");
  return formatPreset(updatedBaseString);
};

const anyCharacter = formatPreset(".");
const anyCharacterExcept = (
  exception: string,
  ...extra: string[]
): RXPStep1 => {
  const anyExcept = `[^${[exception, ...extra].join("")}]`;
  return new RXPStep1(anyExcept);
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
