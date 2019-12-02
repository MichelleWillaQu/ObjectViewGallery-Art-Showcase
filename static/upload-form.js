"use strict";

import $ from 'jquery';


// chose to use prop() method to enable or disable elements using jQuery because
// props affect the dynamic state of a DOM without changing the HTML attribute
const handleRadioButtonClick = (buttonStr) => {
  if (buttonStr === '2D'){
    $('#twoD-block').prop({'disabled': false, 'hidden': false});
    $('#twoD-input').prop('required', true);
    $('#obj-block').prop({'disabled': true, 'hidden': true});
    $('.obj-files').prop('required', false);
    $('.obj-files').val('');
    $('#gltf-block').prop({'disabled': true, 'hidden': true});
    $('.gltf-files').prop('required', false);
    $('.gltf-files').val('');
  }

  else if (buttonStr === 'OBJ'){
    $('#twoD-block').prop({'disabled': true, 'hidden': true});
    $('#twoD-input').prop('required', false);
    $('#twoD-input').val('');
    $('#obj-block').prop({'disabled': false, 'hidden': false});
    $('#obj-input').prop('required', true);
    $('#gltf-block').prop({'disabled': true, 'hidden': true});
    $('.gltf-files').prop('required', false);
    $('.gltf-files').val('');
  }

  else { //GLTF
    $('#twoD-block').prop({'disabled': true, 'hidden': true});
    $('#twoD-input').prop('required', false);
    $('#twoD-input').val('');
    $('#obj-block').prop({'disabled': true, 'hidden': true});
    $('.obj-files').prop('required', false);
    $('.obj-files').val('');
    $('#gltf-block').prop({'disabled': false, 'hidden': false});
    $('.gltf-files').prop('required', true);
  }
};

// These will toggle the form to show the upload section for the specific media
// type (enabling/disabling and hiding fields)
$('#twoD').on('click', () => handleRadioButtonClick('2D'));
$('#OBJ').on('click', () => handleRadioButtonClick('OBJ'));
$('#GLTF').on('click', () => handleRadioButtonClick('GLTF'));

// This will allow for the upload of textures once a mtl file is chosen
$('#mtl').on('change', (evt) => {
  if ($(evt.target).val() === ""){
    $('#textures').prop({'disabled': true, 'required': false})
  }
  else {
    $('#textures').prop({'disabled': false, 'required': true});
  }
});

// TO DO: handle form validation for media name (ajax),
// tags/metadata regex words (metadata allows symbols),
// proper file extensions in each file upload