import {CircuitElement} from '../circuit_element';
import {Node, findNode} from '../node';

import {correctWidth, rect, fillText} from '../canvas_api';
import {colors} from '../themer/themer';
import {converters} from '../utils';
/**
 * @class
 * MSB
 * @extends CircuitElement
 * @param {number} x - x coordinate of element.
 * @param {number} y - y coordinate of element.
 * @param {Scope} scope - Circuit on which element is drawn
 * @param {string} dir - direction of element
 * @param {number} bitWidth - bit width per node.
 * @category modules
 */
export class MSB extends CircuitElement {
  /**
   * @param {number} x - x coordinate of element.
   * @param {number} y - y coordinate of element.
   * @param {Scope} scope - Circuit on which element is drawn
   * @param {string} dir - direction of element
   * @param {number} bitWidth - bit width per node.
   */
  constructor(x, y, scope, dir = 'RIGHT', bitWidth = 1) {
    super(x, y, scope, dir, bitWidth);
    this.leftDimensionX = 10;
    this.rightDimensionX = 20;
    this.setHeight(30);
    this.directionFixed = true;
    this.bitWidth = bitWidth || parseInt(prompt('Enter bitWidth'), 10);
    this.rectangleObject = false;
    this.intputSize = this.bitWidth;

    this.inp1 = new Node(-10, 0, 0, this, this.inputSize);
    this.output1 = new Node(20, 0, 1, this, this.bitWidth);
    this.enable = new Node(20, 20, 1, this, 1);
  }

  /**
   * @memberof MSB
   * Create save JSON data of object.
   * @return {JSON}
   */
  customSave() {
    const data = {
      nodes: {
        inp1: findNode(this.inp1),
        output1: findNode(this.output1),
        enable: findNode(this.enable),
      },
      customData: {
        direction: this.direction,
        bitWidth: this.bitWidth,
      },
    };
    return data;
  }

  /**
     * @memberof MSB
     * function to change bitwidth of the element
     * @param {number} bitWidth - new bitwidth
     */
  newBitWidth(bitWidth) {
    // this.inputSize = 1 << bitWidth
    this.inputSize = bitWidth;
    this.inp1.bitWidth = this.inputSize;
    this.bitWidth = bitWidth;
    this.output1.bitWidth = bitWidth;
  }

  /**
   * @memberof MSB
   * Determine output values and add to simulation queue.
   */
  resolve() {
    const inp = this.inp1.value;
    this.output1.value = converters.dec2bin(inp).length - 1;
    this.scope.simulationArea.simulationQueue.add(this.output1);
    if (inp != 0) {
      this.enable.value = 1;
    } else {
      this.enable.value = 0;
    }
    this.scope.simulationArea.simulationQueue.add(this.enable);
  }

  /**
     * @memberof MSB
     * function to draw element
     * @param {CanvasRenderingContext2D} ctx
   */
  customDraw(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = colors['stroke'];
    ctx.fillStyle = colors['fill'];
    ctx.lineWidth = correctWidth(3);
    const xx = this.x;
    const yy = this.y;
    rect(ctx, xx - 10, yy - 30, 30, 60);
    if (
      (this.hover && !this.scope.simulationArea.shiftDown) ||
      this.scope.simulationArea.lastSelected === this ||
      this.scope.simulationArea.multipleObjectSelections.includes(this)
    ) {
      ctx.fillStyle = colors['hover_select'];
    }
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    fillText(ctx, 'MSB', xx + 6, yy - 12, 10);
    fillText(ctx, 'EN', xx + this.enable.x - 12, yy + this.enable.y + 3, 8);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = 'green';
    ctx.textAlign = 'center';
    if (this.output1.value !== undefined) {
      fillText(ctx, this.output1.value, xx + 5, yy + 14, 13);
    }
    ctx.stroke();
    ctx.fill();
  }

  /**
   * @memberof MSB
   * Generates Verilog string for this CircuitElement.
   * @return {string} String representing the Verilog.
   */
  generateVerilog() {
    return `assign ${this.output1.verilogLabel} = (${this.enable.verilogLabel
    }!=0) ? ${this.inp1.verilogLabel}[${this.inp1.bitWidth - 1}] : 0;`;
  }
}

/**
 * @memberof MSB
 * Help Tip
 * @type {string}
 * @category modules
 */
MSB.prototype.tooltipText =
  'MSB ToolTip : The most significant bit or the high-order bit.';
MSB.prototype.helplink =
  'https://docs.circuitverse.org/#/chapter4/5muxandplex?id=most-significant-bit-msb-detector';
MSB.prototype.objectType = 'MSB';
MSB.prototype.constructorParameters= ['direction', 'bitWidth'];
