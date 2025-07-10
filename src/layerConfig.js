import { markerSizes, markerColors } from './markerStyleConfig.js'

const includedAerodromes = ['ESSA', 'ESSB', 'ESNQ', 'ESPE', 'ESPA', 'ESNS', 'ESNX', 'ESNU', 'ESNO', 'ESNZ', 'ESNN', 'ESND', 'ESKS', 'ESCM', 'ESOW', 'ESOK', 'ESGP', 'ESGG', 'ESIB', 'ESIA', 'ESGJ', 'ESMT', 'ESMS', 'ESMK', 'ESDF', 'ESMQ', 'ESSV', 'ESSL', 'ESCF', 'ESKN', 'ESSU']

const lfvICAO = [
    'ESNQ', // Kiruna
    'ESPE', // Vidsel
    'ESPA', // Luleå/Kallax
    'ESNU', // Umeå
    'ESNZ', // Åre Östersund
    'ESCM', // Uppsala
    'ESSA', // Stockholm Arlanda
    'ESSB', // Stockholm Bromma
    'ESIB', // Såtenäs (F 7)
    'ESIA', // Karlsborg (F 6)
    'ESCF', // Linköping Malmen
    'ESSV', // Visby
    'ESDF', // Ronneby (F 17)
    'ESMS', // Malmö Sturup
    'ESMT', // Halmstad
    'ESGG'  // Göteborg Landvetter
  ];

export default {
    layerFIR: {
        label: 'FIR',
        url: '/geo/fir.json',
        style: {
            color: 'red',
            weight: 1,
            opacity: 0.5,
            fill: false
        }
    },
    seaborder: {
        label: 'Sjögräns',
        url: '/geo/seaborder.json',
        style: {
            color: 'blue',
            weight: 1,
            fill: false,
            opacity: 0.6
        }
    },
    lan: {
        label: 'Län',
        url: '/geo/provinces.geojson',
        style: {
            color: 'purple',
            weight: 0.5,
            fill: false,
            opacity: 0.5
        }
    },    
    airports: {
        label: 'Flygplatser',
        url: '/geo/airports.json',
        filterList: lfvICAO,
        showInMenu: false
    },
    centers: {
        label: 'ACC & RTC',
        url: '/geo/centers.geojson',
        showInMenu: false,                // list controls visibility, no layer toggle
        pointToLayer: (feature, latlng) => {
            /* rectangle marker with divIcon */
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: 'center-icon',
                    iconSize: [12, 12]
                })
            })
        }
    }
      
}
