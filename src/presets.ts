//////////////////
// rgx presets //
/////////////////

interface TextObject {
  text: string;
  escaped: boolean;
}

// format presets for parsing with RGXBuild constructor
type CreateTextObj = (text: string) => TextObject;
const createTextObj: CreateTextObj = (text) => ({
  text,
  escaped: true,
});

// matches a single character for any possible character
export const anyCharacter = createTextObj("."); // correct when in set []?
// match newLine?

// matches a single character for any number 0 through 9
export const anyDigit = createTextObj("[0123456789]");

// matches a single character for any lowercase letter
export const anyLowerCase = createTextObj("[abcdefghijklmnopqrstuvwxyz]");

// matches a single character for any uppercase letter
export const anyUpperCase = createTextObj("[ABCDEFGHIJKLMNOPQRSTUVWXYZ]");

// matches a single character for any possible letter, lower or upper case
export const anyLetter = createTextObj(
  "[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ]"
);

// matches a single character for any special character that must be escaped
// eslint-disable-next-line no-useless-escape
export const anySpecChar = /[.*+\-?^${}()|[\]\\]/; //"[.*+-?^${}()|[\]\\]";
const anyTextFormat = "[!&()_-;:'\",.<>?]";

const anyOther = "[`~!@#$%^&*()-_=+[]|{};:'\",<.>/?\\]"; // just use except with both letters and digits?

export const nonPrint = {
  // rename 'whitespace'? // add testing
  backspace: "[\b]",
  formFeed: "\f",
  lineFeed: "\n",
  carriageReturn: "\r",
  tab: "\t",
  verticalTab: "\v",
};

const wordBoundary = "\b";
const nonWordBoundary = "B"; // better name, used in js?

// backreferences - 70

// use multiline ?m

// boundaries - 52
// 63

const anyHexadecimal = "[abcdefABCDEF0123456789]";

// HOF for removing from digits collection, taking string or number args
type RemoveDigits = (
  x: TextObject
) => (...y: (string | number)[]) => TextObject;
const removeDigits: RemoveDigits = (rgxPreset) => (...exceptions) => {
  const textVersion = exceptions.map((x) =>
    typeof x === "string" ? x : String(x)
  );
  const textToRemove = `[${textVersion.join("")}]`;
  const removalRegex = new RegExp(textToRemove, "g");

  return createTextObj(rgxPreset.text.replace(removalRegex, ""));
};

// HOF for removing from different collections
type RemoveText = (x: TextObject) => (...y: string[]) => TextObject;
const removeText: RemoveText = (rgxPreset) => (...exceptions) => {
  const textToRemove = `[${exceptions.join("")}]`;
  const removalRegex = new RegExp(textToRemove, "g");

  return createTextObj(rgxPreset.text.replace(removalRegex, ""));
};

// generate 'except' functions to return filtered collections
export const anyCharacterExcept = (...args: (string | number)[]): TextObject =>
  createTextObj(`[^${args.map((x) => String(x)).join("")}]`); /// check later

export const anyDigitExcept = removeDigits(anyDigit);
export const anyLowerCaseExcept = removeText(anyLowerCase);
export const anyUpperCaseExcept = removeText(anyUpperCase);
export const anyLetterExcept = removeText(anyLetter);

// return letter as option for either upper or lower case
export const upperOrLower = (letter: string): TextObject => {
  const lowerCase = letter.toLowerCase();
  const upperCase = letter.toUpperCase();
  return createTextObj(`[${lowerCase}${upperCase}]`);
};

// add anyLetterUpTo/ between functions?

const presets = {
  anyCharacter,
  anyCharacterExcept,
  anyDigit,
  anyDigitExcept,
  anyUpperCase,
  anyUpperCaseExcept,
  anyLowerCase,
  anyLowerCaseExcept,
  anyLetter,
  anyLetterExcept,
  anyHexadecimal,
  upperOrLower,
};

export default presets;
