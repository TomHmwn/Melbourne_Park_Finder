import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="slider"
export default class extends Controller {
  static targets = [ "output" ]
  connect() {
    console.log('slider connected')
  }
  display(e) {
    this.outputTarget.innerHTML = e.currentTarget.value;
  }

  reset() {
    this.outputTarget.innerHTML = 0;
  }
}
