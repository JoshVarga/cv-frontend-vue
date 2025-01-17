import {CircuitElement} from '../circuit_element';
import {Node, findNode} from '../node';

import {correctWidth, lineTo, moveTo, fillText} from '../canvas_api';
import {colors} from '../themer/themer';
/**
 * @class
 * Demultiplexer
 * @extends CircuitElement
 * @param {number} x - x coordinate of element.
 * @param {number} y - y coordinate of element.
 * @param {Scope} scope - Circuit on which element is drawn.
 * @param {string} dir - direction of element.
 * @param {number} bitWidth - bit width per node.
 * @param {number} controlSignalSize - 1 by default.
 * @category modules
 */
export class Demultiplexer extends CircuitElement {
  /**
   * @param {number} x - x coordinate of element.
   * @param {number} y - y coordinate of element.
   * @param {Scope} scope - Circuit on which element is drawn.
   * @param {string} dir - direction of element.
   * @param {number} bitWidth - bit width per node.
   * @param {number} controlSignalSize - 1 by default.
   */
  constructor(
      x,
      y,
      scope,
      dir = 'LEFT',
      bitWidth = 1,
      controlSignalSize = 1,
  ) {
    super(x, y, scope, dir, bitWidth);
    this.controlSignalSize =
      controlSignalSize ||
      parseInt(prompt('Enter control signal bitWidth'), 10);
    this.outputsize = 1 << this.controlSignalSize;
    this.xOff = 0;
    this.yOff = 1;
    if (this.controlSignalSize === 1) {
      this.xOff = 10;
    }
    if (this.controlSignalSize <= 3) {
      this.yOff = 2;
    }

    this.changeControlSignalSize = function(size) {
      if (size === undefined || size < 1 || size > 32) {
        return;
      }
      if (this.controlSignalSize === size) {
        return;
      }
      const obj = new Demultiplexer(
          this.x,
          this.y,
          this.scope,
          this.direction,
          this.bitWidth,
          size,
      );
      this.delete();
      this.scope.simulationArea.lastSelected = obj;
      return obj;
    };
    this.mutableProperties = {
      controlSignalSize: {
        name: 'Control Signal Size',
        type: 'number',
        max: '10',
        min: '1',
        func: 'changeControlSignalSize',
      },
    };
    this.newBitWidth = function(bitWidth) {
      this.bitWidth = bitWidth;
      for (let i = 0; i < this.outputsize; i++) {
        this.output1[i].bitWidth = bitWidth;
      }
      this.input.bitWidth = bitWidth;
    };

    this.setDimensions(20 - this.xOff, this.yOff * 5 * this.outputsize);
    this.rectangleObject = false;
    this.input = new Node(20 - this.xOff, 0, 0, this);

    this.output1 = [];
    for (let i = 0; i < this.outputsize; i++) {
      const a = new Node(
          -20 + this.xOff,
          +this.yOff * 10 * (i - this.outputsize / 2) + 10,
          1,
          this,
      );
      this.output1.push(a);
    }

    this.controlSignalInput = new Node(
        0,
        this.yOff * 10 * (this.outputsize / 2 - 1) + this.xOff + 10,
        0,
        this,
        this.controlSignalSize,
        'Control Signal',
    );
  }

  /**
   * @memberof Demultiplexer
   * Create save JSON data of object.
   * @return {JSON}
   */
  customSave() {
    const data = {
      customData: {
        direction: this.direction,
        bitWidth: this.bitWidth,
        controlSignalSize: this.controlSignalSize,
      },
      nodes: {
        output1: this.output1.map(findNode),
        input: findNode(this.input),
        controlSignalInput: findNode(this.controlSignalInput),
      },
    };
    return data;
  }

  /**
   * @memberof Demultiplexer
   * Determine output values and add to simulation queue.
   */
  resolve() {
    for (let i = 0; i < this.output1.length; i++) {
      this.output1[i].value = 0;
    }

    this.output1[this.controlSignalInput.value].value = this.input.value;

    for (let i = 0; i < this.output1.length; i++) {
      this.scope.simulationArea.simulationQueue.add(this.output1[i]);
    }
  }

