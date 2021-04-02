'use strict'

//import * as d3Chromatic from 'd3-scale-chromatic'
//import {MDCRipple} from '@material/ripple';
import * as preprocess_ParPays from './scripts/preprocess_ParPays.js'
import * as preprocess_ParArtiste from './scripts/preprocess_ParArtiste.js'
import * as preprocess_ParTitre from './scripts/preprocess_ParTitre.js'

/**
 * @file This file is the entry-point for the the code for Team 3 project for the course INF8808.
 * @author Justine Marlow
 * @author Marine Carpe
 * @author Tanguy Gloaguen
 */

(function (d3) {

  /*var files = [
    'global',
    'ar', 'at', 'au',
    'be', 'bo', 'br',
    'ca', 'ch', 'cl', 'co', 'cr', 'cz',
    'de', 'dk', 'do',
    'ec', 'es',
    'fi', 'fr',
    'gb', 'gr', 'gt',
    'hk', 'hn', 'hu',
    'id', 'ie', 'is', 'it',
    'jp',
    'lt', 'lv',
    'mx', 'my',
    'nl', 'no', 'nz',
    'pa', 'ph', 'pl', 'pt', 'py',
    'se', 'sg', 'sk', 'sv',
    'tr', 'tw',
    'us', 'uy'
  ]
  */
  
  var countries = ['ca', 'es', 'fr', 'gb', 'it', 'jp', 'us']
  let call_countries = []
  countries.forEach(country => call_countries.push(d3.csv('./assets/data/'+country+'.csv', d3.autoType)));

  Promise.all(call_countries)
    .then(function(files) {
    const data_preprocessed = preprocess_ParTitre.ExplorerParTitre(files, 'Trop beau', new Date('2017-01-01'), new Date('2020-04-20'))
    console.log(data_preprocessed)
    //here we can continue with the data -> viz
  })
    .catch(function(err) {
    // handle error here
    console.log(err)
  })
  
})(d3)
