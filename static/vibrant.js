"use strict";

// Node JS port of Android Palette library
import * as Vibrant from 'node-vibrant'

const el = document.querySelector('#image')
const url = el.className

// By a promise from the builder (helper class for creating a vibrant instance
// where configurations can be chained to the .from)
Vibrant.from(url).getPalette().then((palette) => {
  // Palette returns up to 6 colors for each of the prominent color profiles:
  // Vibrant, Vibrant Dark, Vibrant Light, Muted, Muted Dark, Muted Light
  const colorObj= {};
  const divEl = document.querySelector('#colors');
  for (const colorName of Object.keys(palette)){
    const hexColor = palette[colorName].hex;
    let prevalence = palette[colorName].population;  // DataType: number
    // If the prevalence key exists, stick this hex at a lower prevalence
    while(colorObj[prevalence]){
      prevalence -= 1;
    }
    // colorObj[prevalence] is undefined so use the new prevalence
    colorObj[prevalence] = hexColor;
  }
  // Sort the keys in order of prevalence (aka occurance) and then create the DOM
  // element for the display
  for (const occurance of Object.keys(colorObj).sort((a, b) => b - a)){
    const node = document.createElement('div');
    node.id = colorObj[occurance];
    node.classList.add("color");
    node.setAttribute("style", `display: inline-block;
                                background-color: ${colorObj[occurance]};
                                height: 50px;
                                width: 50px`);
    divEl.appendChild(node);
  }
});