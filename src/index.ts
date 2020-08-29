import init from "./init";
import presets from "./presets";
import shorthand from "./shorthand";

const RGX = {
  init,
  presets,
  shorthand,
};
export default RGX;
export { init, presets, shorthand };
const {
  anyCharacter,
  anyCharacterExcept,
  anyDigit,
  anyDigitExcept,
  anyLowerCase,
  anyLowerCaseExcept,
  anyUpperCase,
  anyUpperCaseExcept,
  anyLetter,
  anyLetterExcept,
} = presets;
export {
  anyCharacter,
  anyCharacterExcept,
  anyDigit,
  anyDigitExcept,
  anyLowerCase,
  anyLowerCaseExcept,
  anyUpperCase,
  anyUpperCaseExcept,
  anyLetter,
  anyLetterExcept,
};
const { either, oneOrMore, zeroOrMore, noOccurenceOf, optional } = shorthand;
export { either, oneOrMore, zeroOrMore, noOccurenceOf, optional };
// destructure presets and shorthand and provide those for export as well
