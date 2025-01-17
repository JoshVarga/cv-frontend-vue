import {CircuitElement} from '../circuit_element';
import {Node, findNode} from '../node';

import {fillText4} from '../canvas_api';
/**
 * @class
 * ForceGate
 * @extends CircuitElement
 * @classdesc Output uses the force value unless tri-stated,
 * in which case the input value is used.
 * @category testbench
 */
export class ForceGate extends CircuitElement {
  /**
   * @param {number} x - x coordinate of element.
   * @param {number} y - y coordinate of element.
   * @param {Scope} scope - Circuit on which element is drawn
   * @param {string} dir - direction of element
   * @param {number} bitWidth - bit width per node.
   */
  constructor(x, y, scope, dir = 'RIGHT', bitWidth = 1) {
    super(x, y, scope, dir, bitWidth);
    this.setDimensions(20, 10);
    this.objectType = 'ForceGate';
    this.scope.ForceGate.push(this);
    this.inp1 = new Node(-20, 0, 0, this);
    this.inp2 = new Node(0, 0, 0, this);
    this.output1 = new Node(20, 0, 1, this);
  }

  /**
     * @memberof ForceGate
     * Checks if the output value can be determined.
     * @return {boolean}
     */
  isResolvable() {
    return this.inp1.value !== undefined || this.inp2.value !== undefined;
  }

  /**
   * @memberof ForceGate
   * Create save JSON data of object.
   * @return {JSON}
   */
  customSave() {
    const data = {
      customData: {
        direction: this.direction,
        bitWidth: this.bitWidth,
      },
      nodes: {
        output1: findNode(this.output1),
        inp1: findNode(this.inp1),
        inp2: findNode(this.inp2),
      },
    };
    return data;
  }

  /**
   * @memberof ForceGate
   * Determine output values and add to simulation queue.
   */
  resolve() {
    if (this.inp2.value !== undefined) {
      this.output1.value = this.inp2.value;
    } else {
      this.output1.value = this.inp1.value;
    }
    this.scope.simulationArea.simulationQueue.add(this.output1);
  }

  /**
     * @memberof ForceGate
     * function to draw element
     * @param {CanvasRenderingContext2D} ctx
   */
  customDraw(ctx) {
    const xx = this.x;
    const yy = this.y;

    ctx.beginPath();
    ctx.fillStyle = 'Black';
    ctx.textAlign = 'center';

    fillText4(ctx, 'I', -10, 0, xx, yy, this.direction, 10);
    fillText4(ctx, 'O', 10, 0, xx, yy, this.direction, 10);
    ctx.fill();
  }
}

/**
 * @memberof ForceGate
 * Help Tip
 * @type {string}
 * @category testbench
 */
ForceGate.prototype.tooltipText = 'Force Gate ToolTip : ForceGate Selected.';
ForceGate.prototype.objectType = 'ForceGate';
ForceGate.prototype.constructorParameters= ['direction', 'bitWidth'];
