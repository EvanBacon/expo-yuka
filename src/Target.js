/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity } from "yuka";
import { interfaceEmitter } from "./Emitter";

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
      interfaceEmitter.emit("hit.hidden", true);
      this.endTime = Infinity;
    }
  }

  handleMessage() {
    interfaceEmitter.emit("hit.hidden", false);
    this.endTime = this.currentTime + this.duration;

    return true;
  }
}

export { Target };
