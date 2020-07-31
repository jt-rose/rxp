"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.endsWith = exports.startsWith = exports.either = exports.upperOrLower = exports.anyLetterExcept = exports.anyUpperCaseExcept = exports.anyLowerCaseExcept = exports.anyDigitExcept = exports.anyCharacterExcept = exports.nonPrint = exports.anySpecChar = exports.anyLetter = exports.anyUpperCase = exports.anyLowerCase = exports.anyDigit = exports.anyCharacter = exports.optional = exports.atLeast = exports.minMax = exports.repeating = exports.zeroOrMore = exports.oneOrMore = exports.formatRegex = void 0;
const uniqid_1 = __importDefault(require("uniqid"));
// note: assume user not writing regex, but literals, so . is a period, not any
exports.formatRegex = (text) => text.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
exports.oneOrMore = (text) => `(${text})+`;
exports.zeroOrMore = (text) => `(${text})*`;
exports.repeating = (text, counter) => `(${text}){${counter}}`;
exports.minMax = (text, min, max) => `(${text}){${min},${max}}`;
exports.atLeast = (text, min) => `(${text}){${min},}`;
// lazy match for minimal = +?, *?, etc. page 49
// lazy by default?
//"< test < some > more >".replace(/<.+?>/, "")
// text.length > 1 && text.match(/^\(.+\)$/) check for
exports.optional = (text) => `(${text})?`;
// conditionally applied non-capturing grouping when appropriate
const applyGrouping = (text) => text.length > 1 && /^[^(].+[^)]$/.test(text) ? `(?:${text})` : text;
/////// POSITIONING
const lookAhead = (target, followedBy) => `${target}(?=${followedBy})`;
const negateLookAhead = (target, notFollowedBy) => `${target}(?!${notFollowedBy})`;
const lookBehind = (target, precededBy) => `(?<=${precededBy})${target}`;
const negateLookBehind = (target, notPrecededBy) => `(?<!${notPrecededBy})${target}`;
const capture = (text) => `(${text})`; // capture lookahed/ behind?
///// BackReference
const reference = (text) => ({
    text,
    type: "back-reference",
    key: uniqid_1.default(),
});
/*const construct = (...textUnits) => {
    const textObj = textUnits.filter(x => typeof x === "object");
    if (textObj.length > 0) {

    }
}
*/
///////////////////////////////////////////////
/*
const init = (text: string) => ({
  text, // handle grouping automatically? handle escaping?
  or: (...textOptions: string[]) => init([text, ...textOptions].join("|")), // only at text initialization, focus on small rgx units
  and: (...textOptions: string[]) => init([text, ...textOptions].join("")), // only at text initialization, focus on small rgx units
  followedBy: (after: string) => init(`${text}(?=${after})`),
  notFollowedBy: (after: string) => init(`${text}(?!${after})`),
  precededBy: (before: string) => init(`(?<=${before})${text}`),
  notPrecededBy: (before: string) => init(`(?<!${before})${text}`),
  isOptional: () => init(`${text}?`),
  isCaptured: () => init(`(${text})`), // apply conditionally
  occurs: (frequency: number) => init(`${text}{${frequency}}`),
  occursOnceOrMore: () => init(`${text}+`),
  occursZeroOrMore: () => init(`${text}*`),
  occursAtLeast: (min: number) => init(`${text}{${min},}`),
  occursBetween: (min: number, max: number) => init(`${text}{${min}, ${max}}`),
  doesNotOccur: () => init(`[^${text}]`), // will [^[abc]] work?
  asReference: "",
  useReference: "",
  atStart: () => init(`^${text}`),
  atEnd: () => init(`${text}$`), // final option, no init needed, just obj w text
}); // startsWith, endsWith
*/
const createReference = () => ""; // 3 parts - init(unit), ref(var), construct( compose units, possibly including vars)
const or = (text) => (newText, ...extra) => [text, newText, ...extra].join("|"); // rename either
const then = (text) => (newText, ...extra) => [text, newText, ...extra].join(","); // rename alongWith;
const isOptional = (text) => `${text}?`; // add grouping?
const occurs = (text) => (amount) => `${text}{${amount}}`;
const doesNotOccur = (text) => `[^${text}]`;
const occursAtLeast = (text) => (min) => `${text}{${min},}`;
const occursOnceOrMore = (text) => `${text}+`;
const occursZeroOrMore = (text) => `${text}*`;
const occursBetween = (text) => (min, max) => `${text}{${min},${max}}`;
const followedBy = (text) => (following, ...extra) => `${text}${[following, ...extra].map((x) => `(?=${x})`).join("")}`; // grouping still work?
const notFollowedBy = (text) => (notFollowing, ...extra) => `${text}${[notFollowing, ...extra].map((x) => `(?!${x})`).join("")}`;
const precededBy = (text) => (preceding, ...extra) => `${[preceding, ...extra].map((x) => `(?<=${x})`).join("")}${text}`;
const notPrecededBy = (text) => (notPreceding, ...extra) => `${[notPreceding, ...extra].map((x) => `(?<!${x})`).join("")}${text}`;
const isCaptured = (text) => `(${text})`;
const atStart = (text) => `^${text}`; // careful of grouping
const atEnd = (text) => `${text}$`; // careful of grouping;
// escape special characters
exports.formatRegex = (text) => text.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
// create a text object to distinguish between unescaped literal strings 
// and already formatted regex strings
const createTextObj = (text) => ({
    text: exports.formatRegex(text),
    escaped: true,
});
const convertTextObj = (text) => typeof text === "string" ? createTextObj(text) : text;
// map over array of strings | text objects and return array of strings
const parseTextObj = (text, ...extra) => [text, ...extra].map((x) => (typeof x === "string" ? x : x.text));
const parseText = (text) => {
    if (typeof text === "string")
        ;
};
// HOF to parse text objects before running text transformation functions
const parseAndTransform = (func) => (...args) => {
    const parsedText = parseTextObj(...args);
    return {
        text: func(...parsedText),
        escaped: true
    };
};
//////////
const initWith2Args = (func, keyName) => (text, removeKeys) => (newText, ...extra) => {
    init(func(text, newText, ...extra), [...removeKeys, keyName]);
};
const initOr = initWith2Args(or, orKey);
const initializePaths = (text, removeKeys) => (Object.assign({ or: initOr(text, removeKeys) }, validateKey(thenKey) && { then: initThen(text, removeKeys) }));
const rggx = (text, removeKeys) => {
    //validate
    const rx = initializePaths();
    return Object.assign({}, validate && { or: rx.or });
};
////
const applyTextParse = (func) => (text, newText, ...extra) => {
    const parsedText = [text, newText, ...extra].map(x => typeof x === "string" ? exports.formatRegex(text) : text.text);
    return func(...parsedText);
};
/*
interface rgxTextModify
interface rgxContinue
interface rgxBehaviorModify
interface rgxEnd
interface rgxMixed
*/
/////////////////////////
/*
hi => hi\bye => (hi|bye){3} => (hi|bye){3}(?=g'night) => ^(hi|bye){3}(?=g'night) => (^(hi|bye){3}(?=g'night))?
init("hi").or("bye").occurs(3).and.followedBy("g'night").atStart().and.isOptional()
const greetings = init("hi").or("bye").occurs(3).and.followedBy("g'night")
init(greetings).atStart().and.isOptional()
isOptional(atStart(followedBy(occurs(or(startingText, "bye"), 3), "g'night")))
*/
// Define keyNames used to check against when removing already used keys
const orKey = "orKey";
const thenKey = "thenKey";
//const anyOccursKey = "anyOccursKey";
const followedKey = "followedKey";
const notFollowedKey = "notFollowedKey";
const precededKey = "precededKey";
const notPrecededKey = "notPrecededKey";
const startKey = "startKey";
const endKey = "endKey";
const optionalKey = "optionalKey";
const captureKey = "captureKey";
// useRef?
const validateKey = (removeKeys) => (keyName) => !removeKeys.includes(keyName);
const withAnd = (expression) => ({ and: expression }); // use lazyload?
// when accepting rgx unit, will need to check for string (and escape it) or grab unit.text
const formatRegex = (text) => {
    if (typeof text === "string") {
        return escaoe();
    }
    else if (text.escaped) {
        return text;
    }
    else if (text.text.escaped) {
        return text.text;
    }
    else {
        return "err";
    }
};
/*
const init2 = (text: string, removeKeys: string[] = []) => {
  const validate = validateKey(removeKeys);
  return {
    text,
    //step 1
    ...(validate(orKey) && {
      or: (newText: string, ...extra: string[]) =>
        init2(or(text)(newText, ...extra), [...removeKeys, orKey]),
    }), // move to step 2 immmediately?
    ...(validate(thenKey) && {
      then: (newText: string, ...extra: string[]) =>
        init2(then(text)(newText, ...extra), [...removeKeys, thenKey]),
    }),
    //step 2
    occurs: (amount: number) =>
      withAnd(generateSurroundings(occurs(text)(amount), removeKeys)),
    doesNotOccur: () =>
      withAnd(generateSurroundings(doesNotOccur(text), removeKeys)),
    occursOnceOrMore: () =>
      withAnd(generateSurroundings(occursOnceOrMore(text), removeKeys)),
    occursZeroOrMore: () =>
      withAnd(generateSurroundings(occursZeroOrMore(text), removeKeys)),
    occursAtLeast: (min: number) =>
      withAnd(generateSurroundings(occursAtLeast(text)(min), removeKeys)),
    occursBetween: (min: number, max: number) =>
      withAnd(generateSurroundings(occursBetween(text)(min, max), removeKeys)),
    ...generateSurroundings(text, removeKeys),
    //step 3
    ...(validate(followedKey) && {
      followedBy: (newText: string, ...extra: string[]) =>
        withAnd(
          generateSurroundings(followedBy(text)(newText, ...extra), [
            ...removeKeys,
            followedKey,
          ])
        ),
    }),
    ...(validate(notFollowedKey) && {
      notFollowedBy: (newText: string, ...extra: string[]) =>
        withAnd(
          generateSurroundings(notFollowedBy(text)(newText, ...extra), [
            ...removeKeys,
            notFollowedKey,
          ])
        ),
    }),
    ...(validate(precededKey) && {
      precededBy: (newText: string, ...extra: string[]) =>
        withAnd(
          generateSurroundings(precededBy(text)(newText, ...extra), [
            ...removeKeys,
            precededKey,
          ])
        ),
    }),
    ...(validate(notPrecededKey) && {
      notPrecededBy: (newText: string, ...extra: string[]) =>
        withAnd(
          generateSurroundings(notPrecededBy(text)(newText, ...extra), [
            ...removeKeys,
            notPrecededKey,
          ])
        ),
    }),
    //step 4
    ...(validate(startKey) && {
      atStart: withAnd(
        generateBoundaries(atStart(text), [...removeKeys, startKey])
      ),
    }),
    ...(validate(endKey) && {
      atEnd: withAnd(generateSettings(atEnd(text), removeKeys)),
    }),
    //step 5
    ...(validate(optionalKey) && {
      isOptional: withAnd(
        generateSettings(isOptional(text), [...removeKeys, optionalKey])
      ),
    }),
    ...(validate(captureKey) && {
      isCaptured: withAnd(
        generateSettings(isCaptured(text), [...removeKeys, captureKey])
      ),
    }),
  };
};
*/
// step 5
const generateSettings = (text, removeKeys = []) => {
    const textObject = convertTextObj(text);
    const validate = validateKey(removeKeys);
    return Object.assign(Object.assign({ text: textObject }, (validate(optionalKey) && {
        isOptional: withAnd(generateSettings(isOptional(textObject), [...removeKeys, optionalKey])),
    })), (validate(captureKey) && {
        isCaptured: withAnd(generateSettings(isCaptured(textObject), [...removeKeys, captureKey])),
    }));
};
// step 4
const generateBoundaries = (text, removeKeys = []) => {
    const validate = validateKey(removeKeys);
    return Object.assign(Object.assign(Object.assign({}, (validate(startKey) && {
        atStart: withAnd(generateBoundaries(atStart(text), [...removeKeys, startKey])),
    })), (validate(endKey) && {
        atEnd: withAnd(generateSettings(atEnd(text), removeKeys)),
    })), generateSettings(text, removeKeys));
};
// step 3
const generateSurroundings = (text, removeKeys = []) => {
    const validate = validateKey(removeKeys);
    return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (validate(followedKey) && {
        followedBy: (newText, ...extra) => withAnd(generateSurroundings(followedBy(text)(newText, ...extra), [
            ...removeKeys,
            followedKey,
        ])),
    })), (validate(notFollowedKey) && {
        notFollowedBy: (newText, ...extra) => withAnd(generateSurroundings(notFollowedBy(text)(newText, ...extra), [
            ...removeKeys,
            notFollowedKey,
        ])),
    })), (validate(precededKey) && {
        precededBy: (newText, ...extra) => withAnd(generateSurroundings(precededBy(text)(newText, ...extra), [
            ...removeKeys,
            precededKey,
        ])),
    })), (validate(notPrecededKey) && {
        notPrecededBy: (newText, ...extra) => withAnd(generateSurroundings(notPrecededBy(text)(newText, ...extra), [
            ...removeKeys,
            notPrecededKey,
        ])),
    })), generateBoundaries(text, removeKeys));
};
// step 2 - only once occurence definition allowed, immediately move to step 3
const generateOccurences = (text, removeKeys = []) => {
    //const validate = validateKey(removeKeys);
    return Object.assign({ 
        //text,
        occurs: (amount) => withAnd(generateSurroundings(occurs(text)(amount), removeKeys)), doesNotOccur: () => withAnd(generateSurroundings(doesNotOccur(text), removeKeys)), occursOnceOrMore: () => withAnd(generateSurroundings(occursOnceOrMore(text), removeKeys)), occursZeroOrMore: () => withAnd(generateSurroundings(occursZeroOrMore(text), removeKeys)), occursAtLeast: (min) => withAnd(generateSurroundings(occursAtLeast(text)(min), removeKeys)), occursBetween: (min, max) => withAnd(generateSurroundings(occursBetween(text)(min, max), removeKeys)) }, generateSurroundings(text, removeKeys));
};
// step 1
const init /*generateStartingText*/ = (text, removeKeys = []) => {
    // remove default val for removeKeys on steps 2-5
    const validate = validateKey(removeKeys);
    return Object.assign(Object.assign(Object.assign({}, (validate(orKey) && {
        or: (newText, ...extra) => init(or(text)(newText, ...extra), [...removeKeys, orKey]),
    })), (validate(thenKey) && {
        then: (newText, ...extra) => init(then(text)(newText, ...extra), [...removeKeys, thenKey]),
    })), generateOccurences(text, removeKeys));
};
const createRGX = (text) => ({
    text,
    or: (newText, ...extra) => createRGX(or(text)(newText, ...extra)),
    then: (newText, ...extra) => createRGX(then(text)(newText, ...extra)),
    followedBy: (following, ...extra) => createRGX(followedBy(text)(following, ...extra)),
    notFollowedBy: (notFollowing, ...extra) => createRGX(notFollowedBy(text)(notFollowing, ...extra)),
    precededBy: (preceding, ...extra) => createRGX(precededBy(text)(preceding, ...extra)),
    notPrecededBy: (notPreceding, ...extra) => createRGX(notPrecededBy(text)(notPreceding, ...extra)),
    isOptional: () => createRGX(isOptional(text)),
    isCaptured: () => createRGX(isCaptured(text)),
    occurs: (amount) => createRGX(occurs(text)(amount)),
    doesNotOccur: () => createRGX(doesNotOccur(text)),
    occursOnceOrMore: () => createRGX(occursOnceOrMore(text)),
    occursZeroOrMore: () => createRGX(occursZeroOrMore(text)),
    occursAtLeast: (amount) => createRGX(occursAtLeast(text)(amount)),
    occursBetween: (min, max) => createRGX(occursBetween(text)(min, max)),
    atStart: () => createRGX(atStart(text)),
    atEnd: () => createRGX(atEnd(text)),
});
//createRGX("hi").or()
///////////////////////////
// rgx text collections //
//////////////////////////
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
const combineSets = (...sets) => {
    const combination = sets.join("").replace(/[[\]]/g, "");
    return `[${combination}]`;
};
const removeDigitsFromStringTemplate = (regexOptions) => (...exceptions) => {
    const textVersion = exceptions.map((x) => typeof x === "string" ? x : String(x));
    const textToRemove = `[${textVersion.join("")}]`;
    const removalRegex = new RegExp(textToRemove, "g");
    return regexOptions.replace(removalRegex, "");
};
const removeTextFromStringTemplate = (regexOptions) => (...exceptions) => {
    const textToRemove = `[${exceptions.join("")}]`;
    const removalRegex = new RegExp(textToRemove, "g");
    return regexOptions.replace(removalRegex, "");
};
// generate 'except' functions to return filtered collections
exports.anyCharacterExcept = (...args) => `[^${args.map((x) => String(x)).join("")}]`; /// check later
exports.anyDigitExcept = removeDigitsFromStringTemplate(exports.anyDigit);
exports.anyLowerCaseExcept = removeTextFromStringTemplate(exports.anyLowerCase);
exports.anyUpperCaseExcept = removeTextFromStringTemplate(exports.anyUpperCase);
exports.anyLetterExcept = removeTextFromStringTemplate(exports.anyLetter);
// return letter as option for either upper or lower case
exports.upperOrLower = (letter) => {
    const lowerCase = letter.toLowerCase();
    const upperCase = letter.toUpperCase();
    return `[${lowerCase}${upperCase}]`;
};
exports.either = (...texts) => texts.join("|"); // add testing, need ()?
exports.startsWith = (startingText) => `^(${startingText})`;
exports.endsWith = (endingText) => `(${endingText})$`;
//////////////////
// preset regex //
//////////////////
// add later
