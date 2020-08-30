import {
  withNonCaptureGrouping,
  parseText,
  or,
  occurs,
  doesNotOccur,
  occursOnceOrMore,
  occursZeroOrMore,
  occursAtLeast,
  occursBetween,
  convertToGreedySearch,
  isOptional,
  isCaptured,
  atStart,
  atEnd,
  followedBy,
  notFollowedBy,
  precededBy,
  notPrecededBy,
  isVariable,
} from "./formatText";

//// Type Settings for RGX constructor ////

// constructor arguments that accept unescaped strings or escaped RGX units
export type NewText = string | RGXUnit;
export type ExtraText = (string | RGXUnit)[];

// minimal interface for RGX units
interface RGXBaseUnit {
  text: string;
  escaped: boolean;
  construct: (...flags: string[]) => RegExp;
}

// RGX unit at step 1 with all options available
// including AndOptions methods inside of and external to 'and' wrapper
export interface RGXUnit extends RGXBaseUnit, AndOptions {
  or?: (newText: NewText, ...extra: ExtraText) => RGXUnit;
  occurs?: (amount: number) => RGXUnit;
  doesNotOccur?: RGXUnit;
  occursOnceOrMore?: RGXUnit;
  occursZeroOrMore?: RGXUnit;
  occursAtLeast?: (min: number) => RGXUnit;
  occursBetween?: (min: number, max: number) => RGXUnit;
  // And options without wrapper from AndOptions extension
  and?: AndOptions;
}

// RGX consturctor methods that may be wrapped in 'and' object
// for improved readability
interface AndOptions {
  followedBy?: (newText: NewText, ...extra: ExtraText) => RGXUnit;
  notFollowedBy?: (newText: NewText, ...extra: ExtraText) => RGXUnit;
  precededBy?: (newText: NewText, ...extra: ExtraText) => RGXUnit;
  notPrecededBy?: (newText: NewText, ...extra: ExtraText) => RGXUnit;
  isGreedy?: RGXUnit;
  atStart?: RGXUnit;
  atEnd?: RGXUnit;
  isOptional?: RGXUnit;
  isCaptured?: RGXUnit;
  isVariable?: RGXUnit;
}

// wrapping AndOptions in 'and' object and joining with base RGX unit
// for simpler type settings on method calls
interface AndWrapper extends RGXBaseUnit {
  and: AndOptions;
}

// RGX constructor factory functions

// The RGX constructor contains the base RGX unit
// which stores the modifiable text as a string
// along with a regex 'construct' method
// which are always available and can be passed into other
// RGX units in a composable manner

// The constructor has five steps available:
// step 1 - or - define alternate possible text options
// step 2 - occurs family - define frequency
// step 3 - precededBy/ followedBy - define surrounding text
// step 4 - atStart/ atEnd - check at borders of text
// step 5 - isOptional/ Captured/ Variable - define settings of regex text

// The constructor is opinionated and has some behavior
// designed to avoid errors if possible
// The user may skip to later steps right away but not return to earlier ones
// As the constructor moves through each step, previous steps are removed
// and some future steps may be removed if they would cause issues
// i.e.: combining 'precededBy' and 'atStart' => /^(?<=first)second/
// does not work as may be expected
// the use of intellisense to guide the user based on the above type settings
// makes this much more intuitive and is highly recommended

// define acceptable flag names for RegExp constructor
const defaultFlag = "";
const defaultFlagKeyWord = "default";
const globalFlag = "g";
const globalFlagKeyWord = "global";
const ignoreCaseFlag = "i";
const ignoreCaseFlagKeyWord = "ignoreCase";
const multilineFlag = "m";
const multilineFlagKeyWord = "multiline";
const dotAllFlag = "s";
const dotAllFlagKeyWord = "dotAll";
const unicodeFlag = "u";
const unicodeFlagKeyWord = "unicode";
const stickyFlag = "y";
const stickyFlagKeyWord = "sticky";

const validFlags = [
  defaultFlag,
  defaultFlagKeyWord,
  globalFlag,
  globalFlagKeyWord,
  ignoreCaseFlag,
  ignoreCaseFlagKeyWord,
  multilineFlag,
  multilineFlagKeyWord,
  dotAllFlag,
  dotAllFlagKeyWord,
  unicodeFlag,
  unicodeFlagKeyWord,
  stickyFlag,
  stickyFlagKeyWord,
];
const validateFlag = (flag: string) => validFlags.includes(flag);
const validateFlags = (flags: string[]) => flags.every(validateFlag);

const convertFlagName = (flag: string) => {
  switch (flag) {
    case defaultFlagKeyWord:
      return defaultFlag;
    case globalFlagKeyWord:
      return globalFlag;
    case ignoreCaseFlagKeyWord:
      return ignoreCaseFlag;
    case multilineFlagKeyWord:
      return multilineFlag;
    case dotAllFlagKeyWord:
      return dotAllFlag;
    case unicodeFlagKeyWord:
      return unicodeFlag;
    case stickyFlagKeyWord:
      return stickyFlag;
    default:
      return flag;
  }
};
const constructFlagMarkers = (flags: string[]) =>
  [...new Set(flags.map(convertFlagName))].join("");

