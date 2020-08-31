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

// The RGX constructor recieves an unformatted string
// or an already formatted RGX unit and prepares them to be converted
// to a standard regex pattern i.e. /regex/
//
// user submitted strings should be written literally
// and will be escaped by the constructor
//
// The constructor contains the base RGX unit
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
// makes this much more intuitive and is very highly recommended

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

// all possible RGX units
export type RGXUnit =
  | RGXBaseUnit
  | RGXStep1
  | RGXStep3
  | RGXStep3WithGreedyConverter
  | RGXStep3WithoutAtStart
  | RGXStep3WithoutAtEnd
  | RGXStep3WithoutStep4
  | RGXStep4WithoutStep5
  | RGXStep5;

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

// confirm requested flag is valid
const validateFlag = (flag: string) => validFlags.includes(flag);
const validateFlags = (flags: string[]) => flags.every(validateFlag);

// convert flag keynames such as 'global' to correct flag "g"
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

// apply flag conversion to multiple submitted flags
const constructFlagMarkers = (flags: string[]) =>
  [...new Set(flags.map(convertFlagName))].join("");

// check RGX text for variables and format them correctly
//
// to account for the composable and modular nature of RGX
// regex variables are submitted with both the initial
// and subsequent variable expressions included
// and are formatted once the text is ready to be constructed
// for example, a variable will be structured as "(?<var>sample\\\\k<var>)"
// and added to a text however many times are needed
// it will later be transformed to "(?<var>sample)"
// for the initial variable declaration
// and "(\\\\k<var>)" for subsequent uses
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

// format the text that has been modified by the RGX constructor
// format any requested flags
// and return a regex literal
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

// create the base RGX unit that will form the core of the constructor
export const createRGXUnit = (text: string): RGXBaseUnit => ({
  text,
  escaped: true,
  construct: (...flags: string[]) => constructRGX(text, flags),
});

// map out available constructor method options,
// starting with step 5 since it has the least available options left

