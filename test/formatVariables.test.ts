import uniqid from "uniqid";
import "mocha";
import { expect } from "chai";
import {
  isVariable,
  getUneditedRegexVariables,
  formatVariableReplacements,
  formatRXPVariables,
  convertRegexVarsToRXPVars,
} from "../src/formatVariables";
import { convertRegexToString } from "../src/formatText";

describe("Format and parse regex variables", () => {
  it("render text with variable marker", () => {
    const RXPVariable = isVariable("text", uniqid().replace(/[0-9]/g, ""));
    const testVariableFormatting = /\(\?<.+?>text\\k<.+?>\)/.test(RXPVariable);
    expect(testVariableFormatting).to.be.true;

    const namedRXPVar = isVariable("text", "varName");
    expect(namedRXPVar).to.equal("(?<varName>text\\k<varName>)");

    expect(() => isVariable("text", "")).to.throw();
  });
  // RXP-style variables
  const RXPVar1 = "(?<varName>stuff\\k<varName>)";
  const RXPVar2 = "(?<secondVar>text\\k<secondVar>)";
  const RXPVar3 = "(?<thirdVar>last one\\k<thirdVar>)";

  //RXP-style variables nested in larger regex string
  const singleRXPVariable = RXPVar1 + " and more " + RXPVar1;
  const formattedSingleVariable = "(?<varName>stuff) and more (\\k<varName>)";
  const formattedDoubleVariable =
    "(?<varName>stuff) and (?<secondVar>text) with another (\\k<varName>)";
  const formattedTripleVariable =
    "(?<varName>stuff) and (?<secondVar>text) with another (\\k<varName>) and yet another (?<thirdVar>last one) with (\\k<thirdVar>)";
  const doubleRXPVariable =
    RXPVar1 + " and " + RXPVar2 + " with another " + RXPVar1;
  const tripleRXPVariable =
    doubleRXPVariable + " and yet another " + RXPVar3 + " with " + RXPVar3;

  // matching RXP variables
  const matchSingle = getUneditedRegexVariables(singleRXPVariable);
  const matchDouble = getUneditedRegexVariables(doubleRXPVariable);
  const matchTriple = getUneditedRegexVariables(tripleRXPVariable);

  it("valid matching of rxp variables", () => {
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
      "(?<varName>stuff)"
    );
    expect(matchSingleReplacements[0].followingUseEdit).to.equal(
      "(\\k<varName>)"
    );

    expect(matchDoubleReplacements[1].original).to.equal(RXPVar2);
    expect(matchDoubleReplacements[1].firstUseEdit).to.equal(
      "(?<secondVar>text)"
    );
    expect(matchDoubleReplacements[1].followingUseEdit).to.equal(
      "(\\k<secondVar>)"
    );

    expect(matchTripleReplacements[2].original).to.equal(RXPVar3);
    expect(matchTripleReplacements[2].firstUseEdit).to.equal(
      "(?<thirdVar>last one)"
    );
    expect(matchTripleReplacements[2].followingUseEdit).to.equal(
      "(\\k<thirdVar>)"
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
  it("convert user-submitted regex variables to RXP variables", () => {
    const regexVar = convertRegexToString(
      /(?<var1>(\w{3})) is (?<var2>((\d){3})-test) (and) \k<var2> with \k<var1>/g
    );

    const testConvert = convertRegexVarsToRXPVars(regexVar);
    expect(testConvert).to.equal(
      "(?<var1>(\\w{3})\\k<var1>) is (?<var2>((\\d){3})-test\\k<var2>) (and) (?<var2>((\\d){3})-test\\k<var2>) with (?<var1>(\\w{3})\\k<var1>)"
    );
  });
});
