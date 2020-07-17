"use strict";
// note: assume user not writing regex, but literals, so . is a period, not any
Object.defineProperty(exports, "__esModule", { value: true });
exports.optional = exports.atLeast = exports.minMax = exports.repeating = exports.zeroOrMore = exports.oneOrMore = exports.endsWith = exports.startsWith = exports.either = exports.upperOrLower = exports.anyLetterExcept = exports.anyUpperCaseExcept = exports.anyLowerCaseExcept = exports.anyDigitExcept = exports.anyCharacterExcept = exports.formatRegex = exports.nonPrint = exports.anySpecChar = exports.anyLetter = exports.anyUpperCase = exports.anyLowerCase = exports.anyDigit = exports.anyCharacter = void 0;
// --collection of character types-- //
// matches a single character for any possible character
exports.anyCharacter = "."; // correct when in set []?
// match newLine?
// matches a single character for any number 0 through 9
exports.anyDigit = "[0123456789]";
// matches a single character for any lowercase letter
exports.anyLowerCase = "[abcdefghijklmnopqrstuvwxyz]";
// matches a single character for any uppercase letter
exports.anyUpperCase = "[ABCDEFGHIJKLMNOPQRSTUVWXYZ]";
// matches a single character for any possible letter, lower or upper case
exports.anyLetter = "[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ]";
// matches a single character for any special character that must be escaped
// eslint-disable-next-line no-useless-escape
exports.anySpecChar = /[.*+\-?^${}()|[\]\\]/; //"[.*+-?^${}()|[\]\\]";
var anyTextFormat = "[!&()_-;:'\",.<>?]";
var anyOther = "[`~!@#$%^&*()-_=+[]|{};:'\",<.>/?\\]"; // just use except with both letters and digits?
exports.nonPrint = {
    // rename 'whitespace'? // add testing
    backspace: "[\b]",
    formFeed: "\f",
    lineFeed: "\n",
    carriageReturn: "\r",
    tab: "\t",
    verticalTab: "\v",
};
var backspace = "[\b]";
var formFeed = "[\f]";
var lineFeed = "[\n]";
var carriageReturn = "[\r]";
var tab = "[\t]";
var verticalTab = "[\v]";
var anyHexadecimal = "[abcdefABCDEF0123456789]";
var combineSets = function () {
    var sets = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sets[_i] = arguments[_i];
    }
    var combination = sets.join("").replace(/[[\]]/g, "");
    return "[" + combination + "]";
};
// func to generate [] options submitted by user
// check later
exports.formatRegex = function (text) {
    return text.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
}; // $& means the whole matched string
var removeDigitsFromStringTemplate = function (regexOptions) { return function () {
    var exceptions = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        exceptions[_i] = arguments[_i];
    }
    var textVersion = exceptions.map(function (x) {
        return typeof x === "string" ? x : String(x);
    });
    var textToRemove = "[" + textVersion.join("") + "]";
    var removalRegex = new RegExp(textToRemove, "g");
    return regexOptions.replace(removalRegex, "");
}; };
var removeTextFromStringTemplate = function (regexOptions) { return function () {
    var exceptions = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        exceptions[_i] = arguments[_i];
    }
    var textToRemove = "[" + exceptions.join("") + "]";
    var removalRegex = new RegExp(textToRemove, "g");
    return regexOptions.replace(removalRegex, "");
}; };
// generate 'except' functions to return filtered collections
exports.anyCharacterExcept = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return "[^" + args.map(function (x) { return String(x); }).join("") + "]";
}; /// check later
exports.anyDigitExcept = removeDigitsFromStringTemplate(exports.anyDigit);
exports.anyLowerCaseExcept = removeTextFromStringTemplate(exports.anyLowerCase);
exports.anyUpperCaseExcept = removeTextFromStringTemplate(exports.anyUpperCase);
exports.anyLetterExcept = removeTextFromStringTemplate(exports.anyLetter);
// return letter as option for either upper or lower case
exports.upperOrLower = function (letter) {
    var lowerCase = letter.toLowerCase();
    var upperCase = letter.toUpperCase();
    return "[" + lowerCase + upperCase + "]";
};
exports.either = function () {
    var texts = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        texts[_i] = arguments[_i];
    }
    return texts.join("|");
}; // add testing, need ()?
exports.startsWith = function (startingText) { return "^(" + startingText + ")"; };
exports.endsWith = function (endingText) { return "(" + endingText + ")$"; };
exports.oneOrMore = function (text) { return "(" + text + ")+"; };
exports.zeroOrMore = function (text) { return "(" + text + ")*"; };
exports.repeating = function (text, counter) { return "(" + text + "){" + counter + "}"; };
exports.minMax = function (text, min, max) { return "(" + text + "){" + min + "," + max + "}"; };
exports.atLeast = function (text, min) { return "(" + text + "){" + min + ",}"; };
// lazy match for minimal = +?, *?, etc. page 49
// lazy by default?
//"< test < some > more >".replace(/<.+?>/, "")
exports.optional = function (text) { return "(" + text + ")?"; };
/////// POSITIONING
