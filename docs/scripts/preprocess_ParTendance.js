import * as preprocess_Helpers from './preprocess_Helpers.js'

/**
 * Génère les données pour la vue Explorer par Tendances
 *
 * @param {object[]} data Les données brutes chargées correspondant au pays sélectionné
 * @param {string} artiste Le nom de l'artiste d'intérêt
 * @param {int} start_day Le jour de la date de début de la période sélectionnée
 * @param {int} start_month Le mois de la date de début de la période sélectionnée
 * @param {int} end_day Le jour de la date de fin de la période sélectionnée (peut être null, dans ce cas on prendra la date de fin comme date de début pour réduire la période étudiée à la journée de début)
 * @param {int} end_month Le mois de la date de fin de la période sélectionnée (peut être null, dans ce cas on prendra la date de fin comme date de début pour réduire la période étudiée à la journée de début)
 * @returns {object[]} Les données d'intérêt pour générer la visualisation
 */
export function ExplorerParTendance(data, start_day, start_month, end_day=null, end_month=null) 
{
  if (!end_day || !end_month)
  { 
    end_day = start_day
    end_month = start_month
  }

  let dates = {}
  for (let year = 2017; year <= 2020; year++) {
    dates[year] = {}
    dates[year]['start'] = new Date(year, start_month-1, start_day) //Les mois sont indéxés à partir de 0
    dates[year]['end'] = new Date(year, end_month-1, end_day) //Les mois sont indéxés à partir de 0
  }

  let data_processed = data

  //Filtre sur la date
  data_processed = data_processed.filter(line => 
    {
      const current_date = line['date']
      if (!(preprocess_Helpers.isValidDate(current_date)))
      {
        return false
      }
      const year = current_date.getFullYear()
      return preprocess_Helpers.isDateToBeConsidered(current_date, dates[year]['start'], dates[year]['end'])
    })

  //Ajout d'une clé 'Year' pour l'année
  data_processed.forEach(line =>
    {
      line['Year'] = line['date'].getFullYear()
    }
  )

  //Réduction des données sur la clé 'Year'
  data_processed = data_processed.reduce(function (acc, line) {
    if (typeof acc[line['Year']] == 'undefined')
    {
      acc[line['Year']] = {}
      acc[line['Year']]['Tracks'] = {}
    }
  
    const key = line['Track_Name']+','+line['Artist']
    if (typeof acc[line['Year']]['Tracks'][key] == 'undefined')
    {
      acc[line['Year']]['Tracks'][key] = {}
      acc[line['Year']]['Tracks'][key]['Track_Name'] = line['Track_Name']
      acc[line['Year']]['Tracks'][key]['Artist'] = line['Artist']
      acc[line['Year']]['Tracks'][key]['Streams'] = {}
      acc[line['Year']]['Tracks'][key]['Count_total_streams'] = 0
    }
  
    const date = line['date']
    const dateISO = date.toISOString().split('T')[0]

    acc[line['Year']]['Tracks'][key]['Streams'][dateISO] = line['Streams']
    acc[line['Year']]['Tracks'][key]['Count_total_streams'] += line['Streams']
    return acc
  }, {})
  data_processed = Object.entries(data_processed)

  //Tri sur le nombre total de streams de chaque entrée et récupération du top 5
  data_processed.forEach(line =>
    {
      var tracks = line[1]['Tracks']

      let sortable = [];
      for (var track in tracks) {
          sortable.push({
          'Track_Name': tracks[track]['Track_Name'],
          'Artist': tracks[track]['Artist'],
          'Count_total_streams' :tracks[track]['Count_total_streams'],
          'Streams': tracks[track]['Streams']
        })
      }
      sortable.sort(function(a, b) {
          return b['Count_total_streams'] - a['Count_total_streams']
      })

      line[1]['Tracks'] = sortable.slice(0,5)
    })

  //Pour chaque année, ajout d'une entrée 'Total'
  data_processed.forEach(line =>
  {
    let newEntry = {}
    newEntry['Track_Name'] = 'Total'
    newEntry['Count_total_streams'] = 0
    newEntry['Streams'] = {}

    line[1]['Tracks'].forEach(track =>
      {
        for (const [date, count] of Object.entries(track['Streams']))
          {
            if (typeof newEntry['Streams'][date] == 'undefined')
            {
              newEntry['Streams'][date] = 0
            }
            newEntry['Streams'][date] += count
            newEntry['Count_total_streams'] += count
          }
      }
      )
      line[1]['Tracks'].unshift(newEntry)
  })

  //Pour chaque année, calcule de la proportion de chaque entrée par rapport au 'Total'
  data_processed.forEach(line =>
  {
    const total = line[1]['Tracks'][0]['Count_total_streams']

    line[1]['Tracks'].forEach(function(track)
      {
        const total_entry = track['Count_total_streams']
        track['Proportion_total_streams'] = total_entry / total
      }
    )
  })


  //Ajout des dates manquantes
  data_processed.forEach(line =>
  {
    const year = line[0]
    const start = dates[year]['start']
    const end = dates[year]['end']

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateISO = d.toISOString().split('T')[0]
      line[1]['Tracks'].forEach(track =>
        {
          if (typeof track['Streams'][dateISO] == 'undefined')
          {
            track['Streams'][dateISO] = 0
          }
        }
      )
    }
  })

  //Tri des streams par date
  data_processed.forEach(line =>
  {
    line[1]['Tracks'].forEach(track =>
    {
      let sorted = Object.keys(track['Streams'])
        .sort()
        .reduce(function (acc, key) { 
        acc[key] = track['Streams'][key];
        return acc;
        }, {});
      track['Streams'] = sorted
    })
  })

  //Formatage
  data_processed = data_processed.map(line => {
    let entry = {}
    entry['Year'] = line[0]
    entry['Tracks'] = line[1]['Tracks']

    entry['Tracks'].forEach(track =>
    {
      let streams_dates = track['Streams']
      let streams_array = []
      for (var date in streams_dates)
      {
        streams_array.push({'Date':date, 'Streams':streams_dates[date]})
      }
      track['Streams'] = streams_array
    })
    return entry
  })

  //Ajout des entrées d'années manquantes et tri sur les années (pour avoir toujours 4 entrées [2017-2018-2019-2020])
  const years_in_data = data_processed.map(entry => entry['Year'])
  for (const year in dates)
  {
    if (!(years_in_data.includes(year)))
    {
      let new_entry = {}
      new_entry['Year'] = year
      new_entry['Tracks'] = []
      data_processed.push(new_entry)
    }
  }
  data_processed.sort(function(a, b) {
    return a['Year'] - b['Year']
  })

  return data_processed
}