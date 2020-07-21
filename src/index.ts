import uniqid from "uniqid";

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

export const either = (...texts: string[]): string => texts.join("|"); // add testing, need ()?

type RegexConvert = (x: string) => string;
export const startsWith: RegexConvert = (startingText) => `^(${startingText})`;
export const endsWith: RegexConvert = (endingText) => `(${endingText})$`;

/////// FREQUENCY
type Frequency = (x: string, y: number, z?: number) => string;
export const oneOrMore: RegexConvert = (text) => `(${text})+`;
export const zeroOrMore: RegexConvert = (text) => `(${text})*`;
export const repeating: Frequency = (text, counter) => `(${text}){${counter}}`;
export const minMax: Frequency = (text, min, max) => `(${text}){${min},${max}}`;
export const atLeast: Frequency = (text, min) => `(${text}){${min},}`;
// lazy match for minimal = +?, *?, etc. page 49
// lazy by default?
//"< test < some > more >".replace(/<.+?>/, "")
// text.length > 1 && text.match(/^\(.+\)$/) check for
export const optional: RegexConvert = (text) => `(${text})?`;

// conditionally applied non-capturing grouping when appropriate
const applyGrouping = (text: string) =>
  text.length > 1 && /^[^(].+[^)]$/.test(text) ? `(?:${text})` : text;

/////// POSITIONING

const lookAhead = (target: string, followedBy: string) =>
  `${target}(?=${followedBy})`;
const negateLookAhead = (target: string, notFollowedBy: string) =>
  `${target}(?!${notFollowedBy})`;
const lookBehind = (target: string, precededBy: string) =>
  `(?<=${precededBy})${target}`;
const negateLookBehind = (target: string, notPrecededBy: string) =>
  `(?<!${notPrecededBy})${target}`;

const capture = (text: string) => `(${text})`; // capture lookahed/ behind?

///// BackReference

const reference = (text: string) => ({
  text,
  type: "back-reference",
  key: uniqid(),
});

/*const construct = (...textUnits) => {
    const textObj = textUnits.filter(x => typeof x === "object");
    if (textObj.length > 0) {

    }
}
*/

const init = (text: string) => ({
  text, // handle grouping automatically? handle escaping?
  or: (...textOptions: string[]) => init([text, ...textOptions].join("|")), // only at text initialization, focus on small rgx units
  and: (...textOptions: string[]) => init([text, ...textOptions].join("")), // only at text initialization, focus on small rgx units
  followedBy: (after: string) => init(`${text}(?=${after})`),
  notFollowedBy: (after: string) => init(`${text}(?!${after})`),
  precededBy: (before: string) => init(`(?<=${before})${text}`),
  notPrecededBy: (before: string) => init(`(?<!${before})${text}`),
  isOptional: () => init(`${text}?`),
  isCaptured: () => init(`(${text})`), // apply conditionally
  occurs: (frequency: number) => init(`${text}{${frequency}}`),
  occursOnceOrMore: () => init(`${text}+`),
  occursZeroOrMore: () => init(`${text}*`),
  occursAtLeast: (min: number) => init(`${text}{${min},}`),
  occursBetween: (min: number, max: number) => init(`${text}{${min}, ${max}}`),
  doesNotOccur: () => init(`[^${text}]`), // will [^[abc]] work?
  asReference: "",
  useReference: "",
  atStart: () => init(`^${text}`),
  atEnd: () => init(`${text}$`), // final option, no init needed, just obj w text
}); // startsWith, endsWith

const createReference = () => ""; // 3 parts - init(unit), ref(var), construct( compose units, possibly including vars)

///// restructuring begins below:

/* regex test transformations */
type AddText = (
  prevText: string,
  newText: string,
  ...extraText: string[]
) => string; // conversion for numbers?
type ModifyText = (text: string) => string;
//type UpdateTextAndNumbers = (...text: (string| number)[]) => string;
type UpdateFrequency = (text: string, amount: number) => string;
type UpdateRange = (text: string, min: number, max: number) => string;

const or: AddText = (previousText, ...text) =>
  [previousText, ...text].join("|"); // rename either
const and: AddText = (previousText, ...text) =>
  [previousText, ...text].join(","); // rename alongWith;
const isOptional: ModifyText = (text) => `${text}?`; // add grouping?
const occurs: UpdateFrequency = (text, amount) => `${text}{${amount}}`;
const doesNotOccur: ModifyText = (text) => `[^${text}]`;
const occursAtLeast: UpdateFrequency = (text, min) => `${text}{${min},}`;
const occursOnceOrMore: ModifyText = (text) => `${text}+`;
const occursZeroOrMore: ModifyText = (text) => `${text}*`;
const occursBetween: UpdateRange = (text, min, max) => `${text}{${min},${max}}`;
const followedBy: AddText = (target, following) => `${target}(?=${following})`;
const notFollowedBy: AddText = (target, notFollowing) =>
  `${target}(?!${notFollowing})`;
