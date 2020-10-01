import { formatRXPVariables } from "./formatVariables";

// accepts the final RXP string and a series of flag markers
// and converts them to a regex literal

// define acceptable flag names for RegExp constructor
const defaultFlag = "";
const defaultFlagKeyWord = "default";
const globalFlag = "g";
const globalFlagKeyWord = "global";
const ignoreCaseFlag = "i";
const ignoreCaseFlagKeyWord = "ignoreCase";
const multilineFlag = "m";
const multilineFlagKeyWord = "multiline";
const dotAllFlag = "s";
const dotAllFlagKeyWord = "dotAll";
const unicodeFlag = "u";
const unicodeFlagKeyWord = "unicode";
const stickyFlag = "y";
const stickyFlagKeyWord = "sticky";

const validFlags = [
  defaultFlag,
  defaultFlagKeyWord,
  globalFlag,
  globalFlagKeyWord,
  ignoreCaseFlag,
  ignoreCaseFlagKeyWord,
  multilineFlag,
  multilineFlagKeyWord,
  dotAllFlag,
  dotAllFlagKeyWord,
  unicodeFlag,
  unicodeFlagKeyWord,
  stickyFlag,
  stickyFlagKeyWord,
];

// confirm requested flag is valid
const validateFlag = (flag: string) => validFlags.includes(flag);
const validateFlags = (flags: string[]) => flags.every(validateFlag);

// convert flag keynames such as 'global' to correct flag "g"
const convertFlagName = (flag: string) => {
  switch (flag) {
    case defaultFlagKeyWord:
      return defaultFlag;
    case globalFlagKeyWord:
      return globalFlag;
    case ignoreCaseFlagKeyWord:
      return ignoreCaseFlag;
    case multilineFlagKeyWord:
      return multilineFlag;
    case dotAllFlagKeyWord:
      return dotAllFlag;
    case unicodeFlagKeyWord:
      return unicodeFlag;
    case stickyFlagKeyWord:
      return stickyFlag;
    default:
      return flag;
  }
};

// apply flag conversion to multiple submitted flags
const constructFlagMarkers = (flags: string[]) =>
  [...new Set(flags.map(convertFlagName))].join("");

// format the text that has been modified by the RXP constructor
// format any requested flags
// and return a regex literal
export const constructRXP = (RXPString: string, flags: string[]): RegExp => {
  if (!validateFlags(flags)) {
    throw new Error(
      `Invalid flag letter/ keyword submitted. Flags must be one of the following: ${validFlags.join(
        ", "
      )}`
    );
  }
  const flagMarkers = constructFlagMarkers(flags);
  const formatWithVariables = formatRXPVariables(RXPString);
  return new RegExp(formatWithVariables, flagMarkers);
};
