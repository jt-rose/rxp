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

// By default, RGX uses lazy searches and non-capturing groupings
// but this behavior can be overwritten

// The constructor has five steps available:
// step 1 - or - define alternate possible text options
// step 2 - occurs family - define frequency
// step 3 - precededBy/ followedBy - define surrounding text
// step 4 - atStart/ atEnd - check at borders of text
// step 5 - isOptional/ Captured/ Variable - define settings of regex text

// The constructor has some behavior designed to avoid errors if possible
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

// create the base RGX unit that will form the core of the constructor

export class RGXBaseUnit {
  text: string;
  escaped: boolean;
  constructor(text: string) {
    this.text = text;
    this.escaped = true;
  }
  construct = (...flags: string[]): RegExp => constructRGX(this.text, flags);
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

///////////////////////
// RGX Modifier Options
// the options are divided into steps
// options provided after reaching step 3 are wrapped in 'and'
// for improved readability

// map out available constructor method options,
// starting with step 5 since it has the least available options left

// step 5 - isOptional, isCaptured, isVariable
export class IsOptionalOptions extends RGXBaseUnit {
  and: {
    isCaptured: RGXBaseUnit;
  };
  constructor(text: string) {
    super(text);
    this.and = {
      get isCaptured() {
        return new RGXBaseUnit(isCaptured(text));
      },
    };
  }
}
class Step5Options {
  protected _text: string;

