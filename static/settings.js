"use strict";

import $ from 'jquery';

const handleClick = (evt) => {
  evt.preventDefault();
  const element = $(evt.target);
  if (element.val() === 'email'){
    if ($('.email-content').prop('hidden')){
      $('.email-content').prop({'hidden': false});
      $('.email').prop({'disabled': false, 'required': true});
    }
    else {
      $('.email-content').prop({'hidden': true});
      $('.email').prop({'disabled': true, 'required': false});
    }
    $('.password-content').prop({'hidden': true});
    $('.password').prop({'disabled': true, 'required': false});
  }
  else if (element.val() === 'password'){
    if ($('.password-content').prop('hidden')){
      $('.password-content').prop({'hidden': false});
      $('.password').prop({'disabled': false, 'required': true});
    }
    else {
      $('.password-content').prop({'hidden': true});
      $('.password').prop({'disabled': true, 'required': false});
    }
    $('.email-content').prop({'hidden': true});
    $('.email').prop({'disabled': true, 'required': false});
  }
};

$('.collapsible').on('click', (evt) => handleClick(evt));

$('select').on('change', (evt) => {
  if($(evt.target).val() === 'other'){
    $('#background-block').prop({'hidden': false});
    $('input[name="background"]').prop({'disabled': false, 'required': true});
  }
  else {
    $('#background-block').prop({'hidden': true});
    $('input[name="background"]').prop({'disabled': true, 'required': false});
  }
})