const constructRGX = (RGXString: string, flags: string[]) => {
  if (!validateFlags(flags)) {
    throw new Error(
      `Invalid flag letter/ keyword submitted. Flags must be one of the following: ${validFlags.join(
        ", "
      )}`
    );
  }
  const flagMarkers = constructFlagMarkers(flags);
  const formatWithVariables = formatRGXVariables(RGXString);
  return new RegExp(formatWithVariables, flagMarkers);
};

//1. check for variables
//2. if var, map out replacement <names>
//3. use reducer to replace non-first variables with replacement names
/*const regexVariables = RGXString.match(/\(\?<.+?>.+?\)/g);
  if (regexVariables) {
    regexVariables.reduce((previousString, regexVar) => previousString.replace(new RegExp(`(?<=${regexVar}).+${regexVar}`), regexVar.replace(/.+(?=<)/, "").replace(/(?<=>).+/, ""), RGXString)
  }*/
// combine with above?

export const getUneditedRegexVariables = (
  RGXString: string
): string[] | null => {
  const foundVariables = RGXString.match(/\(\?<.+?>.+?\\\\k<.+?>\)/g);
  return foundVariables ? [...new Set(foundVariables)] : null;
};

interface FormattedRegexVariables {
  original: string;
  firstUseEdit: string;
  followingUseEdit: string;
}
export const formatVariableReplacements = (
  variablesFound: string[]
): FormattedRegexVariables[] =>
  variablesFound.map((regexVar) => ({
    original: regexVar,
    firstUseEdit: regexVar.replace(/\\\\k<.+?>/, ""),
    followingUseEdit: regexVar.replace(/\?<.+?>.+?(?=\\\\k<.+?>)/, ""),
  }));

export const updateFirstVariableUsage = (
  RGXString: string,
  regexVar: FormattedRegexVariables[]
): string => {
  return regexVar.reduce((currentString, varFound) => {
    return currentString.replace(varFound.original, varFound.firstUseEdit);
  }, RGXString);
};

export const updateSubsequentVariables = (
  RGXString: string,
  regexVar: FormattedRegexVariables[]
): string => {
  return regexVar.reduce((currentString, varFound) => {
    const searchPattern = new RegExp(parseText(varFound.original), "g");
    return currentString.replace(searchPattern, varFound.followingUseEdit);
  }, RGXString);
};

export const updateVariables = (
  RGXString: string,
  replacements: FormattedRegexVariables[]
): string =>
  updateSubsequentVariables(
    updateFirstVariableUsage(RGXString, replacements),
    replacements
  );

export const formatRGXVariables = (RGXString: string): string => {
  const regexVariables = getUneditedRegexVariables(RGXString);
  if (regexVariables) {
    const replacements = formatVariableReplacements(regexVariables);
    return updateVariables(RGXString, replacements);
  } else {
    return RGXString;
  }
};

export const createRGXUnit = (text: string): RGXBaseUnit => ({
  text,
  escaped: true,
  construct: (...flags: string[]) => constructRGX(text, flags),
});

// map out available constructor method options,
// starting with step 5 since it has the least available options left

// step 5 - isOptional, isCaptured, isVariable
const step5Options = (text: string) => ({
  isOptional: {
    // isVariable not used with isOptional
    ...createRGXUnit(isOptional(text)),
    and: {
      isCaptured: {
        ...createRGXUnit(isCaptured(isOptional(text))),
      },
    },
  },
  isCaptured: {
    ...createRGXUnit(isCaptured(text)),
    and: {
      isOptional: {
        ...createRGXUnit(isOptional(isCaptured(text))),
      },
      isVariable: {
        ...createRGXUnit(isVariable(isCaptured(text))),
      },
    },
  },
  isVariable: {
    ...createRGXUnit(isVariable(text)),
    and: {
      // isCaptured should be initialized before
      isOptional: {
        ...createRGXUnit(isOptional(isVariable(text))),
      },
    },
  },
});

const buildRGXStep5 = (text: string) => ({
  ...createRGXUnit(text),
  and: step5Options(text),
});

// Branching step 4 options - atStart, atEnd
const step4Options = (text: string) => ({
  atStart: buildRGXStep5(atStart(text)),
  atEnd: buildRGXStep5(atEnd(text)),
});

const buildRGXStep4WithoutStep5 = (text: string) => ({
  ...createRGXUnit(text),
  atStart: {
    ...createRGXUnit(atStart(text)),
  },
  atEnd: {
    ...createRGXUnit(atEnd(text)),
  },
});

// branching step 3 options - precededBy, followedBy
const buildRGXStep3WithoutStep4 = (text: string) => ({
  ...createRGXUnit(text),
  and: {
    followedBy: (newText: NewText, ...extra: ExtraText) =>
      buildRGXStep3WithoutStep4(followedBy(text, newText, ...extra)),
    notFollowedBy: (newText: NewText, ...extra: ExtraText) =>
      buildRGXStep3WithoutStep4(notFollowedBy(text, newText, ...extra)),
    precededBy: (newText: NewText, ...extra: ExtraText) =>
      buildRGXStep3WithoutStep4(precededBy(text, newText, ...extra)),
    notPrecededBy: (newText: NewText, ...extra: ExtraText) =>
      buildRGXStep3WithoutStep4(notPrecededBy(text, newText, ...extra)),
    ...step5Options(text),
  },
});

