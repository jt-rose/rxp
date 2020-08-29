import "mocha";
import { expect } from "chai";
import { init, presets, shorthand } from "../src/index";
const { anyDigit, anyLowerCase, anyUpperCase, anyLetter } = presets;
const { either, optional, upperOrLowerCase } = shorthand;

describe("Valid application in real-world scenarios", () => {
  it("testing against US phone numbers", () => {
    const phone1 = "123-456-7899";
    const phone2 = "(123) 456-7899";
    const phone3 = "123 456 7899";
    const invalidPhone = "456-7899";
    const invalidPhone2 = "123-456-789A";
    const areaCode = init(
      optional("("),
      anyDigit.occurs(3),
      optional(")"),
      either("-", " ").isOptional
    );
    const firstThreeDigits = areaCode;
    const lastFourDigits = init(
      optional("("),
      anyDigit.occurs(4),
      optional(")")
    );

    const phoneMatch = init(
      areaCode,
      firstThreeDigits,
      lastFourDigits
    ).construct();
    const phoneMatchRegex = /\(?\d{3}\)?-?\s?\(?\d{3}\)?-?\s?\d{4}\)?/;

    expect(phoneMatch.test(phone1)).to.equal(true);
    expect(phoneMatchRegex.test(phone1)).to.equal(true);

    expect(phoneMatch.test(phone2)).to.equal(true);
    expect(phoneMatchRegex.test(phone2)).to.equal(true);

    expect(phoneMatch.test(phone3)).to.equal(true);
    expect(phoneMatchRegex.test(phone3)).to.equal(true);

    expect(phoneMatch.test(invalidPhone)).to.equal(false);
    expect(phoneMatchRegex.test(invalidPhone)).to.equal(false);

    expect(phoneMatch.test(invalidPhone2)).to.equal(false);
    expect(phoneMatchRegex.test(invalidPhone2)).to.equal(false);
  });
  it("testing against credit card numbers", () => {
    const sampleCC1 = "1234-5678-9999-9999";
    const sampleCC2 = "1234 5678 9999 9999";
    const sampleCC3 = "1234567899999999";
    const invalidCC = "1234-5678-9999-9";
    const invalidCC2 = "1234-5678-9999-A";

    const optionalSpace = either("-", " ").isOptional;
    const fourDigitsWithSpace = init(anyDigit.occurs(4), optionalSpace);
    const CCMatch = init(
      fourDigitsWithSpace.occurs(3),
      anyDigit.occurs(4)
    ).construct();
    const CCMatchRegex = /[0-9]{4}-?\s?[0-9]{4}-?\s?[0-9]{4}-?\s?[0-9]{4}/;

    expect(CCMatch.test(sampleCC1)).to.equal(true);
    expect(CCMatchRegex.test(sampleCC1)).to.equal(true);

    expect(CCMatch.test(sampleCC2)).to.equal(true);
    expect(CCMatchRegex.test(sampleCC2)).to.equal(true);

    expect(CCMatch.test(sampleCC3)).to.equal(true);
    expect(CCMatchRegex.test(sampleCC3)).to.equal(true);

    expect(CCMatch.test(invalidCC)).to.equal(false);
    expect(CCMatchRegex.test(invalidCC)).to.equal(false);

    expect(CCMatch.test(invalidCC2)).to.equal(false);
    expect(CCMatchRegex.test(invalidCC2)).to.equal(false);
  });
  it("testing against specific email formats", () => {
    const email1 = "JRose@company.net";
    const email2 = "SJobs@company.net";
    const email3 = "XXavier@company.net";
    const invalidEmail = "jrose@company.net";
    const invalidEmail2 = "JR@company.net";

    const emailMatch = init(
      anyUpperCase.occurs(2),
      anyLowerCase.occursOnceOrMore,
      "@company.net"
    ).construct();
    const emailMatchRegex = /[A-Z]{2}\w+@company.net/;

    expect(emailMatch.test(email1)).to.equal(true);
    expect(emailMatchRegex.test(email1)).to.equal(true);

    expect(emailMatch.test(email2)).to.equal(true);
    expect(emailMatchRegex.test(email2)).to.equal(true);

    expect(emailMatch.test(email3)).to.equal(true);
    expect(emailMatchRegex.test(email3)).to.equal(true);

    expect(emailMatch.test(invalidEmail)).to.equal(false);
    expect(emailMatchRegex.test(invalidEmail)).to.equal(false);

    expect(emailMatch.test(invalidEmail2)).to.equal(false);
    expect(emailMatchRegex.test(invalidEmail2)).to.equal(false);
  });
  it("testing against specific last name", () => {
    const name1 = "Jeff Rose";
    const name2 = "Mr. Jeff Rose";
    const name3 = "jeff rose";
    const name4 = "Jeffrey Theodore Rose";

    const invalidNameMatch = "Jeff Ross";
    const invalidNameMatch2 = "jeff ros3";

    const nameMatch = init(
      anyLetter.occursOnceOrMore,
      " ",
      upperOrLowerCase("r"), //either("r", "R") is equivalent
      "ose"
    ).construct();
    const nameMatchRegex = /\w+?\s[rR]ose/;

    expect(name1.match(nameMatch)?.[0]).to.equal(name1);
    expect(name1.match(nameMatchRegex)?.[0]).to.equal(name1);

    expect(name2.match(nameMatch)?.[0]).to.equal("Jeff Rose");
    expect(name2.match(nameMatchRegex)?.[0]).to.equal("Jeff Rose");

    expect(name3.match(nameMatch)?.[0]).to.equal(name3);
    expect(name3.match(nameMatchRegex)?.[0]).to.equal(name3);

    expect(name4.match(nameMatch)?.[0]).to.equal("Theodore Rose");
    expect(name4.match(nameMatchRegex)?.[0]).to.equal("Theodore Rose");

    expect(invalidNameMatch.match(nameMatch)).to.equal(null);
    expect(invalidNameMatch.match(nameMatchRegex)).to.equal(null);

    expect(invalidNameMatch2.match(nameMatch)).to.equal(null);
    expect(invalidNameMatch2.match(nameMatchRegex)).to.equal(null);
  });
  it("testing against US zip codes", () => {
    const zipCode1 = "22153";
    const zipCode2 = "22153-0000";
    const zipCode3 = "22153 0000";
    const zipCode4 = "221530000";

    const matchPartialZipCode = "22153-00";
    const matchPartialZipCode2 = "22153-000A";

    const invalidZipCode = "2215";
    const invalidZipCode2 = "2215Z";

    const zipCodeMatch = init(
      anyDigit.occurs(5),
      optional(either("-", " ").followedBy(anyDigit.occurs(4))),
      optional(anyDigit.occurs(4))
    ).construct();

    const zipCodeMatchRegex = /\d{5}(?:(?:\s|-)(?=\d{4}))?(?:\d{4})?/;

    // match full zip code listed
    expect(zipCode1.match(zipCodeMatch)?.[0]).to.equal(zipCode1);
    expect(zipCode1.match(zipCodeMatchRegex)?.[0]).to.equal(zipCode1);

    expect(zipCode2.match(zipCodeMatch)?.[0]).to.equal(zipCode2);
    expect(zipCode2.match(zipCodeMatchRegex)?.[0]).to.equal(zipCode2);

    expect(zipCode3.match(zipCodeMatch)?.[0]).to.equal(zipCode3);
    expect(zipCode3.match(zipCodeMatchRegex)?.[0]).to.equal(zipCode3);

    expect(zipCode4.match(zipCodeMatch)?.[0]).to.equal(zipCode4);
    expect(zipCode4.match(zipCodeMatchRegex)?.[0]).to.equal(zipCode4);

    // match only valid first five digits
    expect(matchPartialZipCode.match(zipCodeMatch)?.[0]).to.equal(zipCode1);
    expect(matchPartialZipCode.match(zipCodeMatchRegex)?.[0]).to.equal(
      zipCode1
    );

    expect(matchPartialZipCode2.match(zipCodeMatch)?.[0]).to.equal(zipCode1);
    expect(matchPartialZipCode2.match(zipCodeMatchRegex)?.[0]).to.equal(
      zipCode1
    );

    // reject invalid zip code
    expect(invalidZipCode.match(zipCodeMatch)).to.equal(null);
    expect(invalidZipCode.match(zipCodeMatchRegex)).to.equal(null);

    expect(invalidZipCode2.match(zipCodeMatch)).to.equal(null);
    expect(invalidZipCode2.match(zipCodeMatchRegex)).to.equal(null);
  });
});
