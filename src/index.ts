import uniqid from "uniqid";

//

// Text Objects
// user-submitted strings will be formatted to escape special characters
// already formatted strings will be stored in text objects to distinguish them
// a combination of user-strings and text objects can be submitted to text-transformation functions
// so these will be parsed before running the function

interface TextObject {
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

// receieve string or TextObject and format text accordingly
type ParseText = (text: string | TextObject) => string;
const parseText: ParseText = (text) =>
  typeof text === "string" ? formatRegex(text) : text.text;

// wrap args in parseText function to handle different data types
type TextParsingHOF = (func: CombineText) => CombineText;
const withTextParsing: TextParsingHOF = (func) => (text, newText, ...extra) => {
  const parsedNewText = parseText(newText);
  const parsedExtra = extra.map(parseText);
  return func(text, parsedNewText, ...parsedExtra);
};

const or = withTextParsing((text, newText, ...extra) =>
  [text, newText, ...extra].join("|")
);

const then = withTextParsing((text, newText, ...extra) =>
  [text, newText, ...extra].join(",")
);

const isOptional: ModifyText = (text) => `${text}?`; // add grouping?

const occurs: SetFrequency = (text, amount) => `${text}{${amount}}`;
const doesNotOccur: ModifyText = (text) => `[^${text}]`;
const occursAtLeast: SetFrequency = (text, min) => `${text}{${min},}`;
const occursOnceOrMore: ModifyText = (text) => `${text}+`;
const occursZeroOrMore: ModifyText = (text) => `${text}*`;
const occursBetween: SetRange = (text, min, max) => `${text}{${min},${max}}`;

const followedBy = withTextParsing(
  (text, following, ...extra) =>
    `${text}${[following, ...extra].map((x) => `(?=${x})`).join("")}`
); // grouping still work?

const notFollowedBy = withTextParsing(
  (text, notFollowing, ...extra) =>
    `${text}${[notFollowing, ...extra].map((x) => `(?!${x})`).join("")}`
);

const precededBy = withTextParsing(
  (text, preceding, ...extra) =>
    `${[preceding, ...extra].map((x) => `(?<=${x})`).join("")}${text}`
);

const notPrecededBy = withTextParsing(
  (text, notPreceding, ...extra) =>
    `${[notPreceding, ...extra].map((x) => `(?<!${x})`).join("")}${text}`
);

const isCaptured: ModifyText = (text) => `(${text})`;
const atStart: ModifyText = (text) => `^${text}`; // careful of grouping
const atEnd: ModifyText = (text) => `${text}$`; // careful of grouping;

// keys
// keys are used to track which pathways are still viable when generating the declarative syntax object
// keys passed to the removeKeys variable will be removed from the current object
// Define keyNames used to check against when removing already used keys
const orKey = "orKey";
const thenKey = "thenKey";
const anyOccursKey = "anyOccursKey";
const followedByKey = "followedByKey";
const notFollowedByKey = "notFollowedByKey";
const precededByKey = "precededByKey";
const notPrecededByKey = "notPrecededByKey";
const atStartKey = "atStartKey";
const atEndKey = "atEndKey";
const isOptionalKey = "isOptionalKey";
const isCapturedKey = "isCapturedKey";
// useRef?

// Dynamic Object Pathways

type BuildRGX = (baseText: string, removeKeys: string[]) => RGXUnit; //specify recursive type?

type ModifyTextRGX = () => RGXUnit;
type CombineTextRGX = (
  newText: string | TextObject,
  ...extra: (string | TextObject)[]
) => RGXUnit;
type SetFrequencyRGX = (amount: number) => RGXUnit;
type SetRangeRGX = (min: number, max: number) => RGXUnit;

interface RGXUnit {
  text: string;
  escaped: boolean;
  or?: CombineTextRGX;
  then?: CombineTextRGX;
  occurs?: SetFrequencyRGX;
  doesNotOccur?: ModifyTextRGX;
  occursAtLeast?: SetFrequencyRGX;
  occursOnceOrMore?: ModifyTextRGX;
  occursZeroOrMore?: ModifyTextRGX;
  occursBetween?: SetRangeRGX;
  followedBy?: CombineTextRGX;
  notFollowedBy?: CombineTextRGX;
  precededBy?: CombineTextRGX;
  notPrecededBy?: CombineTextRGX;
  atStart?: ModifyTextRGX;
  atEnd?: ModifyTextRGX;
  isOptional?: ModifyTextRGX;
  isCaptured?: ModifyTextRGX;
  // useRef?
  // any
}

const validateKey = (removeKeys: string[]) => (key: string) =>
  !removeKeys.includes(key);
const buildRGX: BuildRGX = (baseText, removeKeys) => {
  const validate = validateKey(removeKeys);
  return {
    text: baseText,
    escaped: true,
    //...validate(orKey) && {or: initWith2Args(or, orKey)(baseText, removeKeys) },
    ...(validate(orKey) && { or: initOr(baseText, removeKeys) }),
    //...validate(orKey) && {or3: (newText, ...extra) => continue(or(baseText, newText, ...extra), [orKey,...removeKeys]) }
    ...(validate(thenKey) && { then: initThen(baseText, removeKeys) }),
    ...(validate(anyOccursKey) && { occurs: initOccurs(baseText, removeKeys) }),
    ...(validate(anyOccursKey) && {
      doesNotOccur: initDoesNotOccur(baseText, removeKeys),
    }),
    ...(validate(anyOccursKey) && {
      occursAtLeast: initOccursAtLeast(baseText, removeKeys),
    }),
    ...(validate(anyOccursKey) && {
      occursOnceOrMore: initOccursOnceOrMore(baseText, removeKeys),
    }),
    ...(validate(anyOccursKey) && {
      occursZeroOrMore: initOccursZeroOrMore(baseText, removeKeys),
    }),
    ...(validate(anyOccursKey) && {
      occursBetween: initOccursBetween(baseText, removeKeys),
    }),
    ...(validate(followedByKey) && {
      followedBy: initFollowedBy(baseText, removeKeys),
    }),
    ...(validate(notFollowedByKey) && {
      notFollowedBy: initNotFollowedBy(baseText, removeKeys),
    }),
    ...(validate(precededByKey) && {
      precededBy: initPrecededBy(baseText, removeKeys),
    }),
    ...(validate(notPrecededByKey) && {
      notPrecededBy: initNotPrecededBy(baseText, removeKeys),
    }),
    ...(validate(atStartKey) && { atStart: initAtStart(baseText, removeKeys) }),
    ...(validate(atEndKey) && { atEnd: initAtEnd(baseText, removeKeys) }),
    ...(validate(isOptionalKey) && {
      isOptional: initIsOptional(baseText, removeKeys),
    }),
    ...(validate(isCapturedKey) && {
      isCaptured: initIsCaptured(baseText, removeKeys),
    }),
  };
};

const init = (text: string | TextObject) => buildRGX(parseText(text), []); // starting point

type InitCombineText = (
  func: CombineText,
  key: string
) => (
  baseText: string,
  removeKeys: string[]
) => (
  newText: string | TextObject,
  ...extra: (string | TextObject)[]
) => RGXUnit;
const initCombineText: InitCombineText = (func, key) => (
  baseText,
  removeKeys
) => (newText, ...extra) =>
  buildRGX(func(baseText, newText, ...extra), [key, ...removeKeys]);
const initOr = initCombineText(or, orKey);
const initThen = initCombineText(then, thenKey);
const initFollowedBy = initCombineText(followedBy, followedByKey);
const initNotFollowedBy = initCombineText(notFollowedBy, notFollowedByKey);
const initPrecededBy = initCombineText(precededBy, precededByKey);
const initNotPrecededBy = initCombineText(notPrecededBy, notPrecededByKey);

type InitSetRange = (
  func: SetRange,
  key: string
) => (
  baseText: string,
  removeKeys: string[]
) => (min: number, max: number) => RGXUnit;
const initSetRange: InitSetRange = (func, key) => (baseText, removeKeys) => (
  min,
  max
) => buildRGX(func(baseText, min, max), [key, ...removeKeys]);
const initOccursBetween = initSetRange(occursBetween, anyOccursKey);

type InitSetFrequency = (
  func: SetFrequency,
  key: string
) => (baseText: string, removeKeys: string[]) => (amount: number) => RGXUnit;
const initSetFrequency: InitSetFrequency = (func, key) => (
  baseText,
  removeKeys
) => (amount) => buildRGX(func(baseText, amount), [key, ...removeKeys]);
const initOccurs = initSetFrequency(occurs, anyOccursKey);
const initOccursAtLeast = initSetFrequency(occursAtLeast, anyOccursKey);

type InitModifyText = (
  func: ModifyText,
  key: string
) => (baseText: string, removeKeys: string[]) => () => RGXUnit;
const initModifyText: InitModifyText = (func, key) => (
  baseText,
  removeKeys
) => () => buildRGX(func(baseText), [key, ...removeKeys]);
const initDoesNotOccur = initModifyText(doesNotOccur, anyOccursKey);
const initOccursOnceOrMore = initModifyText(occursOnceOrMore, anyOccursKey);
const initOccursZeroOrMore = initModifyText(occursZeroOrMore, anyOccursKey);
const initAtStart = initModifyText(atStart, atStartKey);
const initAtEnd = initModifyText(atEnd, atEndKey);
const initIsOptional = initModifyText(isOptional, isOptionalKey);
const initIsCaptured = initModifyText(isCaptured, isCapturedKey);

// set up common searches - ssn, email, etc.
// set up variable units - (<title>...)<title>
// withAnd
// lazy vs greedy settings
// apply groupings - careful
// rgx construct
// rgx deconstruct - optional

// conditionally applied non-capturing grouping when appropriate

// extras from before
const applyGrouping = (text: string) =>
  text.length > 1 && /^[^(].+[^)]$/.test(text) ? `(?:${text})` : text;

const reference = (text: string) => ({
  text,
  type: "back-reference",
  key: uniqid(),
});

const withAnd = (expression) => ({ and: expression }); // use lazyload?
// when accepting rgx unit, will need to check for string (and escape it) or grab unit.text
