"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.atEnd = exports.atStart = exports.isVariable = exports.isCaptured = exports.notPrecededBy = exports.precededBy = exports.notFollowedBy = exports.followedBy = exports.convertToGreedySearch = exports.occursBetween = exports.occursZeroOrMore = exports.occursOnceOrMore = exports.occursAtLeast = exports.doesNotOccur = exports.occurs = exports.isOptional = exports.or = exports.parseText = exports.withNonCaptureGrouping = exports.formatRegex = void 0;
const uniqid_1 = __importDefault(require("uniqid"));
// RGX Units //
// user-submitted strings will be formatted to escape special characters
// already formatted strings will be stored in RGX Units to distinguish them
// a combination of user-strings and RGX Units can be submitted
// to text-transform functions and will be parsed before running the function
// format user-submitted strings to escape special characters
exports.formatRegex = (text) => text.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
// wrap regex text in a non-capture grouping
exports.withNonCaptureGrouping = (text) => `(?:${text})`;
exports.parseText = (text) => typeof text === "string"
    ? exports.withNonCaptureGrouping(exports.formatRegex(text))
    : text.text;
const withTextParsing = (func) => (text, newText, ...extra) => {
    const parsedNewText = exports.parseText(newText);
    const parsedExtra = extra.map(exports.parseText);
    return func(text, parsedNewText, ...parsedExtra);
};
exports.or = withTextParsing((text, newText, ...extra) => exports.withNonCaptureGrouping([text, newText, ...extra].join("|"))); // the initial text will already be parsed by the 'init' function
exports.isOptional = (text) => exports.withNonCaptureGrouping(`${text}?`); // add grouping?
exports.occurs = (text, amount) => exports.withNonCaptureGrouping(`${text}{${amount}}`);
exports.doesNotOccur = (text) => exports.withNonCaptureGrouping(`[^${text}]`);
exports.occursAtLeast = (text, min) => exports.withNonCaptureGrouping(`${text}{${min},}`);
exports.occursOnceOrMore = (text) => exports.withNonCaptureGrouping(`${text}+?`);
exports.occursZeroOrMore = (text) => exports.withNonCaptureGrouping(`${text}*?`);
exports.occursBetween = (text, min, max) => exports.withNonCaptureGrouping(`${text}{${min},${max}}`);
// converts lazy searches (+? or *?) to greedy searches (+ or *)
// must be invoked immediately after declaring the
// oneOrMore/ zeroOrMore transformations
exports.convertToGreedySearch = (text) => text.replace(/\?\)$/, ")");
exports.followedBy = withTextParsing((text, following, ...extra) => exports.withNonCaptureGrouping(`${text}${[following, ...extra].map((x) => `(?=${x})`).join("")}`));
exports.notFollowedBy = withTextParsing((text, notFollowing, ...extra) => exports.withNonCaptureGrouping(`${text}${[notFollowing, ...extra].map((x) => `(?!${x})`).join("")}`));
exports.precededBy = withTextParsing((text, preceding, ...extra) => exports.withNonCaptureGrouping(`${[preceding, ...extra].map((x) => `(?<=${x})`).join("")}${text}`));
exports.notPrecededBy = withTextParsing((text, notPreceding, ...extra) => exports.withNonCaptureGrouping(`${[notPreceding, ...extra].map((x) => `(?<!${x})`).join("")}${text}`));
exports.isCaptured = (text) => `(${text})`;
exports.isVariable = (text) => {
    const uniqueName = uniqid_1.default().replace(/[0-9]/g, "");
    return `(?<${uniqueName}>${text}\\\\k<${uniqueName}>)`;
};
exports.atStart = (text) => exports.withNonCaptureGrouping(`^${text}`);
exports.atEnd = (text) => exports.withNonCaptureGrouping(`${text}$`);
const formatText = {
    or: exports.or,
    occurs: exports.occurs,
    doesNotOccur: exports.doesNotOccur,
    occursAtLeast: exports.occursAtLeast,
    occursOnceOrMore: exports.occursOnceOrMore,
    occursZeroOrMore: exports.occursZeroOrMore,
    occursBetween: exports.occursBetween,
    followedBy: exports.followedBy,
    notFollowedBy: exports.notFollowedBy,
    precededBy: exports.precededBy,
    notPrecededBy: exports.notPrecededBy,
    atStart: exports.atStart,
    atEnd: exports.atEnd,
    isOptional: exports.isOptional,
    isCaptured: exports.isCaptured,
    isVariable: exports.isVariable,
};
exports.default = formatText;
