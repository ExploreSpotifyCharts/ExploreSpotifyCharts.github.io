'use strict'

//import * as d3Chromatic from 'd3-scale-chromatic'
//import $ from "jquery";
//import d3Tip from 'd3-tip'

import * as preprocess_Helpers from './scripts/preprocess_Helpers.js'
import * as preprocess_ParPays from './scripts/preprocess_ParPays.js'
import * as preprocess_ParArtiste from './scripts/preprocess_ParArtiste.js'
import * as preprocess_ParTitre from './scripts/preprocess_ParTitre.js'
import * as preprocess_ParTendance from './scripts/preprocess_ParTendance.js'

import * as helper from './scripts/helper.js'
import * as viz from './scripts/viz.js'
import * as viz_ParArtiste from './scripts/viz_ParArtiste.js'

import * as tooltip from './scripts/tooltip.js'

import * as interactivity from './scripts/interactivity.js'

import * as onboarding from './scripts/onboarding.js'

/**
 * @file This file is the entry-point for the the code for Team 3 project for the course INF8808.
 * @author Justine Marlow
 * @author Marine Carpe
 * @author Tanguy Gloaguen
 */

//Chemin pour accèder aux données
export const PATH = './assets/data/'

//Constantes de taille pour le placement des éléments
export const margin = {
  top: 40,
  right: 60,
  bottom: 100,
  left: 60
}
export const sidebarWidth = 0.15
export const windowWidth = window.innerWidth
export const windowHeight = window.innerHeight
export const svgWidth = (windowWidth*(1-sidebarWidth))
export const vizWidth = svgWidth - margin.left - margin.right;

//Error messages
export const no_data_error = "Oops aucune donnée n'est disponible, essayez avec d'autres paramètres."
export const other_error = "Oops quelque chose s'est mal passé, veuillez réessayer."
export const no_data_2020_error = "Oops pas de donnée disponible pour cette période sur l'année 2020"

/* Loader settings */
export var spinnerOpts = {
  lines: 9, // The number of lines to draw
  length: 9, // The length of each line
  width: 10, // The line thickness
  radius: 28, // The radius of the inner circle
  color: '#1db954', // #rgb or #rrggbb or array of colors
  speed: 1.9, // Rounds per second
  trail: 50, // Afterglow percentage
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 99
};



(function (d3) {

  //Mise en place du onboarding
  onboarding.initialize()

  //Mise en place de l'intéraction
  interactivity.initialize()

  /*
  //EXPLORER PAR TENDANCE
  const start = [1,6]
  const end = [1,9]
  country = 'global'
  d3.csv(PATH+country+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
    const data_preprocessed_tendance = preprocess_ParTendance.ExplorerParTendance(data, start[0], start[1], end[0], end[1])
    console.log(data_preprocessed_tendance)
    //here we can continue with the data -> viz
    })*/
})(d3)
