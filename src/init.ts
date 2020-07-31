import {
  or,
  then,
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
  parseText,
} from "./formatText";

// Generate tiers of options, removing option sets
// as unit constructor progresses
//
// also remove individual options from each tier
// after they have already been implemented
//
// dynamically inject "and" into object syntax to improve readability

// keys
// keys are used to track which pathways are still viable
// when generating the declarative syntax object
// keys passed to the removeKeys array will be removed from the current object

// Define keyNames used to check against when removing already used keys
const orKey = "orKey";
const thenKey = "thenKey";
//const anyOccursKey = "anyOccursKey";
const followedByKey = "followedByKey";
const notFollowedByKey = "notFollowedByKey";
const precededByKey = "precededByKey";
const notPrecededByKey = "notPrecededByKey";
const atStartKey = "atStartKey";
const atEndKey = "atEndKey";
const isOptionalKey = "isOptionalKey";
const isCapturedKey = "isCapturedKey";
// useRef?

// check if any optional path should be removed
const validateKey = (removeKeys: string[]) => (key: string) =>
  !removeKeys.includes(key);

interface TextObject {
  text: string;
  escaped: boolean;
}
type BuildRGX = (
  baseText: string,
  removeKeys: string[],
  extendsWithAnd?: boolean
) => RGXUnit; //specify recursive type?

type ModifyTextRGX = RGXUnit; //() => RGXUnit;
type CombineTextRGX = (
  newText: string | TextObject,
  ...extra: (string | TextObject)[]
) => RGXUnit;
type SetFrequencyRGX = (amount: number) => RGXUnit;
type SetRangeRGX = (min: number, max: number) => RGXUnit;

interface RGXUnit extends RGXPathways {
  text: string;
  escaped: boolean;
  // useRef?
  // any
}

interface RGXPathways {
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
  and?: RGXPathways;
}

type BuildPathways = (text: string, removeKeys: string[]) => RGXPathways;

// step 1
const generateExtensions: BuildPathways = (text, removeKeys) => {
  // remove default val for removeKeys on steps 2-5
  const validate = validateKey(removeKeys);
  return {
    ...(validate(orKey) && {
      or: (newText, ...extra) =>
        createStep1(or(text, newText, ...extra), [...removeKeys, orKey]),
    }), // move to step 2 immmediately?
    ...(validate(thenKey) && {
      then: (newText, ...extra) =>
        createStep1(then(text, newText, ...extra), [...removeKeys, thenKey]),
    }),
  };
};

// step 2 - generate occurences
// only once occurence definition allowed, immediately move to step 3
const generateOccurences: BuildPathways = (text, removeKeys) => {
  //const validate = validateKey(removeKeys);
  return {
    // add validation after refactor?
    occurs: (amount: number) => createStep3(occurs(text, amount), removeKeys),
    doesNotOccur: /*() => */ createStep3(doesNotOccur(text), removeKeys),
    occursOnceOrMore: /*() => */ createStep3(
      occursOnceOrMore(text),
      removeKeys
    ),
    occursZeroOrMore: /*() => */ createStep3(
      occursZeroOrMore(text),
      removeKeys
    ),
    occursAtLeast: (min: number) =>
      createStep3(occursAtLeast(text, min), removeKeys),
    occursBetween: (min: number, max: number) =>
      createStep3(occursBetween(text, min, max), removeKeys),
  };
};

// step 3 - generate surroundings
const generateSurroundings: BuildPathways = (text, removeKeys) => {
  const validate = validateKey(removeKeys);
  return {
    ...(validate(followedByKey) && {
      followedBy: (newText, ...extra) =>
        createStep3(followedBy(text, newText, ...extra), [
          ...removeKeys,
          followedByKey,
          atEndKey,
        ]),
    }),
    ...(validate(notFollowedByKey) && {
      notFollowedBy: (newText, ...extra) =>
        createStep3(notFollowedBy(text, newText, ...extra), [
          ...removeKeys,
          notFollowedByKey,
          atEndKey,
        ]),
    }),
    ...(validate(precededByKey) && {
      precededBy: (newText, ...extra) =>
        createStep3(precededBy(text, newText, ...extra), [
          ...removeKeys,
          precededByKey,
          atStartKey,
        ]),
    }),
    ...(validate(notPrecededByKey) && {
      notPrecededBy: (newText, ...extra) =>
        createStep3(notPrecededBy(text, newText, ...extra), [
          ...removeKeys,
          notPrecededByKey,
          atStartKey,
        ]),
    }),
  };
};

