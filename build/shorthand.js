"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const presets_1 = require("./presets");
const init_1 = __importDefault(require("./init"));
const either = (firstOption, secondOption, ...extraOptions) => init_1.default(firstOption).or(secondOption, ...extraOptions);
const oneOrMore = (text, ...extra) => init_1.default(text, ...extra).occursOnceOrMore;
const zeroOrMore = (text, ...extra) => init_1.default(text, ...extra).occursZeroOrMore;
const noOccurenceOf = (text, ...extra) => init_1.default(text, ...extra).doesNotOccur;
const optional = (text, ...extra) => init_1.default(text, ...extra).isOptional;
const upperOrLowerCase = (letter) => {
    const confirmValidLetter = letter.length === 1 && presets_1.lettersWithAnyCase.match(letter);
    if (!confirmValidLetter) {
        throw new Error("Must provide a single upper or lower case letter");
    }
    const upper = letter.toUpperCase();
    const lower = letter.toLowerCase();
    return init_1.default(upper).or(lower);
};
const wrapRGX = (before, after) => (wrappedItem, ...extra) => init_1.default(before, wrappedItem, ...extra, after);
const shorthand = {
    either,
    oneOrMore,
    zeroOrMore,
    noOccurenceOf,
    optional,
    upperOrLowerCase,
    wrapRGX,
};
exports.default = shorthand;
