import uniqid from "uniqid";
import { parseText } from "./formatText";

// check RXP text for variables and format them correctly
//
// to account for the composable and modular nature of RXP
// regex variables are submitted with both the initial
// and subsequent variable expressions included
// and are formatted once the text is ready to be constructed
//
// for example, a variable will be structured as "(?<var>sample\\\\k<var>)"
// and added to a text however many times are needed
// it will later be transformed to "(?<var>sample)"
// for the initial variable declaration
// and "(\\\\k<var>)" for subsequent uses

export const isVariable = (text: string): string => {
  const uniqueName = uniqid().replace(/[0-9]/g, "");
  return `(?<${uniqueName}>${text}\\k<${uniqueName}>)`;
};

// find each unedited RXP variable
export const getUneditedRegexVariables = (
  RXPString: string
): string[] | null => {
  const foundVariables = RXPString.match(/\(\?<.+?>.+?\\k<.+?>\)/g);
  return foundVariables ? [...new Set(foundVariables)] : null;
};

interface FormattedRegexVariables {
  original: string;
  firstUseEdit: string;
  followingUseEdit: string;
}

// format how each rxp variable should be edited for the final construction
export const formatVariableReplacements = (
  variablesFound: string[]
): FormattedRegexVariables[] =>
  variablesFound.map((regexVar) => ({
    original: regexVar,
    firstUseEdit: regexVar.replace(/\\k<.+?>/, ""),
    followingUseEdit: regexVar.replace(/\?<.+?>.+?(?=\\k<.+?>)/, ""),
  }));

// update the first instance each variable is used
export const updateFirstVariableUsage = (
  RXPString: string,
  regexVar: FormattedRegexVariables[]
): string => {
  return regexVar.reduce((currentString, varFound) => {
    return currentString.replace(varFound.original, varFound.firstUseEdit);
  }, RXPString);
};

// update all subsequent uses of each variable
export const updateSubsequentVariables = (
  RXPString: string,
  regexVar: FormattedRegexVariables[]
): string => {
  return regexVar.reduce((currentString, varFound) => {
    const searchPattern = new RegExp(parseText(varFound.original), "g");
    return currentString.replace(searchPattern, varFound.followingUseEdit);
  }, RXPString);
};

// update first and subsequent variable usages together
export const updateVariables = (
  RXPString: string,
  replacements: FormattedRegexVariables[]
): string =>
  updateSubsequentVariables(
    updateFirstVariableUsage(RXPString, replacements),
    replacements
  );

// receive an RXP string, check for variables, and edit if needed
export const formatRXPVariables = (RXPString: string): string => {
  const regexVariables = getUneditedRegexVariables(RXPString);
  if (regexVariables) {
    const replacements = formatVariableReplacements(regexVariables);
    return updateVariables(RXPString, replacements);
  } else {
    return RXPString;
  }
};
