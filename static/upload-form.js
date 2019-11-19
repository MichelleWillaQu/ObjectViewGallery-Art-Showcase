"use strict";

import $ from 'jquery';


// chose to use prop() method to enable or disable elements using jQuery because
// props affect the dynamic state of a DOM without changing the HTML attribute
const handleRadioButtonClick = (buttonStr) => {
  if (buttonStr === '2D'){
    $('#2D-block').prop({'disabled': false, 'hidden': false});
    $('#2D-input').prop('required', true);
    $('#obj-block').prop({'disabled': true, 'hidden': true});
    $('.obj-files').prop('required', false);
    $('.obj-files').val('');
    $('#gltf-block').prop({'disabled': true, 'hidden': true});
    $('.gltf-files').prop('required', false);
    $('.gltf-files').val('');
  }

  else if (buttonStr === 'OBJ'){
    $('#2D-block').prop({'disabled': true, 'hidden': true});
    $('#2D-input').prop('required', false);
    $('#2D-input').val('');
    $('#obj-block').prop({'disabled': false, 'hidden': false});
    $('#obj-input').prop('required', true);
    $('#gltf-block').prop({'disabled': true, 'hidden': true});
    $('.gltf-files').prop('required', false);
    $('.gltf-files').val('');
  }

  else { //GLTF
    $('#2D-block').prop({'disabled': true, 'hidden': true});
    $('#2D-input').prop('required', false);
    $('#2D-input').val('');
    $('#obj-block').prop({'disabled': true, 'hidden': true});
    $('.obj-files').prop('required', false);
    $('.obj-files').val('');
    $('#gltf-block').prop({'disabled': false, 'hidden': false});
    $('.gltf-files').prop('required', true);
  }
};

$('#2D').on('click', () => handleRadioButtonClick('2D'));
$('#OBJ').on('click', () => handleRadioButtonClick('OBJ'));
$('#GLTF').on('click', () => handleRadioButtonClick('GLTF'));

$('#mtl').on('change', (evt) => {
  if ($(evt.target).val() === ""){
    $('#textures').prop({'disabled': true, 'required': false})
  }
  else {
    $('#textures').prop({'disabled': false, 'required': true});
  }
});

//TO DO: handle form validation for media name (ajax),
//tags/metadata alphanumerical (metadata allows symbols)
  // const nameValue = $('#name').val();
  // console.log('Name: ', nameValue);
  // const metadata = $('#metadata').val();
  // console.log('MD: ', metadata);
  // const downloadable = $('input[name="downloadable"]').val();
  // console.log('dl: ', downloadable);
  // const date = $('#date').val();
  // console.log('DATE: ', date);
  // const thumbnail = $('#thumbnail').val();
  // console.log('Thumb: ', thumbnail);
  // const tags = $('#tags').val();