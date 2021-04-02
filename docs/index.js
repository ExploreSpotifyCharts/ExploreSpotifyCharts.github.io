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

  /*let countries = [
    //'global',
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

  const PATH = './assets/data/' //for Tanguy : './'

  //EXPLORER PAR PAYS
  const country = 'fr'
  d3.csv(PATH+country+'.csv', d3.autoType).then(function (data) {
     const data_preprocessed_countrytrack = preprocess_ParPays.ExplorerParPays_Track(data, new Date('2017-01-01'), new Date('2020-04-20'))
     console.log(data_preprocessed_countrytrack)
     //here we can continue with the data -> viz
 
     const data_preprocessed_countryartist = preprocess_ParPays.ExplorerParPays_Artist(data, new Date('2017-01-01'), new Date('2020-04-20'))
     console.log(data_preprocessed_countryartist)
     //here we can continue with the data -> viz
  })

  //EXPLORER PAR ARTISTE
  const artiste = 'Orelsan'
  d3.csv(PATH+country+'.csv', d3.autoType).then(function (data) {
    const data_preprocessed_artist = preprocess_ParArtiste.ExplorerParArtiste(data, artiste, new Date('2017-01-01'), new Date('2020-04-20'))
    console.log(data_preprocessed_artist)
    //here we can continue with the data -> viz
  })

  //EXPLORER PAR TITRE
  let countries = ['be', 'ca', 'es', 'fr', 'gb', 'it', 'jp', 'us'] //à remplacer à terme par la liste complètes des country code (cf plus haut)
  const titre = 'Trop beau'
  let call_countries = []
  countries.forEach(country => call_countries.push(d3.csv(PATH+country+'.csv', d3.autoType).then(function (data) {
    const data_filtered = data.filter(line => line['Track Name'] == titre)
    //console.log(data_filtered)
    return data_filtered
  })))

  Promise.all(call_countries)
    .then(function(files) {
    const data_preprocessed_titre = preprocess_ParTitre.ExplorerParTitre(files, countries, new Date('2017-01-01'), new Date('2020-04-20'))
    console.log(data_preprocessed_titre)
    //here we can continue with the data -> viz
  })
    .catch(function(err) {
    // handle error here
    console.log(err)
  })
  
})(d3)
