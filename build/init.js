"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formatText_1 = require("./formatText");
// Generate tiers of options, removing option sets
// as unit constructor progresses
//
// also remove individual options from each tier
// after they have already been implemented
//
// dynamically inject "and" into object syntax to improve readability
// keys
// keys are used to track which pathways are still viable
// when generating the declarative syntax object
// keys passed to the removeKeys array will be removed from the current object
// Define keyNames used to check against when removing already used keys
const orKey = "orKey";
const thenKey = "thenKey";
//const anyOccursKey = "anyOccursKey";
const followedByKey = "followedByKey";
const notFollowedByKey = "notFollowedByKey";
const precededByKey = "precededByKey";
const notPrecededByKey = "notPrecededByKey";
const atStartKey = "atStartKey";
const atEndKey = "atEndKey";
const isOptionalKey = "isOptionalKey";
const isCapturedKey = "isCapturedKey";
// useRef?
// check if any optional path should be removed
const validateKey = (removeKeys) => (key) => !removeKeys.includes(key);
// step 1
const generateExtensions = (text, removeKeys) => {
    // remove default val for removeKeys on steps 2-5
    const validate = validateKey(removeKeys);
    return Object.assign(Object.assign({}, (validate(orKey) && {
        or: (newText, ...extra) => createStep1(formatText_1.or(text, newText, ...extra), [...removeKeys, orKey]),
    })), (validate(thenKey) && {
        then: (newText, ...extra) => createStep1(formatText_1.then(text, newText, ...extra), [...removeKeys, thenKey]),
    }));
};
// step 2 - generate occurences
// only once occurence definition allowed, immediately move to step 3
const generateOccurences = (text, removeKeys) => {
    //const validate = validateKey(removeKeys);
    return {
        // add validation after refactor?
        occurs: (amount) => createStep3(formatText_1.occurs(text, amount), removeKeys),
        doesNotOccur: /*() => */ createStep3(formatText_1.doesNotOccur(text), removeKeys),
        occursOnceOrMore: /*() => */ createStep3(formatText_1.occursOnceOrMore(text), removeKeys),
        occursZeroOrMore: /*() => */ createStep3(formatText_1.occursZeroOrMore(text), removeKeys),
        occursAtLeast: (min) => createStep3(formatText_1.occursAtLeast(text, min), removeKeys),
        occursBetween: (min, max) => createStep3(formatText_1.occursBetween(text, min, max), removeKeys),
    };
};
// step 3 - generate surroundings
const generateSurroundings = (text, removeKeys) => {
    const validate = validateKey(removeKeys);
    return Object.assign(Object.assign(Object.assign(Object.assign({}, (validate(followedByKey) && {
        followedBy: (newText, ...extra) => createStep3(formatText_1.followedBy(text, newText, ...extra), [
            ...removeKeys,
            followedByKey,
        ]),
    })), (validate(notFollowedByKey) && {
        notFollowedBy: (newText, ...extra) => createStep3(formatText_1.notFollowedBy(text, newText, ...extra), [
            ...removeKeys,
            notFollowedByKey,
        ]),
    })), (validate(precededByKey) && {
        precededBy: (newText, ...extra) => createStep3(formatText_1.precededBy(text, newText, ...extra), [
            ...removeKeys,
            precededByKey,
        ]),
    })), (validate(notPrecededByKey) && {
        notPrecededBy: (newText, ...extra) => createStep3(formatText_1.notPrecededBy(text, newText, ...extra), [
            ...removeKeys,
            notPrecededByKey,
        ]),
    }));
};
// step 4 - generate boundaries
const generateBoundaries = (text, removeKeys) => {
    const validate = validateKey(removeKeys);
    return Object.assign(Object.assign({}, (validate(atStartKey) && {
        atStart: createStep4(formatText_1.atStart(text), [...removeKeys, atStartKey]),
    })), (validate(atEndKey) && {
        atEnd: createStep5(formatText_1.atEnd(text), removeKeys),
    }));
};
// step 5 - generate settings
const generateSettings = (text, removeKeys) => {
    const validate = validateKey(removeKeys);
    return Object.assign(Object.assign({}, (validate(isOptionalKey) && {
        isOptional: createStep5(formatText_1.isOptional(text), [...removeKeys, isOptionalKey]),
    })), (validate(isCapturedKey) && {
        isCaptured: createStep5(formatText_1.isCaptured(text), [...removeKeys, isCapturedKey]),
    }));
};
const createStep1 = (text, removeKeys, extendsWithAnd = false) => {
    return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ text, escaped: true }, generateExtensions(text, removeKeys)), generateOccurences(text, removeKeys)), generateSurroundings(text, removeKeys)), generateBoundaries(text, removeKeys)), generateSettings(text, removeKeys));
};
// step 2 - once a single function is used to define the occurences,
// the rgx builder will cancel out the other and move to step 3
// The step 2 functions will be called from within step 1
// and have no need to recursively call an updated version of step 2
// therefore, we can skip a 'createStep2' function altogether
/*
const createStep2: BuildRGX = (text, removeKeys, extendsWithAnd = false) => {
  return {
    text,
    escaped: true,
    ...generateOccurences(text, removeKeys),
    ...generateSurroundings(text, removeKeys),
    ...generateBoundaries(text, removeKeys),
    ...generateSettings(text, removeKeys),
  };
};*/
const createStep3 = (text, removeKeys, extendsWithAnd = false) => {
    const baseObj = Object.assign({ text, escaped: true }, generateBoundaries(text, removeKeys));
    const andObject = Object.assign(Object.assign({}, generateSurroundings(text, removeKeys)), generateSettings(text, removeKeys));
    return formatWithAnd(extendsWithAnd, baseObj, andObject);
};
const createStep4 = (text, removeKeys, extendsWithAnd = false) => {
    const baseObj = Object.assign({ text, escaped: true }, generateBoundaries(text, removeKeys));
    const andObject = Object.assign({}, generateSettings(text, removeKeys));
    return formatWithAnd(extendsWithAnd, baseObj, andObject);
};
const createStep5 = (text, removeKeys, extendsWithAnd = false) => {
    const baseObj = {
        text,
        escaped: true,
    };
    const andObject = Object.assign({}, generateSettings(text, removeKeys));
    return formatWithAnd(extendsWithAnd, baseObj, andObject);
};
const formatWithAnd = (extendsWithAnd, baseObj, andObj) => {
    if (extendsWithAnd) {
        return Object.assign(Object.assign({}, baseObj), { andObj });
    }
    else {
        return Object.assign(Object.assign({}, baseObj), andObj);
    }
};
// what if and followed by empty {}?
const init = (text) => createStep1(formatText_1.parseText(text), []);
