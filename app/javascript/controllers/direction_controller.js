import { Controller } from "@hotwired/stimulus"
import mapboxgl from 'mapbox-gl';

// Connects to data-controller="direction"
export default class extends Controller {

  static values = {
    apiKey: String,
    parkingBay: Object,
  }

  connect() {
    mapboxgl.accessToken = this.apiKeyValue

    const map = new mapboxgl.Map({
      container: this.element,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [this.parkingBayValue.longitude, this.parkingBayValue.latitude],
      zoom: 15
    });

    // console.log(this.parkingBayValue)
    const end = [this.parkingBayValue.longitude, this.parkingBayValue.latitude];
    navigator.geolocation.getCurrentPosition((data) => {
      const start = [data.coords.longitude, data.coords.latitude];
      getRoute(start, end);
    });

    // create a function to make a directions request
    async function getRoute(start, end) {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
        { method: 'GET' }
      );
      const json = await query.json();
      const data = json.routes[0];
      const route = data.geometry.coordinates;
      const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route
        }
      };
      // if the route already exists on the map, we'll reset it using setData
      if (map.getSource('route')) {
        map.getSource('route').setData(geojson);
      }
      // otherwise, we'll make a new request
      else {
        map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: geojson
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });
      }

      const instructions = document.getElementById('instructions');
      const steps = data.legs[0].steps;

      let tripInstructions = '';
      for (const step of steps) {
        tripInstructions += `<li>${step.maneuver.instruction}</li>`;
      }

      instructions.insertAdjacentHTML('afterbegin', `<p><strong>🚗 Trip duration: ${Math.floor(data.duration / 60)} min </strong></p> <ol>${tripInstructions}</ol>`);
    }
  }
}
