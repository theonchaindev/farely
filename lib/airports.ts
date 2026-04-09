export interface Airport {
  iata: string
  name: string
  city: string
  country: string
}

export const airports: Airport[] = [
  { iata: 'LHR', name: 'Heathrow', city: 'London', country: 'GB' },
  { iata: 'LGW', name: 'Gatwick', city: 'London', country: 'GB' },
  { iata: 'STN', name: 'Stansted', city: 'London', country: 'GB' },
  { iata: 'MAN', name: 'Manchester', city: 'Manchester', country: 'GB' },
  { iata: 'EDI', name: 'Edinburgh', city: 'Edinburgh', country: 'GB' },
  { iata: 'BHX', name: 'Birmingham', city: 'Birmingham', country: 'GB' },
  { iata: 'GLA', name: 'Glasgow', city: 'Glasgow', country: 'GB' },
  { iata: 'BRS', name: 'Bristol', city: 'Bristol', country: 'GB' },
  { iata: 'NCL', name: 'Newcastle', city: 'Newcastle', country: 'GB' },
  { iata: 'LBA', name: 'Leeds Bradford', city: 'Leeds', country: 'GB' },
  { iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'FR' },
  { iata: 'ORY', name: 'Orly', city: 'Paris', country: 'FR' },
  { iata: 'AMS', name: 'Schiphol', city: 'Amsterdam', country: 'NL' },
  { iata: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'DE' },
  { iata: 'MUC', name: 'Munich', city: 'Munich', country: 'DE' },
  { iata: 'BER', name: 'Brandenburg', city: 'Berlin', country: 'DE' },
  { iata: 'MAD', name: 'Barajas', city: 'Madrid', country: 'ES' },
  { iata: 'BCN', name: 'El Prat', city: 'Barcelona', country: 'ES' },
  { iata: 'FCO', name: 'Fiumicino', city: 'Rome', country: 'IT' },
  { iata: 'MXP', name: 'Malpensa', city: 'Milan', country: 'IT' },
  { iata: 'ATH', name: 'Eleftherios Venizelos', city: 'Athens', country: 'GR' },
  { iata: 'LIS', name: 'Humberto Delgado', city: 'Lisbon', country: 'PT' },
  { iata: 'DUB', name: 'Dublin', city: 'Dublin', country: 'IE' },
  { iata: 'CPH', name: 'Copenhagen', city: 'Copenhagen', country: 'DK' },
  { iata: 'ARN', name: 'Arlanda', city: 'Stockholm', country: 'SE' },
  { iata: 'OSL', name: 'Gardermoen', city: 'Oslo', country: 'NO' },
  { iata: 'HEL', name: 'Helsinki-Vantaa', city: 'Helsinki', country: 'FI' },
  { iata: 'VIE', name: 'Vienna', city: 'Vienna', country: 'AT' },
  { iata: 'ZRH', name: 'Zurich', city: 'Zurich', country: 'CH' },
  { iata: 'BRU', name: 'Brussels', city: 'Brussels', country: 'BE' },
  { iata: 'WAW', name: 'Chopin', city: 'Warsaw', country: 'PL' },
  { iata: 'PRG', name: 'Vaclav Havel', city: 'Prague', country: 'CZ' },
  { iata: 'BUD', name: 'Liszt Ferenc', city: 'Budapest', country: 'HU' },
  { iata: 'JFK', name: 'John F. Kennedy', city: 'New York', country: 'US' },
  { iata: 'LGA', name: 'LaGuardia', city: 'New York', country: 'US' },
  { iata: 'EWR', name: 'Newark Liberty', city: 'Newark', country: 'US' },
  { iata: 'LAX', name: 'Los Angeles', city: 'Los Angeles', country: 'US' },
  { iata: 'ORD', name: "O'Hare", city: 'Chicago', country: 'US' },
  { iata: 'ATL', name: 'Hartsfield-Jackson', city: 'Atlanta', country: 'US' },
  { iata: 'DFW', name: 'Dallas/Fort Worth', city: 'Dallas', country: 'US' },
  { iata: 'MIA', name: 'Miami', city: 'Miami', country: 'US' },
  { iata: 'SFO', name: 'San Francisco', city: 'San Francisco', country: 'US' },
  { iata: 'BOS', name: 'Logan', city: 'Boston', country: 'US' },
  { iata: 'SEA', name: 'Seattle-Tacoma', city: 'Seattle', country: 'US' },
  { iata: 'LAS', name: 'Harry Reid', city: 'Las Vegas', country: 'US' },
  { iata: 'MCO', name: 'Orlando', city: 'Orlando', country: 'US' },
  { iata: 'CUN', name: 'Cancun', city: 'Cancun', country: 'MX' },
  { iata: 'YYZ', name: 'Pearson', city: 'Toronto', country: 'CA' },
  { iata: 'YVR', name: 'Vancouver', city: 'Vancouver', country: 'CA' },
  { iata: 'DXB', name: 'Dubai', city: 'Dubai', country: 'AE' },
  { iata: 'DOH', name: 'Hamad', city: 'Doha', country: 'QA' },
  { iata: 'AUH', name: 'Abu Dhabi Zayed', city: 'Abu Dhabi', country: 'AE' },
  { iata: 'SIN', name: 'Changi', city: 'Singapore', country: 'SG' },
  { iata: 'HKG', name: 'Hong Kong', city: 'Hong Kong', country: 'HK' },
  { iata: 'NRT', name: 'Narita', city: 'Tokyo', country: 'JP' },
  { iata: 'HND', name: 'Haneda', city: 'Tokyo', country: 'JP' },
  { iata: 'ICN', name: 'Incheon', city: 'Seoul', country: 'KR' },
  { iata: 'PVG', name: 'Pudong', city: 'Shanghai', country: 'CN' },
  { iata: 'PEK', name: 'Capital', city: 'Beijing', country: 'CN' },
  { iata: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'TH' },
  { iata: 'KUL', name: 'KLIA', city: 'Kuala Lumpur', country: 'MY' },
  { iata: 'CGK', name: 'Soekarno-Hatta', city: 'Jakarta', country: 'ID' },
  { iata: 'SYD', name: 'Kingsford Smith', city: 'Sydney', country: 'AU' },
  { iata: 'MEL', name: 'Melbourne', city: 'Melbourne', country: 'AU' },
  { iata: 'BNE', name: 'Brisbane', city: 'Brisbane', country: 'AU' },
  { iata: 'AKL', name: 'Auckland', city: 'Auckland', country: 'NZ' },
  { iata: 'JNB', name: 'O.R. Tambo', city: 'Johannesburg', country: 'ZA' },
  { iata: 'CPT', name: 'Cape Town', city: 'Cape Town', country: 'ZA' },
  { iata: 'NBO', name: 'Jomo Kenyatta', city: 'Nairobi', country: 'KE' },
  { iata: 'CAI', name: 'Cairo', city: 'Cairo', country: 'EG' },
  { iata: 'CMN', name: 'Mohammed V', city: 'Casablanca', country: 'MA' },
  { iata: 'GRU', name: 'Guarulhos', city: 'São Paulo', country: 'BR' },
  { iata: 'GIG', name: 'Galeão', city: 'Rio de Janeiro', country: 'BR' },
  { iata: 'EZE', name: 'Ezeiza', city: 'Buenos Aires', country: 'AR' },
  { iata: 'BOG', name: 'El Dorado', city: 'Bogotá', country: 'CO' },
  { iata: 'LIM', name: 'Jorge Chávez', city: 'Lima', country: 'PE' },
  { iata: 'SCL', name: 'Arturo Merino Benítez', city: 'Santiago', country: 'CL' },
  { iata: 'DEL', name: 'Indira Gandhi', city: 'Delhi', country: 'IN' },
  { iata: 'BOM', name: 'Chhatrapati Shivaji', city: 'Mumbai', country: 'IN' },
  { iata: 'BLR', name: 'Kempegowda', city: 'Bangalore', country: 'IN' },
  { iata: 'CMB', name: 'Bandaranaike', city: 'Colombo', country: 'LK' },
  { iata: 'MLE', name: 'Velana', city: 'Malé', country: 'MV' },
  { iata: 'TFS', name: 'Tenerife South', city: 'Tenerife', country: 'ES' },
  { iata: 'PMI', name: 'Palma de Mallorca', city: 'Palma', country: 'ES' },
  { iata: 'AGP', name: 'Costa del Sol', city: 'Malaga', country: 'ES' },
  { iata: 'IBZ', name: 'Ibiza', city: 'Ibiza', country: 'ES' },
  { iata: 'HER', name: 'Heraklion', city: 'Heraklion', country: 'GR' },
  { iata: 'RHO', name: 'Diagoras', city: 'Rhodes', country: 'GR' },
  { iata: 'CFU', name: 'Ioannis Kapodistrias', city: 'Corfu', country: 'GR' },
  { iata: 'SKG', name: 'Thessaloniki', city: 'Thessaloniki', country: 'GR' },
  { iata: 'TLV', name: 'Ben Gurion', city: 'Tel Aviv', country: 'IL' },
  { iata: 'IST', name: 'Istanbul', city: 'Istanbul', country: 'TR' },
  { iata: 'SAW', name: 'Sabiha Gökçen', city: 'Istanbul', country: 'TR' },
  { iata: 'AYT', name: 'Antalya', city: 'Antalya', country: 'TR' },
  { iata: 'RKT', name: 'Ras Al Khaimah', city: 'Ras Al Khaimah', country: 'AE' },
  { iata: 'MCT', name: 'Muscat', city: 'Muscat', country: 'OM' },
]

export function searchAirports(query: string): Airport[] {
  const q = query.toLowerCase()
  return airports.filter(
    (a) =>
      a.iata.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q)
  ).slice(0, 8)
}

export function getAirport(iata: string): Airport | undefined {
  return airports.find((a) => a.iata === iata)
}
