import { parseText, formatRegex } from "./formatText";

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

export const isVariable = (text: string, variableName: string): string => {
  if (variableName.length === 0) {
    throw new Error(
      "regex variable names must have at least one character and not be an empty string"
    );
  }
  return `(?<${variableName}>${text}\\k<${variableName}>)`;
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

////////////convert regex literal var to rxp var////////////

// find the initial "(?<varName>" patterns of a regex variable
// and return each starting index
export const findRegexVarStartingIndices = (
  text: string
): number[] | undefined =>
  text.match(/\(\?<.+?>/g)?.map((match) => text.indexOf(match));

// search for the closing parentheses, avoiding any nested () groups
// currentIndex needs to start at the index after the first "("
// i.e. "hi( there)" would be 3
type FindCP = (
  text: string,
  currentIndex: number,
  nestedAmount: number
) => FindCP | number | false;

const findCP: FindCP = (text, currentIndex, nestedAmount) => {
  if (text[currentIndex] === "(") {
    return findCP(text, currentIndex + 1, nestedAmount + 1);
  } else if (text[currentIndex] === ")") {
    if (nestedAmount > 0) {
      return findCP(text, currentIndex + 1, nestedAmount - 1);
    } else {
      return currentIndex;
    }
  } else if (text.length > currentIndex + 1) {
    return findCP(text, currentIndex + 1, nestedAmount);
  } else {
    return false;
  }
};

// take the starting index of the variable match
// move to the next possible spot and start the recursive search function
export const findClosingParentheses = (
  text: string,
  startingIndex: number
): FindCP | number | false => findCP(text, startingIndex + 1, 0);

// format data for regex variable replacements
export class RegexVariableData {
  variableName: string;
  replacePattern: RegExp;
  RXPVersion: string;

  constructor(text: string, startIndex: number, closeIndex: number) {
    const varFirstUse = text.slice(startIndex, closeIndex + 1);
    const varName = varFirstUse.replace(/\(\?</, "").replace(/>.+/, "");
    const subsequentUse = `\\k<${varName}>`;

    const formattedFirstUse = formatRegex(varFirstUse);
    const formattedSubsequentUse = formatRegex(subsequentUse);

    const replacePattern = new RegExp(
      `(${formattedFirstUse})|(\\(${formattedSubsequentUse}\\))|(${formattedSubsequentUse})`,
      "g"
    );

    this.variableName = varName;
    this.replacePattern = replacePattern;
    this.RXPVersion =
      varFirstUse.slice(0, varFirstUse.length - 1) + subsequentUse + ")";
  }
}

const updateRegexVars = (text: string, regexVariables: RegexVariableData[]) =>
  regexVariables.reduce(
    (textToEdit, regexVar) =>
      textToEdit.replace(regexVar.replacePattern, regexVar.RXPVersion),
    text
  );

export const convertRegexVarsToRXPVars = (text: string): string => {
  // check for any variables in regex and return starting index for each
  const startingIndices = findRegexVarStartingIndices(text);
  if (startingIndices) {
    // find the closing index for each variable declaration
    const closingIndices = startingIndices.map((i) =>
      findClosingParentheses(text, i)
    );
    // reject with error if unterminated parentheses in regex
    if (closingIndices.includes(false)) {
      throw new Error(
        "The submitted regex has a variable declaration with an unclosed parentheses"
      );
    }
    // format data to update for each regex variable found
    const regexVarData = startingIndices.map(
      (startsAt, i) =>
        new RegexVariableData(
          text,
          startsAt,
          closingIndices[i] as number /* error already thrown if false found */
        )
    );
    // edit regex string to convert regex variables to RXP format
    const formattedRXPVariables = updateRegexVars(text, regexVarData);
    return formattedRXPVariables;
  } else {
    // return unedited text if no variables found
    return text;
  }
};
