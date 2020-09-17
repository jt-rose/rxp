import "mocha";
import { expect } from "chai";
import shorthand from "../src/shorthand";
const {
  either,
  oneOrMore,
  zeroOrMore,
  noOccurenceOf,
  optional,
  upperOrLowerCase,
  wrapRXP,
} = shorthand;

describe("Valid shorthand functions", () => {
  it("correct RXP unit resulting from 'either' shorthand", () => {
    const exampleEither = either("this", "that", "or another");
    const expectedRXPText = "(?:(?:this)|(?:that)|(?:or another))";
    expect(exampleEither.text).to.equal(expectedRXPText);
  });
  it("correct RXP unit resulting from 'oneOrMore' shorthand", () => {
    const exampleOneOrMore = oneOrMore("sample");
    const expectedRXPText = "(?:sample)+?";
    expect(exampleOneOrMore.text).to.equal(expectedRXPText);
  });
  it("correct RXP unit resulting from 'zeroOrMore' shorthand", () => {
    const exampleZeroOrMore = zeroOrMore("sample");
    const expectedRXPText = "(?:sample)*?";
    expect(exampleZeroOrMore.text).to.equal(expectedRXPText);
  });
  it("correct RXP unit resulting from 'noOccurenceOf' shorthand", () => {
    const exampleNoOccurenceOf = noOccurenceOf("sample");
    const expectedRXPText = "[^(?:sample)]";
    expect(exampleNoOccurenceOf.text).to.equal(expectedRXPText);
  });
  it("correct RXP unit resulting from 'optional' shorthand", () => {
    const exampleOptional = optional("option");
    const expectedRXPText = "(?:option)?";
    expect(exampleOptional.text).to.equal(expectedRXPText);
  });
  it("correct RXP unit resulting from 'upperOrLower' shorthand", () => {
    const exampleUpperOrLower = upperOrLowerCase("z");
    const expectedRXPText = "(?:(?:Z)|(?:z))";
    expect(exampleUpperOrLower.text).to.equal(expectedRXPText);
    expect(() => upperOrLowerCase("too many")).to.throw();
    expect(() => upperOrLowerCase("7")).to.throw();
  });
  it("correct RXP unit resulting from 'wrapRXP' shorthand", () => {
    const wrapParentheses = wrapRXP(optional("["), optional("]"));
    const exampleWrapper = wrapParentheses("sample");
    const expectedRXPText = "(?:\\[)?sample(?:\\])?";
    expect(exampleWrapper.text).to.equal(expectedRXPText);
  });
});
