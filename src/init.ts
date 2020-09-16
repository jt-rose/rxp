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

// The RXP constructor recieves an unformatted string, a regex literal,
// or an already formatted RXP unit and prepares them to be converted
// to a standard regex pattern i.e. /regex/
//
// user submitted strings should be written literally
// and will be escaped by the constructor
//
// The constructor contains the base RXP unit
// which stores the modifiable text as a string
// along with a regex 'construct' method
// which are always available and can be passed into other
// RXP units in a composable manner

// By default, RXP uses lazy searches and non-capturing groupings
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

//// Type Settings for RXP constructor ////

// constructor arguments that accept unescaped strings, regex literals, or escaped RXP units
export type NewText = string | RegExp | RXPUnit;
export type ExtraText = (string | RegExp | RXPUnit)[];

// create the base RXP unit that will form the core of the constructor
export class RXPBaseUnit {
  text: string;
  escaped: boolean;
  constructor(text: string) {
    this.text = text;
    this.escaped = true;
  }
  construct = (...flags: string[]): RegExp => constructRXP(this.text, flags);
}

// all possible RXP units
export type RXPUnit =
  | RXPBaseUnit
  | RXPStep1
  | RXPStep3
  | RXPStep3WithGreedyConverter
  | RXPStep3WithoutAtStart
  | RXPStep3WithoutAtEnd
  | RXPStep3WithoutStep4
  | RXPStep4WithoutStep5
  | RXPStep5;

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

// check RXP text for variables and format them correctly
//
// to account for the composable and modular nature of RXP
// regex variables are submitted with both the initial
// and subsequent variable expressions included
// and are formatted once the text is ready to be constructed
// for example, a variable will be structured as "(?<var>sample\\\\k<var>)"
// and added to a text however many times are needed
// it will later be transformed to "(?<var>sample)"
// for the initial variable declaration
// and "(\\\\k<var>)" for subsequent uses
export const getUneditedRegexVariables = (
  RXPString: string
): string[] | null => {
  const foundVariables = RXPString.match(/\(\?<.+?>.+?\\\\k<.+?>\)/g);
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
  RXPString: string,
  regexVar: FormattedRegexVariables[]
): string => {
  return regexVar.reduce((currentString, varFound) => {
    return currentString.replace(varFound.original, varFound.firstUseEdit);
  }, RXPString);
};

export const updateSubsequentVariables = (
  RXPString: string,
  regexVar: FormattedRegexVariables[]
): string => {
  return regexVar.reduce((currentString, varFound) => {
    const searchPattern = new RegExp(parseText(varFound.original), "g");
    return currentString.replace(searchPattern, varFound.followingUseEdit);
  }, RXPString);
};

export const updateVariables = (
  RXPString: string,
  replacements: FormattedRegexVariables[]
): string =>
  updateSubsequentVariables(
    updateFirstVariableUsage(RXPString, replacements),
    replacements
  );

export const formatRXPVariables = (RXPString: string): string => {
  const regexVariables = getUneditedRegexVariables(RXPString);
  if (regexVariables) {
    const replacements = formatVariableReplacements(regexVariables);
    return updateVariables(RXPString, replacements);
  } else {
    return RXPString;
  }
};

// format the text that has been modified by the RXP constructor
// format any requested flags
// and return a regex literal
const constructRXP = (RXPString: string, flags: string[]) => {
  if (!validateFlags(flags)) {
    throw new Error(
      `Invalid flag letter/ keyword submitted. Flags must be one of the following: ${validFlags.join(
        ", "
      )}`
    );
  }
  const flagMarkers = constructFlagMarkers(flags);
  const formatWithVariables = formatRXPVariables(RXPString);
  return new RegExp(formatWithVariables, flagMarkers);
};

///////////////////////
// RXP Modifier Options
// the options are divided into steps
// options provided after reaching step 3 are wrapped in 'and'
// for improved readability

// map out available constructor method options,
// starting with step 5 since it has the least available options left

