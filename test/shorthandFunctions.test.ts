import "mocha";
import { expect } from "chai";
import shorthand from "../src/shorthandFunctions";
const {
  either,
  oneOrMore,
  zeroOrMore,
  noOccurenceOf,
  optional,
  upperOrLowerCase,
  wrapRGX,
} = shorthand;

describe("Valid shorthand functions", () => {
  it("correct rgx unit resulting from 'either' shorthand", () => {
    const exampleEither = either("this", "that", "or another");
    const expectedRGXText = "(?:(?:this)|(?:that)|(?:or another))";
    expect(exampleEither.text).to.equal(expectedRGXText);
  });
  it("correct rgx unit resulting from 'oneOrMore' shorthand", () => {
    const exampleOneOrMore = oneOrMore("sample");
    const expectedRGXText = "(?:(?:sample)+?)";
    expect(exampleOneOrMore.text).to.equal(expectedRGXText);
  });
  it("correct rgx unit resulting from 'zeroOrMore' shorthand", () => {
    const exampleZeroOrMore = zeroOrMore("sample");
    const expectedRGXText = "(?:(?:sample)*?)";
    expect(exampleZeroOrMore.text).to.equal(expectedRGXText);
  });
  it("correct rgx unit resulting from 'noOccurenceOf' shorthand", () => {
    const exampleNoOccurenceOf = noOccurenceOf("sample");
    const expectedRGXText = "(?:[^(?:sample)])";
    expect(exampleNoOccurenceOf.text).to.equal(expectedRGXText);
  });
  it("correct rgx unit resulting from 'optional' shorthand", () => {
    const exampleOptional = optional("option");
    const expectedRGXText = "(?:(?:option)?)";
    expect(exampleOptional.text).to.equal(expectedRGXText);
  });
  it("correct rgx unit resulting from 'upperOrLower' shorthand", () => {
    const exampleUpperOrLower = upperOrLowerCase("z");
    const expectedRGXText = "(?:(?:Z)|(?:z))";
    expect(exampleUpperOrLower.text).to.equal(expectedRGXText);
    // test expected failure
  });
  it("correct rgx unit resulting from 'wrapRGX' shorthand", () => {
    const wrapParentheses = wrapRGX(optional("["), optional("]"));
    const exampleWrapper = wrapParentheses("sample");
    const expectedRGXText = "(?:(?:(?:\\[)?)(?:sample)(?:(?:\\])?))";
    expect(exampleWrapper.text).to.equal(expectedRGXText);
  });
});
