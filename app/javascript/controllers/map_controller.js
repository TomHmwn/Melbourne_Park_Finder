import { Controller } from "@hotwired/stimulus"
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder"

let previouslyLoaded = false;

// Connects to data-controller="map"
export default class extends Controller {
  static targets = [ "map" ]

  static values = {
    apiKey: String,
    parkingBays: Object,
    position: {
      type: Object,
      default: {longitude:  144.947982, latitude: -37.8187}
    }
  }
  connect() {

    this.easingDuration = previouslyLoaded ? 0 : 2100
    // this.easingDuration = 0
    previouslyLoaded = true
    // console.log(this.parkingBaysValue)
    mapboxgl.accessToken = this.apiKeyValue

    this.loadMap()
  }

  loadMap() {
    // console.log('loading map')
    this.map = new mapboxgl.Map({
      container: this.mapTarget,
      style: 'mapbox://styles/mapbox/dark-v11',
      // center: [-103.5917, 40.6699], // [longitude, latitude]
      center: [this.positionValue.longitude, this.positionValue.latitude],
      zoom: 3
    });

    const geocoder = new MapboxGeocoder({ accessToken: mapboxgl.accessToken, mapboxgl: mapboxgl })
    this.map.addControl(geocoder, 'top-left');

    geocoder._inputEl.addEventListener('focus', function () {
      geocoder._geocode(geocoder._inputEl.value);
    });

    geocoder.on('result', function(e) {
      // console.log(e.result.center)
      this.positionValue = {longitude: e.result.center[0], latitude: e.result.center[1]}
      // console.log('AFTER SET this.positionValue', this.positionValue)
      // if (e && e.result) {
      //   geocoder.trigger();
      // }
    }.bind(this))


    // Add geolocate control to the map.
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
      enableHighAccuracy: true
      },
      // When active the map will receive updates to the device's location as it changes.
      trackUserLocation: true,
      // Draw an arrow next to the location dot to indicate which direction the device is heading.
      showUserHeading: true
    }, 'top-left')
    this.map.addControl(geolocate);

    geolocate.on('geolocate', function(e) {
      // console.log(e)
          const longitude = e.coords.longitude;
          const latitude = e.coords.latitude
          this.userPosition = {longitude: longitude, latitude: latitude};
          // console.log(this.userPosition);
    }.bind(this));

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

          // When the map loads, add the source and layer
          this.map.addSource('iso', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            }
          });

          this.map.addLayer(
            {
              id: 'isoLayer',
              type: 'fill',
              // Use "iso" as the data source for this layer
              source: 'iso',
              layout: {},
              paint: {
                // The fill color for the layer is set to a light purple
                'fill-color': '#ff0000',
                'fill-opacity': 0.3
              }
            },
            'poi-label'
          );
    });

  }

  // Create a function that sets up the Isochrone API query then makes an fetch call
  getIso = (e) => {
    e.preventDefault();
    const form = e.currentTarget
    const formData = new FormData(form)
    // Create constants to use in getIso()
    const urlBase = 'https://api.mapbox.com/isochrone/v1/mapbox/';
    console.log(formData.get("location"))

    const lat = formData.get("location") === "user" ? this.userPosition.latitude : this.positionValue.latitude;
    const lon = formData.get("location") === "user" ? this.userPosition.longitude : this.positionValue.longitude;
    // console.log('this.positionValue', this.positionValue)
    // console.log('LAT, LON', lat, lon)

    const profile = formData.get('profile'); // Set the default routing profile
    const minutes = formData.get('minutes'); // Set the default duration

    const query = fetch(
      `${urlBase}${profile}/${lon},${lat}?contours_minutes=${minutes}&polygons=true&access_token=${mapboxgl.accessToken}`,
      { method: 'GET' }
    )
     .then((response) => response.json())
     .then(async (data) => {
        this.map.getSource('iso').setData(data);
        this.setBounds(data.features[0].geometry.coordinates[0])
      });
  }

  setBounds = (coordinates) => {
    const bounds = new mapboxgl.LngLatBounds();
    coordinates.forEach((coordinate) => {
      bounds.extend(coordinate);
    });
    this.map.fitBounds(bounds, { padding: 15, maxZoom: 22 });
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
