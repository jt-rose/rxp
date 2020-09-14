# RXP

A descriptive constructor for regular expressions

### Installation

`npm install rxp` / `yarn add rxp`

Both a default export and named exports are supported

```javascript
import RXP from "rxp";
import { init, presets, either, wrapRXP } from "rxp";
```

### Dependencies

- [uniqid] - generate unique names used for identifying regex variables

## Features

#### Plain English Constructor

- using a Mocha/ Chai inspired syntax, regex are constructed to be readable at a glance and easy to reason about
- after initializing the constructor with a base text, various regex behavior can be applied through nested, descriptive method calls
- easily transforms to regex literals with the `construct` command

```javascript
const userNameMatch = anyCharacter.occursOnceOrMore.and.followedBy(
  "@helpdesk.org"
);
const storyIntro = either("Twas a dark and stormy night", "Once upon a time")
  .atStart;

const ISBN = init("ISBN-1", anyDigit, ": ");
const multipleDigits = anyDigit.occursOnceOrMore;
const ProductId = init(
  multipleDigits,
  optional("-"),
  optional(multipleDigits)
).andPrecededBy(ISBN);
```

#### Composable, Modular Units

- RXP can build regex expressions as small units that can then be reused, further modified as needed, and composed within other RXP units

```javascript
const fourDigits = anyDigit.occurs(4);
const fourDigitsWithOptionalHyphen = init(fourDigits, optional("-"));
const CreditCardMatch = init(
  fourDigitsWithOptionalHyphen.occurs(3),
  fourDigits
).construct();
```

#### Convenient Shorthands and Presets

- frequently used regex behavior, such as marking text optional or providing alternatives, can be quickly defined using shorthand functions that retain RXP functionality
- common regex characters, such as `.` and `\d`, are stored as descriptive presets ("anyCharacter", "anyDigit") with full RXP functionality built in

```javascript
either("this", "that").occurs(3);
optional("optional text");

anyCharacterExcept("T").atStart;
anyDigit.occursOnceOrMore.and.isGreedy;
```

#### Simplifies Default Behavior

- auto-escapes user-submitted strings
- groups are noncapturing
- frequency searches are lazy
- noncapturing groupings and lazy searches can easily be overridden if needed

```javascript
// convert to greedy search
oneOrMore("sample").text; // (?:sample)+?
oneOrMore("sample").and.isGreedy.text; // (?:sample)+

// convert to captured groupings
init("sample").text; // (?:sample)
init("sample").isCaptured.text; // (sample)
```

## Quick Guide

The RXP constructor works by accepting a string argument, escaping any special characters, and then modifying the string argument using descriptive object methods to apply wanted behavior. When the prepared regex string is ready, it can be transformed to a regex literal (`/regex/`) with any desired flags applied.

```javascript
const regexSearch = init("text", " with ", "unescaped []")
  .occursOnceOrMore.and.precededBy("intro: ")
  .construct("g"); // => /(?:(?<=intro: )(?:(?:text with unescaped \[\])+?))/g

regexSearch.test("intro: text with unescaped []"); // true
regexSearch.test("!Wrong!: text with unescaped []"); // false
regexSearch.match("intro: text with unescaped []"); // "text with unescaped []"
```

##### Initialize Constructor

The main `init` function is used to generate the RXP constructor. `init` accepts any number of strings, combines them in order, applies a noncapture grouping, and escapes them, storing the modified string in the `text` property.

```javascript
const sample = init("sample");
sample.text; // "(?:sample)"

const escaped = init("escape ", ". and ?");
escaped.text; // "(?:escape \\. and \\?)"
```

The `init` function can also accept other RXP units. The full constructor object should be provided and not just the `.text` property to avoid escaping special characters a second time:

```javascript
const newSample = init("combine with ", escaped);
newSample.text; // "(?:(?:combine with )(?:escape \\. and \\?))"
```