const buildRGXStep3WithoutAtStart = (text: string) => ({
  ...createRGXUnit(text),
  and: {
    followedBy: (newText: NewText, ...extra: ExtraText) =>
      buildRGXStep3WithoutStep4(followedBy(text, newText, ...extra)),
    notFollowedBy: (newText: NewText, ...extra: ExtraText) =>
      buildRGXStep3WithoutStep4(notFollowedBy(text, newText, ...extra)),
    precededBy: (newText: NewText, ...extra: ExtraText) =>
      buildRGXStep3WithoutAtStart(precededBy(text, newText, ...extra)),
    notPrecededBy: (newText: NewText, ...extra: ExtraText) =>
      buildRGXStep3WithoutAtStart(notPrecededBy(text, newText, ...extra)),
    atEnd: buildRGXStep5(atEnd(text)),
    /*buildRGXStep4OnlyAtEnd(atEnd(text)),*/
    ...step5Options(text),
  },
});

const buildRGXStep3WithoutAtEnd = (text: string) => ({
  ...createRGXUnit(text),
  and: {
    followedBy: (newText: NewText, ...extra: ExtraText) =>
      buildRGXStep3WithoutAtEnd(followedBy(text, newText, ...extra)),
    notFollowedBy: (newText: NewText, ...extra: ExtraText) =>
      buildRGXStep3WithoutAtEnd(notFollowedBy(text, newText, ...extra)),
    precededBy: (newText: NewText, ...extra: ExtraText) =>
      buildRGXStep3WithoutStep4(precededBy(text, newText, ...extra)),
    notPrecededBy: (newText: NewText, ...extra: ExtraText) =>
      buildRGXStep3WithoutStep4(notPrecededBy(text, newText, ...extra)),
    atStart: buildRGXStep5(
      atStart(text)
    ) /*buildRGXStep4OnlyAtStart(atStart(text)),*/,
    ...step5Options(text),
  },
});

const step3Options = (text: string) => ({
  followedBy: (newText: NewText, ...extra: ExtraText) =>
    buildRGXStep3WithoutAtEnd(followedBy(text, newText, ...extra)),
  notFollowedBy: (newText: NewText, ...extra: ExtraText) =>
    buildRGXStep3WithoutAtEnd(notFollowedBy(text, newText, ...extra)),
  precededBy: (newText: NewText, ...extra: ExtraText) =>
    buildRGXStep3WithoutAtStart(precededBy(text, newText, ...extra)),
  notPrecededBy: (newText: NewText, ...extra: ExtraText) =>
    buildRGXStep3WithoutAtStart(notPrecededBy(text, newText, ...extra)),
});

const buildRGXStep3 = (text: string) => ({
  ...createRGXUnit(text),
  and: {
    ...step3Options(text),
    ...step4Options(text),
    ...step5Options(text),
  },
});

// step2.5 options => modify lazy searches to greedy searches
const buildRGXStep3WithGreedyConverter = (text: string) => ({
  ...createRGXUnit(text),
  and: {
    isGreedy: buildRGXStep3(convertToGreedySearch(text)),
    ...step3Options(text),
    ...step4Options(text),
    ...step5Options(text),
  },
});

// step 2 options - occurs family
const step2Options = (text: string) => ({
  occurs: (amount: number) => buildRGXStep3(occurs(text, amount)),
  doesNotOccur: buildRGXStep4WithoutStep5(doesNotOccur(text)),
  occursOnceOrMore: buildRGXStep3WithGreedyConverter(occursOnceOrMore(text)), // lazy load/ getter?
  occursZeroOrMore: buildRGXStep3WithGreedyConverter(occursZeroOrMore(text)),
  occursAtLeast: (min: number) => buildRGXStep3(occursAtLeast(text, min)),
  occursBetween: (min: number, max: number) =>
    buildRGXStep3(occursBetween(text, min, max)),
});

// step 1 - or
export const buildRGXStep1 = (text: string) => ({
  ...createRGXUnit(text),
  or: (newText: NewText, ...extra: ExtraText) =>
    buildRGXStep1(or(text, newText, ...extra)), // jump to next level?
  ...step2Options(text),
  ...step3Options(text),
  ...step4Options(text),
  ...step5Options(text),
});

// initialize RGX constructor, accepting a series
// of unescaped strings or escaped RGX units
// and formatting them before returning step 1 of the constructor
const init = (text: NewText, ...extra: ExtraText) => {
  const formattedText = [text, ...extra].map((x) => parseText(x)).join("");
  // apply nonCaptureGrouping if more than one arg given
  const textWithGrouping =
    extra.length > 0 ? withNonCaptureGrouping(formattedText) : formattedText;
  return buildRGXStep1(textWithGrouping);
};

export default init;
