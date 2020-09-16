import "mocha";
import { expect } from "chai";
import init, {
  RXPUnit,
  OptionsFromStep3To5,
  RXPBaseUnit,
  getUneditedRegexVariables,
  formatVariableReplacements,
  formatRXPVariables,
} from "../src/init";

// define expected keys for each individual step of the RXP constructor
const everyStepKeys = ["text", "construct"];
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

// group together all expected keys at each step
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
const step5Keys = step4Keys;

// define all possible keys
const allKeys = [
  ...everyStepKeys,
  "and",
  ...onlyStep1Keys,
  ...onlyStep2Keys,
  "isGreedy",
  ...onlyStep3Keys,
  ...onlyStep4Keys,
  ...onlyStep5Keys,
];

// return which keys/ getters are found in an RXP object
// in is used in place of Object.keys(...) to find getters
type RXPUnitOrOptions = RXPUnit | OptionsFromStep3To5;
const findKeysAndGetters = (obj: RXPUnitOrOptions) => {
  return allKeys.filter((key) => key in obj);
};

describe("", () => {
  describe("Initialize RXP unit", () => {
    it("correct escaping of submitted text", () => {
      const initialUnit = init("first step");
      expect(initialUnit.text).to.equal("(?:first step)");
      expect(findKeysAndGetters(initialUnit)).to.have.same.members(step1Keys);
    });
    it("correct formatting of regex literal to string", () => {
      expect(init(/regex\.\?/g).text).to.equal("(?:regex\\.\\?)");
      expect(init("hello", /regex\.\?/g).text).to.equal(
        "(?:(?:hello)(?:regex\\.\\?))"
      );
    });
    it("correct composition of RXP units without additional escaping", () => {
      const sampleRXPUnit = new RXPBaseUnit("(?:pre-escaped sample)");
      const initialUnit = init(sampleRXPUnit);
      expect(initialUnit.text).to.equal("(?:pre-escaped sample)");
      expect(findKeysAndGetters(initialUnit)).to.have.same.members(step1Keys);
    });
  });
  describe("RXP Step 1 - 'or'", () => {
    const testOr = init("sample")
      .or("other sample")
      .or(/third\./s);
    it("valid transformation of text", () => {
      expect(testOr.text).to.equal(
        "(?:(?:(?:sample)|(?:other sample))|(?:third\\.))"
      );
    });
    it("valid RXP method options after 'or'", () => {
      // step 1 is recursive, allowing for additional 'or' methods
      expect(findKeysAndGetters(testOr)).to.have.same.members(step1Keys);
    });
  });
  describe("RXP Step 2 - 'occurs' grouping", () => {
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
    it("valid RXP method options after 'occurs' options", () => {
      expect(findKeysAndGetters(testOccurs)).to.have.same.members(step3Keys);
      expect(findKeysAndGetters(testOccurs.and)).to.have.same.members(
        step3KeysAfterAnd
      );

      expect(findKeysAndGetters(testOccursAtLeast)).to.have.same.members(
        step3Keys
      );
      expect(findKeysAndGetters(testOccursAtLeast.and)).to.have.same.members(
        step3KeysAfterAnd
      );

      expect(findKeysAndGetters(testOccursBetween)).to.have.same.members(
        step3Keys
      );
      expect(findKeysAndGetters(testOccursBetween.and)).to.have.same.members(
        step3KeysAfterAnd
      );

      expect(findKeysAndGetters(testOccursOnceOrMore)).to.have.same.members(
        step3Keys
      );
      expect(
        findKeysAndGetters(testOccursOnceOrMore.and)
      ).to.have.same.members([...step3KeysAfterAnd, "isGreedy"]);

      expect(findKeysAndGetters(testOccursZeroOrMore)).to.have.same.members(
        step3Keys
      );
      expect(
        findKeysAndGetters(testOccursZeroOrMore.and)
      ).to.have.same.members(["isGreedy", ...step3KeysAfterAnd]);

      expect(findKeysAndGetters(testGreedyOnceOrMore)).to.have.same.members(
        step3Keys
      );
      expect(findKeysAndGetters(testGreedyOnceOrMore.and)).to.have.same.members(
        step3KeysAfterAnd
      );

      expect(findKeysAndGetters(testGreedyZeroOrMore)).to.have.same.members(
        step3Keys
      );
      expect(findKeysAndGetters(testGreedyZeroOrMore.and)).to.have.same.members(
        step3KeysAfterAnd
      );

      expect(findKeysAndGetters(testDoesNotOccur)).to.have.same.members([
        ...everyStepKeys,
        "and",
      ]);
      expect(findKeysAndGetters(testDoesNotOccur.and)).to.have.same.members(
        onlyStep4Keys
      );
    });
  });
  describe("RXP Step 3 - 'surrounding' grouping", () => {
    const sample = init("sample");
    const testPrecededBy = sample.precededBy("before");
    const testNotPrecededBy = sample.notPrecededBy(/not before/s);
    const testFollowedBy = sample.followedBy("after");
    const testNotFollowedBy = sample.notFollowedBy(/not after/g);
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
    it("valid RXP method options after 'surrounding' options", () => {
      expect(findKeysAndGetters(testPrecededBy)).to.have.same.members(
        step3Keys
      );
      expect(findKeysAndGetters(testNotPrecededBy)).to.have.same.members(
        step3Keys
      );
      expect(findKeysAndGetters(testFollowedBy)).to.have.same.members(
        step3Keys
      );
      expect(findKeysAndGetters(testNotFollowedBy)).to.have.same.members(
        step3Keys
      );

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

      expect(findKeysAndGetters(testPrecededBy.and)).to.have.same.members(
        step3KeysAfterAndWithoutAtStart
      );
      expect(findKeysAndGetters(testNotPrecededBy.and)).to.have.same.members(
        step3KeysAfterAndWithoutAtStart
      );
      expect(findKeysAndGetters(testFollowedBy.and)).to.have.same.members(
        step3KeysAfterAndWithoutAtEnd
      );
      expect(findKeysAndGetters(testNotFollowedBy.and)).to.have.same.members(
        step3KeysAfterAndWithoutAtEnd
      );
      expect(
        findKeysAndGetters(testPrecededBy.and.followedBy("after").and)
      ).to.have.same.members(step3KeysAfterAndWithoutStep4);
    });
  });
  describe("RXP Step 4 - atStart, atEnd", () => {
    const sample = init("sample");
    const testAtStart = sample.atStart;
    const testAtEnd = sample.atEnd;
    it("valid transformation of text", () => {
      expect(testAtStart.text).to.equal("(?:^(?:sample))");
      expect(testAtEnd.text).to.equal("(?:(?:sample)$)");
    });
    it("valid RXP method options after step 4 options", () => {
      expect(findKeysAndGetters(testAtStart)).to.have.same.members(step4Keys);
      expect(findKeysAndGetters(testAtStart.and)).to.have.same.members(
        onlyStep5Keys
      );
      expect(findKeysAndGetters(testAtEnd)).to.have.same.members(step4Keys);
      expect(findKeysAndGetters(testAtEnd.and)).to.have.same.members(
        onlyStep5Keys
      );
    });
  });
  describe("RXP Step 5 - settings", () => {
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
    it("valid RXP method options after step 5 options", () => {
      expect(findKeysAndGetters(testIsOptional)).to.have.same.members(
        step5Keys
      );
      expect(typeof testIsOptional.and.isCaptured.text).to.equal("string");
      expect(
        findKeysAndGetters(testIsOptionalAndCaptured)
      ).to.have.same.members(everyStepKeys);

      expect(findKeysAndGetters(testIsCaptured)).to.have.same.members(
        step5Keys
      );
      expect(typeof testIsCaptured.and.isOptional.text).to.equal("string");
      expect(typeof testIsCaptured.and.isVariable.text).to.equal("string");
      expect(
        findKeysAndGetters(testIsCapturedAndOptional)
      ).to.have.same.members(everyStepKeys);
      expect(
        findKeysAndGetters(testIsCapturedAndVariable)
      ).to.have.same.members(everyStepKeys);

      expect(findKeysAndGetters(testIsVariable)).to.have.same.members(
        step5Keys
      );
    });
  });
  describe("RXP Final Step - constructor", () => {
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

    // RXP-style variables
    const RXPVar1 = "(?<varName>(?:stuff)\\\\k<varName>)";
    const RXPVar2 = "(?<secondVar>(?:text)\\\\k<secondVar>)";
    const RXPVar3 = "(?<thirdVar>(?:(?:last )(?:one))\\\\k<thirdVar>)";

    //RXP-style variables nested in larger regex string
    const singleRXPVariable = RXPVar1 + " and more " + RXPVar1;
    const formattedSingleVariable =
      "(?<varName>(?:stuff)) and more (\\\\k<varName>)";
    const formattedDoubleVariable =
      "(?<varName>(?:stuff)) and (?<secondVar>(?:text)) with another (\\\\k<varName>)";
    const formattedTripleVariable =
      "(?<varName>(?:stuff)) and (?<secondVar>(?:text)) with another (\\\\k<varName>) and yet another (?<thirdVar>(?:(?:last )(?:one))) with (\\\\k<thirdVar>)";
    const doubleRXPVariable =
      RXPVar1 + " and " + RXPVar2 + " with another " + RXPVar1;
    const tripleRXPVariable =
      doubleRXPVariable + " and yet another " + RXPVar3 + " with " + RXPVar3;

    // matching RXP variables
    const matchSingle = getUneditedRegexVariables(singleRXPVariable);
    const matchDouble = getUneditedRegexVariables(doubleRXPVariable);
    const matchTriple = getUneditedRegexVariables(tripleRXPVariable);

    it("valid matching of regex variables", () => {
      expect(getUneditedRegexVariables("")).to.equal(null);

      expect(matchSingle?.length).to.equal(1);
      expect(matchSingle?.[0]).to.equal(RXPVar1);

      expect(matchDouble?.length).to.equal(2);
      expect(matchDouble?.[0]).to.equal(RXPVar1);
      expect(matchDouble?.[1]).to.equal(RXPVar2);

      expect(matchTriple?.length).to.equal(3);
      expect(matchTriple?.[0]).to.equal(RXPVar1);
      expect(matchTriple?.[1]).to.equal(RXPVar2);
      expect(matchTriple?.[2]).to.equal(RXPVar3);
    });

    it("valid formatting of variable replacements", () => {
      const matchSingleReplacements = formatVariableReplacements([RXPVar1]);
      const matchDoubleReplacements = formatVariableReplacements([
        RXPVar1,
        RXPVar2,
      ]);
      const matchTripleReplacements = formatVariableReplacements([
        RXPVar1,
        RXPVar2,
        RXPVar3,
      ]);

      expect(matchSingleReplacements[0].original).to.equal(RXPVar1);
      expect(matchSingleReplacements[0].firstUseEdit).to.equal(
        "(?<varName>(?:stuff))"
      );
      expect(matchSingleReplacements[0].followingUseEdit).to.equal(
        "(\\\\k<varName>)"
      );

      expect(matchDoubleReplacements[1].original).to.equal(RXPVar2);
      expect(matchDoubleReplacements[1].firstUseEdit).to.equal(
        "(?<secondVar>(?:text))"
      );
      expect(matchDoubleReplacements[1].followingUseEdit).to.equal(
        "(\\\\k<secondVar>)"
      );

      expect(matchTripleReplacements[2].original).to.equal(RXPVar3);
      expect(matchTripleReplacements[2].firstUseEdit).to.equal(
        "(?<thirdVar>(?:(?:last )(?:one)))"
      );
      expect(matchTripleReplacements[2].followingUseEdit).to.equal(
        "(\\\\k<thirdVar>)"
      );
    });
    it("valid updates of variables in regex string", () => {
      const formatSingle = formatRXPVariables(singleRXPVariable);
      const formatDouble = formatRXPVariables(doubleRXPVariable);
      const formatTriple = formatRXPVariables(tripleRXPVariable);
      const noVariable = "no variables here";
      const formatNoChanges = formatRXPVariables(noVariable);

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
