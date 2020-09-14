import { lettersWithAnyCase } from "./presets";
import init, {
  NewText,
  ExtraText,
  RXPStep1,
  RXPStep3WithGreedyConverter,
  RXPStep4WithoutStep5,
  IsOptionalOptions,
} from "./init";

// Provide shorthand functions to improve readability
// for common regex constructions

const either = (
  firstOption: NewText,
  secondOption: NewText,
  ...extraOptions: ExtraText
): RXPStep1 => init(firstOption).or(secondOption, ...extraOptions);

const oneOrMore = (
  text: NewText,
  ...extra: ExtraText
): RXPStep3WithGreedyConverter => init(text, ...extra).occursOnceOrMore;

const zeroOrMore = (
  text: NewText,
  ...extra: ExtraText
): RXPStep3WithGreedyConverter => init(text, ...extra).occursZeroOrMore;

const noOccurenceOf = (
  text: NewText,
  ...extra: ExtraText
): RXPStep4WithoutStep5 => init(text, ...extra).doesNotOccur;

const optional = (text: NewText, ...extra: ExtraText): IsOptionalOptions =>
  init(text, ...extra).isOptional;

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
const wrapRXP = (before: NewText, after: NewText) => (
  wrappedItem: NewText,
  ...extra: ExtraText
): RXPStep1 => init(before, wrappedItem, ...extra, after);

const shorthand = {
  either,
  oneOrMore,
  zeroOrMore,
  noOccurenceOf,
  optional,
  upperOrLowerCase,
  wrapRXP,
};
export default shorthand;
