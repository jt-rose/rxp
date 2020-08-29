import "mocha";
import { expect } from "chai";
import init, {
  createRGXUnit,
  getUneditedRegexVariables,
  formatVariableReplacements,
  formatRGXVariables,
} from "../src/init";

const everyStepKeys = ["text", "escaped", "construct"];
const onlyStep1Keys = ["or"];
const onlyStep2Keys = [
  "occurs",
  "doesNotOccur",
  "occursAtLeast",
  "occursOnceOrMore",
  "occursZeroOrMore",
  "occursBetween",
];
const onlyStep3Keys = [
  "followedBy",
  "notFollowedBy",
  "precededBy",
  "notPrecededBy",
];
const onlyStep4Keys = ["atStart", "atEnd"];
const onlyStep5Keys = ["isOptional", "isCaptured", "isVariable"];

const step1Keys = [
  ...everyStepKeys,
  ...onlyStep1Keys,
  ...onlyStep2Keys,
  ...onlyStep3Keys,
  ...onlyStep4Keys,
  ...onlyStep5Keys,
];

const step3Keys = [...everyStepKeys, "and"];
const step3KeysAfterAnd = [
  ...onlyStep3Keys,
  ...onlyStep4Keys,
  ...onlyStep5Keys,
];
const step4Keys = [...everyStepKeys, "and"];
const step5Keys = [...everyStepKeys, "and"];

