import { lettersWithAnyCase } from "./presets";
import {
  init,
  NewText,
  RXPStep1,
  RXPStep3WithGreedyConverter,
  IsOptionalOptions,
  RXPUnit,
  RXPBaseUnit,
  Step3Options,
} from "./init";
import { parseText, or } from "./formatText";
import { ValidFlag } from "./constructRXP";

// Provide shorthand functions to improve readability
// for common regex constructions

const either = (
  ...options: [
    string | RegExp | RXPUnit,
    string | RegExp | RXPUnit,
    ...(string | RegExp | RXPUnit)[]
  ]
): RXPStep1 => init(options[0]).or(options[1], ...options.slice(2));

const oneOrMore = (...text: NewText): RXPStep3WithGreedyConverter =>
  init(...text).occursOnceOrMore;

const zeroOrMore = (...text: NewText): RXPStep3WithGreedyConverter =>
  init(...text).occursZeroOrMore;

const optional = (...text: NewText): IsOptionalOptions =>
  init(...text).isOptional;

const upperOrLowerCase = (letter: string): RXPStep1 => {
  const confirmValidLetter =
    letter.length === 1 && lettersWithAnyCase.match(letter);
  if (!confirmValidLetter) {
    throw new Error("Must provide a single upper or lower case letter");
  }
  const upper = letter.toUpperCase();
  const lower = letter.toLowerCase();
  return init(upper).or(lower);
};

// returns a new function that will set up an RXP unit
// wrapped between other text. For example:
// const withParentheses = wrapRXP("(", ")")
// will allow withParentheses("sample") to return init("(sample)")
const wrapRXP = (
  before: string | RegExp | RXPUnit,
  after: string | RegExp | RXPUnit
) => (...wrappedItem: NewText): RXPStep1 => init(before, ...wrappedItem, after);

// wrap text in \b word boundaries and remove RXP - occurs options
// to avoid faulty regex
const withBoundaries = (...text: NewText): WithBoundaries => {
  const formattedText = [/\b/, ...text, /\b/].map((x) => parseText(x)).join("");
  return new WithBoundaries(formattedText);
};

// create a special version of the consructor that excludes the occurs options
// since they will cause an error when combined with 'withBoundaries'
export class WithBoundaries extends Step3Options {
  text: string;
  construct: (...flags: ValidFlag[]) => RegExp; //needs testing

  constructor(text: string) {
    super(text);
    const baseUnit = new RXPBaseUnit(text);
    this.text = baseUnit.text;
    this.construct = baseUnit.construct;
  }
  or = (...text: NewText): WithBoundaries =>
    new WithBoundaries(or(this.text, ...text));
}

export const shorthand = {
  either,
  oneOrMore,
  zeroOrMore,
  optional,
  upperOrLowerCase,
  wrapRXP,
  withBoundaries,
};
