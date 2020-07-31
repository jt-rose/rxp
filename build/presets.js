"use strict";
//////////////////
// rgx presets //
/////////////////
Object.defineProperty(exports, "__esModule", { value: true });
exports.upperOrLower = exports.anyLetterExcept = exports.anyUpperCaseExcept = exports.anyLowerCaseExcept = exports.anyDigitExcept = exports.anyCharacterExcept = exports.nonPrint = exports.anySpecChar = exports.anyLetter = exports.anyUpperCase = exports.anyLowerCase = exports.anyDigit = exports.anyCharacter = void 0;
const createTextObj = (text) => ({
    text,
    escaped: true,
});
// matches a single character for any possible character
exports.anyCharacter = createTextObj("."); // correct when in set []?
// match newLine?
// matches a single character for any number 0 through 9
exports.anyDigit = createTextObj("[0123456789]");
// matches a single character for any lowercase letter
exports.anyLowerCase = createTextObj("[abcdefghijklmnopqrstuvwxyz]");
// matches a single character for any uppercase letter
exports.anyUpperCase = createTextObj("[ABCDEFGHIJKLMNOPQRSTUVWXYZ]");
// matches a single character for any possible letter, lower or upper case
exports.anyLetter = createTextObj("[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ]");
// matches a single character for any special character that must be escaped
// eslint-disable-next-line no-useless-escape
exports.anySpecChar = /[.*+\-?^${}()|[\]\\]/; //"[.*+-?^${}()|[\]\\]";
const anyTextFormat = "[!&()_-;:'\",.<>?]";
const anyOther = "[`~!@#$%^&*()-_=+[]|{};:'\",<.>/?\\]"; // just use except with both letters and digits?
exports.nonPrint = {
    // rename 'whitespace'? // add testing
    backspace: "[\b]",
    formFeed: "\f",
    lineFeed: "\n",
    carriageReturn: "\r",
    tab: "\t",
    verticalTab: "\v",
};
const wordBoundary = "\b";
const nonWordBoundary = "B"; // better name, used in js?
// backreferences - 70
// use multiline ?m
// boundaries - 52
// 63
const anyHexadecimal = "[abcdefABCDEF0123456789]";
const removeDigits = (rgxPreset) => (...exceptions) => {
    const textVersion = exceptions.map((x) => typeof x === "string" ? x : String(x));
    const textToRemove = `[${textVersion.join("")}]`;
    const removalRegex = new RegExp(textToRemove, "g");
    return createTextObj(rgxPreset.text.replace(removalRegex, ""));
};
const removeText = (rgxPreset) => (...exceptions) => {
    const textToRemove = `[${exceptions.join("")}]`;
    const removalRegex = new RegExp(textToRemove, "g");
    return createTextObj(rgxPreset.text.replace(removalRegex, ""));
};
// generate 'except' functions to return filtered collections
exports.anyCharacterExcept = (...args) => createTextObj(`[^${args.map((x) => String(x)).join("")}]`); /// check later
exports.anyDigitExcept = removeDigits(exports.anyDigit);
exports.anyLowerCaseExcept = removeText(exports.anyLowerCase);
exports.anyUpperCaseExcept = removeText(exports.anyUpperCase);
exports.anyLetterExcept = removeText(exports.anyLetter);
// return letter as option for either upper or lower case
exports.upperOrLower = (letter) => {
    const lowerCase = letter.toLowerCase();
    const upperCase = letter.toUpperCase();
    return createTextObj(`[${lowerCase}${upperCase}]`);
};
// add anyLetterUpTo/ between functions?
const presets = {
    anyCharacter: exports.anyCharacter,
    anyCharacterExcept: exports.anyCharacterExcept,
    anyDigit: exports.anyDigit,
    anyDigitExcept: exports.anyDigitExcept,
    anyUpperCase: exports.anyUpperCase,
    anyUpperCaseExcept: exports.anyUpperCaseExcept,
    anyLowerCase: exports.anyLowerCase,
    anyLowerCaseExcept: exports.anyLowerCaseExcept,
    anyLetter: exports.anyLetter,
    anyLetterExcept: exports.anyLetterExcept,
    anyHexadecimal,
    upperOrLower: exports.upperOrLower,
};
exports.default = presets;
