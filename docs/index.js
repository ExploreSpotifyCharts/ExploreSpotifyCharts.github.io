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
  let country
  let start_date
  let end_date

  /*
  //EXPLORER PAR PAYS
  country = 'fr'
  start_date = preprocess_Helpers.parseDate('2017-01-01')
  end_date = preprocess_Helpers.parseDate('2020-04-20')
  d3.csv(PATH+country+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
     const data_preprocessed_countrytrack = preprocess_ParPays.ExplorerParPays_Track(data, start_date, end_date)
     console.log(data_preprocessed_countrytrack)
     //here we can continue with the data -> viz
 
     const data_preprocessed_countryartist = preprocess_ParPays.ExplorerParPays_Artist(data, start_date, end_date)
     console.log(data_preprocessed_countryartist)
     //here we can continue with the data -> viz
  })

  //EXPLORER PAR ARTISTE
  const artiste = 'Orelsan'
  country = 'fr'
  start_date = preprocess_Helpers.parseDate('2017-01-01')
  end_date = preprocess_Helpers.parseDate('2020-04-20')
  d3.csv(PATH+country+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
    const data_preprocessed_artist = preprocess_ParArtiste.ExplorerParArtiste(data, artiste, start_date, end_date)
    console.log(data_preprocessed_artist)
    //here we can continue with the data -> viz
  })

  //EXPLORER PAR TITRE
  let countries = ['be', 'ca', 'es', 'fr', 'gb', 'it', 'jp', 'us'] //à remplacer à terme par la liste complètes des country code (cf plus haut)
  const titre = 'Trop beau'
  start_date = preprocess_Helpers.parseDate('2017-01-01')
  end_date = preprocess_Helpers.parseDate('2020-04-20')

  let call_countries = []
  countries.forEach(country => call_countries.push(d3.csv(PATH+country+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
    const data_filtered = data.filter(line => line['Track Name'] == titre)
    //console.log(data_filtered)
    return data_filtered
  })))

  Promise.all(call_countries)
    .then(function(files) {
    const data_preprocessed_titre = preprocess_ParTitre.ExplorerParTitre(files, countries, start_date, end_date)
    console.log(data_preprocessed_titre)
    //here we can continue with the data -> viz
  })
    .catch(function(err) {
    // handle error here
    console.log(err)
  })

  //EXPLORER PAR TENDANCE
  const start = [1,6]
  const end = [1,9]
  country = 'global'
  d3.csv(PATH+country+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
    const data_preprocessed_tendance = preprocess_ParTendance.ExplorerParTendance(data, start[0], start[1], end[0], end[1])
    console.log(data_preprocessed_tendance)
    //here we can continue with the data -> viz
  })
  */


let countries = ['be', 'ca', 'es', 'fr', 'gb', 'it', 'jp', 'us'] //à remplacer à terme par la liste complètes des country code (cf plus haut)
let call_countries = []
countries.forEach(country => call_countries.push(d3.csv(PATH+country+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
      let uniq_artists = [...new Set(data.map(line => line['Artist'].replace('#', '')))].sort()
      console.log(uniq_artists)
      return uniq_artists
    })))

Promise.all(call_countries)
  .then(function(files) {
    let artists = []
    files.forEach(file => {
      artists = artists.concat(file)
      artists = [...new Set(artists)].sort()
    })
    let index_to_remove = artists.indexOf('')
    if (index_to_remove > -1) { artists.splice(index_to_remove, 1)}
    index_to_remove = artists.indexOf('NA')
    if (index_to_remove > -1) { artists.splice(index_to_remove, 1)}
    console.log(artists)

    let csvContent = "data:text/csv;charset=utf-8,"
    + 'Artist' + '\n' + artists.join("\n")
    console.log(csvContent)
    var encodedUri = encodeURI(csvContent)
    window.open(encodedUri)
  })
    .catch(function(err) {
    // handle error here
    console.log(err)
  })


/*country = 'be'
d3.csv(PATH+country+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
  const artists = data.map(line => line['Artist'].replace('#', ''))
  const uniq_artists = [...new Set(artists)].sort()
  console.log(uniq_artists)

  let csvContent = "data:text/csv;charset=utf-8,"
    + uniq_artists.join("\n")
    console.log(csvContent)
    var encodedUri = encodeURI(csvContent)
    window.open(encodedUri)
})
*/


  
})(d3)