// step 5 - isOptional, isCaptured, isVariable
export interface IsOptionalOptions extends RGXBaseUnit {
  and: {
    isCaptured: RGXBaseUnit;
  };
}
interface Step5Options {
  isOptional: IsOptionalOptions;
  isCaptured: {
    text: string;
    escaped: boolean;
    construct: (...flags: string[]) => RegExp;
    and: {
      isOptional: RGXBaseUnit;
      isVariable: RGXBaseUnit;
    };
  };
  isVariable: {
    text: string;
    escaped: boolean;
    construct: (...flags: string[]) => RegExp;
    and: {
      isOptional: RGXBaseUnit;
    };
  };
}
const step5Options = (text: string): Step5Options => ({
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

interface RGXStep5 extends RGXBaseUnit {
  and: Step5Options;
}
const buildRGXStep5 = (text: string): RGXStep5 => ({
  ...createRGXUnit(text),
  and: step5Options(text),
});

interface Step4Options {
  atStart: RGXStep5;
  atEnd: RGXStep5;
}

// Branching step 4 options - atStart, atEnd
const step4Options = (text: string): Step4Options => ({
  atStart: buildRGXStep5(atStart(text)),
  atEnd: buildRGXStep5(atEnd(text)),
});

export interface RGXStep4WithoutStep5 extends RGXBaseUnit {
  atStart: RGXBaseUnit;
  atEnd: RGXBaseUnit;
}
const buildRGXStep4WithoutStep5 = (text: string): RGXStep4WithoutStep5 => ({
  ...createRGXUnit(text),
  atStart: {
    ...createRGXUnit(atStart(text)),
  },
  atEnd: {
    ...createRGXUnit(atEnd(text)),
  },
});

interface And_RGXStep3WithoutStep4 extends Step5Options {
  followedBy: (newText: NewText, ...extra: ExtraText) => RGXStep3WithoutStep4;
  notFollowedBy: (
    newText: NewText,
    ...extra: ExtraText
  ) => RGXStep3WithoutStep4;
  precededBy: (newText: NewText, ...extra: ExtraText) => RGXStep3WithoutStep4;
  notPrecededBy: (
    newText: NewText,
    ...extra: ExtraText
  ) => RGXStep3WithoutStep4;
}
interface RGXStep3WithoutStep4 extends RGXBaseUnit {
  and: And_RGXStep3WithoutStep4;
}
// branching step 3 options - precededBy, followedBy
const buildRGXStep3WithoutStep4 = (text: string): RGXStep3WithoutStep4 => ({
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

interface And_RGXStep3WithoutAtStart extends Step5Options {
  followedBy: (newText: NewText, ...extra: ExtraText) => RGXStep3WithoutStep4;
  notFollowedBy: (
    newText: NewText,
    ...extra: ExtraText
  ) => RGXStep3WithoutStep4;
  precededBy: (newText: NewText, ...extra: ExtraText) => RGXStep3WithoutAtStart;
  notPrecededBy: (
    newText: NewText,
    ...extra: ExtraText
  ) => RGXStep3WithoutAtStart;
  atEnd: RGXStep5;
}
interface RGXStep3WithoutAtStart extends RGXBaseUnit {
  and: And_RGXStep3WithoutAtStart;
}
const buildRGXStep3WithoutAtStart = (text: string): RGXStep3WithoutAtStart => ({
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
    ...step5Options(text),
  },
});

interface And_RGXStep3WithoutAtEnd extends Step5Options {
  followedBy: (newText: NewText, ...extra: ExtraText) => RGXStep3WithoutAtEnd;
  notFollowedBy: (
    newText: NewText,
    ...extra: ExtraText
  ) => RGXStep3WithoutAtEnd;
  precededBy: (newText: NewText, ...extra: ExtraText) => RGXStep3WithoutStep4;
  notPrecededBy: (
    newText: NewText,
    ...extra: ExtraText
  ) => RGXStep3WithoutStep4;
  atStart: RGXStep5;
}
interface RGXStep3WithoutAtEnd extends RGXBaseUnit {
  and: And_RGXStep3WithoutAtEnd;
}
const buildRGXStep3WithoutAtEnd = (text: string): RGXStep3WithoutAtEnd => ({
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
    atStart: buildRGXStep5(atStart(text)),
    ...step5Options(text),
  },
});

interface Step3Options {
  followedBy: (newText: NewText, ...extra: ExtraText) => RGXStep3WithoutAtEnd;
  notFollowedBy: (
    newText: NewText,
    ...extra: ExtraText
  ) => RGXStep3WithoutAtEnd;
  precededBy: (newText: NewText, ...extra: ExtraText) => RGXStep3WithoutAtStart;
  notPrecededBy: (
    newText: NewText,
    ...extra: ExtraText
  ) => RGXStep3WithoutAtStart;
}
const step3Options = (text: string): Step3Options => ({
  followedBy: (newText: NewText, ...extra: ExtraText) =>
    buildRGXStep3WithoutAtEnd(followedBy(text, newText, ...extra)),
  notFollowedBy: (newText: NewText, ...extra: ExtraText) =>
    buildRGXStep3WithoutAtEnd(notFollowedBy(text, newText, ...extra)),
  precededBy: (newText: NewText, ...extra: ExtraText) =>
    buildRGXStep3WithoutAtStart(precededBy(text, newText, ...extra)),
  notPrecededBy: (newText: NewText, ...extra: ExtraText) =>
    buildRGXStep3WithoutAtStart(notPrecededBy(text, newText, ...extra)),
});

interface And_RGXStep3 extends Step3Options, Step4Options, Step5Options {}
interface RGXStep3 extends RGXBaseUnit {
  and: And_RGXStep3;
}
const buildRGXStep3 = (text: string): RGXStep3 => ({
  ...createRGXUnit(text),
  and: {
    ...step3Options(text),
    ...step4Options(text),
    ...step5Options(text),
  },
});

interface And_RGXStep3WithGreedyConverter
  extends Step3Options,
    Step4Options,
    Step5Options {
  isGreedy: RGXStep3;
}
export interface RGXStep3WithGreedyConverter extends RGXBaseUnit {
  and: And_RGXStep3WithGreedyConverter;
}
// step 2.5 options => modify lazy searches to greedy searches
const buildRGXStep3WithGreedyConverter = (
  text: string
): RGXStep3WithGreedyConverter => ({
  ...createRGXUnit(text),
  and: {
    isGreedy: buildRGXStep3(convertToGreedySearch(text)),
    ...step3Options(text),
    ...step4Options(text),
    ...step5Options(text),
  },
});

interface Step2Options {
  occurs: (amount: number) => RGXStep3;
  doesNotOccur: RGXStep4WithoutStep5;
  occursOnceOrMore: RGXStep3WithGreedyConverter;
  occursZeroOrMore: RGXStep3WithGreedyConverter;
  occursAtLeast: (min: number) => RGXStep3;
  occursBetween: (min: number, max: number) => RGXStep3;
}
// step 2 options - occurs family
const step2Options = (text: string): Step2Options => ({
  occurs: (amount: number) => buildRGXStep3(occurs(text, amount)),
  doesNotOccur: buildRGXStep4WithoutStep5(doesNotOccur(text)),
  occursOnceOrMore: buildRGXStep3WithGreedyConverter(occursOnceOrMore(text)),
  occursZeroOrMore: buildRGXStep3WithGreedyConverter(occursZeroOrMore(text)),
  occursAtLeast: (min: number) => buildRGXStep3(occursAtLeast(text, min)),
  occursBetween: (min: number, max: number) =>
    buildRGXStep3(occursBetween(text, min, max)),
});

export interface RGXStep1
  extends RGXBaseUnit,
    Step2Options,
    Step3Options,
    Step4Options,
    Step5Options {
  or: (newText: NewText, ...extra: ExtraText) => RGXStep1;
}
// step 1 - or
export const buildRGXStep1 = (text: string): RGXStep1 => ({
  ...createRGXUnit(text),
  or: (newText: NewText, ...extra: ExtraText) =>
    buildRGXStep1(or(text, newText, ...extra)),
  ...step2Options(text),
  ...step3Options(text),
  ...step4Options(text),
  ...step5Options(text),
});

// initialize RGX constructor, accepting a series
// of unescaped strings or escaped RGX units
// and formatting them before returning step 1 of the constructor
const init = (text: NewText, ...extra: ExtraText): RGXStep1 => {
  const formattedText = [text, ...extra].map((x) => parseText(x)).join("");
  // apply nonCaptureGrouping if more than one arg given
  const textWithGrouping =
    extra.length > 0 ? withNonCaptureGrouping(formattedText) : formattedText;
  return buildRGXStep1(textWithGrouping);
};

export default init;
