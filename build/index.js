"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapRGX = exports.upperOrLowerCase = exports.optional = exports.noOccurenceOf = exports.zeroOrMore = exports.oneOrMore = exports.either = exports.anyLetterExcept = exports.anyLetter = exports.anyUpperCaseExcept = exports.anyUpperCase = exports.anyLowerCaseExcept = exports.anyLowerCase = exports.anyDigitExcept = exports.anyDigit = exports.anyCharacterExcept = exports.anyCharacter = exports.shorthand = exports.presets = exports.init = void 0;
const init_1 = __importDefault(require("./init"));
exports.init = init_1.default;
const presets_1 = __importDefault(require("./presets"));
exports.presets = presets_1.default;
const shorthand_1 = __importDefault(require("./shorthand"));
exports.shorthand = shorthand_1.default;
const RGX = {
    init: init_1.default,
    presets: presets_1.default,
    shorthand: shorthand_1.default,
};
exports.default = RGX;
// destructure presets and shorthand and provide for export as well
const { anyCharacter, anyCharacterExcept, anyDigit, anyDigitExcept, anyLowerCase, anyLowerCaseExcept, anyUpperCase, anyUpperCaseExcept, anyLetter, anyLetterExcept, } = presets_1.default;
exports.anyCharacter = anyCharacter;
exports.anyCharacterExcept = anyCharacterExcept;
exports.anyDigit = anyDigit;
exports.anyDigitExcept = anyDigitExcept;
exports.anyLowerCase = anyLowerCase;
exports.anyLowerCaseExcept = anyLowerCaseExcept;
exports.anyUpperCase = anyUpperCase;
exports.anyUpperCaseExcept = anyUpperCaseExcept;
exports.anyLetter = anyLetter;
exports.anyLetterExcept = anyLetterExcept;
const { either, oneOrMore, zeroOrMore, noOccurenceOf, optional, upperOrLowerCase, wrapRGX, } = shorthand_1.default;
exports.either = either;
exports.oneOrMore = oneOrMore;
exports.zeroOrMore = zeroOrMore;
exports.noOccurenceOf = noOccurenceOf;
exports.optional = optional;
exports.upperOrLowerCase = upperOrLowerCase;
exports.wrapRGX = wrapRGX;
