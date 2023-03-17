import { Controller } from "@hotwired/stimulus"
import { Drawer } from 'flowbite'

window.drawers = []

// Connects to data-controller="drawer"
export default class extends Controller {
  static targets = [ "drawer" ]

  connect() {
    console.log(this.drawerTarget)
    const options = {
      // placement: 'right',
      backdrop: true,
      bodyScrolling: false,
      edge: true,
      placement: 'bottom',
      edgeOffset: "bottom-[60px]",
      backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-30',
      onHide: () => {
          console.log('drawer is hidden');
      },
      onShow: () => {
          console.log('drawer is shown');
      },
      onToggle: () => {
          console.log('drawer has been toggled');
      }
    };

    this.drawer = new Drawer(this.drawerTarget, options)
    window.drawers.push(this.drawer)
  }

  toggle(){
    this.drawer.toggle();
  }
}