const precededBy: AddText = (target, preceding) => `(?<=${preceding})${target}`;
const notPrecededBy: AddText = (target, notPreceding) =>
  `(?<!${notPreceding})${target}`;
const isCaptured: ModifyText = (text) => `(${text})`;
const atStart: ModifyText = (text) => `^${text}`; // careful of grouping
const atEnd: ModifyText = (text) => `${text}$`; // careful of grouping;

/* object pathways */

//use interface to simplify?
type ModifyString = () => rgxInit; //string;
type AddToString = (text: string, ...extraText: string[]) => rgxInit; //string;
type SetFrequency = (amount: number) => rgxInit; //string;
type SetRange = (min: number, max: number) => rgxInit; //string;
/*
interface rgxTextModify
interface rgxContinue
interface rgxBehaviorModify
interface rgxEnd
interface rgxMixed
*/
interface rgxInit {
  text: string;
  or: AddToString;
  and: AddToString;
  followedBy: AddToString;
  notFollowedBy: AddToString;
  precededBy: AddToString;
  notPrecededBy: AddToString;
  isOptional: ModifyString;
  isCaptured: ModifyString;
  occurs: SetFrequency;
  doesNotOccur: ModifyString;
  occursOnceOrMore: ModifyString;
  occursZeroOrMore: ModifyString;
  occursAtLeast: SetFrequency;
  occursBetween: SetRange;
  atStart: ModifyString;
  atEnd: ModifyString;
  //useRef
}

const createRGX = (text: string) => {
  const rgxObj: rgxInit = {
    text,
    or: (...orText) => createRGX(or(text, ...orText)), // init new obj
    and: (...andText) => createRGX(and(text, ...andText)),
    followedBy: (...following) =>
      createRGX(`${text}${following.map((x) => `(?=${x})`).join("")}`),
    notFollowedBy: (...notFollowing) =>
      createRGX(`${text}${notFollowing.map((x) => `(?!${x})`).join("")}`),
    precededBy: (...preceding) =>
      createRGX(`${preceding.map((x) => `(?<=${x})`).join("")}${text}`),
    notPrecededBy: (...notPreceding) =>
      createRGX(`${notPreceding.map((x) => `(?<!${x})`).join("")}${text}`),
    isOptional: () => createRGX(isOptional(text)),
    isCaptured: () => createRGX(isCaptured(text)),
    occurs: (amount) => createRGX(occurs(text, amount)),
    doesNotOccur: () => createRGX(doesNotOccur(text)),
    occursOnceOrMore: () => createRGX(occursOnceOrMore(text)),
    occursZeroOrMore: () => createRGX(occursZeroOrMore(text)),
    occursAtLeast: (amount) => createRGX(occursAtLeast(text, amount)),
    occursBetween: (min, max) => createRGX(occursBetween(text, min, max)),
    atStart: () => createRGX(atStart(text)),
    atEnd: () => createRGX(atEnd(text)),
    //useRef
  };
  return rgxObj;
};
//createRGX("hi").or()

const sampleInit = (text: string) => ({
  text, // handle grouping automatically? handle escaping?
  or: (newText: string, ...textOptions: string[]) =>
    init(or(text, newText, ...textOptions)), // only at text initialization, focus on small rgx units
  and: (...textOptions: string[]) => init([text, ...textOptions].join("")), // only at text initialization, focus on small rgx units
  followedBy: (after: string) => init(`${text}(?=${after})`),
  notFollowedBy: (after: string) => init(`${text}(?!${after})`),
  precededBy: (before: string) => init(`(?<=${before})${text}`),
  notPrecededBy: (before: string) => init(`(?<!${before})${text}`),
  isOptional: () => init(`${text}?`),
  isCaptured: () => init(`(${text})`), // apply conditionally
  occurs: (frequency: number) => init(`${text}{${frequency}}`),
  occursOnceOrMore: () => init(`${text}+`),
  occursZeroOrMore: () => init(`${text}*`),
  occursAtLeast: (min: number) => init(`${text}{${min},}`),
  occursBetween: (min: number, max: number) => init(`${text}{${min}, ${max}}`),
  doesNotOccur: () => init(`[^${text}]`), // will [^[abc]] work?
  asReference: "",
  useReference: "",
  atStart: () => init(`^${text}`),
  atEnd: () => init(`${text}$`), // final option, no init needed, just obj w text
});

/* rgx construction functions */

/* text collections */

/* preset regex */
