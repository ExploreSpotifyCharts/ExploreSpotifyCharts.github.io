'use strict'

//import * as d3Chromatic from 'd3-scale-chromatic'
//import {MDCRipple} from '@material/ripple';
import * as preprocess_Helpers from './scripts/preprocess_Helpers.js'
import * as preprocess_ParPays from './scripts/preprocess_ParPays.js'
import * as preprocess_ParArtiste from './scripts/preprocess_ParArtiste.js'
import * as preprocess_ParTitre from './scripts/preprocess_ParTitre.js'
import * as preprocess_ParTendance from './scripts/preprocess_ParTendance.js'

/**
 * @file This file is the entry-point for the the code for Team 3 project for the course INF8808.
 * @author Justine Marlow
 * @author Marine Carpe
 * @author Tanguy Gloaguen
 */

(function (d3) {

  let countries = [
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

  const PATH = './assets/data/' //for Tanguy : './'


// let countries = ['be', 'ca', 'es', 'fr', 'gb', 'it', 'jp', 'us'] //à remplacer à terme par la liste complètes des country code (cf plus haut)
let call_countries = []
countries.forEach(country => call_countries.push(d3.csv(PATH+country+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
      let data_preprocessed = [...new Set(data.map(line => 
        {
          let artist = line['Artist'].replace('#', '')
          let track = line['Track Name']
          while (track.includes('#'))
          {
            track = track.replace('#', '')
          }
          if (artist != '' && artist != 'NA' && track != '' && track != 'NA') {return artist+','+track}
        }))].sort()
      console.log(data_preprocessed)
      return data_preprocessed
    })))

Promise.all(call_countries)
  .then(function(files) {
    let data_preprocessed = []
    files.forEach(file => {
      data_preprocessed = data_preprocessed.concat(file)
      data_preprocessed = [...new Set(data_preprocessed)].sort()
    })
    console.log(data_preprocessed)


    let csvContent = "data:text/csv;charset=utf-8,"+"Artist,Track Name"+"\n"
    + data_preprocessed.join("\n")
    //console.log(csvContent)
    var encodedUri = encodeURI(csvContent)
    window.open(encodedUri)
  })
    .catch(function(err) {
    // handle error here
    console.log(err)
  })
  
})(d3)
