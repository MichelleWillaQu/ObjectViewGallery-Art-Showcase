"use strict";

import $ from 'jquery';


// These are the functions that will perform regex checks on inputs
export function passwordRegexCheck(inputValue){
  if (inputValue.length < 8){
    return false;
  }
  const validRegex = /^[\w\!\@\#\$\%\^\&\*]+$/;
  if (!validRegex.test(inputValue)){
    return false;
  }
  return true;
}


export function usernameRegexCheck(inputValue){
  if (inputValue.length < 4){
    return false;
  }
  const validRegex = /^[A-Za-z][A-Za-z0-9\-]+$/;
  if (!validRegex.test(inputValue)){
    return false;
  }
  return true;
}
