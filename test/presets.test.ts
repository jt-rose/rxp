import "mocha";
import { expect } from "chai";
import presets from "../src/presets";
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

describe("Valid creation of RGX presets", () => {
  it("correct creation of 'anyCharacter' preset", () => {
    expect(anyCharacter.text).to.equal("(?:.)");
  });
  it("correct creation of 'anyCharacterExcept' preset", () => {
    expect(anyCharacterExcept("a", "A", "B").text).to.equal("(?:[^aAB])");
  });
  it("correct creation of 'anyDigit' preset", () => {
    expect(anyDigit.text).to.equal("(?:[0123456789])");
  });
  it("correct creation of 'anyDigitExcept' preset", () => {
    expect(anyDigitExcept("3", "6", "9").text).to.equal("(?:[0124578])");
  });
  it("correct creation of 'anyLowerCase' preset", () => {
    expect(anyLowerCase.text).to.equal("(?:[abcdefghijklmnopqrstuvwxyz])");
  });
  it("correct creation of 'anyLowerCaseExcept' preset", () => {
    expect(anyLowerCaseExcept("b", "d", "z").text).to.equal(
      "(?:[acefghijklmnopqrstuvwxy])"
    );
  });
  it("correct creation of 'anyUpperCase' preset", () => {
    expect(anyUpperCase.text).to.equal("(?:[ABCDEFGHIJKLMNOPQRSTUVWXYZ])");
  });
  it("correct creation of 'anyUpperCaseExcept' preset", () => {
    expect(anyUpperCaseExcept("A", "C", "E").text).to.equal(
      "(?:[BDFGHIJKLMNOPQRSTUVWXYZ])"
    );
  });
  it("correct creation of 'anyLetter' preset", () => {
    expect(anyLetter.text).to.equal(
      "(?:[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ])"
    );
  });
  it("correct creation of 'anyLetterExcept' preset", () => {
    expect(anyLetterExcept("a", "A", "c", "C").text).to.equal(
      "(?:[bdefghijklmnopqrstuvwxyzBDEFGHIJKLMNOPQRSTUVWXYZ])"
    );
  });
});
