"use strict";
// Text Objects
// user-submitted strings will be formatted to escape special characters
// already formatted strings will be stored in text objects to distinguish them
// a combination of user-strings and text objects can be submitted to text-transformation functions
// so these will be parsed before running the function
Object.defineProperty(exports, "__esModule", { value: true });
exports.atEnd = exports.atStart = exports.isCaptured = exports.notPrecededBy = exports.precededBy = exports.notFollowedBy = exports.followedBy = exports.occursBetween = exports.occursZeroOrMore = exports.occursOnceOrMore = exports.occursAtLeast = exports.doesNotOccur = exports.occurs = exports.isOptional = exports.then = exports.or = exports.parseText = exports.formatRegex = void 0;
// format user-submitted strings to escape special characters
exports.formatRegex = (text) => text.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
exports.parseText = (text) => typeof text === "string" ? exports.formatRegex(text) : text.text;
const withTextParsing = (func) => (text, newText, ...extra) => {
    const parsedNewText = exports.parseText(newText);
    const parsedExtra = extra.map(exports.parseText);
    return func(text, parsedNewText, ...parsedExtra);
};
exports.or = withTextParsing((text, newText, ...extra) => [text, newText, ...extra].join("|"));
exports.then = withTextParsing((text, newText, ...extra) => [text, newText, ...extra].join(","));
exports.isOptional = (text) => `${text}?`; // add grouping?
exports.occurs = (text, amount) => `${text}{${amount}}`;
exports.doesNotOccur = (text) => `[^${text}]`;
exports.occursAtLeast = (text, min) => `${text}{${min},}`;
exports.occursOnceOrMore = (text) => `${text}+`;
exports.occursZeroOrMore = (text) => `${text}*`;
exports.occursBetween = (text, min, max) => `${text}{${min},${max}}`;
exports.followedBy = withTextParsing((text, following, ...extra) => `${text}${[following, ...extra].map((x) => `(?=${x})`).join("")}`); // grouping still work?
exports.notFollowedBy = withTextParsing((text, notFollowing, ...extra) => `${text}${[notFollowing, ...extra].map((x) => `(?!${x})`).join("")}`);
exports.precededBy = withTextParsing((text, preceding, ...extra) => `${[preceding, ...extra].map((x) => `(?<=${x})`).join("")}${text}`);
exports.notPrecededBy = withTextParsing((text, notPreceding, ...extra) => `${[notPreceding, ...extra].map((x) => `(?<!${x})`).join("")}${text}`);
exports.isCaptured = (text) => `(${text})`;
exports.atStart = (text) => `^${text}`; // careful of grouping
exports.atEnd = (text) => `${text}$`; // careful of grouping;
const formatText = {
    then: exports.then,
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
};
exports.default = formatText;
