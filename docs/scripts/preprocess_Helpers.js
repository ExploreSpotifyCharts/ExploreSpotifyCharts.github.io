/**
 * Parse les données initiales (à utiliser dans d3.csv)
 */
export function SpotifyDataParser(d)
{
 return {
   Position: +d.Position, //convertion en number
   Track_Name: parseTrackName_Artist(d['Track Name']),
   Artist: parseTrackName_Artist(d.Artist),
   Streams: +d.Streams, //convertion en number
   date: parseDate(d.date),
   region: d.region,
   spotify_id: d.spotify_id
   }
}

/**
 * Parse une date au format YYYY-MM-DD
 * @param {string} input Date à parser
 * @returns {Date} La date parsée
 */
export function parseDate(input)
{
  if(input == null) return null
  let parts = input.split('-')
  return new Date(parts[0], parts[1]-1, parts[2]) // Les mois sont indexés à partir de 0
}

/**
 * Parse un titre de chanson ou le nom d'un artiste 
 * @param {string} input Titre de chanson ou nom d'un artiste à parser
 * @returns {Date} Titre de chanson ou nom d'un artiste parsé
 */
export function parseTrackName_Artist(input)
{
  while (input.includes('#'))
  {
    input = input.replace('#', '')
  }
  while (input.includes(','))
  {
    input = input.replace(',', '')
  }
  while (input.includes('&'))
  {
    input = input.replace('&', 'and')
  }
  return input
}

/**
 * Vérifie si une date est valide
 * @param {object} input Date à vérifier
 * @returns {boolean} Vrai si la date est valide
 */
export function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

/**
 * Vérifie si une date est comprise entre deux dates (début et fin)
 * @param {Date} d Date à vérifier
 * @param {Date} start Date de début
 * @param {Date} end Date de fin
 * @returns {boolean} Vrai si la date est comprise entre les deux dates
 */
export function isDateToBeConsidered(d, start, end)
{
  return (d.getTime() >= start.getTime()) && (d.getTime() <= end.getTime())
}

/**
 * Réduit les données en utilisant une clé
 * @param {object[]} data Données à réduire
 * @param {string} key Clé à utiliser
 * @param {string[]} keys_to_keep Clés supplémentaires à conserver lors de la réduction
 * @returns {object[]} Données réduites
 */
export function reduceDataPerKey(data, key, keys_to_keep=[])
{
  let data_processed = data.reduce(function (acc, line) {
    const date = line['date']
    const dateISO = date.toISOString().split('T')[0]
    if (typeof acc[line[key]] == 'undefined')
    {
      acc[line[key]] = {}
      keys_to_keep.forEach(key_to_keep => acc[line[key]][key_to_keep] = line[key_to_keep])
      acc[line[key]]['Streams'] = {}
      acc[line[key]]['Count_total_streams'] = 0
    }
    if (typeof acc[line[key]]['Streams'][dateISO] == 'undefined')
    {
      acc[line[key]]['Streams'][dateISO] = 0
    }
    acc[line[key]]['Streams'][dateISO] += line['Streams']
    acc[line[key]]['Count_total_streams'] += line['Streams']
    return acc
  }, {})
  return Object.entries(data_processed)
}

/**
 * Réduit les données à un seul élément en utilisant une clé (partagée entre tous les éléments)
 * @param {object[]} data Données à réduire
 * @param {string} key_to_use Clé à utiliser
 * @returns {object} Données réduites à un élément
 */
export function reduceDataToOneElement(data, key_to_use)
{
  let output = []
  output.push(key_to_use)
  output.push({})

  output[1]['Streams'] = {}
  output[1]['Count_total_streams'] = 0

  data.forEach(line =>
    {
      const date = line['date']
      const dateISO = date.toISOString().split('T')[0]
      if (typeof output[1]['Streams'][dateISO] == 'undefined')
      {
        output[1]['Streams'][dateISO] = 0
      }
      output[1]['Streams'][dateISO] += line['Streams']
      output[1]['Count_total_streams'] += line['Streams']
    }
  )

  return output
}

/**
 * Ajoute aux données une entrée 'Total' et calcule les proportions de chaque entrée par rapport à 'Total'
 * @param {object[]} data Données à traiter
 * @returns {object[]} Données traitées
 */
export function addTotalEntry_computeProportion(data)
{
  //Ajout de l'entrée 'Total'
  let newEntry = []
  newEntry[0] = 'Total'
  newEntry[1] = {}
  newEntry[1]['Track_Name'] = 'Total'
  newEntry[1]['Streams'] = {}
  newEntry[1]['Count_total_streams'] = 0

  data.forEach(line =>
    {
      for (const [date, count] of Object.entries(line[1]['Streams']))
      {
        if (typeof newEntry[1]['Streams'][date] == 'undefined')
        {
          newEntry[1]['Streams'][date] = 0
        }
        newEntry[1]['Streams'][date] += count
        newEntry[1]['Count_total_streams'] += count
      }
    }
  )

  data.unshift(newEntry)

  //Calcul des proportions de chaque entrée
  const total = newEntry[1]['Count_total_streams']

  data.forEach(function(line, index)
    {
      const total_entry = line[1]['Count_total_streams']
      line[1]['Proportion_total_streams'] = total_entry / total
    }
  )

  return data
}

/**
 * Ajoute aux données les valeurs de dates manquantes (entre début et fin)
 * @param {object[]} data Données à traiter
 * @param {Date} start Date de début
 * @param {Date} end Date de fin
 * @returns {object[]} Données traitées
 */
export function fillMissingDates(data, start, end)
{
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateISO = d.toISOString().split('T')[0]
    data.forEach(line =>
      {
        if (typeof line[1]['Streams'][dateISO] == 'undefined')
        {
          line[1]['Streams'][dateISO] = 0
        }
      }
    )
  }
  return data
}

/**
 * Trie les objets streams de chaque entrée selon leur date
 * @param {object[]} data Données à traiter
 * @returns {object[]} Données traitées
 */
export function sortStreamsOnDate(data)
{
  data.forEach(line =>
    {
      let sorted = Object.keys(line[1]['Streams'])
        .sort()
        .reduce(function (acc, key) { 
        acc[key] = line[1]['Streams'][key];
        return acc;
        }, {});
      line[1]['Streams'] = sorted
    })
  return data
}

/**
 * Formatte les données pour générer les visualisation
 * @param {object[]} data Données à formater
 * @param {string} key_name Nom de la clé à utiliser
 * @returns {object[]} Données formatées
 */
export function formatData(data, key_name)
{
  let data_formatted = data.map(line => {
    let entry = {}
    entry[key_name] = line[0]
    for (const [ key, value ] of Object.entries(line[1])) {
      entry[key] = value
    }

    let streams_dates = line[1]['Streams']
    let streams_array = [];
      for (var date in streams_dates) {
        streams_array.push({'Date':date, 'Streams':streams_dates[date]})
      }
    entry['Streams'] = streams_array
    return entry
  })
  return data_formatted
}