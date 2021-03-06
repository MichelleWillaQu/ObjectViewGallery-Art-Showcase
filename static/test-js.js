"use strict";

import {passwordRegexCheck, usernameRegexCheck} from '../static/functions'


// This is the testing file for functions.js via Jasmine - each function is checked
// with something too short, invalid input(s), and valid input
describe('Testing Password Regex', () => {
  it('should be too short', () => {
    expect(passwordRegexCheck('osetu0')).toBe(false);
  });

  it('should contain invalid characters', () => {
    expect(passwordRegexCheck(',tha9eos.c')).toBe(false);
  });

  it('should be valid', () => {
    expect(passwordRegexCheck('aoeu8829##!!$!')).toBe(true);
  });
});

describe('Testing Username Regex', () => {
  it('should be too short', () => {
    expect(usernameRegexCheck('ose')).toBe(false);
  });

  it('should contain invalid characters (, and .)', () => {
    expect(usernameRegexCheck(',tha9eos.c')).toBe(false);
  });

  it('should contain invalid characters (!, #, and @)', () => {
    expect(usernameRegexCheck('!!tha9eos##@#@c')).toBe(false);
  });

  it('should contain invalid characters (starting -)', () => {
    expect(usernameRegexCheck('-tha9-eosc')).toBe(false);
  });

  it('should be valid', () => {
    expect(usernameRegexCheck('aoeu8-829-')).toBe(true);
  });
});