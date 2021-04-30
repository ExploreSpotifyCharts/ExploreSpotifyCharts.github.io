import * as preprocess_Helpers from './preprocess_Helpers.js'

/**
 * Génère les données pour la vue Explorer par Pays (toggle sur Titres)
 *
 * @param {object[]} data Les données brutes chargées correspondant au pays sélectionné
 * @param {Date} start Le début de la période sélectionnée
 * @param {Date} end La fin de la période sélectionnée (peut être null : dans ce cas, la période sélectionnée se réduit au jour de début)
 * @returns {object[]} Les données d'intérêt pour générer la visualisation
 */
export function ExplorerParPays_Track(data, start, end=null) 
{ 
  if (!end) { end = start }
  let data_processed = data

  //Filtre sur les dates
  data_processed = data_processed.filter(line => preprocess_Helpers.isValidDate(line['date']) && preprocess_Helpers.isDateToBeConsidered(line['date'], start, end))
  
  //Création d'une nouvelle clé (concaténation Nom du titre et Nom de l'artiste)
  data_processed.forEach(line => line['key'] = line['Track_Name']+','+line['Artist'])

  //Réduction sur cette nouvelle clé
  data_processed = preprocess_Helpers.reduceDataPerKey(data_processed, 'key', ['Track_Name', 'Artist'])

  //Tri sur le nombre total de streams de chaque entrée et récupération du top k
  const k = 50
  data_processed = data_processed.sort((a,b) => b[1]['Count_total_streams']-a[1]['Count_total_streams']).slice(0,k)

  //Ajout du total et des proportions
  data_processed = preprocess_Helpers.addTotalEntry_computeProportion(data_processed)

  //Ajout des dates manquantes
  data_processed = preprocess_Helpers.fillMissingDates(data_processed, start, end)

  //Tri des streams par date
  data_processed = preprocess_Helpers.sortStreamsOnDate(data_processed)

  //Formatage
  data_processed = preprocess_Helpers.formatData(data_processed, 'key')

  return data_processed
}

//--------------------------------------------------------------------------------------------------------
/**
 * Génère les données pour la vue Explorer par Pays (toggle sur Artistes)
 *
 * @param {object[]} data Les données brutes chargées correspondant au pays sélectionné
 * @param {Date} start Le début de la période sélectionnée
 * @param {Date} end La fin de la période sélectionnée (peut être null : dans ce cas, la période sélectionnée se réduit au jour de début)
 * @returns {object[]} Les données d'intérêt pour générer la visualisation
 */
export function ExplorerParPays_Artist(data, start, end=null) 
{ 
  if (!end) { end = start }
  let data_processed = data

  //Filtre sur les dates
  data_processed = data_processed.filter(line => preprocess_Helpers.isValidDate(new Date(line['date'])) && preprocess_Helpers.isDateToBeConsidered(new Date(line['date']), start, end))
  
  //Réduction sur le nom de l'artiste
  data_processed = preprocess_Helpers.reduceDataPerKey(data_processed, 'Artist')

  //Tri sur le nombre total de streams de chaque entrée et récupération du top k
  const k = 200
  data_processed = data_processed.sort((a,b) => b[1]['Count_total_streams']-a[1]['Count_total_streams']).slice(0,k)

  //Ajout du total et des proportions
  data_processed = preprocess_Helpers.addTotalEntry_computeProportion(data_processed)

  //Ajout des dates manquantes
  data_processed = preprocess_Helpers.fillMissingDates(data_processed, start, end)

  //Tri des streams par date
  data_processed = preprocess_Helpers.sortStreamsOnDate(data_processed)

  //Formatage
  data_processed = preprocess_Helpers.formatData(data_processed, 'Artist')

  return data_processed
}