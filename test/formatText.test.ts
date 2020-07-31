import "mocha";
import { expect } from "chai";
import formatText, { formatRegex } from "../src/formatText";
const {
  then,
  or,
  occurs,
  doesNotOccur,
  occursAtLeast,
  occursOnceOrMore,
  occursZeroOrMore,
  occursBetween,
  followedBy,
  notFollowedBy,
  precededBy,
  notPrecededBy,
  atStart,
  atEnd,
  isOptional,
  isCaptured,
} = formatText;

const initRegex = (regex: string | RegExp) => new RegExp(regex); // simplify later without regexp arg

describe("Test user text transformations", () => {
  describe("format text for regex constructor", () => {
    it("correctly formats escapes for special characters", () => {
      const formatted = formatRegex("hello ^|*");
      const regexTest = initRegex(formatted);
      expect(formatted).to.equal("hello \\^\\|\\*");
      expect(regexTest.test("hello ^|*")).to.equal(true);
    });
  });

  describe("mark text as optional", () => {
    it("render text with optional marker", () => {
      const optionalHello = isOptional("(?:hello)");
      expect(optionalHello).to.equal("(?:hello)?");
    });
  });
  describe("combine different texts", () => {
    it("render multiple text as single text", () => {
      const combinedText = then("(?:first)", "second", "third");
      expect(combinedText).to.equal("(?:(?:first)(?:second)(?:third))");
    });
  });
  describe("mark text as captured", () => {
    it("render text with capture marker", () => {
      const capturedWord = isCaptured("(?:capture)");
      expect(capturedWord).to.equal("((?:capture))");
    });
  });
  describe("mark 2 or more text items as possible", () => {
    it("render text with either marker", () => {
      const orOption = or("Hi", "Bye"); // add req for at least 2 args?
      expect(orOption).to.equal("(?:Hi|(?:Bye))");
    });
  });
  describe("mark text as positioned in beginning", () => {
    it("render text with beginning marker", () => {
      const startingText = atStart("(?:hello)");
      expect(startingText).to.equal("^(?:hello)");
    });
  });
  describe("mark text as positioned at end", () => {
    it("render text with ending marker", () => {
      const endingText = atEnd("(?:goodbye)");
      expect(endingText).to.equal("(?:goodbye)$");
    });
  });
});
describe("Define repetitions of supplied character", () => {
  describe("repeat character search until no match found", () => {
    it("render text with one or more marker", () => {
      const oneOrMoreNums = occursOnceOrMore("(?:789)"); // optional numeric type conversion?
      expect(oneOrMoreNums).to.equal("(?:789)+");
    });
  });
  describe("repeat character search specified number of times", () => {
    it("render text with zero or more marker", () => {
      const zeroOrMoreNums = occursZeroOrMore("(?:345)"); // optional numeric type conversion?
      expect(zeroOrMoreNums).to.equal("(?:345)*");
    });
  });
  describe("look for exact number of specified characters", () => {
    it("render text with exact repetitions search requirement", () => {
      const threeDogs = occurs("(?:dogs)", 3);
      expect(threeDogs).to.equal("(?:dogs){3}");
    });
  });
  describe("look for minimal number of specified characters", () => {
    it("render text with minimal search requirement", () => {
      const atLeastFive = occursAtLeast("(?:cats)", 5);
      expect(atLeastFive).to.equal("(?:cats){5,}");
    });
  });
  describe("look for specified characters within set min-max range", () => {
    it("render text with min-max frequency requirements", () => {
      const between2And5 = occursBetween("(?:iguana)", 2, 5);
      expect(between2And5).to.equal("(?:iguana){2,5}");
    });
  });
  describe("mark character as not occuring", () => {
    it("apply not-occuring marker", () => {
      const noOccurence = doesNotOccur("(?:nothing here)");
      expect(noOccurence).to.equal("[^(?:nothing here)]");
    });
  });
});
describe("Define text as surrounded by other specified text", () => {
  describe("mark text as being followed by specified text", () => {
    it("apply 'followedBy' marker", () => {
      const followedExample = followedBy("(?:hello)", "goodbye");
      expect(followedExample).to.equal("(?:hello)(?=(?:goodbye))");
    });
  });
  describe("mark text as NOT being followed by specified text", () => {
    it("apply 'notFollowedBy' marker", () => {
      const notFollowedExample = notFollowedBy("(?:hello)", "goodbye");
      expect(notFollowedExample).to.equal("(?:hello)(?!(?:goodbye))");
    });
  });
  describe("mark text as being preceded by specified text", () => {
    it("apply 'precededBy' marker", () => {
      const precededExample = precededBy("(?:goodbye)", "hello");
      expect(precededExample).to.equal("(?<=(?:hello))(?:goodbye)");
    });
  });
  describe("mark text as NOT being preceded by specified text", () => {
    it("apply 'notPrecededBy' marker", () => {
      const notPrecededExample = notPrecededBy("(?:goodbye)", "hello");
      expect(notPrecededExample).to.equal("(?<!(?:hello))(?:goodbye)");
    });
  });
});
