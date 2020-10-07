import { RXPUnit } from "./init";
import { convertRegexVarsToRXPVars } from "./formatVariables";

// format user-submitted strings to escape special characters
export const formatRegex: ModifyText = (text) =>
  text.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string

// convert a regex literal to a string, removing borders and flags
export const convertRegexToString = (regex: RegExp): string =>
  `${regex}`.replace(/^\//, "").replace(/(\/(g|i|m|s|u|y){0,6})$/, "");

// Text Transformations //
// the following functions transform a given string
// and add regex behavior markers to it
type ModifyText = (text: string) => string;
type CombineText = (text: string, ...newText: [string, ...string[]]) => string;
type CombineTextWithRXPUnits = (
  text: string,
  ...newText: [string | RegExp | RXPUnit, ...(string | RegExp | RXPUnit)[]]
) => string;
type SetFrequency = (text: string, amount: number) => string;
type SetRange = (text: string, min: number, max: number) => string;

// wrap regex string in a non-capture grouping
export const withNonCaptureGrouping = (text: string): string => `(?:${text})`;

// receive string, regex, or RXP Unit and format text accordingly
type ParseText = (text: string | RegExp | RXPUnit) => string;
export const parseText: ParseText = (text) => {
  if (typeof text === "string") {
    return formatRegex(text);
  } else if (text instanceof RegExp) {
    return convertRegexVarsToRXPVars(convertRegexToString(text));
  } else if ("text" && "construct" in text) {
    return text.text;
  } else {
    throw new Error(
      "The RXP constructor can only accept string, regex, or other RXP constructors"
    );
  }
};

// combine an already parsed initial text with new texts that will need to be parsed
// wrap args in parseText function to handle different data types
type TextParsingHOF = (func: CombineText) => CombineTextWithRXPUnits;
const withTextParsing: TextParsingHOF = (func) => (text, ...newText) => {
  // the initial text will have already been parsed
  const parsedNewText = newText.map(parseText);
  return func(text, parsedNewText[0], ...parsedNewText.slice(1));
};

// combining 'or' text such as (cat)|(dog) with other text can cause problems by modifying cat or dog,
// to avoid this an additional nonCaptureGrouping is applied to the 'or' settings
// Ex: init("hello ", /(cat)|(dog)/) would result in matching either "hello cat" or "dog", but not "hello dog"
// init("hello ", /((cat)|(dog))/) will match "hello cat" or "hello dog" as expected
export const or = withTextParsing((text, ...newText) =>
  withNonCaptureGrouping(
    [text, ...newText].map((x) => withNonCaptureGrouping(x)).join("|")
  )
);

export const occurs: SetFrequency = (text, amount) =>
  `${withNonCaptureGrouping(text)}{${amount}}`;
export const occursAtLeast: SetFrequency = (text, min) =>
  `${withNonCaptureGrouping(text)}{${min},}`;
export const occursOnceOrMore: ModifyText = (text) =>
  `${withNonCaptureGrouping(text)}+?`;
export const occursZeroOrMore: ModifyText = (text) =>
  `${withNonCaptureGrouping(text)}*?`;
export const occursBetween: SetRange = (text, min, max) =>
  `${withNonCaptureGrouping(text)}{${min},${max}}`;

// converts lazy searches (+? or *?) to greedy searches (+ or *)
// must be invoked immediately after declaring the
// oneOrMore/ zeroOrMore transformations
export const convertToGreedySearch: ModifyText = (text) =>
  text.replace(/\?$/, "");

export const followedBy = withTextParsing(
  (text, ...following) => `${text}${following.map((x) => `(?=${x})`).join("")}`
);

export const notFollowedBy = withTextParsing(
  (text, ...notFollowing) =>
    `${text}${notFollowing.map((x) => `(?!${x})`).join("")}`
);

export const precededBy = withTextParsing(
  (text, ...preceding) => `${preceding.map((x) => `(?<=${x})`).join("")}${text}`
);

export const notPrecededBy = withTextParsing(
  (text, ...notPreceding) =>
    `${notPreceding.map((x) => `(?<!${x})`).join("")}${text}`
);

export const atStart: ModifyText = (text) => `^${withNonCaptureGrouping(text)}`;
export const atEnd: ModifyText = (text) => `${withNonCaptureGrouping(text)}$`;

export const isOptional: ModifyText = (text) =>
  `${withNonCaptureGrouping(text)}?`;
export const isCaptured: ModifyText = (text) => `(${text})`;

export const formatText = {
  or,
  occurs,
  occursAtLeast,
  occursOnceOrMore,
  occursZeroOrMore,
  occursBetween,
  followedBy,
  notFollowedBy,
  precededBy,
  notPrecededBy,
  atStart,
  atEnd,
  isOptional,
  isCaptured,
};
