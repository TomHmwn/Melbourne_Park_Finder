import { Controller } from "@hotwired/stimulus"
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder"

let previouslyLoaded = false;

// Connects to data-controller="map"
export default class extends Controller {

  static values = {
    apiKey: String,
    parkingBays: Object,
  }
  connect() {
    console.log('previous loaded: ', previouslyLoaded)
    this.easingDuration = previouslyLoaded ? 0 : 1000
    previouslyLoaded = true
    // console.log(this.parkingBaysValue)
    mapboxgl.accessToken = this.apiKeyValue

    this.loadMap()
  }

  loadMap() {
    console.log('loading map')
    this.map = new mapboxgl.Map({
      container: this.element,
      style: 'mapbox://styles/mapbox/dark-v11',
      // center: [-103.5917, 40.6699], // [longitude, latitude]
      center: [144.947982, -37.8187],
      zoom: 3
    });

    this.map.on('load', ()=> {
      this.map.addSource('parking_bays', {
        type: 'geojson',
        data: this.parkingBaysValue,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      this.map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'parking_bays',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            100,
            '#f1f075',
            750,
            '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40
          ]
        }
      });

      this.map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'parking_bays',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      });

      // console.log(this.parkingBaysValue.features);
      // this.parkingBaysValue.features.forEach((feature) => {
      //   if (feature.properties.occupied === true) {
      //     let availability_color = '#f28cb1';
      //   }
      //   else {
      //     let availability_color = '#51bbd6';
      //   }
      // });

      this.map.addLayer({ // individual parking bay markers
        id: 'unclustered-point',
        type: 'circle',
        source: 'parking_bays',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 10,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      });

      this.map.on('click', 'clusters', function (e) {
        const features = this.map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;

        this.map.getSource('parking_bays').getClusterExpansionZoom(clusterId, function (err, zoom) {
          if (err) return;

          this.map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom
          });
        }.bind(this));
      }.bind(this));

      this.map.on('mouseenter', 'clusters', function (e) {
        this.map.getCanvas().style.cursor = 'pointer';
      }.bind(this));

      this.map.on('mouseleave', 'clusters', function () {
        this.map.getCanvas().style.cursor = '';
      }.bind(this));

      this.map.on('click', 'unclustered-point', function (e) {
        const features = this.map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });
        const infoWindow = features[0].properties.info_window;
        const coordinates = features[0].geometry.coordinates;

        this.map.easeTo({
          center: features[0].geometry.coordinates
        });

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(infoWindow)
          .addTo(this.map);
      }.bind(this));

      this.map.on('mouseenter', 'unclustered-point', function () {
        this.map.getCanvas().style.cursor = 'pointer';
      }.bind(this));

      this.map.on('mouseleave', 'unclustered-point', function () {
        this.map.getCanvas().style.cursor = '';
      }.bind(this));

      this.#fitMapToMarkers(this.map, this.parkingBaysValue.features);

      this.map.addControl(new MapboxGeocoder({ accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl }), 'top-left')
    });
  }

  #fitMapToMarkers = (map, features) => {
    const bounds = new mapboxgl.LngLatBounds();
    features.forEach(({ geometry }) => bounds.extend(geometry.coordinates));
    this.map.fitBounds(bounds, { padding: 70, maxZoom: 15, duration: this.easingDuration });
  };

  #addMarkersToMap() {
    this.markersValue.forEach((marker) => {
      const popup = new mapboxgl.Popup().setHTML(marker.info_window_html)

      // Create a HTML element for your custom marker
      const customMarker = document.createElement("div")
      customMarker.innerHTML = marker.marker_html

      // Pass the element as an argument to the new marker
      new mapboxgl.Marker(customMarker)
        .setLngLat([marker.lng, marker.lat])
        .setPopup(popup)
        .addTo(this.map)
    })
  }

}