// step 5 - isOptional, isCaptured, isVariable
export class IsOptionalOptions extends RXPBaseUnit {
  and: {
    isCaptured: RXPBaseUnit;
  };
  constructor(text: string) {
    super(text);
    this.and = {
      get isCaptured() {
        return new RXPBaseUnit(isCaptured(text));
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
      ...new RXPBaseUnit(isCaptured(this._text)),
      and: {
        isOptional: new RXPBaseUnit(isOptional(isCaptured(this._text))),
        isVariable: new RXPBaseUnit(isVariable(isCaptured(this._text))),
      },
    };
  }
  get isVariable() {
    return {
      ...new RXPBaseUnit(isVariable(this._text)),
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
    return new RXPStep5(atStart(this._text));
  }
  get atEnd() {
    return new RXPStep5(atEnd(this._text));
  }
}

class Step4OptionsWithoutStep5 {
  private _text: string;
  constructor(text: string) {
    this._text = text;
  }
  get atStart() {
    return new RXPBaseUnit(atStart(this._text));
  }
  get atEnd() {
    return new RXPBaseUnit(atEnd(this._text));
  }
}

class Step3Options extends Step4Options {
  constructor(text: string) {
    super(text);
  }
  followedBy = (newText: NewText, ...extra: ExtraText): RXPStep3WithoutAtEnd =>
    new RXPStep3WithoutAtEnd(followedBy(this._text, newText, ...extra));
  notFollowedBy = (
    newText: NewText,
    ...extra: ExtraText
  ): RXPStep3WithoutAtEnd =>
    new RXPStep3WithoutAtEnd(notFollowedBy(this._text, newText, ...extra));
  precededBy = (
    newText: NewText,
    ...extra: ExtraText
  ): RXPStep3WithoutAtStart =>
    new RXPStep3WithoutAtStart(precededBy(this._text, newText, ...extra));
  notPrecededBy = (
    newText: NewText,
    ...extra: ExtraText
  ): RXPStep3WithoutAtStart =>
    new RXPStep3WithoutAtStart(notPrecededBy(this._text, newText, ...extra));
}

class Step3OptionsWithGreedyConverter extends Step3Options {
  constructor(text: string) {
    super(text);
  }
  get isGreedy() {
    return new RXPStep3(convertToGreedySearch(this._text));
  }
}

class Step3OptionsWithoutStep4 extends Step5Options {
  constructor(text: string) {
    super(text);
  }
  followedBy = (newText: NewText, ...extra: ExtraText): RXPStep3WithoutStep4 =>
    new RXPStep3WithoutStep4(followedBy(this._text, newText, ...extra));
  notFollowedBy = (
    newText: NewText,
    ...extra: ExtraText
  ): RXPStep3WithoutStep4 =>
    new RXPStep3WithoutStep4(notFollowedBy(this._text, newText, ...extra));
  precededBy = (newText: NewText, ...extra: ExtraText): RXPStep3WithoutStep4 =>
    new RXPStep3WithoutStep4(precededBy(this._text, newText, ...extra));
  notPrecededBy = (
    newText: NewText,
    ...extra: ExtraText
  ): RXPStep3WithoutStep4 =>
    new RXPStep3WithoutStep4(notPrecededBy(this._text, newText, ...extra));
}

class Step3OptionsWithoutAtStart extends Step3OptionsWithoutStep4 {
  constructor(text: string) {
    super(text);
  }
  precededBy = (
    newText: NewText,
    ...extra: ExtraText
  ): RXPStep3WithoutAtStart =>
    new RXPStep3WithoutAtStart(precededBy(this._text, newText, ...extra));
  notPrecededBy = (
    newText: NewText,
    ...extra: ExtraText
  ): RXPStep3WithoutAtStart =>
    new RXPStep3WithoutAtStart(notPrecededBy(this._text, newText, ...extra));
  get atEnd() {
    return new RXPStep5(atEnd(this._text));
  }
}

class Step3OptionsWithoutAtEnd extends Step3OptionsWithoutStep4 {
  constructor(text: string) {
    super(text);
  }
  followedBy = (newText: NewText, ...extra: ExtraText): RXPStep3WithoutAtEnd =>
    new RXPStep3WithoutAtEnd(followedBy(this._text, newText, ...extra));
  notFollowedBy = (
    newText: NewText,
    ...extra: ExtraText
  ): RXPStep3WithoutAtEnd =>
    new RXPStep3WithoutAtEnd(notFollowedBy(this._text, newText, ...extra));
  get atStart() {
    return new RXPStep5(atStart(this._text));
  }
}

// after step 1 'or' is called, it can be called again
// such as init("sample").or("other").or("maybe a third")
// all subsequent steps are included
// and step 2 immediately moves to step 3
// so the step 2 options are included in RXPStep1 class
// and no RXPStep2 constructor is needed

export class RXPStep1 extends Step3Options {
  text: string;
  escaped: boolean;
  construct: (...flags: string[]) => RegExp;
  constructor(text: string) {
    super(text);
    const baseUnit = new RXPBaseUnit(text);
    this.text = baseUnit.text;
    this.escaped = baseUnit.escaped;
    this.construct = baseUnit.construct;
  }
  // step 1 method - or
  or = (newText: NewText, ...extra: ExtraText): RXPStep1 =>
    new RXPStep1(or(this.text, newText, ...extra));
  //step 2 methods - occurs
  occurs = (amount: number): RXPStep3 =>
    new RXPStep3(occurs(this.text, amount));
  get doesNotOccur(): RXPStep4WithoutStep5 {
    return new RXPStep4WithoutStep5(doesNotOccur(this.text));
  }
  get occursOnceOrMore(): RXPStep3WithGreedyConverter {
    return new RXPStep3WithGreedyConverter(occursOnceOrMore(this.text));
  }
  get occursZeroOrMore(): RXPStep3WithGreedyConverter {
    return new RXPStep3WithGreedyConverter(occursZeroOrMore(this.text));
  }
  occursAtLeast = (min: number): RXPStep3 =>
    new RXPStep3(occursAtLeast(this.text, min));
  occursBetween = (min: number, max: number): RXPStep3 =>
    new RXPStep3(occursBetween(this.text, min, max));
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

class RXPStep3 extends RXPBaseUnit {
  and: Step3Options;
  constructor(text: string) {
    super(text);
    this.and = new Step3Options(text);
  }
}

export class RXPStep3WithGreedyConverter extends RXPBaseUnit {
  and: Step3OptionsWithGreedyConverter;
  constructor(text: string) {
    super(text);
    this.and = new Step3OptionsWithGreedyConverter(text);
  }
}
class RXPStep3WithoutAtStart extends RXPBaseUnit {
  and: Step3OptionsWithoutAtStart;
  constructor(text: string) {
    super(text);
    this.and = new Step3OptionsWithoutAtStart(text);
  }
}
class RXPStep3WithoutAtEnd extends RXPBaseUnit {
  and: Step3OptionsWithoutAtEnd;
  constructor(text: string) {
    super(text);
    this.and = new Step3OptionsWithoutAtEnd(text);
  }
}
class RXPStep3WithoutStep4 extends RXPBaseUnit {
  and: Step3OptionsWithoutStep4;
  constructor(text: string) {
    super(text);
    this.and = new Step3OptionsWithoutStep4(text);
  }
}
export class RXPStep4WithoutStep5 extends RXPBaseUnit {
  and: Step4OptionsWithoutStep5;
  constructor(text: string) {
    super(text);
    this.and = new Step4OptionsWithoutStep5(text);
  }
}
class RXPStep5 extends RXPBaseUnit {
  and: Step5Options;
  constructor(text: string) {
    super(text);
    this.and = new Step5Options(text);
  }
}

// initialize RXP constructor, accepting a series
// of unescaped strings or escaped RXP units
// and formatting them before returning step 1 of the constructor
const init = (text: NewText, ...extra: ExtraText): RXPStep1 => {
  const formattedText = [text, ...extra].map((x) => parseText(x)).join("");
  // apply nonCaptureGrouping if more than one arg given
  const textWithGrouping =
    extra.length > 0 ? withNonCaptureGrouping(formattedText) : formattedText;
  return new RXPStep1(textWithGrouping);
};

export default init;
