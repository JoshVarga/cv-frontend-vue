import {CircuitElement} from '../circuit_element';
import {Node, findNode} from '../node';

import {correctWidth, rect, fillText} from '../canvas_api';
import {colors} from '../themer/themer';
import {converters} from '../utils';
/**
 * @class
 * PriorityEncoder
 * @extends CircuitElement
 * @param {number} x - x coordinate of element.
 * @param {number} y - y coordinate of element.
 * @param {Scope} scope - Circuit on which element is drawn
 * @param {string} dir - direction of element
 * @param {number} bitWidth - bit width per node.
 * @category modules
 */
export class PriorityEncoder extends CircuitElement {
  /**
   * @param {number} x - x coordinate of element.
   * @param {number} y - y coordinate of element.
   * @param {Scope} scope - Circuit on which element is drawn
   * @param {string} dir - direction of element
   * @param {number} bitWidth - bit width per node.
   */
  constructor(x, y, scope, dir = 'RIGHT', bitWidth = 1) {
    super(x, y, scope, dir, bitWidth);
    this.bitWidth = bitWidth;
    this.inputSize = 1 << this.bitWidth;
    this.yOff = 1;
    if (this.bitWidth <= 3) {
      this.yOff = 2;
    }

    this.setDimensions(20, this.yOff * 5 * this.inputSize);
    this.directionFixed = true;
    this.rectangleObject = false;

    this.inp1 = [];
    for (let i = 0; i < this.inputSize; i++) {
      const a = new Node(
          -10,
          +this.yOff * 10 * (i - this.inputSize / 2) + 10,
          0,
          this,
          1,
      );
      this.inp1.push(a);
    }

    this.output1 = [];
    for (let i = 0; i < this.bitWidth; i++) {
      const a = new Node(
          30,
          +2 * 10 * (i - this.bitWidth / 2) + 10,
          1,
          this,
          1,
      );
      this.output1.push(a);
    }

    this.enable = new Node(
        10,
        20 + this.inp1[this.inputSize - 1].y,
        1,
        this,
        1,
    );
  }

