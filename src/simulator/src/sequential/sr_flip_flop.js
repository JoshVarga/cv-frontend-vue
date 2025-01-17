import {CircuitElement} from '../circuit_element';
import {Node, findNode} from '../node';

import {correctWidth, fillText} from '../canvas_api';
import {colors} from '../themer/themer';
/**
 * SRflipFlop
 * SR flip flop has 6 input nodes:
 * clock, S input, R input, preset, reset ,enable.
 * @extends CircuitElement
 * @param {number} x - x coord of element
 * @param {number} y - y coord of element
 * @param {Scope} scope - the circuit in which we want the Element
 * @param {string} dir - direction in which element has to drawn
 * @category sequential
 */
export class SRflipFlop extends CircuitElement {
  /**
    * @param {number} x - x coord of element
    * @param {number} y - y coord of element
    * @param {Scope} scope - the circuit in which we want the Element
    * @param {string} dir - direction in which element has to drawn
   */
  constructor(x, y, scope, dir = 'RIGHT') {
    super(x, y, scope, dir, 1);
    this.directionFixed = true;
    this.fixedBitWidth = true;
    this.setDimensions(20, 20);
    this.rectangleObject = true;
    this.R = new Node(-20, +10, 0, this, 1, 'R');
    this.S = new Node(-20, -10, 0, this, 1, 'S');
    this.qOutput = new Node(20, -10, 1, this, 1, 'Q');
    this.qInvOutput = new Node(20, 10, 1, this, 1, 'Q Inverse');
    this.reset = new Node(10, 20, 0, this, 1, 'Asynchronous Reset');
    this.preset = new Node(0, 20, 0, this, 1, 'Preset');
    this.en = new Node(-10, 20, 0, this, 1, 'Enable');
    this.state = 0;
  }

  newBitWidth(bitWidth) {
    this.bitWidth = bitWidth;
    this.dInp.bitWidth = bitWidth;
    this.qOutput.bitWidth = bitWidth;
    this.qInvOutput.bitWidth = bitWidth;
    this.preset.bitWidth = bitWidth;
  }

  /**
   * @memberof SRflipFlop
   * always resolvable
   * @return {boolean} is resolvable.
   */
  isResolvable() {
    return true;
  }

  /**
   * @memberof SRflipFlop
   * function to resolve SR flip flop if S != R we can
   * set this.state to value S.
   */
  resolve() {
    if (this.reset.value == 1) {
      this.state = this.preset.value || 0;
    } else if (
      (this.en.value == 1 || this.en.connections == 0) &&
      this.S.value ^ this.R.value
    ) {
      this.state = this.S.value;
    }

    if (this.qOutput.value != this.state) {
      this.qOutput.value = this.state;
      this.qInvOutput.value = this.flipBits(this.state);
      this.scope.simulationArea.simulationQueue.add(this.qOutput);
      this.scope.simulationArea.simulationQueue.add(this.qInvOutput);
    }
  }

  /**
   * @memberof SRflipFlop
   * Create save JSON data of object.
   * @return {JSON}
   */
  customSave() {
    const data = {
      nodes: {
        S: findNode(this.S),
        R: findNode(this.R),
        qOutput: findNode(this.qOutput),
        qInvOutput: findNode(this.qInvOutput),
        reset: findNode(this.reset),
        preset: findNode(this.preset),
        en: findNode(this.en),
      },
      customData: {
        direction: this.direction,
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
    ctx.stroke();

    ctx.beginPath();
    ctx.font = '20px Raleway';
    ctx.fillStyle = colors['input_text'];
    ctx.textAlign = 'center';
    fillText(ctx, this.state.toString(16), xx, yy + 5);
    ctx.fill();
  }
}

SRflipFlop.prototype.tooltipText = 'SR FlipFlop ToolTip : SR FlipFlop Selected.';

SRflipFlop.prototype.helplink =
  'https://docs.circuitverse.org/#/chapter4/6sequentialelements?id=sr-flip-flop';

SRflipFlop.prototype.objectType = 'SRflipFlop';
SRflipFlop.prototype.constructorParameters= ['direction'];
