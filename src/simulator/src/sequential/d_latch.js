import {CircuitElement} from '../circuit_element';
import {Node, findNode} from '../node';

import {correctWidth, lineTo, moveTo, fillText} from '../canvas_api';
import {colors} from '../themer/themer';
/**
 * Dlatch
 * D latch has 2 input nodes:
 * clock, data input.
 * Difference between this and D - FlipFlop is
 * that Flip flop must have a clock.
 * @extends CircuitElement
 * @param {number} x - x coord of element.
 * @param {number} y - y coord of element.
 * @param {Scope} scope - the circuit in which we want the Element.
 * @param {string} dir - direction in which element has to drawn.
 * @category sequential
 */
export class Dlatch extends CircuitElement {
  /**
   * @param {number} x - x coord of element.
   * @param {number} y - y coord of element.
   * @param {Scope} scope - the circuit in which we want the Element.
   * @param {string} dir - direction in which element has to drawn.
   * @param {number} bitWidth - bitwidth of the latch.
   */
  constructor(x, y, scope, dir = 'RIGHT', bitWidth = 1) {
    super(x, y, scope, dir, bitWidth);
    this.directionFixed = true;
    this.setDimensions(20, 20);
    this.rectangleObject = true;
    this.clockInp = new Node(-20, +10, 0, this, 1, 'Clock');
    this.dInp = new Node(-20, -10, 0, this, this.bitWidth, 'D');
    this.qOutput = new Node(20, -10, 1, this, this.bitWidth, 'Q');
    this.qInvOutput = new Node(20, 10, 1, this, this.bitWidth, 'Q Inverse');
    // this.reset = new Node(10, 20, 0, this, 1, "Asynchronous Reset");
    // this.preset = new Node(0, 20, 0, this, this.bitWidth, "Preset");
    // this.en = new Node(-10, 20, 0, this, 1, "Enable");
    this.state = 0;
    this.prevClockState = 0;
    this.wasClicked = false;
  }

  /**
   * @memberof Dlatch
   * Checks if the output value can be determined.
   * @return {boolean}
   */
  isResolvable() {
    if (this.clockInp.value != undefined && this.dInp.value != undefined) {
      return true;
    }
    return false;
  }

  newBitWidth(bitWidth) {
    this.bitWidth = bitWidth;
    this.dInp.bitWidth = bitWidth;
    this.qOutput.bitWidth = bitWidth;
    this.qInvOutput.bitWidth = bitWidth;
    // this.preset.bitWidth = bitWidth;
  }

  /**
     * @memberof Dlatch
     * when the clock input is high we update the state
     * qOutput is set to the state
     */
  resolve() {
    if (this.clockInp.value == 1 && this.dInp.value != undefined) {
      this.state = this.dInp.value;
    }

    if (this.qOutput.value != this.state) {
      this.qOutput.value = this.state;
      this.qInvOutput.value = this.flipBits(this.state);
      this.scope.simulationArea.simulationQueue.add(this.qOutput);
      this.scope.simulationArea.simulationQueue.add(this.qInvOutput);
    }
  }

  /**
   * @memberof Dlatch
   * Create save JSON data of object.
   * @return {JSON}
   */
  customSave() {
    const data = {
      nodes: {
        clockInp: findNode(this.clockInp),
        dInp: findNode(this.dInp),
        qOutput: findNode(this.qOutput),
        qInvOutput: findNode(this.qInvOutput),
      },
      customData: {
        direction: this.direction,
        bitWidth: this.bitWidth,
      },
    };
    return data;
  }

  /**
   * Custom draw.
   * @param {CanvasRenderingContext2D} ctx
   */
  customDraw(ctx) {
    ctx.strokeStyle = colors['stroke'];
    ctx.fillStyle = colors['fill'];
    ctx.beginPath();
    ctx.lineWidth = correctWidth(3);
    const xx = this.x;
    const yy = this.y;
    moveTo(ctx, -20, 5, xx, yy, this.direction);
    lineTo(ctx, -15, 10, xx, yy, this.direction);
    lineTo(ctx, -20, 15, xx, yy, this.direction);
    ctx.stroke();
    ctx.beginPath();
    ctx.font = '20px Raleway';
    ctx.fillStyle = colors['input_text'];
    ctx.textAlign = 'center';
    fillText(ctx, this.state.toString(16), xx, yy + 5);
    ctx.fill();
  }
}

Dlatch.prototype.tooltipText = 'D Latch : Single input Flip flop or D FlipFlop';
Dlatch.prototype.helplink =
  'https://docs.circuitverse.org/#/chapter4/6sequentialelements?id=d-latch';

Dlatch.prototype.objectType = 'Dlatch';
Dlatch.prototype.constructorParameters= ['direction', 'bitWidth'];
