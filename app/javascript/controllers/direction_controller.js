import { Controller } from "@hotwired/stimulus"
import mapboxgl from 'mapbox-gl';



// Connects to data-controller="direction"
export default class extends Controller {
  static targets = [ "start", "end" ]

  static values = {
    apiKey: String,
    parkingBay: Object,

  }

  connect() {
    mapboxgl.accessToken = this.apiKeyValue

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [this.parkingBayValue.longitude, this.parkingBayValue.latitude],
      zoom: 15
    });

    this.end = [this.parkingBayValue.longitude, this.parkingBayValue.latitude];
    navigator.geolocation.getCurrentPosition(async (data) => {
       this.start = [data.coords.longitude, data.coords.latitude];
       fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${this.start[0]},${this.start[1]}.json?access_token=${mapboxgl.accessToken}   `)
       .then(response => response.json())
       .then(data => {
          this.start[2] = data.features[0].place_name;
          this.startTarget.value = this.start[2];
          this.endTarget.value = this.parkingBayValue.address;
        });
       await getRoute(this.start, this.end);
      //  this.#setBounds([this.start, this.end]);
       map.fitBounds([
        this.start, // southwestern corner of the bounds
        this.end // northeastern corner of the bounds
        ], { padding: 100, maxZoom: 20, duration: 2100});
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
            'line-color': '#217cde',
            'line-width': 5,
            'line-opacity': 1
          }
        });
      }
      // Add starting point to the map
      map.addLayer({
        id: 'point',
        type: 'circle',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: start
                }
              }
            ]
          }
        },
        paint: {
          'circle-radius': 5,
          'circle-color': '#3887be',
          'circle-opacity': 1,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        }
      });

      const duration = document.getElementById('duration');
      duration.innerHTML = '';
      duration.insertAdjacentHTML('afterbegin', `${Math.floor(data.duration / 60)} min`);
    }
    const popup = new mapboxgl.Popup().setText(this.parkingBayValue.address);

    new mapboxgl.Marker({ color: 'red', scale: 0.6 })
    .setLngLat(this.end)
    .setPopup(popup)
    .addTo(map)

  }

}
