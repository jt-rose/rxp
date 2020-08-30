import uniqid from "uniqid";

// Text Objects
// user-submitted strings will be formatted to escape special characters
// already formatted strings will be stored in text objects to distinguish them
// a combination of user-strings and text objects can be submitted to text-transformation functions
// so these will be parsed before running the function

interface TextObject {
  //collision issue?
  text: string;
  escaped: boolean;
}

// format user-submitted strings to escape special characters
export const formatRegex: ModifyText = (text) =>
  text.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string

// Text Transformations
// the following functions transform the given strings to match the regex command
type ModifyText = (text: string) => string;
type CombineText = (
  text: string,
  newText: string | TextObject,
  ...extra: (string | TextObject)[]
) => string;
type SetFrequency = (text: string, amount: number) => string;
type SetRange = (text: string, min: number, max: number) => string;

// wrap regex text in a non-capture grouping
export const withNonCaptureGrouping = (text: string): string => `(?:${text})`;

// receieve string or TextObject and format text accordingly
type ParseText = (text: string | TextObject) => string;
export const parseText: ParseText = (text) =>
  typeof text === "string"
    ? withNonCaptureGrouping(formatRegex(text))
    : text.text;

// wrap args in parseText function to handle different data types
type TextParsingHOF = (func: CombineText) => CombineText;
const withTextParsing: TextParsingHOF = (func) => (text, newText, ...extra) => {
  const parsedNewText = parseText(newText);
  const parsedExtra = extra.map(parseText);
  return func(text, parsedNewText, ...parsedExtra);
};

export const or = withTextParsing((text, newText, ...extra) =>
  withNonCaptureGrouping([text, newText, ...extra].join("|"))
); // the initial text will already be parsed by the 'init' function

/*export const then = withTextParsing((text, newText, ...extra) =>
  withNonCaptureGrouping([text, newText, ...extra].join(""))
);*/

export const isOptional: ModifyText = (text) =>
  withNonCaptureGrouping(`${text}?`); // add grouping?

export const occurs: SetFrequency = (text, amount) =>
  withNonCaptureGrouping(`${text}{${amount}}`);
export const doesNotOccur: ModifyText = (text) =>
  withNonCaptureGrouping(`[^${text}]`);
export const occursAtLeast: SetFrequency = (text, min) =>
  withNonCaptureGrouping(`${text}{${min},}`);
export const occursOnceOrMore: ModifyText = (text) =>
  withNonCaptureGrouping(`${text}+?`);
export const occursZeroOrMore: ModifyText = (text) =>
  withNonCaptureGrouping(`${text}*?`);
export const occursBetween: SetRange = (text, min, max) =>
  withNonCaptureGrouping(`${text}{${min},${max}}`);

// converts lazy searches (+? or *?) to greedy searches (+ or *)
// must be invoked immediately after declaring the
// oneOrMore/ zeroOrMore transformations
export const convertToGreedySearch: ModifyText = (text) =>
  text.replace(/\?\)$/, ")");

export const followedBy = withTextParsing((text, following, ...extra) =>
  withNonCaptureGrouping(
    `${text}${[following, ...extra].map((x) => `(?=${x})`).join("")}`
  )
);

export const notFollowedBy = withTextParsing((text, notFollowing, ...extra) =>
  withNonCaptureGrouping(
    `${text}${[notFollowing, ...extra].map((x) => `(?!${x})`).join("")}`
  )
);

export const precededBy = withTextParsing((text, preceding, ...extra) =>
  withNonCaptureGrouping(
    `${[preceding, ...extra].map((x) => `(?<=${x})`).join("")}${text}`
  )
);

export const notPrecededBy = withTextParsing((text, notPreceding, ...extra) =>
  withNonCaptureGrouping(
    `${[notPreceding, ...extra].map((x) => `(?<!${x})`).join("")}${text}`
  )
);

export const isCaptured: ModifyText = (text) => `(${text})`;
export const isVariable: ModifyText = (text) => {
  const uniqueName = uniqid().replace(/[0-9]/g, "");
  return `(?<${uniqueName}>${text}\\\\k<${uniqueName}>)`;
};

export const atStart: ModifyText = (text) => withNonCaptureGrouping(`^${text}`);
export const atEnd: ModifyText = (text) => withNonCaptureGrouping(`${text}$`);

const formatText = {
  or,
  occurs,
  doesNotOccur,
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
  isVariable,
};

export default formatText;