##### Modify Behavior

After initializing the constructor, a variety of properties/ methods are available to modify the regex behavior:

```javascript
init("this").or("that").text; // "(?:(?:this)|(?:that))"
sample.occursBetween(3, 5).text; // "(?:(?:sample){3,5})"
sample.occurs(2).and.atEnd.text; // "(?:(?:(?:sample){2})$)"
```

##### Convert to Regex Literal

When the regex is ready to be finalized, the `construct` method can be used to convert the text string to a regex literal (`/regex/`). A flag can be passed to `construct` to apply matching behavior:

```javascript
sample.construct(); // => /(?:sample)/
sample.construct("g"); // => /(?:sample)/g
sample.construct("global", "sticky", "i"); // => /(?:sample)/gsi
```

##### Presets

Commonly used special characters, such as `.` and `\d`, are stored as ready-to-use RXP units (called "Presets"), which have full RXP functionality:

```javascript
const sectionID = anyDigit.occurs(3).atStart;
const sectionAbbr = anyUpperCaseExcept("X", "Y", "Z").occurs(2);
```

##### Shorthand Functions

A variety of shorthand functions are also available for commonly used behavior, such as marking text optional, defining frequency, or declaring alternatives:

```javascript
optional("some text"); // equivalent to init("some text").isOptional
oneOrMore("sample"); // equivalent to init("sample").occursOnceOrMore
either("A", "B"); // equivalent to init("A").or("B")

//these are especially handy for improving the readability of composed RXP units:
const regexSearch = init(
  either("(", "["),
  anyDigit.occursOnceOrMore,
  either(")", "]"),
  optional("-0000")
);
```

## API

#### Constructor

| method           | example                                   | equivalent                               |
| ---------------- | ----------------------------------------- | ---------------------------------------- |
| init             | `const RXPSample = init("sample")`        | escapes text and initializes constructor |
| or               | `RXPSample.or("other sample")`            | `sample\|other sample`                   |
| occurs           | `RXPSample.occurs(4)`                     | `(?:sample){4}`                          |
| doesNotOccur     | `RXPSample.doesNotOccur`                  | `[^(?:sample)]`                          |
| occursOnceOrMore | `RXPSample.occursOnceOrMore`              | `(?:sample)+?`                           |
| occursZeroOrMore | `RXPSample.occursZeroOrMore`              | `(?:sample)\*?`                          |
| occursAtLeast    | `RXPSample.occursAtLeast(3)`              | `(?:sample){3,}`                         |
| occursBetween    | `RXPSample.occursBetween(2,4)`            | `(?:sample){2,4}`                        |
| isGreedy         | `RXPSample.occursOnceOrMore.and.isGreedy` | `(?:sample)+`                            |
| followedBy       | `RXPSample.followedBy("text")`            | `(?:sample)(?=text)`                     |
| notFollowedBy    | `RXPSample.notFollowedBy("text")`         | `(?:sample)(?!text)`                     |
| precededBy       | `RXPSample.precededBy("text")`            | `(?<=text)(?:sample)`                    |
| notPrecededBy    | `RXPSample.notPrecededBy("text")`         | `(?<!text)(?:sample)`                    |
| atStart          | `RXPSample.atStart`                       | `^(?:sample)`                            |
| atEnd            | `RXPSample.atEnd`                         | `(?:sample)\$`                           |
| isOptional       | `RXPSample.isOptional`                    | `(?:sample)?`                            |
| isCaptured       | `RXPSample.isCaptured`                    | `(sample)`                               |
| isVariable       | `RXPSample.isVariable`                    | `(?\<var>(?:sample))` -or- `//k<var>`    |
| and              | `RXPSample.occurs(4).and.atEnd`           | `(?:(?:sample){4})$`                     |
| construct        | `RXPSample.construct("g")`                | `/sample/g`                              |

#### Shorthands

