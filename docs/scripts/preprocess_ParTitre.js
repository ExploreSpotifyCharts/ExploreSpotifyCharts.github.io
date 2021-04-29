import * as preprocess_Helpers from './preprocess_Helpers.js'

/**
 * Génère les données pour la vue Explorer par Titre
 *
 * @param {object[][]} data_countries Les données brutes chargées correspondant au titre sélectionné (plusieurs pays, données déjà filtrées pour n'avoir que le titre d'intérêt)
 * @param {string[]} countries Les noms des pays (ordonnés comme les données brutes)
 * @param {Date} start Le début de la période sélectionnée
 * @param {Date} end La fin de la période sélectionnée (peut être null : dans ce cas, la période sélectionnée se réduit au jour de début)
 * @returns {object[]} Les données d'intérêt pour générer la visualisation
 */
export function ExplorerParTitre(data_countries, countries, start, end=null) 
{
  if (!end) { end = start }

  let data_processed = []
  data_countries.forEach((data_country, index) =>
    {
      const country_name = countries[index]['country']

      let data_country_preprocessed = data_country

      //Filtre sur les dates
      data_country_preprocessed = data_country_preprocessed.filter(line => preprocess_Helpers.isValidDate(line['date']) && preprocess_Helpers.isDateToBeConsidered(line['date'], start, end))
      
      //Réduction à un élément
      data_country_preprocessed = preprocess_Helpers.reduceDataToOneElement(data_country_preprocessed, country_name)

      //Vérification que des données sont disponibles pour ce pays, et si oui, ajout aux données conservées
      if (data_country_preprocessed[1]['Count_total_streams'] != 0)
      {
        data_processed.push(data_country_preprocessed)
      }
    })

  //Tri sur le nombre total de streams de chaque entrée
  data_processed.sort((a,b) => b[1]['Count_total_streams']-a[1]['Count_total_streams'])

  //Ajout du total et des proportions
  data_processed = preprocess_Helpers.addTotalEntry_computeProportion(data_processed)

  //Ajout des dates manquantes
  data_processed = preprocess_Helpers.fillMissingDates(data_processed, start, end)

  //Tri des streams par date
  data_processed = preprocess_Helpers.sortStreamsOnDate(data_processed)

  //Formatage
  data_processed = preprocess_Helpers.formatData(data_processed, 'Region')

  return data_processed
}