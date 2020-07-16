"use strict";
// --collection of character types-- //
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.anyDigit = void 0;
// matches a single character for any possible character
var anyCharacter = "."; // correct when in set []?
// matches a single character for any number 0 through 9
exports.anyDigit = "[0123456789]";
// matches a single character for any lowercase letter
var anyLowerCase = "[abcdefghijklmnopqrstuvwxyz]";
// matches a single character for any uppercase letter
var anyUpperCase = "[ABCDEFGHIJKLMNOPQRSTUVWXYZ]";
// matches a single character for any possible letter, lower or upper case
var anyLetter = "[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ]";
var backspaceChar = "[\b]";
var formFeedChar = "[\f]";
var lineFeedChar = "[\n]";
var carriageReturnChar = "[\r]";
var tabChar = "[\t]";
var verticalTabChar = "[\f]";
var whitespaceChar = "[\f\n\r\t\v]";
var anyHexadecimal = "[abcdefABCDEF0123456789]";
var combineSets = function () {
    var sets = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sets[_i] = arguments[_i];
    }
    var combination = sets.join("").replace(/[[\]]/g, "");
    return "[" + combination + "]";
};
// check later
var formatForRegex = function (text) {
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
var anyCharacterExcept = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return "[^" + args.join("") + "]";
}; /// check later
var anyDigitExcept = removeDigitsFromStringTemplate(exports.anyDigit);
var anyLowerCaseExcept = removeTextFromStringTemplate(anyLowerCase);
var anyUpperCaseExcept = removeTextFromStringTemplate(anyUpperCase);
var anyLetterExcept = removeTextFromStringTemplate(anyLetter);
// return letter as option for either upper or lower case
var upperOrLower = function (letter) {
    var lowerCase = letter.toLowerCase();
    var upperCase = letter.toUpperCase();
    return "[" + lowerCase + upperCase + "]";
};
// matches a single character for any special character
var anySpecChar = /[!]/; //add later
var startsWith = function (startingText) { return "^" + startingText; }; // add later
var endsWith = function (endingText) { return "" + endingText; }; // add later
var getRange = function (targetLength, array) {
    if (array === void 0) { array = []; }
    var arrayLength = array.length;
    if (arrayLength === targetLength) {
        return array;
    }
    else {
        var updatedArray = __spreadArrays(array, [arrayLength]);
        return getRange(targetLength, updatedArray);
    }
};
var repeat = function (text, counter) {
    return getRange(counter)
        .map(function () { return text; })
        .join("");
};
// anythingBut
// excluding
/////// POSITIONING
var oneOrMore = function (character) { return character + "+"; };
var zeroOrMore = function (character) { return character + "*"; };
var zeroOrOne = function (character) { return character + "?"; }; // rename "optional"?
// consecutiveMatch
var consecutiveMatch = function (character, counter) {
    return character + "{" + counter + "}";
};
var rangeMatch = function (character, min, max) {
    return character + "{" + min + "," + max + "}";
};
// upTo {0,3} ?
var atLeast = function (character, min) { return character + "{" + min + ",}"; };
// lazy match for iminimal = +?, *?, etc. page 49
// lazy by default?
//"< test < some > more >".replace(/<.+?>/, "")
// findAt
/*
// format:
// construct regex as declarative string:
 const fourNumbers = repeat(anyNumber, 4)
 const fourNumbersWithPossibleDash = maybe("-") + fourNumbers
 const creditCard = rgx.construct(
    
    fourNumbersWithPossibleDash,
    fourNumbersWithPossibleDash,
    fourNumbersWithPossibleDash,
    fourNumbers
)
*/
//tests
//credit card
//lastName, firstName
// this.email@address.com
// lots!of*special[]characters^
// ssn
// every 5th char is x
// excludes specified