  /**
   * @memberof Demultiplexer
   * function to draw element
   * @param {CanvasRenderingContext2D} ctx
   */
  customDraw(ctx) {
    const xx = this.x;
    const yy = this.y;
    ctx.beginPath();
    moveTo(
        ctx,
        0,
        this.yOff * 10 * (this.outputsize / 2 - 1) + 10 + 0.5 * this.xOff,
        xx,
        yy,
        this.direction,
    );
    lineTo(
        ctx,
        0,
        this.yOff * 5 * (this.outputsize - 1) + this.xOff,
        xx,
        yy,
        this.direction,
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = colors['stroke'];
    ctx.lineWidth = correctWidth(4);
    ctx.fillStyle = colors['fill'];
    moveTo(
        ctx,
        -20 + this.xOff,
        -this.yOff * 10 * (this.outputsize / 2),
        xx,
        yy,
        this.direction,
    );
    lineTo(
        ctx,
        -20 + this.xOff,
        20 + this.yOff * 10 * (this.outputsize / 2 - 1),
        xx,
        yy,
        this.direction,
    );
    lineTo(
        ctx,
        20 - this.xOff,
        +this.yOff * 10 * (this.outputsize / 2 - 1) + this.xOff,
        xx,
        yy,
        this.direction,
    );
    lineTo(
        ctx,
        20 - this.xOff,
        -this.yOff * 10 * (this.outputsize / 2) - this.xOff + 20,
        xx,
        yy,
        this.direction,
    );
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

    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    for (let i = 0; i < this.outputsize; i++) {
      if (this.direction === 'LEFT') {
        fillText(
            ctx,
            String(i),
            xx + this.output1[i].x - 7,
            yy + this.output1[i].y + 2,
            10,
        );
      } else if (this.direction === 'RIGHT') {
        fillText(
            ctx,
            String(i),
            xx + this.output1[i].x + 7,
            yy + this.output1[i].y + 2,
            10,
        );
      } else if (this.direction === 'UP') {
        fillText(
            ctx,
            String(i),
            xx + this.output1[i].x,
            yy + this.output1[i].y - 5,
            10,
        );
      } else {
        fillText(
            ctx,
            String(i),
            xx + this.output1[i].x,
            yy + this.output1[i].y + 10,
            10,
        );
      }
    }
    ctx.fill();
  }

  /**
   * Verilog base type.
   * @return {string} Unique Verilog type name.
   */
  verilogBaseType() {
    return this.verilogName() + this.output1.length;
  }

  /**
   * @memberof Demultiplexer
   * Generates Verilog string for this CircuitElement.
   * @return {string} String representing the Verilog.
   */
  generateVerilog() {
    Demultiplexer.selSizes.add(this.controlSignalSize);
    return CircuitElement.prototype.generateVerilog.call(this);
  }

  /**
   * @memberof Demultiplexer
   * Generate Verilog string for this CircuitClement.
   * @return {string} String describing this element in Verilog.
   */
  static moduleVerilog() {
    let output = '';

    for (const size of Demultiplexer.selSizes) {
      const numOutput = 1 << size;
      output += '\n';
      output += 'module Demultiplexer' + numOutput;
      output += '(';
      for (let j = 0; j < numOutput; j++) {
        output += 'out' + j + ', ';
      }
      output += 'in, sel);\n';

      output += '  parameter WIDTH = 1;\n';
      output += '  output reg [WIDTH-1:0] ';
      for (let j = 0; j < numOutput - 1; j++) {
        output += 'out' + j + ', ';
      }
      output += 'out' + (numOutput - 1) + ';\n';

      output += '  input [WIDTH-1:0] in;\n';
      output += '  input [' + (size - 1) + ':0] sel;\n';
      output += '  \n';

      output += '  always @ (*) begin\n';
      for (let j = 0; j < numOutput; j++) {
        output += '    out' + j + ' = 0;\n';
      }
      output += '    case (sel)\n';
      for (let j = 0; j < numOutput; j++) {
        output += '      ' + j + ' : out' + j + ' = in;\n';
      }
      output += '    endcase\n';
      output += '  end\n';
      output += 'endmodule\n';
    }

    return output;
  }

  /**
   * Reset the sized before Verilog generation
   */
  static resetVerilog() {
    Demultiplexer.selSizes = new Set();
  }
}

/**
 * @memberof Demultiplexer
 * Help Tip
 * @type {string}
 * @category modules
 */
Demultiplexer.prototype.tooltipText =
  'Demultiplexer ToolTip : Multiple outputs and a single line input.';
Demultiplexer.prototype.helplink =
  'https://docs.circuitverse.org/#/chapter4/5muxandplex?id=demultiplexer';
Demultiplexer.prototype.objectType = 'Demultiplexer';
Demultiplexer.prototype.constructorParameters= [
  'direction',
  'bitWidth',
  'controlSignalSize',
];
