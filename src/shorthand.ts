import { lettersWithAnyCase } from "./presets";
import init, {
  NewText,
  ExtraText,
  RGXStep1,
  RGXStep3WithGreedyConverter,
  RGXStep4WithoutStep5,
  IsOptionalOptions,
} from "./init";

// Provide shorthand functions to improve readability
// for common regex constructions

const either = (
  firstOption: NewText,
  secondOption: NewText,
  ...extraOptions: ExtraText
): RGXStep1 => init(firstOption).or(secondOption, ...extraOptions);

const oneOrMore = (
  text: NewText,
  ...extra: ExtraText
): RGXStep3WithGreedyConverter => init(text, ...extra).occursOnceOrMore;

const zeroOrMore = (
  text: NewText,
  ...extra: ExtraText
): RGXStep3WithGreedyConverter => init(text, ...extra).occursZeroOrMore;

const noOccurenceOf = (
  text: NewText,
  ...extra: ExtraText
): RGXStep4WithoutStep5 => init(text, ...extra).doesNotOccur;

const optional = (text: NewText, ...extra: ExtraText): IsOptionalOptions =>
  init(text, ...extra).isOptional;

const upperOrLowerCase = (letter: string): RGXStep1 => {
  const confirmValidLetter =
    letter.length === 1 && lettersWithAnyCase.match(letter);
  if (!confirmValidLetter) {
    throw new Error("Must provide a single upper or lower case letter");
  }
  const upper = letter.toUpperCase();
  const lower = letter.toLowerCase();
  return init(upper).or(lower);
};

// returns a new function that will set up an RGX unit
// wrapped between other text. For example:
// const withParentheses = wrapRGX("(", ")")
// will allow withParentheses("sample") to return init("(sample)")
const wrapRGX = (before: NewText, after: NewText) => (
  wrappedItem: NewText,
  ...extra: ExtraText
): RGXStep1 => init(before, wrappedItem, ...extra, after);

const shorthand = {
  either,
  oneOrMore,
  zeroOrMore,
  noOccurenceOf,
  optional,
  upperOrLowerCase,
  wrapRGX,
};
export default shorthand;