  /**
   * @memberof PriorityEncoder
   * Create save JSON data of object.
   * @return {JSON}
   */
  customSave() {
    const data = {
      nodes: {
        inp1: this.inp1.map(findNode),
        output1: this.output1.map(findNode),
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
   * @memberof PriorityEncoder
   * function to change bitwidth of the element
   * @param {number} bitWidth - new bitwidth
   * @return {PriorityEncoder}
   */
  newBitWidth(bitWidth) {
    if (bitWidth === undefined || bitWidth < 1 || bitWidth > 32) {
      return;
    }
    if (this.bitWidth === bitWidth) {
      return;
    }
    this.bitWidth = bitWidth;
    const obj = new PriorityEncoder(
        this.x,
        this.y,
        this.scope,
        this.direction,
        this.bitWidth,
    );
    this.inputSize = 1 << bitWidth;

    this.delete();
    this.scope.simulationArea.lastSelected = obj;
    return obj;
  }

  /**
   * @memberof PriorityEncoder
   * Determine output values and add to simulation queue.
   */
  resolve() {
    let out = 0;
    let temp = 0;
    for (let i = this.inputSize - 1; i >= 0; i--) {
      if (this.inp1[i].value === 1) {
        out = converters.dec2bin(i);
        break;
      }
    }
    temp = out;

    if (out.length !== undefined) {
      this.enable.value = 1;
    } else {
      this.enable.value = 0;
    }
    this.scope.simulationArea.simulationQueue.add(this.enable);

    if (temp.length === undefined) {
      temp = '0';
      for (let i = 0; i < this.bitWidth - 1; i++) {
        temp = `0${temp}`;
      }
    }

    if (temp.length !== this.bitWidth) {
      for (let i = temp.length; i < this.bitWidth; i++) {
        temp = `0${temp}`;
      }
    }

    for (let i = this.bitWidth - 1; i >= 0; i--) {
      this.output1[this.bitWidth - 1 - i].value = Number(temp[i]);
      this.scope.simulationArea.simulationQueue.add(
          this.output1[this.bitWidth - 1 - i],
      );
    }
  }

  /**
     * @memberof PriorityEncoder
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
    if (this.bitWidth <= 3) {
      rect(
          ctx,
          xx - 10,
          yy - 10 - this.yOff * 5 * this.inputSize,
          40,
          20 * (this.inputSize + 1),
      );
    } else {
      rect(
          ctx,
          xx - 10,
          yy - 10 - this.yOff * 5 * this.inputSize,
          40,
          10 * (this.inputSize + 3),
      );
    }
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
    for (let i = 0; i < this.inputSize; i++) {
      fillText(ctx, String(i), xx, yy + this.inp1[i].y + 2, 10);
    }
    for (let i = 0; i < this.bitWidth; i++) {
      fillText(
          ctx,
          String(i),
          xx + this.output1[0].x - 10,
          yy + this.output1[i].y + 2,
          10,
      );
    }
    fillText(ctx, 'EN', xx + this.enable.x, yy + this.enable.y - 5, 10);
    ctx.fill();
  }

  /**
   * Verilog base type.
   * @return {string} Unique Verilog type name.
   */
  verilogBaseType() {
    return this.verilogName() + this.inp1.length;
  }

  /**
   * @memberof PriorityEncoder
   * Generates Verilog string for this CircuitElement.
   * @return {string} String representing the Verilog.
   */
  generateVerilog() {
    PriorityEncoder.selSizes.add(this.bitWidth);
    return CircuitElement.prototype.generateVerilog.call(this);
  }

  /**
   * @memberof PriorityEncoder
   * Generate Verilog string for this CircuitClement.
   * @return {string} String describing this element in Verilog.
   */
  static moduleVerilog() {
    let output = '';
    for (const size of PriorityEncoder.selSizes) {
      const numInput = 1 << size;
      output += '\n';
      output += 'module PriorityEncoder' + numInput;
      output += '(sel, ze, ';
      for (let j = 0; j < numInput - 1; j++) {
        output += 'in' + j + ', ';
      }
      output += 'in' + (numInput - 1) + ');\n';

      output += '  output reg [' + (size - 1) + ':0] sel;\n';
      output += '  output reg ze;\n';

      output += '  input ';
      for (let j = 0; j < numInput - 1; j++) {
        output += 'in' + j + ', ';
      }
      output += 'in' + (numInput - 1) + ';\n';
      output += '\n';

      output += '  always @ (*) begin\n';
      output += '    sel = 0;\n';
      output += '    ze = 0;\n';
      output += '    if (in' + (numInput - 1) + ')\n';
      output += '      sel = ' + (numInput - 1) + ';\n';
      for (let j = numInput - 2; j <= 0; j++) {
        output += '    else if (in' + j + ')\n';
        output += '      sel = ' + j + ';\n';
      }
      output += '    else\n';
      output += '      ze = 1;\n';
      output += '  end\n';
      output += 'endmodule\n';
    }

    return output;
  }

  /**
   * Reset the sized before Verilog generation
   */
  static resetVerilog() {
    PriorityEncoder.selSizes = new Set();
  }
}

/**
 * @memberof PriorityEncoder
 * Help Tip
 * @type {string}
 * @category modules
 */
PriorityEncoder.prototype.tooltipText = 'Priority Encoder ToolTip : ' +
          'Compresses binary inputs into a smaller number of outputs.';
PriorityEncoder.prototype.helplink =
  'https://docs.circuitverse.org/#/chapter4/5muxandplex?id=priority-encoder';
PriorityEncoder.prototype.objectType = 'PriorityEncoder';
PriorityEncoder.prototype.constructorParameters= ['direction', 'bitWidth'];