// step 4 - generate boundaries
const generateBoundaries: BuildPathways = (text, removeKeys) => {
  const validate = validateKey(removeKeys);
  return {
    ...(validate(atStartKey) && {
      atStart: createStep4(atStart(text), [...removeKeys, atStartKey]),
    }),
    ...(validate(atEndKey) && {
      atEnd: createStep5(atEnd(text), removeKeys),
    }), // moving to step 5, no addition to key removal needed
  };
};

// step 5 - generate settings
const generateSettings: BuildPathways = (text, removeKeys) => {
  const validate = validateKey(removeKeys);
  return {
    ...(validate(isOptionalKey) && {
      isOptional: createStep5(isOptional(text), [...removeKeys, isOptionalKey]),
    }),
    ...(validate(isCapturedKey) && {
      isCaptured: createStep5(isCaptured(text), [...removeKeys, isCapturedKey]),
    }),
  };
};

const createStep1: BuildRGX = (text, removeKeys) => {
  return {
    text,
    escaped: true,
    ...generateExtensions(text, removeKeys),
    ...generateOccurences(text, removeKeys),
    ...generateSurroundings(text, removeKeys),
    ...generateBoundaries(text, removeKeys),
    ...generateSettings(text, removeKeys),
  };
};

// step 2 - once a single function is used to define the occurences,
// the rgx builder will cancel out the other and move to step 3
// The step 2 functions will be called from within step 1
// and have no need to recursively call an updated version of step 2
// therefore, we can skip a 'createStep2' function altogether

/*
const createStep2: BuildRGX = (text, removeKeys, extendsWithAnd = false) => {
  return {
    text,
    escaped: true,
    ...generateOccurences(text, removeKeys),
    ...generateSurroundings(text, removeKeys),
    ...generateBoundaries(text, removeKeys),
    ...generateSettings(text, removeKeys),
  };
};*/

const createStep3: BuildRGX = (text, removeKeys) => {
  return {
    text,
    escaped: true,
    and: {
      ...generateBoundaries(text, removeKeys),
      ...generateSurroundings(text, removeKeys),
      ...generateSettings(text, removeKeys),
    },
  }; /*
  const baseObj = {
    text,
    escaped: true,
    ...generateBoundaries(text, removeKeys),
  };
  const andObject = {
    ...generateSurroundings(text, removeKeys),
    ...generateSettings(text, removeKeys),
  };

  return formatWithAnd(extendsWithAnd, baseObj, andObject);*/
};

const createStep4: BuildRGX = (text, removeKeys) => {
  return {
    text,
    escaped: true,
    and: {
      ...generateBoundaries(text, removeKeys),
      ...generateSettings(text, removeKeys),
    },
  }; /*
  const baseObj = {
    text,
    escaped: true,
    ...generateBoundaries(text, removeKeys),
  };
  const andObject = {
    ...generateSettings(text, removeKeys),
  };

  return formatWithAnd(extendsWithAnd, baseObj, andObject);*/
};

const createStep5: BuildRGX = (text, removeKeys) => {
  const validate = validateKey(removeKeys);
  const anyOptionsLeft = validate(isOptionalKey) || validate(isCapturedKey);
  return {
    text,
    escaped: true,
    ...(anyOptionsLeft && {
      and: {
        ...generateSettings(text, removeKeys),
      },
    }),
  }; /*
  const baseObj = {
    text,
    escaped: true,
  };
  const andObject = {
    ...generateSettings(text, removeKeys),
  };

  return formatWithAnd(extendsWithAnd, baseObj, andObject);*/
};
/*
const formatWithAnd = (
  extendsWithAnd: boolean,
  baseObj: RGXUnit,
  andObj: RGXPathways
) => {
  if (extendsWithAnd) {
    return {
      ...baseObj,
      andObj,
    };
  } else {
    return {
      ...baseObj,
      ...andObj,
    };
  }
};*/
// what if and followed by empty {}?

const init = (text: string | TextObject): RGXUnit =>
  createStep1(parseText(text), []);
export default init;