  constructor(text: string) {
    this._text = text;
  }
  get isOptional() {
    return new IsOptionalOptions(isOptional(this._text));
  }
  get isCaptured() {
    return {
      ...new RGXBaseUnit(isCaptured(this._text)),
      and: {
        isOptional: new RGXBaseUnit(isOptional(isCaptured(this._text))),
        isVariable: new RGXBaseUnit(isVariable(isCaptured(this._text))),
      },
    };
  }
  get isVariable() {
    return {
      ...new RGXBaseUnit(isVariable(this._text)),
      and: {
        isOptional: new IsOptionalOptions(isOptional(isVariable(this._text))),
      },
    };
  }
}

// Branching step 4 options - atStart, atEnd
class Step4Options extends Step5Options {
  constructor(text: string) {
    super(text);
  }
  get atStart() {
    return new RGXStep5(atStart(this._text));
  }
  get atEnd() {
    return new RGXStep5(atEnd(this._text));
  }
}

class Step4OptionsWithoutStep5 {
  private _text: string;
  constructor(text: string) {
    this._text = text;
  }
  get atStart() {
    return new RGXBaseUnit(atStart(this._text));
  }
  get atEnd() {
    return new RGXBaseUnit(atEnd(this._text));
  }
}

class Step3Options extends Step4Options {
  constructor(text: string) {
    super(text);
  }
  followedBy = (newText: NewText, ...extra: ExtraText): RGXStep3WithoutAtEnd =>
    new RGXStep3WithoutAtEnd(followedBy(this._text, newText, ...extra));
  notFollowedBy = (
    newText: NewText,
    ...extra: ExtraText
  ): RGXStep3WithoutAtEnd =>
    new RGXStep3WithoutAtEnd(notFollowedBy(this._text, newText, ...extra));
  precededBy = (
    newText: NewText,
    ...extra: ExtraText
  ): RGXStep3WithoutAtStart =>
    new RGXStep3WithoutAtStart(precededBy(this._text, newText, ...extra));
  notPrecededBy = (
    newText: NewText,
    ...extra: ExtraText
  ): RGXStep3WithoutAtStart =>
    new RGXStep3WithoutAtStart(notPrecededBy(this._text, newText, ...extra));
}

class Step3OptionsWithGreedyConverter extends Step3Options {
  constructor(text: string) {
    super(text);
  }
  get isGreedy() {
    return new RGXStep3(convertToGreedySearch(this._text));
  }
}

class Step3OptionsWithoutStep4 extends Step5Options {
  constructor(text: string) {
    super(text);
  }
  followedBy = (newText: NewText, ...extra: ExtraText): RGXStep3WithoutStep4 =>
    new RGXStep3WithoutStep4(followedBy(this._text, newText, ...extra));
  notFollowedBy = (
    newText: NewText,
    ...extra: ExtraText
  ): RGXStep3WithoutStep4 =>
    new RGXStep3WithoutStep4(notFollowedBy(this._text, newText, ...extra));
  precededBy = (newText: NewText, ...extra: ExtraText): RGXStep3WithoutStep4 =>
    new RGXStep3WithoutStep4(precededBy(this._text, newText, ...extra));
  notPrecededBy = (
    newText: NewText,
    ...extra: ExtraText
  ): RGXStep3WithoutStep4 =>
    new RGXStep3WithoutStep4(notPrecededBy(this._text, newText, ...extra));
}

class Step3OptionsWithoutAtStart extends Step3OptionsWithoutStep4 {
  constructor(text: string) {
    super(text);
  }
  precededBy = (
    newText: NewText,
    ...extra: ExtraText
  ): RGXStep3WithoutAtStart =>
    new RGXStep3WithoutAtStart(precededBy(this._text, newText, ...extra));
  notPrecededBy = (
    newText: NewText,
    ...extra: ExtraText
  ): RGXStep3WithoutAtStart =>
    new RGXStep3WithoutAtStart(notPrecededBy(this._text, newText, ...extra));
  get atEnd() {
    return new RGXStep5(atEnd(this._text));
  }
}

class Step3OptionsWithoutAtEnd extends Step3OptionsWithoutStep4 {
  constructor(text: string) {
    super(text);
  }
  followedBy = (newText: NewText, ...extra: ExtraText): RGXStep3WithoutAtEnd =>
    new RGXStep3WithoutAtEnd(followedBy(this._text, newText, ...extra));
  notFollowedBy = (
    newText: NewText,
    ...extra: ExtraText
  ): RGXStep3WithoutAtEnd =>
    new RGXStep3WithoutAtEnd(notFollowedBy(this._text, newText, ...extra));
  get atStart() {
    return new RGXStep5(atStart(this._text));
  }
}

// after step 1 'or' is called, it can be called again
// such as init("sample").or("other").or("maybe a third")
// all subsequent steps are included
// and step 2 immediately moves to step 3
// so the step 2 options are included in RGXStep1 class
// and no RGXStep2 constructor is needed

export class RGXStep1 extends Step3Options {
  text: string;
  escaped: boolean;
  construct: (...flags: string[]) => RegExp;
  constructor(text: string) {
    super(text);
    const baseUnit = new RGXBaseUnit(text);
    this.text = baseUnit.text;
    this.escaped = baseUnit.escaped;
    this.construct = baseUnit.construct;
  }
  // step 1 method - or
  or = (newText: NewText, ...extra: ExtraText): RGXStep1 =>
    new RGXStep1(or(this.text, newText, ...extra));
  //step 2 methods - occurs
  occurs = (amount: number): RGXStep3 =>
    new RGXStep3(occurs(this.text, amount));
  get doesNotOccur(): RGXStep4WithoutStep5 {
    return new RGXStep4WithoutStep5(doesNotOccur(this.text));
  }
  get occursOnceOrMore(): RGXStep3WithGreedyConverter {
    return new RGXStep3WithGreedyConverter(occursOnceOrMore(this.text));
  }
  get occursZeroOrMore(): RGXStep3WithGreedyConverter {
    return new RGXStep3WithGreedyConverter(occursZeroOrMore(this.text));
  }
  occursAtLeast = (min: number): RGXStep3 =>
    new RGXStep3(occursAtLeast(this.text, min));
  occursBetween = (min: number, max: number): RGXStep3 =>
    new RGXStep3(occursBetween(this.text, min, max));
}

export type OptionsFromStep3To5 =
  | Step3Options
  | Step3OptionsWithGreedyConverter
  | Step3OptionsWithoutAtStart
  | Step3OptionsWithoutAtEnd
  | Step3OptionsWithoutStep4
  | Step4Options
  | Step4OptionsWithoutStep5
  | Step5Options;

class RGXStep3 extends RGXBaseUnit {
  and: Step3Options;
  constructor(text: string) {
    super(text);
    this.and = new Step3Options(text);
  }
}

export class RGXStep3WithGreedyConverter extends RGXBaseUnit {
  and: Step3OptionsWithGreedyConverter;
  constructor(text: string) {
    super(text);
    this.and = new Step3OptionsWithGreedyConverter(text);
  }
}
class RGXStep3WithoutAtStart extends RGXBaseUnit {
  and: Step3OptionsWithoutAtStart;
  constructor(text: string) {
    super(text);
    this.and = new Step3OptionsWithoutAtStart(text);
  }
}
class RGXStep3WithoutAtEnd extends RGXBaseUnit {
  and: Step3OptionsWithoutAtEnd;
  constructor(text: string) {
    super(text);
    this.and = new Step3OptionsWithoutAtEnd(text);
  }
}
class RGXStep3WithoutStep4 extends RGXBaseUnit {
  and: Step3OptionsWithoutStep4;
  constructor(text: string) {
    super(text);
    this.and = new Step3OptionsWithoutStep4(text);
  }
}
export class RGXStep4WithoutStep5 extends RGXBaseUnit {
  and: Step4OptionsWithoutStep5;
  constructor(text: string) {
    super(text);
    this.and = new Step4OptionsWithoutStep5(text);
  }
}
class RGXStep5 extends RGXBaseUnit {
  and: Step5Options;
  constructor(text: string) {
    super(text);
    this.and = new Step5Options(text);
  }
}

// initialize RGX constructor, accepting a series
// of unescaped strings or escaped RGX units
// and formatting them before returning step 1 of the constructor
const init = (text: NewText, ...extra: ExtraText): RGXStep1 => {
  const formattedText = [text, ...extra].map((x) => parseText(x)).join("");
  // apply nonCaptureGrouping if more than one arg given
  const textWithGrouping =
    extra.length > 0 ? withNonCaptureGrouping(formattedText) : formattedText;
  return new RGXStep1(textWithGrouping);
};

export default init;
