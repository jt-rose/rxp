"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lettersWithAnyCase = void 0;
const init_1 = require("./init");
const formatText_1 = require("./formatText");
const formatPreset = (presetCharacter) => init_1.buildRGXStep1(formatText_1.withNonCaptureGrouping(presetCharacter));
const formatExcept = (baseString) => (exception, ...extra) => {
    const lettersToRemove = [exception, ...extra].join("");
    const removeRegex = new RegExp(`[${lettersToRemove}]`, "g");
    const updatedBaseString = baseString.replace(removeRegex, "");
    return formatPreset(updatedBaseString);
};
//const formatPresetExcept =
const anyCharacter = formatPreset(".");
const anyCharacterExcept = (exception, ...extra) => {
    const anyExcept = `[^${[exception, ...extra].join("")}]`;
    return init_1.buildRGXStep1(formatText_1.withNonCaptureGrouping(anyExcept));
};
// matches a single character for any digit
const anyDigitString = "[0123456789]";
const anyDigit = formatPreset(anyDigitString);
const anyDigitExcept = formatExcept(anyDigitString);
// matches a single character for any lowercase letter
const lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";
const anyLowerCaseString = `[${lowerCaseLetters}]`;
const anyLowerCase = formatPreset(anyLowerCaseString);
const anyLowerCaseExcept = formatExcept(anyLowerCaseString);
// matches a single character for any uppercase letter
const upperCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const anyUpperCaseString = `[${upperCaseLetters}]`;
const anyUpperCase = formatPreset(anyUpperCaseString);
const anyUpperCaseExcept = formatExcept(anyUpperCaseString);
// matches a single character for any possible letter, lower or upper case
exports.lettersWithAnyCase = lowerCaseLetters + upperCaseLetters;
const anyLetterString = `[${exports.lettersWithAnyCase}]`;
const anyLetter = formatPreset(anyLetterString);
const anyLetterExcept = formatExcept(anyLetterString);
const presets = {
    anyCharacter,
    anyCharacterExcept,
    anyDigit,
    anyDigitExcept,
    anyLowerCase,
    anyLowerCaseExcept,
    anyUpperCase,
    anyUpperCaseExcept,
    anyLetter,
    anyLetterExcept,
};
exports.default = presets;
