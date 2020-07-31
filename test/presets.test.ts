import "mocha";
import { expect } from "chai";
import presets from "../src/presets";
const {
  anyCharacter,
  anyCharacterExcept,
  anyDigit,
  anyDigitExcept,
  anyUpperCase,
  anyUpperCaseExcept,
  anyLowerCase,
  anyLowerCaseExcept,
  anyLetter,
  anyLetterExcept,
  anyHexadecimal,
  upperOrLower,
} = presets;

const initRegex = (regex: string | RegExp) => new RegExp(regex); // simplify later without regexp arg
const testEach = (regex: RegExp, testItems: string[]) =>
  testItems.every((x) => regex.test(x));

const everyDigit = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const everyLowerCase = "abcdefghijklmnopqrstuvwxyz".split("");
const everyUpperCase = everyLowerCase.map((x) => x.toUpperCase());
const everyLetter = [...everyLowerCase, ...everyUpperCase];
const everySpecChar = [...".*+-?^${}()|[]".split(""), "\\"];

describe("RGX - declarative regular expression constructor", () => {
  describe("Test collections of characters to match with regex", () => {
    describe("anyCharacter", () => {
      const testAnyCharacter = initRegex(anyCharacter.text);
      it("matches any possible character", () => {
        const allPassingLetters = testEach(testAnyCharacter, everyLetter);
        const allPassingDigits = testEach(testAnyCharacter, everyDigit);
        const allPassingSpecChar = testEach(testAnyCharacter, everySpecChar);
        expect(allPassingLetters).to.equal(true);
        expect(allPassingDigits).to.equal(true);
        expect(allPassingSpecChar).to.equal(true);
      });
      it("correct removal of character when used with ...except()", () => {
        const anyExcept3DAnd = initRegex(anyCharacterExcept(3, "D", "&").text);
        expect(anyExcept3DAnd.test("3")).to.equal(false);
        expect(anyExcept3DAnd.test("D")).to.equal(false);
        expect(anyExcept3DAnd.test("&")).to.equal(false);
        expect(anyExcept3DAnd.test("2")).to.equal(true);
        expect(anyExcept3DAnd.test("d")).to.equal(true);
        expect(anyExcept3DAnd.test("+")).to.equal(true);
      });
    });
    describe("anyDigit", () => {
      const testAnyDigit = initRegex(anyDigit.text);
      it("matches any possible digit", () => {
        const allPassing = testEach(testAnyDigit, everyDigit);
        expect(allPassing).to.equal(true);
      });
      it("fails when checking non-numeric character", () => {
        const matchLetter = testAnyDigit.test("hello");
        const matchPunctuation = testAnyDigit.test("!&*_");
        expect(matchLetter).to.equal(false);
        expect(matchPunctuation).to.equal(false);
      });
      it("correct removal of character when used with ...except()", () => {
        const anyExcept5 = initRegex(anyDigitExcept(5).text);
        expect(anyExcept5.test("5")).to.equal(false);
        expect(anyExcept5.test("9")).to.equal(true);
        expect(anyExcept5.test("A")).to.equal(false);
      });
    });
    describe("anyLowerCase", () => {
      const testAnyLowerCase = initRegex(anyLowerCase.text);
      it("matches any possible lowercase letter", () => {
        const allPassing = testEach(testAnyLowerCase, everyLowerCase);
        expect(allPassing).to.equal(true);
      });
      it("fails when checking non-lowercase letter", () => {
        const rgxTest = new RegExp(anyLowerCase.text);
        const matchUpperCase = rgxTest.test("HELLO");
        const matchDigit = rgxTest.test("12345");
        expect(matchUpperCase).to.equal(false);
        expect(matchDigit).to.equal(false);
      });
      it("correct removal of character when used with ...except()", () => {
        const anyExceptC = initRegex(anyLowerCaseExcept("c").text);
        expect(anyExceptC.test("c")).to.equal(false);
        expect(anyExceptC.test("b")).to.equal(true);
        expect(anyExceptC.test("5")).to.equal(false);
      });
    });
    describe("anyUpperCase", () => {
      const testAnyUpperCase = initRegex(anyUpperCase.text);
      it("matches any possible uppercase letter", () => {
        const allPassing = testEach(testAnyUpperCase, everyUpperCase);
        expect(allPassing).to.equal(true);
      });
      it("fails when checking non-uppercase letter", () => {
        const rgxTest = new RegExp(anyUpperCase.text);
        const matchLowerCase = rgxTest.test("hello");
        const matchDigit = rgxTest.test("12345");
        expect(matchLowerCase).to.equal(false);
        expect(matchDigit).to.equal(false);
      });
      it("correct removal of character when used with ...except()", () => {
        const anyExceptFG = initRegex(anyUpperCaseExcept("F", "G").text); // add error handling for submitting lowercase version?
        expect(anyExceptFG.test("F")).to.equal(false);
        expect(anyExceptFG.test("G")).to.equal(false);
        expect(anyExceptFG.test("B")).to.equal(true);
        expect(anyExceptFG.test("5")).to.equal(false);
      });
    });
    describe("anyLetter", () => {
      const testAnyLetter = initRegex(anyLetter.text);
      it("matches any possible uppercase letter", () => {
        const allPassing = testEach(testAnyLetter, everyLetter);
        expect(allPassing).to.equal(true);
      });
      it("fails when checking non-letter", () => {
        const matchSpecChar = testAnyLetter.test("!*&");
        const matchDigit = testAnyLetter.test("12345");
        expect(matchSpecChar).to.equal(false);
        expect(matchDigit).to.equal(false);
      });
      it("correct removal of character when used with ...except()", () => {
        const anyExceptaBc = initRegex(anyLetterExcept("a", "B", "c").text); // add error handling for submitting lowercase version?
        expect(anyExceptaBc.test("a")).to.equal(false);
        expect(anyExceptaBc.test("A")).to.equal(true);
        expect(anyExceptaBc.test("B")).to.equal(false);
        expect(anyExceptaBc.test("b")).to.equal(true);
        expect(anyExceptaBc.test("c")).to.equal(false);
        expect(anyExceptaBc.test("C")).to.equal(true);
        expect(anyExceptaBc.test("5")).to.equal(false);
      });
    }); /*
    describe("anySpecChar", () => {
      const testAnySpecChar = initRegex(anySpecChar.text);
      it("matches any possible special character requiring regex escape", () => {
        const allPassing = testEach(testAnySpecChar, everySpecChar);
        expect(allPassing).to.equal(true);
      });
      it("fails when checking non-special character", () => {
        const matchLetter = testAnySpecChar.test("abc");
        const matchDigit = testAnySpecChar.test("12345");
        expect(matchLetter).to.equal(false);
        expect(matchDigit).to.equal(false);
      });
    });*/
    /*
    formFeed, etc.
    hexadecimal
    */
  });

  describe("convert letter to upper or lowercase", () => {
    it("correctly converts letter to optional upper or lowercase", () => {
      const updatedQ = upperOrLower("q");
      expect(updatedQ.text).to.equal("[qQ]");
      const updatedT = upperOrLower("T");
      expect(updatedT.text).to.equal("[tT]");
    });
  });
});
