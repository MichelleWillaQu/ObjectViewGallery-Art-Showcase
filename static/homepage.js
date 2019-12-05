"use strict";

import $ from 'jquery';


// Since artist is default selected, run the function in the beginning
getArtists();


// When the select inputs change, hide/unhide certain things 
$('#type').on('change', (evt) => {
  if ($(evt.target).val() === 'artist'){
    $('#media-filters').prop({'hidden': true});
    getArtists();
  }
  else {
    $('#media-filters').prop({'hidden': false});
  }
});

$('#how').on('change', (evt) => {
  if($(evt.target).val() === 'tag'){
    $('.tag-content').prop({'hidden': false});
    $('.date-content').prop({'hidden': true});
  }
  else {
    $('.tag-content').prop({'hidden': true});
    $('.date-content').prop({'hidden': false});
  }
})


// Logic for getting all the users and displaying them
function getArtists(){
  const locationEl = document.querySelector('#content');
  $.get('/api/discover-artists.json', (response) => {
    locationEl.innerHTML = '';
    for (const artist of response.data){
      // For each, generate the outer div that holds an anchor tag to the user's
      // gallery and inside it has their username and their avatar icon if set
      const outer = document.createElement('div');
      outer.classList.add('artist-data');
      const anchor = document.createElement('a');
      anchor.setAttribute('href', `/gallery/${artist.username}`);
      const node = document.createElement('div');
      node.classList.add('inside');
      if (artist.url){
        const divImg = document.createElement('div');
        divImg.classList.add('img-container');
        const img = document.createElement('img');
        img.setAttribute('src', artist.url);
        divImg.appendChild(img);
        node.appendChild(divImg);
      }
      const text = document.createElement('div')
      text.innerHTML = `${artist.username}`;
      text.classList.add('text');
      node.appendChild(text);
      anchor.appendChild(node);
      outer.appendChild(anchor);
      locationEl.append(outer);
    }
  });
  locationEl.innerHTML = 'Loading!';
}