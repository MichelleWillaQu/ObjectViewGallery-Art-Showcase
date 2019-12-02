"use strict";

import $ from 'jquery';
import {passwordRegexCheck, usernameRegexCheck} from './functions'


// For the email validation messages to appear only after the first type
let firstType = false;
let firstSubmit = false;
// For asynchronous checks
let check1passed = false;
let check2passed = false;

// Event type 'input' is not fully supported on Edge and IE - alternative is to
// put the async checks on blur which may not always check one of the inputs if
// it is focused while being submitted
const usernameInput = $('#username');
usernameInput.on('input', () => {
  // Ajax call to see if username exists (false is the wanted return)
  $.get('/api/username-check.json',
      {username: usernameInput.val()}, (response) => {
    if (response.bool === 'TRUE'){
      check1passed = false;
      usernameInput.addClass('invalid');
      usernameInput[0].setCustomValidity('That username is already taken')
    }
    else {
      check1passed = true;
    }
  });
});

const emailInput = $('#email');
emailInput.on('input', () => {
  // Check to make sure there is not a user with that email (false is the wanted
  // response)
  firstType = true;
  $.get('/api/email-check.json',
      {email: emailInput.val()}, (response) => {
    if (response.bool === 'TRUE'){
      check2passed = false;
      emailInput.addClass('invalid');
      emailInput[0].setCustomValidity('That email is already taken');
    }
    else {
      check2passed = true;
    }
  });
});

// Prevent form submission unless all validations are done
$('form').on('submit', (evt) => {
  // For synchronous checks
  let validation = true;

  // Make sure the username follows valid Regex
  const usernameEl = $('#username');
  if (!usernameRegexCheck(usernameEl.val())){
    validation = false;
    usernameEl.addClass('invalid');
    // setCustomValidity must be done on a DOM element, hence jQueryObject[0]
    usernameEl[0].setCustomValidity('Please be 4+ characters, start with a ' +
      'letter, and only use letters, numbers, or hyphens');
  }
  
  // Password Checking
  // Both input fields must match the regex pattern
  $('.password').each(function() {
    // 'this' is a single DOM element thus it is 
    if (!passwordRegexCheck($(this).val())){
      validation = false;
      $(this).addClass('invalid');
      $(this)[0].setCustomValidity('Please be 8+ characters, and use only letters, '
        + '0-9, and _,!,@,#,$,%,^,&,*');
    }
  });
  // Both input fields must match each other
  if ($('#password').val() !== $('#password2').val()){
    validation = false;
    $('#password').addClass('invalid');
    $('#password2').addClass('invalid');
    $('.password')[0].setCustomValidity('Password Mismatch');
    $('.password')[1].setCustomValidity('Password Mismatch');
  }

  // If there is an error, this will prevent form submission
  if(!validation || !check1passed || !check2passed){
    // I only want reports of the validity after the first submit press
    firstSubmit = true;
    evt.preventDefault();
  }
});

// Resets the color of the input when when the user changes the input and will
// get rid of the error message
// Event type 'input' is not fully supported on Edge and IE - the alternative is
// to make the custom error messages appear in an inserted div
$('input').on('input', (evt) => {
  $(evt.target).removeClass('invalid');
  $(evt.target)[0].setCustomValidity(""); // Resets
});

// Will give the error report when the user clicks on the input instead of only
// presenting the first error message every time the form submits (ex. if password
// and username error, will only show username error if any - sometimes thefirst
// form submit does not show the error which is not a problem with this method)
$('.password').on('focus', (evt) => {
  if (firstSubmit){
    // Not supported by IE even partially. The only alternative is the do a
    // completely different way of giving error messages like described above
    evt.target.reportValidity();
  }
});

$('#username').on('focus', (evt) => {
  evt.target.reportValidity();
});

// Bug: Occasionally may report type email specific errors when typing though
$('#email').on('focus', (evt) => {
  if (firstType){
    evt.target.reportValidity();
  }
});