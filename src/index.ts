// note: assume user not writing regex, but literals, so . is a period, not any

// --collection of character types-- //

// matches a single character for any possible character
export const anyCharacter = "."; // correct when in set []?
// match newLine?

// matches a single character for any number 0 through 9
export const anyDigit = "[0123456789]";

// matches a single character for any lowercase letter
export const anyLowerCase = "[abcdefghijklmnopqrstuvwxyz]";

// matches a single character for any uppercase letter
export const anyUpperCase = "[ABCDEFGHIJKLMNOPQRSTUVWXYZ]";

// matches a single character for any possible letter, lower or upper case
export const anyLetter =
  "[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ]";

// matches a single character for any special character that must be escaped
// eslint-disable-next-line no-useless-escape
export const anySpecChar = /[.*+\-?^${}()|[\]\\]/; //"[.*+-?^${}()|[\]\\]";
const anyTextFormat = "[!&()_-;:'\",.<>?]";

const anyOther = "[`~!@#$%^&*()-_=+[]|{};:'\",<.>/?\\]"; // just use except with both letters and digits?

const backspaceChar = "[\b]";
const formFeedChar = "[\f]";
const lineFeedChar = "[\n]";
const carriageReturnChar = "[\r]";
const tabChar = "[\t]";
const verticalTabChar = "[\f]";

const whitespaceChar = "[\f\n\r\t\v]";

const anyHexadecimal = "[abcdefABCDEF0123456789]";

const combineSets = (...sets: string[]) => {
  const combination = sets.join("").replace(/[[\]]/g, "");
  return `[${combination}]`;
};

// check later
export const formatRegex = (text: string): string =>
  text.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string

//
// --return above collections with specified characters removed-- //
//

// HOF for removing from digits collection, taking string or number args
type RemoveDigits = (x: string) => (...y: (string | number)[]) => string;
const removeDigitsFromStringTemplate: RemoveDigits = (regexOptions) => (
  ...exceptions
) => {
  const textVersion = exceptions.map((x) =>
    typeof x === "string" ? x : String(x)
  );
  const textToRemove = `[${textVersion.join("")}]`;
  const removalRegex = new RegExp(textToRemove, "g");

  return regexOptions.replace(removalRegex, "");
};

// HOF for removing from different collections
type RemoveText = (x: string) => (...y: string[]) => string;
const removeTextFromStringTemplate: RemoveText = (regexOptions) => (
  ...exceptions
) => {
  const textToRemove = `[${exceptions.join("")}]`;
  const removalRegex = new RegExp(textToRemove, "g");

  return regexOptions.replace(removalRegex, "");
};

// generate 'except' functions to return filtered collections
export const anyCharacterExcept = (...args: (string | number)[]): string =>
  `[^${args.map((x) => String(x)).join("")}]`; /// check later

export const anyDigitExcept = removeDigitsFromStringTemplate(anyDigit);
export const anyLowerCaseExcept = removeTextFromStringTemplate(anyLowerCase);
export const anyUpperCaseExcept = removeTextFromStringTemplate(anyUpperCase);
export const anyLetterExcept = removeTextFromStringTemplate(anyLetter);

// return letter as option for either upper or lower case
export const upperOrLower = (letter: string): string => {
  const lowerCase = letter.toLowerCase();
  const upperCase = letter.toUpperCase();
  return `[${lowerCase}${upperCase}]`;
};

// construct(anyNumber, except(5))
// or
// anyNumberExcept(5)

type RegexConvert = (x: string) => string;
const startsWith: RegexConvert = (startingText) => `^${startingText}`; // add later
const endsWith: RegexConvert = (endingText) => `${endingText}`; // add later
/*
type GetRange = (x: number, y?: number[]) => number[];
const getRange: GetRange = (targetLength, array = []) => {
  const arrayLength = array.length;
  if (arrayLength === targetLength) {
    return array;
  } else {
    const updatedArray = [...array, arrayLength];
    return getRange(targetLength, updatedArray);
  }
};

const repeat: Frequency = (text, counter) =>
  getRange(counter)
    .map(() => text)
    .join("");
*/
// anythingBut
// excluding

/////// FREQUENCY
type Frequency = (x: string, y: number, z?: number) => string;
export const oneOrMore: RegexConvert = (text) => `(${text})+`;
export const zeroOrMore: RegexConvert = (text) => `(${text})*`;
export const repeating: Frequency = (text, counter) => `(${text}){${counter}}`;
export const minMax: Frequency = (text, min, max) => `(${text}){${min},${max}}`;
export const atLeast: Frequency = (text, min) => `(${text}){${min},}`;
// lazy match for miinimal = +?, *?, etc. page 49
// lazy by default?
//"< test < some > more >".replace(/<.+?>/, "")

export const optional: RegexConvert = (text) => `(${text})?`;

/////// POSITIONING
