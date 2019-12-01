"use strict";

import $ from 'jquery';
import {passwordCheck} from './functions'

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
  if ($(evt.target).val() === 'other'){
    $('#background-block').prop({'hidden': false});
    $('input[name="background"]').prop({'disabled': false, 'required': true});
  }
  else {
    $('#background-block').prop({'hidden': true});
    $('input[name="background"]').prop({'disabled': true, 'required': false});
  }
})


// Validation of form
$('form').on('submit', (evt) => {
  let validation = true;

  if(!$('.email').prop('disabled')){
    if($('#new-email1').val() !== $('#new-email2').val()){
      validation = false;
      $('#new-email1').addClass('invalid');
      $('#new-email2').addClass('invalid');
    }
  }

  if (!$('.password').prop('disabled')){
    $('.password').each(function() {
      if (!passwordCheck($(this).val())){
        validation = false;
        $(this).addClass('invalid');
      }
    });
    if ($('#new-password1').val() !== $('#new-password2').val()){
      validation = false;
      $('#new-password1').addClass('invalid');
      $('#new-password2').addClass('invalid');
    }
    $.get('/api/password-check.json',
        {password: $('#old-password').val()}, (response) => {
      if (response.bool === 'FALSE'){
        validation = false;
        $('#old-password').addClass('invalid');
      }
    });
  }

  if (!$('input[name="background"]').prop('disabled')){
    const validTypes = ['jpg', 'jpeg', 'png'];
    const background = $('input[name="background"]');
    const backArr = background.val().split('.');
    if (!validTypes.includes(backArr[backArr.length - 1])){
      validation = false;
      background.addClass('invalid');
    }
  }
  // Check Avatar file
  const validTypes2 = ['gif', 'jpg', 'jpeg', 'png', 'webp'];
  const avatar = $('input[name="avatar"]');
  if (avatar.val()){
    const avaArr = $('input[name="avatar"]').val().split('.');
    if (!validTypes2.includes(avaArr[avaArr.length - 1])){
      validation = false;
      $('input[name="avatar"]').addClass('invalid');
    }
  }

  if(!validation){
    evt.preventDefault();
  }
});


$('input').on('focusin', (evt) => {
  $(evt.target).removeClass('invalid');
})