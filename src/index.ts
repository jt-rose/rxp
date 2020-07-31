import uniqid from "uniqid";

/*



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

// the rgx constructor follows...
const createStep5 = (baseText: string, removeKeys: string[]) => {
    const validate = validateKey(removeKeys);
    return { // add and
        text: baseText,
        escaped: true,
        ...(validate(isOptionalKey) && {
            isOptional: initIsOptional(baseText, removeKeys),
          }),
          ...(validate(isCapturedKey) && {
            isCaptured: initIsCaptured(baseText, removeKeys),
          }),
    }
};

const createStep4AndAbove = (baseText: string, removeKeys: string[]) => {
    const validate = validateKey(removeKeys);
    return { // add and
        ...(validate(atStartKey) && { atStart: initAtStart(baseText, removeKeys) }),
    ...(validate(atEndKey) && { atEnd: initAtEnd(baseText, removeKeys) }),
    ...createStep5(baseText, removeKeys)
    }
};

const createStep3AndAbove = (baseText: string, removeKeys: string[]) => {
    const validate = validateKey(removeKeys);
    return { // add and
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
    ...createStep4AndAbove(baseText, removeKeys)
    }
};

const createStep2AndAbove = (baseText: string, removeKeys: string[]) => {
    const validate = validateKey(removeKeys);
    return { // add and
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
    ...createStep3AndAbove(baseText, removeKeys)
    }
};

const createStep1AndAbove = (baseText: string, removeKeys: string[]) => {
    const validate = validateKey(removeKeys);
    return { // add and
        ...(validate(orKey) && { or: initOr(baseText, removeKeys) }),
    //...validate(orKey) && {or3: (newText, ...extra) => continue(or(baseText, newText, ...extra), [orKey,...removeKeys]) }
    ...(validate(thenKey) && { then: initThen(baseText, removeKeys) }),
    ...createStep2AndAbove(baseText, removeKeys)
    }
};


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

// avoid () call when no args needed
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
*/