describe("", () => {
  describe("Initialize RGX unit", () => {
    it("correct escaping of submitted text", () => {
      const initialUnit = init("first step");
      expect(initialUnit.text).to.equal("(?:first step)");
      expect(initialUnit.escaped).to.be.true;
      expect(Object.keys(initialUnit)).to.have.same.members(step1Keys);
    });
    it("correct composition of rgx units without additional escaping", () => {
      const sampleRGXUnit = createRGXUnit("(?:pre-escaped sample)");
      const initialUnit = init(sampleRGXUnit);
      expect(initialUnit.text).to.equal("(?:pre-escaped sample)");
      expect(initialUnit.escaped).to.be.true;
      expect(Object.keys(initialUnit)).to.have.same.members(step1Keys);
    });
  });
  describe("RGX Step 1 - 'or'", () => {
    const testOr = init("sample").or("other sample");
    it("valid transformation of text", () => {
      expect(testOr.text).to.equal("(?:(?:sample)|(?:other sample))");
    });
    it("valid RGX method options after 'or'", () => {
      const orKeys = Object.keys(testOr);
      // step 1 is recursive, allowing for additional 'or' methods
      expect(orKeys).to.have.same.members(step1Keys);
    });
  });
  describe("RGX Step 2 - 'occurs' grouping", () => {
    const sample = init("sample");
    const testOccurs = sample.occurs(5);
    const testDoesNotOccur = sample.doesNotOccur;
    const testOccursAtLeast = sample.occursAtLeast(3);
    const testOccursOnceOrMore = sample.occursOnceOrMore;
    const testGreedyOnceOrMore = testOccursOnceOrMore.and.isGreedy;
    const testOccursZeroOrMore = sample.occursZeroOrMore;
    const testGreedyZeroOrMore = testOccursZeroOrMore.and.isGreedy;
    const testOccursBetween = sample.occursBetween(2, 4);
    it("valid transformation of text", () => {
      expect(testOccurs.text).to.equal("(?:(?:sample){5})");
      expect(testDoesNotOccur.text).to.equal("(?:[^(?:sample)])");
      expect(testOccursAtLeast.text).to.equal("(?:(?:sample){3,})");

      expect(testOccursOnceOrMore.text).to.equal("(?:(?:sample)+?)");
      expect(testGreedyOnceOrMore.text).to.equal("(?:(?:sample)+)");

      expect(testOccursZeroOrMore.text).to.equal("(?:(?:sample)*?)");
      expect(testGreedyZeroOrMore.text).to.equal("(?:(?:sample)*)");

      expect(testOccursBetween.text).to.equal("(?:(?:sample){2,4})");
    });
    it("valid RGX method options after 'occurs' options", () => {
      const occursRGXUnits = [testOccurs, testOccursAtLeast, testOccursBetween];
      const occursRGXUnitsAfterAnd = occursRGXUnits.map((unit) => unit.and);
      const occursRGXUnitsKeys = occursRGXUnits.map((unit) =>
        Object.keys(unit)
      );
      const occursRGXUnitsAfterAndKeys = occursRGXUnitsAfterAnd.map((unit) =>
        Object.keys(unit)
      );

      occursRGXUnitsKeys.forEach((unitKeys) =>
        expect(unitKeys).to.have.same.members(step3Keys)
      );
      occursRGXUnitsAfterAndKeys.forEach((unitKeys) =>
        expect(unitKeys).to.have.same.members(step3KeysAfterAnd)
      );

      expect(Object.keys(testOccursOnceOrMore)).to.have.same.members(step3Keys);
      expect(Object.keys(testOccursOnceOrMore.and)).to.have.same.members([
        "isGreedy",
        ...step3KeysAfterAnd,
      ]);

      expect(Object.keys(testOccursZeroOrMore)).to.have.same.members(step3Keys);
      expect(Object.keys(testOccursZeroOrMore.and)).to.have.same.members([
        "isGreedy",
        ...step3KeysAfterAnd,
      ]);

      expect(Object.keys(testGreedyOnceOrMore)).to.have.same.members(step3Keys);
      expect(Object.keys(testGreedyOnceOrMore.and)).to.have.same.members(
        step3KeysAfterAnd
      );

      expect(Object.keys(testGreedyZeroOrMore)).to.have.same.members(step3Keys);
      expect(Object.keys(testGreedyZeroOrMore.and)).to.have.same.members(
        step3KeysAfterAnd
      );

      expect(Object.keys(testDoesNotOccur)).to.have.same.members([
        ...onlyStep4Keys,
        ...everyStepKeys,
      ]);
    });
  });
  describe("RGX Step 3 - 'surrounding' grouping", () => {
    const sample = init("sample");
    const testPrecededBy = sample.precededBy("before");
    const testNotPrecededBy = sample.notPrecededBy("not before");
    const testFollowedBy = sample.followedBy("after");
    const testNotFollowedBy = sample.notFollowedBy("not after");
    it("valid transformation of text", () => {
      expect(testPrecededBy.text).to.equal("(?:(?<=(?:before))(?:sample))");
      expect(testNotPrecededBy.text).to.equal(
        "(?:(?<!(?:not before))(?:sample))"
      );
      expect(testFollowedBy.text).to.equal("(?:(?:sample)(?=(?:after)))");
      expect(testNotFollowedBy.text).to.equal(
        "(?:(?:sample)(?!(?:not after)))"
      );
    });
    it("valid RGX method options after 'surrounding' options", () => {
      expect(Object.keys(testPrecededBy)).to.have.same.members(step3Keys);
      expect(Object.keys(testNotPrecededBy)).to.have.same.members(step3Keys);
      expect(Object.keys(testFollowedBy)).to.have.same.members(step3Keys);
      expect(Object.keys(testNotFollowedBy)).to.have.same.members(step3Keys);

      // test step 4 variations after and
      const atStartKey = "atStart";
      const atEndKey = "atEnd";

      const step3KeysAfterAndWithoutAtStart = [
        ...onlyStep3Keys,
        atEndKey,
        ...onlyStep5Keys,
      ];
      const step3KeysAfterAndWithoutAtEnd = [
        ...onlyStep3Keys,
        atStartKey,
        ...onlyStep5Keys,
      ];
      const step3KeysAfterAndWithoutStep4 = [
        ...onlyStep3Keys,
        ...onlyStep5Keys,
      ];
      expect(Object.keys(testPrecededBy.and)).to.have.same.members(
        step3KeysAfterAndWithoutAtStart
      );
      expect(Object.keys(testNotPrecededBy.and)).to.have.same.members(
        step3KeysAfterAndWithoutAtStart
      );
      expect(Object.keys(testFollowedBy.and)).to.have.same.members(
        step3KeysAfterAndWithoutAtEnd
      );
      expect(Object.keys(testNotFollowedBy.and)).to.have.same.members(
        step3KeysAfterAndWithoutAtEnd
      );

      expect(
        Object.keys(testPrecededBy.and.followedBy("after").and)
      ).to.have.same.members(step3KeysAfterAndWithoutStep4);
    });
  });
  describe("RGX Step 4 - atStart, atEnd", () => {
    const sample = init("sample");
    const testAtStart = sample.atStart;
    const testAtEnd = sample.atEnd;
    it("valid transformation of text", () => {
      expect(testAtStart.text).to.equal("(?:^(?:sample))");
      expect(testAtEnd.text).to.equal("(?:(?:sample)$)");
    });
    it("valid RGX method options after step 4 options", () => {
      expect(Object.keys(testAtStart)).to.have.same.members(step4Keys);
      expect(Object.keys(testAtStart.and)).to.have.same.members(onlyStep5Keys);
      expect(Object.keys(testAtEnd)).to.have.same.members(step4Keys);
      expect(Object.keys(testAtEnd.and)).to.have.same.members(onlyStep5Keys);
    });
  });
  describe("RGX Step 5 - settings", () => {
    const sample = init("sample");
    const testIsOptional = sample.isOptional;
    const testIsOptionalAndCaptured = testIsOptional.and.isCaptured;
    const testIsCaptured = sample.isCaptured;
    const testIsCapturedAndOptional = testIsCaptured.and.isOptional;
    const testIsCapturedAndVariable = testIsCaptured.and.isVariable;
    const testIsVariable = sample.isVariable;
    it("valid transformation of text", () => {
      expect(testIsOptional.text).to.equal("(?:(?:sample)?)");
      expect(testIsOptionalAndCaptured.text).to.equal("((?:(?:sample)?))");

      expect(testIsCaptured.text).to.equal("((?:sample))");
      expect(testIsCapturedAndOptional.text).to.equal("(?:((?:sample))?)");
      const correctCaptureAndVariable = /\(\?<.+>\(\(\?:sample\)\)\\\\k<.+?>\)/.test(
        testIsCapturedAndVariable.text
      );
      expect(correctCaptureAndVariable).to.be.true;

      const correctVariableTransformation = /\(\?<.+>\(\?:sample\)\\\\k<.+?>\)/.test(
        testIsVariable.text
      );
      expect(correctVariableTransformation).to.be.true;
    });
    it("valid RGX method options after step 5 options", () => {
      expect(Object.keys(testIsOptional)).to.have.same.members(step5Keys);
      expect(Object.keys(testIsOptional.and)).to.have.same.members([
        "isCaptured",
      ]);
      expect(Object.keys(testIsOptionalAndCaptured)).to.have.same.members(
        everyStepKeys
      );

      expect(Object.keys(testIsCaptured)).to.have.same.members(step5Keys);
      expect(Object.keys(testIsCaptured.and)).to.have.same.members([
        "isOptional",
        "isVariable",
      ]);
      expect(Object.keys(testIsCapturedAndOptional)).to.have.same.members(
        everyStepKeys
      );
      expect(Object.keys(testIsCapturedAndVariable)).to.have.same.members(
        everyStepKeys
      );

      expect(Object.keys(testIsVariable)).to.have.same.members(step5Keys);
    });
  });
  describe("RGX Final Step - constructor", () => {
    // samples for testing
    const sample = init("sample");
    const sampleConstruct = sample.construct();
    const complexConstruct = init(sample, "2nd sample")
      .or("other option")
      .occurs(5)
      .and.precededBy("before")
      .and.atEnd.and.isCaptured.and.isOptional.construct();

    const sampleVariable = init("var").isVariable;
    const sampleWithVariables = init(
      sampleVariable,
      "some text",
      sampleVariable
    ).construct();

    // rgx-style variables
    const rgxVar1 = "(?<varName>(?:stuff)\\\\k<varName>)";
    const rgxVar2 = "(?<secondVar>(?:text)\\\\k<secondVar>)";
    const rgxVar3 = "(?<thirdVar>(?:(?:last )(?:one))\\\\k<thirdVar>)";

    //rgx-style variables nested in larger regex string
    const singleRGXVariable = rgxVar1 + " and more " + rgxVar1;
    const formattedSingleVariable =
      "(?<varName>(?:stuff)) and more (\\\\k<varName>)";
    const formattedDoubleVariable =
      "(?<varName>(?:stuff)) and (?<secondVar>(?:text)) with another (\\\\k<varName>)";
    const formattedTripleVariable =
      "(?<varName>(?:stuff)) and (?<secondVar>(?:text)) with another (\\\\k<varName>) and yet another (?<thirdVar>(?:(?:last )(?:one))) with (\\\\k<thirdVar>)";
    const doubleRGXVariable =
      rgxVar1 + " and " + rgxVar2 + " with another " + rgxVar1;
    const tripleRGXVariable =
      doubleRGXVariable + " and yet another " + rgxVar3 + " with " + rgxVar3;

    // matching rgx variables
    const matchSingle = getUneditedRegexVariables(singleRGXVariable);
    const matchDouble = getUneditedRegexVariables(doubleRGXVariable);
    const matchTriple = getUneditedRegexVariables(tripleRGXVariable);

    it("valid matching of regex variables", () => {
      expect(getUneditedRegexVariables("")).to.equal(null);

      expect(matchSingle?.length).to.equal(1);
      expect(matchSingle?.[0]).to.equal(rgxVar1);

      expect(matchDouble?.length).to.equal(2);
      expect(matchDouble?.[0]).to.equal(rgxVar1);
      expect(matchDouble?.[1]).to.equal(rgxVar2);

      expect(matchTriple?.length).to.equal(3);
      expect(matchTriple?.[0]).to.equal(rgxVar1);
      expect(matchTriple?.[1]).to.equal(rgxVar2);
      expect(matchTriple?.[2]).to.equal(rgxVar3);
    });

    it("valid formatting of variable replacements", () => {
      const matchSingleReplacements = formatVariableReplacements([rgxVar1]);
      const matchDoubleReplacements = formatVariableReplacements([
        rgxVar1,
        rgxVar2,
      ]);
      const matchTripleReplacements = formatVariableReplacements([
        rgxVar1,
        rgxVar2,
        rgxVar3,
      ]);

      expect(matchSingleReplacements[0].original).to.equal(rgxVar1);
      expect(matchSingleReplacements[0].firstUseEdit).to.equal(
        "(?<varName>(?:stuff))"
      );
      expect(matchSingleReplacements[0].followingUseEdit).to.equal(
        "(\\\\k<varName>)"
      );

      expect(matchDoubleReplacements[1].original).to.equal(rgxVar2);
      expect(matchDoubleReplacements[1].firstUseEdit).to.equal(
        "(?<secondVar>(?:text))"
      );
      expect(matchDoubleReplacements[1].followingUseEdit).to.equal(
        "(\\\\k<secondVar>)"
      );

      expect(matchTripleReplacements[2].original).to.equal(rgxVar3);
      expect(matchTripleReplacements[2].firstUseEdit).to.equal(
        "(?<thirdVar>(?:(?:last )(?:one)))"
      );
      expect(matchTripleReplacements[2].followingUseEdit).to.equal(
        "(\\\\k<thirdVar>)"
      );
    });
    it("valid updates of variables in regex string", () => {
      const formatSingle = formatRGXVariables(singleRGXVariable);
      const formatDouble = formatRGXVariables(doubleRGXVariable);
      const formatTriple = formatRGXVariables(tripleRGXVariable);
      const noVariable = "no variables here";
      const formatNoChanges = formatRGXVariables(noVariable);

      expect(formatSingle).to.equal(formattedSingleVariable);
      expect(formatDouble).to.equal(formattedDoubleVariable);
      expect(formatTriple).to.equal(formattedTripleVariable);
      expect(formatNoChanges).to.equal(noVariable);
    });
    it("valid RegExp formatting", () => {
      expect(`${sampleConstruct}`).to.equal("/(?:sample)/");
      const expectedComplexConstructString =
        "/(?:((?:(?:(?<=(?:before))(?:(?:(?:(?:sample)(?:2nd sample))|(?:other option)){5}))$))?)/";

      expect(`${complexConstruct}`).to.equal(expectedComplexConstructString);
    });
    it("valid conversion of RegExp variable references", () => {
      const stringRegexSample = `${sampleWithVariables}`;
      const expectedVariableConstruct = /\/\(\?:\(\?<.+?>\(\?:var\)\)\(\?:some text\)\(\\\\k<.+?>\)\)\//.test(
        stringRegexSample
      );
      const withoutVariableNames = stringRegexSample.replace(
        /(?<=<).+?(?=>)/g,
        ""
      );
      expect(expectedVariableConstruct).to.be.true;
      expect(withoutVariableNames).to.equal(
        "/(?:(?<>(?:var))(?:some text)(\\\\k<>))/"
      );
    });
    it("valid construction of regex flags", () => {
      // test single flag constructors
      const testDefault = init("sample").construct("");
      const testGlobal = init("sample").construct("g");
      const testIgnoreCase = init("sample").construct("i");
      const testMultiline = init("sample").construct("m");
      const testDotAll = init("sample").construct("s");
      const testUnicode = init("sample").construct("u");
      const testSticky = init("sample").construct("y");

      expect(`${testDefault}`).to.equal("/(?:sample)/");
      expect(testGlobal.global).to.be.true;
      expect(testIgnoreCase.ignoreCase).to.be.true;
      expect(testMultiline.multiline).to.be.true;
      expect(/s$/.test(`${testDotAll}`)).to.be.true;
      expect(testUnicode.unicode).to.be.true;
      expect(testSticky.sticky).to.be.true;

      // test supplied keywords
      const testDefaultKeyWord = init("sample").construct("default");
      const testGlobalKeyWord = init("sample").construct("global");
      const testIgnoreCaseKeyWord = init("sample").construct("ignoreCase");
      const testMultilineKeyWord = init("sample").construct("multiline");
      const testDotAllKeyWord = init("sample").construct("dotAll");
      const testUnicodeKeyWord = init("sample").construct("unicode");
      const testStickyKeyWord = init("sample").construct("sticky");

      expect(`${testDefaultKeyWord}`).to.equal("/(?:sample)/");
      expect(testGlobalKeyWord.global).to.be.true;
      expect(testIgnoreCaseKeyWord.ignoreCase).to.be.true;
      expect(testMultilineKeyWord.multiline).to.be.true;
      expect(/s$/.test(`${testDotAllKeyWord}`)).to.be.true;
      expect(testUnicodeKeyWord.unicode).to.be.true;
      expect(testStickyKeyWord.sticky).to.be.true;

      // test construction of multiple flags
      const testMultipleFlags = init("sample").construct("g", "ignoreCase");
      expect(testMultipleFlags.global).to.be.true;
      expect(testMultipleFlags.ignoreCase).to.be.true;
      expect(testMultipleFlags.unicode).to.be.false;

      // test rejection of invalid flags/ keywords
      expect(() => init("sample").construct("whoops!")).to.throw();
    });
  });
});
