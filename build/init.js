"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRGXStep1 = exports.createRGXUnit = exports.formatRGXVariables = exports.updateVariables = exports.updateSubsequentVariables = exports.updateFirstVariableUsage = exports.formatVariableReplacements = exports.getUneditedRegexVariables = void 0;
const formatText_1 = require("./formatText");
// RGX unit at step 1 with all options available
// including AndOptions methods inside of and external to 'and' wrapper
// RGX constructor factory functions
// The RGX constructor contains the base RGX unit
// which stores the modifiable text as a string
// along with a regex 'construct' method
// which are always available and can be passed into other
// RGX units in a composable manner
// The constructor has five steps available:
// step 1 - or - define alternate possible text options
// step 2 - occurs family - define frequency
// step 3 - precededBy/ followedBy - define surrounding text
// step 4 - atStart/ atEnd - check at borders of text
// step 5 - isOptional/ Captured/ Variable - define settings of regex text
// The constructor is opinionated and has some behavior
// designed to avoid errors if possible
// The user may skip to later steps right away but not return to earlier ones
// As the constructor moves through each step, previous steps are removed
// and some future steps may be removed if they would cause issues
// i.e.: combining 'precededBy' and 'atStart' => /^(?<=first)second/
// does not work as may be expected
// the use of intellisense to guide the user based on the above type settings
// makes this much more intuitive and is highly recommended
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
const validateFlag = (flag) => validFlags.includes(flag);
const validateFlags = (flags) => flags.every(validateFlag);
const convertFlagName = (flag) => {
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
const constructFlagMarkers = (flags) => [...new Set(flags.map(convertFlagName))].join("");
const constructRGX = (RGXString, flags) => {
    if (!validateFlags(flags)) {
        throw new Error(`Invalid flag letter/ keyword submitted. Flags must be one of the following: ${validFlags.join(", ")}`);
    }
    const flagMarkers = constructFlagMarkers(flags);
    const formatWithVariables = exports.formatRGXVariables(RGXString);
    return new RegExp(formatWithVariables, flagMarkers);
};
//1. check for variables
//2. if var, map out replacement <names>
//3. use reducer to replace non-first variables with replacement names
/*const regexVariables = RGXString.match(/\(\?<.+?>.+?\)/g);
  if (regexVariables) {
    regexVariables.reduce((previousString, regexVar) => previousString.replace(new RegExp(`(?<=${regexVar}).+${regexVar}`), regexVar.replace(/.+(?=<)/, "").replace(/(?<=>).+/, ""), RGXString)
  }*/
// combine with above?
exports.getUneditedRegexVariables = (RGXString) => {
    const foundVariables = RGXString.match(/\(\?<.+?>.+?\\\\k<.+?>\)/g);
    return foundVariables ? [...new Set(foundVariables)] : null;
};
exports.formatVariableReplacements = (variablesFound) => variablesFound.map((regexVar) => ({
    original: regexVar,
    firstUseEdit: regexVar.replace(/\\\\k<.+?>/, ""),
    followingUseEdit: regexVar.replace(/\?<.+?>.+?(?=\\\\k<.+?>)/, ""),
}));
exports.updateFirstVariableUsage = (RGXString, regexVar) => {
    return regexVar.reduce((currentString, varFound) => {
        return currentString.replace(varFound.original, varFound.firstUseEdit);
    }, RGXString);
};
exports.updateSubsequentVariables = (RGXString, regexVar) => {
    return regexVar.reduce((currentString, varFound) => {
        const searchPattern = new RegExp(formatText_1.parseText(varFound.original), "g");
        return currentString.replace(searchPattern, varFound.followingUseEdit);
    }, RGXString);
};
exports.updateVariables = (RGXString, replacements) => exports.updateSubsequentVariables(exports.updateFirstVariableUsage(RGXString, replacements), replacements);
exports.formatRGXVariables = (RGXString) => {
    const regexVariables = exports.getUneditedRegexVariables(RGXString);
    if (regexVariables) {
        const replacements = exports.formatVariableReplacements(regexVariables);
        return exports.updateVariables(RGXString, replacements);
    }
    else {
        return RGXString;
    }
};
exports.createRGXUnit = (text) => ({
    text,
    escaped: true,
    construct: (...flags) => constructRGX(text, flags),
});
const step5Options = (text) => ({
    isOptional: Object.assign(Object.assign({}, exports.createRGXUnit(formatText_1.isOptional(text))), { and: {
            isCaptured: Object.assign({}, exports.createRGXUnit(formatText_1.isCaptured(formatText_1.isOptional(text)))),
        } }),
    isCaptured: Object.assign(Object.assign({}, exports.createRGXUnit(formatText_1.isCaptured(text))), { and: {
            isOptional: Object.assign({}, exports.createRGXUnit(formatText_1.isOptional(formatText_1.isCaptured(text)))),
            isVariable: Object.assign({}, exports.createRGXUnit(formatText_1.isVariable(formatText_1.isCaptured(text)))),
        } }),
    isVariable: Object.assign(Object.assign({}, exports.createRGXUnit(formatText_1.isVariable(text))), { and: {
            // isCaptured should be initialized before
            isOptional: Object.assign({}, exports.createRGXUnit(formatText_1.isOptional(formatText_1.isVariable(text)))),
        } }),
});
const buildRGXStep5 = (text) => (Object.assign(Object.assign({}, exports.createRGXUnit(text)), { and: step5Options(text) }));
// Branching step 4 options - atStart, atEnd
const step4Options = (text) => ({
    atStart: buildRGXStep5(formatText_1.atStart(text)),
    atEnd: buildRGXStep5(formatText_1.atEnd(text)),
});
const buildRGXStep4WithoutStep5 = (text) => (Object.assign(Object.assign({}, exports.createRGXUnit(text)), { atStart: Object.assign({}, exports.createRGXUnit(formatText_1.atStart(text))), atEnd: Object.assign({}, exports.createRGXUnit(formatText_1.atEnd(text))) }));
// branching step 3 options - precededBy, followedBy
const buildRGXStep3WithoutStep4 = (text) => (Object.assign(Object.assign({}, exports.createRGXUnit(text)), { and: Object.assign({ followedBy: (newText, ...extra) => buildRGXStep3WithoutStep4(formatText_1.followedBy(text, newText, ...extra)), notFollowedBy: (newText, ...extra) => buildRGXStep3WithoutStep4(formatText_1.notFollowedBy(text, newText, ...extra)), precededBy: (newText, ...extra) => buildRGXStep3WithoutStep4(formatText_1.precededBy(text, newText, ...extra)), notPrecededBy: (newText, ...extra) => buildRGXStep3WithoutStep4(formatText_1.notPrecededBy(text, newText, ...extra)) }, step5Options(text)) }));
const buildRGXStep3WithoutAtStart = (text) => (Object.assign(Object.assign({}, exports.createRGXUnit(text)), { and: Object.assign({ followedBy: (newText, ...extra) => buildRGXStep3WithoutStep4(formatText_1.followedBy(text, newText, ...extra)), notFollowedBy: (newText, ...extra) => buildRGXStep3WithoutStep4(formatText_1.notFollowedBy(text, newText, ...extra)), precededBy: (newText, ...extra) => buildRGXStep3WithoutAtStart(formatText_1.precededBy(text, newText, ...extra)), notPrecededBy: (newText, ...extra) => buildRGXStep3WithoutAtStart(formatText_1.notPrecededBy(text, newText, ...extra)), atEnd: buildRGXStep5(formatText_1.atEnd(text)) }, step5Options(text)) }));
const buildRGXStep3WithoutAtEnd = (text) => (Object.assign(Object.assign({}, exports.createRGXUnit(text)), { and: Object.assign({ followedBy: (newText, ...extra) => buildRGXStep3WithoutAtEnd(formatText_1.followedBy(text, newText, ...extra)), notFollowedBy: (newText, ...extra) => buildRGXStep3WithoutAtEnd(formatText_1.notFollowedBy(text, newText, ...extra)), precededBy: (newText, ...extra) => buildRGXStep3WithoutStep4(formatText_1.precededBy(text, newText, ...extra)), notPrecededBy: (newText, ...extra) => buildRGXStep3WithoutStep4(formatText_1.notPrecededBy(text, newText, ...extra)), atStart: buildRGXStep5(formatText_1.atStart(text)) /*buildRGXStep4OnlyAtStart(atStart(text)),*/ }, step5Options(text)) }));
const step3Options = (text) => ({
    followedBy: (newText, ...extra) => buildRGXStep3WithoutAtEnd(formatText_1.followedBy(text, newText, ...extra)),
    notFollowedBy: (newText, ...extra) => buildRGXStep3WithoutAtEnd(formatText_1.notFollowedBy(text, newText, ...extra)),
    precededBy: (newText, ...extra) => buildRGXStep3WithoutAtStart(formatText_1.precededBy(text, newText, ...extra)),
    notPrecededBy: (newText, ...extra) => buildRGXStep3WithoutAtStart(formatText_1.notPrecededBy(text, newText, ...extra)),
});
const buildRGXStep3 = (text) => (Object.assign(Object.assign({}, exports.createRGXUnit(text)), { and: Object.assign(Object.assign(Object.assign({}, step3Options(text)), step4Options(text)), step5Options(text)) }));
// step2.5 options => modify lazy searches to greedy searches
const buildRGXStep3WithGreedyConverter = (text) => (Object.assign(Object.assign({}, exports.createRGXUnit(text)), { and: Object.assign(Object.assign(Object.assign({ isGreedy: buildRGXStep3(formatText_1.convertToGreedySearch(text)) }, step3Options(text)), step4Options(text)), step5Options(text)) }));
// step 2 options - occurs family
const step2Options = (text) => ({
    occurs: (amount) => buildRGXStep3(formatText_1.occurs(text, amount)),
    doesNotOccur: buildRGXStep4WithoutStep5(formatText_1.doesNotOccur(text)),
    occursOnceOrMore: buildRGXStep3WithGreedyConverter(formatText_1.occursOnceOrMore(text)),
    occursZeroOrMore: buildRGXStep3WithGreedyConverter(formatText_1.occursZeroOrMore(text)),
    occursAtLeast: (min) => buildRGXStep3(formatText_1.occursAtLeast(text, min)),
    occursBetween: (min, max) => buildRGXStep3(formatText_1.occursBetween(text, min, max)),
});
// step 1 - or
exports.buildRGXStep1 = (text) => (Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, exports.createRGXUnit(text)), { or: (newText, ...extra) => exports.buildRGXStep1(formatText_1.or(text, newText, ...extra)) }), step2Options(text)), step3Options(text)), step4Options(text)), step5Options(text)));
// initialize RGX constructor, accepting a series
// of unescaped strings or escaped RGX units
// and formatting them before returning step 1 of the constructor
const init = (text, ...extra) => {
    const formattedText = [text, ...extra].map((x) => formatText_1.parseText(x)).join("");
    // apply nonCaptureGrouping if more than one arg given
    const textWithGrouping = extra.length > 0 ? formatText_1.withNonCaptureGrouping(formattedText) : formattedText;
    return exports.buildRGXStep1(textWithGrouping);
};
exports.default = init;
