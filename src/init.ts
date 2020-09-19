import uniqid from "uniqid";
import {
  parseText,
  or,
  occurs,
  doesNotOccur,
  occursOnceOrMore,
  occursZeroOrMore,
  occursAtLeast,
  occursBetween,
  convertToGreedySearch,
  followedBy,
  notFollowedBy,
  precededBy,
  notPrecededBy,
  atStart,
  atEnd,
  isOptional,
  isCaptured,
} from "./formatText";
import { isVariable } from "./formatVariables";
import constructRXP from "./constructRXP";

// The RXP constructor receives an unformatted string, a regex literal,
// or an already formatted RXP unit and prepares them to be converted
// to a standard regex pattern i.e. /regex/
//
// user submitted strings should be written literally
// and will be escaped by the constructor
//
// The constructor creates an object that contains the base RXP unit
// which stores the modifiable text as a string
// along with a regex 'construct' method
// and appropriate method calls to further modify the text
//
// as the regex string is modified through the object methods
// nested calls to new objects are used to define
// what further options should be available at this point
// this enforces a logical, clear flow to how text is modified
// and avoids some potential errors (mentioned further below)

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
  constructor(text: string) {
    this.text = text;
  }
  construct = (...flags: string[]): RegExp => constructRXP(this.text, flags);
}

interface IsOptionalAndOptions {
  isCaptured: RXPBaseUnit;
}

interface IsCapturedAndOptions {
  isOptional: RXPBaseUnit;
}
interface IsVariableAndOptions {
  isOptional: RXPBaseUnit;
}

export type AndOptions =
  | Step3Options
  | Step3OptionsWithGreedyConverter
  | Step3OptionsWithoutAtEnd
  | Step3OptionsWithoutAtStart
  | Step3OptionsWithoutStep4
  | Step4Options
  | Step4OptionsWithoutStep5
  | Step5Options
  | IsOptionalAndOptions
  | IsCapturedAndOptions
  | IsVariableAndOptions;

export interface RXPUnit extends RXPBaseUnit {
  and?: AndOptions;
  or?: (newText: NewText, ...extra: ExtraText) => RXPStep1;
  occurs?: (amount: number) => RXPStep3;
  doesNotOccur?: RXPStep4WithoutStep5;
  occursOnceOrMore?: RXPStep3WithGreedyConverter;
  occursZeroOrMore?: RXPStep3WithGreedyConverter;
  occursAtLeast?: (min: number) => RXPStep3;
  occursBetween?: (min: number, max: number) => RXPStep3;
  followedBy?: (
    newText: NewText,
    ...extra: ExtraText
  ) => RXPStep3WithoutAtEnd | RXPStep3WithoutStep4;
  notFollowedBy?: (
    newText: NewText,
    ...extra: ExtraText
  ) => RXPStep3WithoutAtEnd | RXPStep3WithoutStep4;
  precededBy?: (
    newText: NewText,
    ...extra: ExtraText
  ) => RXPStep3WithoutAtStart | RXPStep3WithoutStep4;
  notPrecededBy?: (
    newText: NewText,
    ...extra: ExtraText
  ) => RXPStep3WithoutAtStart | RXPStep3WithoutStep4;
  atStart?: RXPStep5;
  atEnd?: RXPStep5;
  isOptional?: IsOptionalOptions | RXPBaseUnit;
  isCaptured?: IsCapturedOptions | RXPBaseUnit;
  isVariable?: (variableName: string) => IsVariableOptions | RXPBaseUnit;
}

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

class IsCapturedOptions extends RXPBaseUnit {
  and: {
    isOptional: RXPBaseUnit;
  };
  constructor(text: string) {
    super(text);
    this.and = {
      get isOptional() {
        return new RXPBaseUnit(isOptional(text));
      },
    };
  }
}

class IsVariableOptions extends RXPBaseUnit {
  and: {
    isOptional: RXPBaseUnit;
  };
  constructor(text: string) {
    super(text);
    this.and = {
      get isOptional() {
        return new RXPBaseUnit(isOptional(text));
      },
    };
  }
}

// define all possible options for step 5
class Step5Options {
  protected _text: string;

  constructor(text: string) {
    this._text = text;
  }
  get isOptional() {
    return new IsOptionalOptions(isOptional(this._text));
  }
  get isCaptured() {
    return new IsCapturedOptions(isCaptured(this._text));
  }
  isVariable(variableName: string = uniqid().replace(/[0-9]/g, "")) {
    return new IsVariableOptions(isVariable(this._text, variableName));
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

///////////// RXP Steps /////////////
//
// after step 1 'or' is called, it can be called again
// such as init("sample").or("other").or("maybe a third")
// all subsequent steps are included
// and step 2 immediately moves to step 3
// so the step 2 options are included in RXPStep1 class
// and no RXPStep2 constructor is needed

export class RXPStep1 extends Step3Options {
  text: string;
  construct: (...flags: string[]) => RegExp;
  constructor(text: string) {
    super(text);
    const baseUnit = new RXPBaseUnit(text);
    this.text = baseUnit.text;
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
// of unescaped strings, regex literals, or escaped RXP units
// and formatting them before returning step 1 of the constructor
const init = (
  text: string | RegExp | RXPUnit,
  ...extra: ExtraText
): RXPStep1 => {
  const formattedText = [text, ...extra].map((x) => parseText(x)).join("");
  return new RXPStep1(formattedText);
};

export default init;
