import { init, RXPBaseUnit } from "./init";
import { presets } from "./presets";
import { shorthand } from "./shorthand";

// import types for the .d.ts file to enable correct types via npm
import {
  RXPUnit,
  RXPStep1,
  RXPStep3WithGreedyConverter,
  ExtraText,
  IsOptionalOptions,
} from "./init";
import { WithBoundaries } from "./shorthand";

export const RXP = {
  init,
  presets,
  shorthand,
};
export { init, presets, shorthand, RXPUnit };

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
