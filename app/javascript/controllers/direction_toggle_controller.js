import { Controller } from "@hotwired/stimulus"
import mapboxgl from 'mapbox-gl';

// Connects to data-controller="direction-toggle"
export default class extends Controller {
  static targets = [ "map", "instruction" ]
  connect() {
    console.log("direction toggle connected")
  }

  toggleMap() {
    console.log(this.instructionTarget);

    if(this.mapTarget.classList.contains('hidden') ) {
      this.mapTarget.classList.remove('hidden')
      this.instructionTarget.classList.add('hidden')
    } else if (this.instructionTarget.classList.contains('hidden')) {
      this.instructionTarget.classList.remove('hidden')
      this.mapTarget.classList.add('hidden')
    }
  }
}
