/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity } from "yuka";

class Target extends GameEntity {
  constructor(geometry) {
    super();

    this.uiElement = document.getElementById("hit");

    this.endTime = Infinity;
    this.currentTime = 0;
    this.duration = 1; // 1 second
    this.geometry = geometry;
  }

  update(delta) {
    this.currentTime += delta;

    if (this.currentTime >= this.endTime) {
      // this.uiElement.classList.add("hidden");
      this.endTime = Infinity;
    }
  }

  handleMessage() {
    // this.uiElement.classList.remove("hidden");

    this.endTime = this.currentTime + this.duration;

    return true;
  }
}

export { Target };
