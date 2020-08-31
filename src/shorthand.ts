import init, {
  NewText,
  ExtraText,
  RGXStep1,
  RGXStep3WithGreedyConverter,
  RGXStep4WithoutStep5,
  IsOptionalOptions,
} from "./init";

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
  const upper = letter.toUpperCase();
  const lower = letter.toLowerCase();
  return init(upper).or(lower);
}; // add enums? or error check for len > 1?

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