| function         | example                  | equivalent                                               |
| ---------------- | ------------------------ | -------------------------------------------------------- |
| either           | `either("this", "that")` | `init("this").or("that")`                                |
| optional         | `optional("text")`       | `init("text").isOptional`                                |
| noOccurenceOf    | `noOccurenceOf("text")`  | `init("text").doesNotOccur`                              |
| oneOrMore        | `oneOrMore("text")`      | `init("text").occursOnceOrMore`                          |
| zeroOrMore       | `zeroOrMore("text")`     | `init("text").occursZeroOrMore`                          |
| upperOrLowerCase | `upperOrLowerCase("r")`  | `init("r").or("R")`                                      |
| wrapRXP          | `wrapRXP("(", ")")`      | new function: `(innerText) => init("(", innerText, ")")` |

#### Presets

| RXP unit           | example                             | equivalent  |
| ------------------ | ----------------------------------- | ----------- |
| anyCharacter       | `anyCharacter`                      | .           |
| anyCharacterExcept | `anyCharacterExcept("t", "7")`      | [^t7]       |
| anyDigit           | `anyDigit`                          | \d          |
| anyDigitExcept     | `anyDigitExcept("5")`               | [012346789] |
| anyLowerCase       | `anyLowerCase`                      | [a-z]       |
| anyLowerCaseExcept | `anyLowerCaseExcept("a", "b", "c")` | [d-z]       |
| anyUpperCase       | `anyUpperCase`                      | [A-Z]       |
| anyUpperCaseExcept | `anyUpperCaseExcept("Z")`           | [A-Y]       |
| anyLetter          | `anyLetter`                         | \w          |
| anyLetterExcept    | `anyLetterExcept("a")`              | [b-zA-Z]    |

## Examples

#### Matching a specific email pattern

```javascript
// original regex:
/[A-Z]{2}[a-z]+@(?:support\.)?company\.net/;

//RXP version:
const emailMatch = init(
  anyUpperCase.occurs(2),
  anyLowerCase.occursOnceOrMore,
  "@",
  optional("support."),
  "company.net"
).construct();
```

#### Matching someone with a specific family name

```javascript
// original regex:
/\w+\s[rR]ose/;

// RXP version:
const nameMatch = init(
  anyLetter.occursOnceOrMore,
  " ",
  upperOrLowerCase("r"), //either("r", "R") is equivalent
  "ose"
).construct();
```

#### Matching a US zip code after the state abbreviation

```javascript
//original regex:
/(?<=\w{2},\s)\d{5}(?:(?:(?:-|\s)\d{4})|(?:\d{4}))?/;

// RXP version:
const stateAbbreviation = init(anyUpperCase.occurs(2), ", ");
const zipCode = anyDigit.occurs(5);
const extendedZipCode = anyDigit.occurs(4);
const extendedZipWithSpace = init(either("-", " "), extendedZipCode);

const zipCodeMatch = init(
  zipCode,
  either(extendedZipCode, extendedZipWithSpace).isOptional
)
  .precededBy(stateAbbreviation)
  .construct();
```

#### Matching a phone number with extension

```javascript
//original regex:
/\(?\d{3}\)?(?:-|\s)?\d{3}(?:-|\s)?\d{4}(?:\s[eE]xt.:\s\d{2,4})?/;

// RXP version:
const areaCode = init(
  optional("("),
  anyDigit.occurs(3),
  optional(")"),
  either("-", " ").isOptional // optional(either("-", " ")) also works
);

const firstThreeDigits = areaCode;
const lastFourDigits = anyDigit.occurs(4);
const extension = optional(
  " ",
  upperOrLowerCase("e"),
  "xt.: ",
  anyDigit.occursBetween(2, 4)
);

const phoneMatch = init(
  areaCode,
  firstThreeDigits,
  lastFourDigits,
  extension
).construct("g");
```

[uniqid]: https://www.npmjs.com/package/uniqid
