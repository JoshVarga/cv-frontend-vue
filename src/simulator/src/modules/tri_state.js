import {CircuitElement} from '../circuit_element';
import {Node, findNode} from '../node';

import {correctWidth, lineTo, moveTo} from '../canvas_api';
import {colors} from '../themer/themer';

/**
 * @class
 * TriState
 * @extends CircuitElement
 * @param {number} x - x coordinate of element.
 * @param {number} y - y coordinate of element.
 * @param {Scope} scope - Circuit on which element is drawn
 * @param {string} dir - direction of element
 * @param {number} bitWidth - bit width per node.
 * @category modules
 */
export class TriState extends CircuitElement {
  /**
   * @param {number} x - x coordinate of element.
   * @param {number} y - y coordinate of element.
   * @param {Scope} scope - Circuit on which element is drawn.
   * @param {string} dir - direction of element.
   * @param {number} bitWidth - bit width per node.
   */
  constructor(x, y, scope, dir = 'RIGHT', bitWidth = 1) {
    super(x, y, scope, dir, bitWidth);
    this.rectangleObject = false;
    this.setDimensions(15, 15);
    this.inp1 = new Node(-10, 0, 0, this);
    this.output1 = new Node(20, 0, 1, this);
    this.state = new Node(0, 0, 0, this, 1, 'Enable');
  }

  /**
   * @memberof TriState
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
        state: findNode(this.state),
      },
    };
    return data;
  }

  /**
     * @memberof TriState
     * function to change bitwidth of the element
     * @param {number} bitWidth - new bitwidth
     */
  newBitWidth(bitWidth) {
    this.inp1.bitWidth = bitWidth;
    this.output1.bitWidth = bitWidth;
    this.bitWidth = bitWidth;
  }

  /**
   * @memberof TriState
   * Determine output values and add to simulation queue.
   */
  resolve() {
    if (this.isResolvable() === false) {
      return;
    }

    if (this.state.value === 1) {
      if (this.output1.value !== this.inp1.value) {
        this.output1.value = this.inp1.value;
        this.scope.simulationArea.simulationQueue.add(this.output1);
      }
      const index = this.scope.simulationArea.contentionPending.indexOf(this);
      if (index != -1) {
        this.scope.simulationArea.contentionPending.splice(index, 1);
      }
    } else if (
      this.output1.value !== undefined &&
      !this.scope.simulationArea.contentionPending.includes(this)
    ) {
      this.output1.value = undefined;
      this.scope.simulationArea.simulationQueue.add(this.output1);
    }
    const index = this.scope.simulationArea.contentionPending.indexOf(this);
    if (index != -1) {
      this.scope.simulationArea.contentionPending.splice(index, 1);
    }
  }

  /**
     * @memberof TriState
     * function to draw element
     * @param {CanvasRenderingContext2D} ctx
   */
  customDraw(ctx) {
    ctx.strokeStyle = colors['stroke'];
    ctx.lineWidth = correctWidth(3);
    const xx = this.x;
    const yy = this.y;
    ctx.beginPath();
    ctx.fillStyle = colors['fill'];
    moveTo(ctx, -10, -15, xx, yy, this.direction);
    lineTo(ctx, 20, 0, xx, yy, this.direction);
    lineTo(ctx, -10, 15, xx, yy, this.direction);
    ctx.closePath();
    if (
      (this.hover && !this.scope.simulationArea.shiftDown) ||
      this.scope.simulationArea.lastSelected === this ||
      this.scope.simulationArea.multipleObjectSelections.includes(this)
    ) {
      ctx.fillStyle = colors['hover_select'];
    }
    ctx.fill();
    ctx.stroke();
  }

  /**
   * @memberof TriState
   * Generates Verilog string for this CircuitElement.
   * @return {string} String representing the Verilog.
   */
  generateVerilog() {
    return `assign ${this.output1.verilogLabel} = ` +
    `(${this.state.verilogLabel}!=0) ? ${this.inp1.verilogLabel} : ` +
    `${this.inp1.bitWidth}'b?;`;
  }
}

/**
 * @memberof TriState
 * Help Tip
 * @type {string}
 * @category modules
 */
TriState.prototype.tooltipText =
  'TriState ToolTip : Effectively removes the output from the circuit.';
TriState.prototype.helplink =
  'https://docs.circuitverse.org/#/chapter4/8misc?id=tristate-buffer';
TriState.prototype.objectType = 'TriState';
TriState.prototype.constructorParameters= ['direction', 'bitWidth'];
