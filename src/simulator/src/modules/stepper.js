import {CircuitElement} from '../circuit_element';
import {Node, findNode} from '../node';

import {fillText} from '../canvas_api';
import {colors} from '../themer/themer';
/**
 * @class
 * Stepper
 * @extends CircuitElement
 * @param {number} x - x coordinate of element.
 * @param {number} y - y coordinate of element.
 * @param {Scope} scope - Circuit on which element is drawn
 * @param {string} dir - direction of element
 * @param {number} bitWidth - bitwidth of element
 * @category modules
 */
export class Stepper extends CircuitElement {
  /**
   * @param {number} x - x coordinate of element.
   * @param {number} y - y coordinate of element.
   * @param {Scope} scope - Circuit on which element is drawn
   * @param {string} dir - direction of element
   * @param {number} bitWidth - bitwidth of element
   */
  constructor(x, y, scope, dir = 'RIGHT', bitWidth = 8) {
    super(x, y, scope, dir, bitWidth);
    this.setDimensions(20, 20);
    this.output1 = new Node(20, 0, 1, this, bitWidth);
    this.state = 0;
  }

  /**
   * @memberof Stepper
   * Create save JSON data of object.
   * @return {JSON}
   */
  customSave() {
    const data = {
      nodes: {
        output1: findNode(this.output1),
      },
      customData: {
        direction: this.direction,
        bitWidth: this.bitWidth,
        state: this.state,
      },
    };
    return data;
  }

  /**
     * @memberof Stepper
     * function to draw element
     * @param {CanvasRenderingContext2D} ctx
   */
  customDraw(ctx) {
    ctx.beginPath();
    ctx.font = '20px Raleway';
    ctx.fillStyle = colors['input_text'];
    ctx.textAlign = 'center';
    fillText(ctx, this.state.toString(16), this.x, this.y + 5);
    ctx.fill();
  }

  /**
   * @memberof Stepper
   * Determine output values and add to simulation queue.
   */
  resolve() {
    this.state = Math.min(this.state, (1 << this.bitWidth) - 1);
    this.output1.value = this.state;
    this.scope.simulationArea.simulationQueue.add(this.output1);
  }

  /**
   * Listener function for increasing value of state
   * @memberof Stepper
   * @param {string} key - the key pressed
   */
  keyDown2(key) {
    if (this.state < 1 << this.bitWidth && (key === '+' || key === '=')) {
      this.state++;
    }
    if (this.state > 0 && (key === '_' || key === '-')) {
      this.state--;
    }
  }
}

/**
 * @memberof Stepper
 * Help Tip
 * @type {string}
 * @category modules
 */
Stepper.prototype.tooltipText =
  'Stepper ToolTip: Increase/Decrease value by ' +
  'selecting the stepper and using +/- keys.';

/**
 * @memberof Stepper
 * Help URL
 * @type {string}
 * @category modules
 */
Stepper.prototype.helplink =
  'https://docs.circuitverse.org/#/chapter4/2input?id=stepper';
Stepper.prototype.objectType = 'Stepper';
Stepper.prototype.constructorParameters= ['direction', 'bitWidth'];
