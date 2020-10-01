import { init } from "./init";
import { presets } from "./presets";
import { shorthand } from "./shorthand";

export const RXP = {
  init,
  presets,
  shorthand,
};
export { init, presets, shorthand };

// destructure presets and shorthand and provide for export as well
export const {
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

export const {
  either,
  oneOrMore,
  zeroOrMore,
  optional,
  upperOrLowerCase,
  wrapRXP,
  withBoundaries,
} = shorthand;
