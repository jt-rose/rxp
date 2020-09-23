import "mocha";
import { expect } from "chai";
import init from "../src/init";
import formatText, {
  parseText,
  formatRegex,
  convertRegexToString,
  convertToGreedySearch,
} from "../src/formatText";
const {
  or,
  occurs,
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

const initRegex = (regex: string | RegExp) => new RegExp(regex);

describe("Test user text transformations", () => {
  it("correctly formats escapes for special characters", () => {
    const formatted = formatRegex("hello ^|*");
    const regexTest = initRegex(formatted);
    expect(formatted).to.equal("hello \\^\\|\\*");
    expect(regexTest.test("hello ^|*")).to.equal(true);
  });
  it("correctly converts regex literal to a string", () => {
    expect(convertRegexToString(/regex/g)).to.equal("regex");
    expect(convertRegexToString(/regex \? with escape\//gis)).to.equal(
      "regex \\? with escape\\/"
    );
  });
  it("correct conversion of regex literal variables to RXP-style variables", () => {
    const regexWithVar = /(?<var1>\d{3}) and \k<var1>/;
    const regexWithVar2 = /(?<var2>\w{3})/;

    expect(parseText(regexWithVar)).to.equal(
      "(?<var1>\\d{3}\\k<var1>) and (?<var1>\\d{3}\\k<var1>)"
    );
    expect(parseText(regexWithVar2)).to.equal("(?<var2>\\w{3}\\k<var2>)");
    const combinedVars = /(?<var2>\w{3}) (and) (?<var1>\d{3}) and \k<var1> (w)(ith) (\k<var2>)/;
    expect(parseText(combinedVars)).to.equal(
      "(?<var2>\\w{3}\\k<var2>) (and) (?<var1>\\d{3}\\k<var1>) and (?<var1>\\d{3}\\k<var1>) (w)(ith) (?<var2>\\w{3}\\k<var2>)"
    );
  });
  it("correct text parsing between strings, regex literals, and rxp constructors", () => {
    expect(parseText("sample")).to.equal("sample");
    const sampleRXP = init("sampleRXP");
    expect(parseText(sampleRXP)).to.equal("sampleRXP");
    expect(parseText(/regex/g)).to.equal("regex");
  });

  it("render text with optional marker", () => {
    const optionalHello = isOptional("hello");
    expect(optionalHello).to.equal("(?:hello)?");
  });

  it("render text with capture marker", () => {
    const capturedWord = isCaptured("capture");
    expect(capturedWord).to.equal("(capture)");
  });

  it("render text with either marker", () => {
    const orOption = or("Hi", /Bye/g);
    expect(orOption).to.equal("(?:(?:Hi)|(?:Bye))");
  });

  it("render text with beginning position marker", () => {
    const startingText = atStart("hello");
    expect(startingText).to.equal("^(?:hello)");
  });

  it("render text with ending position marker", () => {
    const endingText = atEnd("goodbye");
    expect(endingText).to.equal("(?:goodbye)$");
  });
});
describe("Define repetitions of supplied text", () => {
  it("render text with one or more marker", () => {
    const oneOrMoreNums = occursOnceOrMore("789");
    expect(oneOrMoreNums).to.equal("(?:789)+?");
  });

  it("render text with zero or more marker", () => {
    const zeroOrMoreNums = occursZeroOrMore("345");
    expect(zeroOrMoreNums).to.equal("(?:345)*?");
  });

  it("render text with exact repetitions search requirement", () => {
    const threeDogs = occurs("dogs", 3);
    expect(threeDogs).to.equal("(?:dogs){3}");
  });

  it("render text with minimal search requirement", () => {
    const atLeastFive = occursAtLeast("cats", 5);
    expect(atLeastFive).to.equal("(?:cats){5,}");
  });

  it("render text with min-max frequency requirements", () => {
    const between2And5 = occursBetween("iguana", 2, 5);
    expect(between2And5).to.equal("(?:iguana){2,5}");
  });

  it("convert lazy searches to greedy searches", () => {
    const greedyOneOrMore = convertToGreedySearch("(?:sample)+?");
    const greedyZeroOrMore = convertToGreedySearch("(?:sample)*?");
    const confirmOnlyUpdateLast = convertToGreedySearch("\\?+?");

    expect(greedyOneOrMore).to.equal("(?:sample)+");
    expect(greedyZeroOrMore).to.equal("(?:sample)*");
    expect(confirmOnlyUpdateLast).to.equal("\\?+");
  });
});
describe("Define text as surrounded by other specified text", () => {
  it("mark text as being followed by specified text", () => {
    const followedExample = followedBy("hello", "goodbye");
    expect(followedExample).to.equal("hello(?=goodbye)");
  });

  it("mark text as NOT being followed by specified text", () => {
    const notFollowedExample = notFollowedBy("hello", /goodbye/i);
    expect(notFollowedExample).to.equal("hello(?!goodbye)");
  });

  it("mark text as being preceded by specified text", () => {
    const precededExample = precededBy("goodbye", "hello");
    expect(precededExample).to.equal("(?<=hello)goodbye");
  });

  it("mark text as NOT being preceded by specified text", () => {
    const notPrecededExample = notPrecededBy("goodbye", /hello/s);
    expect(notPrecededExample).to.equal("(?<!hello)goodbye");
  });
});
