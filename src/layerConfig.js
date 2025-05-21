import { markerSizes, markerColors } from './markerStyleConfig.js'

const includedAerodromes = ['ESSA', 'ESSB', 'ESNQ', 'ESPE', 'ESPA', 'ESNS', 'ESNX', 'ESNU', 'ESNO', 'ESNZ', 'ESNN', 'ESND', 'ESKS', 'ESCM', 'ESOW', 'ESOK', 'ESGP', 'ESGG', 'ESIB', 'ESIA', 'ESGJ', 'ESMT', 'ESMS', 'ESMK', 'ESDF', 'ESMQ', 'ESSV', 'ESSL', 'ESCF', 'ESKN', 'ESSU']

export default {
    layerFIR: {
        label: 'FIR',
        popupEnabled: false,
        url: 'https://daim.lfv.se/geoserver/wfs?service=WFS&&version=1.1.0&request=GetFeature&typename=mais:FIR&outputFormat=application/json&srsname=EPSG:4326',
        style: {
            color: 'red',
            weight: 1,
            opacity: 0.5,
            fill: false
        }
    },
    seaborder: {
        label: 'Sjögräns',
        popupEnabled: false,
        url: 'https://daim.lfv.se/geoserver/wfs?service=WFS&&version=1.1.0&request=GetFeature&typename=DAIM_TOPO:Terrvattengrans&outputFormat=application/json&srsname=EPSG:4326',
        style: {
            color: 'blue',
            weight: 1,
            fill: false,
            opacity: 0.6
        }
    },
    airports: {
        label: 'Flygplatser',
        popupEnabled: true,
        url: 'https://daim.lfv.se/geoserver/wfs?service=WFS&&version=1.1.0&request=GetFeature&typename=mais:ARP&outputFormat=application/json&srsname=EPSG:4326',
        filter: (feature) => {
            return includedAerodromes.includes(feature.properties.POSITIONINDICATOR)
        },
        pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
                radius: markerSizes.small,
                color: markerColors.gray,
                fillColor: markerColors.gray,
                fillOpacity: 1
            })
        }
    },
    aerodromes: {
        label: 'Flygfält',
        popupEnabled: true,
        url: 'https://daim.lfv.se/geoserver/wfs?service=WFS&&version=1.1.0&request=GetFeature&typename=mais:ARP&outputFormat=application/json&srsname=EPSG:4326',
        filter: (feature) => {
            return !includedAerodromes.includes(feature.properties.POSITIONINDICATOR)
        },
        pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
                radius: markerSizes.smallest,
                color: markerColors.gray,
                fillColor: markerColors.gray,
                fillOpacity: 1
            })
        }
    }
}
