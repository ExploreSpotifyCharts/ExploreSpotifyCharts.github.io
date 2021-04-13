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

  /*
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
  */


const PATH = './assets/data/'
let countries = ['global', 'be', 'ca', 'fr'] //à remplacer à terme par la liste complètes des country code (cf plus haut)
let call_countries = []

//DOWNLOAD track_countries.csv
/*
countries.forEach(country => call_countries.push(d3.csv(PATH+country+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
  let tracks = [...new Set(data.map(line => {
    if (line && line['Track Name'])
    {
      let track = line['Track Name']
      while(track.includes('#'))
      {
        track = track.replace('#','')
      }
      while(track.includes(','))
      {
        track = track.replace(',','')
      }
      return track
    }
  }))].sort()
  
  let index_to_remove = tracks.indexOf('')
  if (index_to_remove > -1) { tracks.splice(index_to_remove, 1)}
  index_to_remove = tracks.indexOf('NA')
  if (index_to_remove > -1) { tracks.splice(index_to_remove, 1)}

  console.log(tracks)
  return tracks
})))

Promise.all(call_countries)
  .then(function(files) {
    let data_preprocessed = {}
    files.forEach((file, index) => {
      file.forEach(track =>
        {
          const country_code = countries[index]
          if (typeof data_preprocessed[track] == 'undefined')
          {
            data_preprocessed[track] = []
          }
          data_preprocessed[track].push(country_code)
        })
    })
    data_preprocessed = Object.entries(data_preprocessed)
    console.log(data_preprocessed)


    let csvContent = "data:text/csv;charset=utf-8,"+"Track Name,Countries"+"\n"
      + data_preprocessed.map(e => e[0]+','+e[1].join("|")).join("\n");
    //console.log(csvContent)
    var encodedUri = encodeURI(csvContent)
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "track_countries.csv");
    document.body.appendChild(link); // Required for FF
    link.click(); // This will download the data file named "my_data.csv".

  })
    .catch(function(err) {
    // handle error here
    console.log(err)
  })
  */

//DOWNLOAD artist_countries.csv
/*
countries.forEach(country => call_countries.push(d3.csv(PATH+country+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
  let artists = [...new Set(data.map(line => {
    if (line && line['Artist'])
    {
      let artist = line['Artist']
      while(artist.includes('#'))
      {
        artist = artist.replace('#','')
      }
      while(artist.includes(','))
      {
        artist = artist.replace(',','')
      }
      return artist
    }
  }))].sort()
  
  let index_to_remove = artists.indexOf('')
  if (index_to_remove > -1) { artists.splice(index_to_remove, 1)}
  index_to_remove = artists.indexOf('NA')
  if (index_to_remove > -1) { artists.splice(index_to_remove, 1)}

  console.log(artists)
  return artists
})))

Promise.all(call_countries)
  .then(function(files) {
    let data_preprocessed = {}
    files.forEach((file, index) => {
      file.forEach(track =>
        {
          const country_code = countries[index]
          if (typeof data_preprocessed[artist] == 'undefined')
          {
            data_preprocessed[artist] = []
          }
          data_preprocessed[artist].push(country_code)
        })
    })
    data_preprocessed = Object.entries(data_preprocessed)
    console.log(data_preprocessed)


    let csvContent = "data:text/csv;charset=utf-8,"+"Artist,Countries"+"\n"
      + data_preprocessed.map(e => e[0]+','+e[1].join("|")).join("\n");
    //console.log(csvContent)
    var encodedUri = encodeURI(csvContent)
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "artist_countries.csv");
    document.body.appendChild(link); // Required for FF
    link.click(); // This will download the data file named "my_data.csv".

  })
    .catch(function(err) {
    // handle error here
    console.log(err)
  })
  */

  //DOWNLOAD titres.csv
  /*
  countries.forEach(country => call_countries.push(d3.csv(PATH+country+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
      let data_preprocessed = [...new Set(data.map(line => 
        {
          if(line && line['Artist'] && line['Track Name']){
            let artist = line['Artist'].replace('#', '')
            let track = line['Track Name']
            while (track.includes('#'))
            {
              track = track.replace('#', '')
            }
            while (track.includes(','))
            {
              track = track.replace(',', '')
            }
            while (artist.includes('#'))
            {
              artist = artist.replace('#', '')
            }
            while (artist.includes(','))
            {
              artist = artist.replace(',', '')
            }
            if (artist != '' && artist != 'NA' && track != '' && track != 'NA') {return artist+','+track}
            }
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
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "titres.csv");
    document.body.appendChild(link); // Required for FF
    link.click(); // This will download the data file named "my_data.csv".

  })
    .catch(function(err) {
    // handle error here
    console.log(err)
  })
  */
  
})(d3)
