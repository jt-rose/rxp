import init, { NewText, ExtraText } from "./init";

const either = (
  firstOption: NewText,
  secondOption: NewText,
  ...extraOptions: ExtraText
) => init(firstOption).or(secondOption, ...extraOptions);

const oneOrMore = (text: NewText, ...extra: ExtraText) =>
  init(text, ...extra).occursOnceOrMore;
const zeroOrMore = (text: NewText, ...extra: ExtraText) =>
  init(text, ...extra).occursZeroOrMore;
const noOccurenceOf = (text: NewText, ...extra: ExtraText) =>
  init(text, ...extra).doesNotOccur;

const optional = (text: NewText, ...extra: ExtraText) =>
  init(text, ...extra).isOptional;

const upperOrLowerCase = (letter: string) => {
  const upper = letter.toUpperCase();
  const lower = letter.toLowerCase();
  return init(upper).or(lower);
}; // add enums? or error check for len > 1?

const wrapRGX = (before: NewText, after: NewText) => (
  wrappedItem: NewText,
  ...extra: ExtraText
) => {
  return init(before, wrappedItem, ...extra, after);
};
// wrapRGX

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
