import init from "./init";
import presets from "./presets";
import shorthand from "./shorthand";

const RXP = {
  init,
  presets,
  shorthand,
};
export default RXP;
export { RXP, init, presets, shorthand };

// destructure presets and shorthand and provide for export as well
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

const {
  either,
  oneOrMore,
  zeroOrMore,
  noOccurenceOf,
  optional,
  upperOrLowerCase,
  wrapRXP,
} = shorthand;
export {
  either,
  oneOrMore,
  zeroOrMore,
  noOccurenceOf,
  optional,
  upperOrLowerCase,
  wrapRXP,
};
