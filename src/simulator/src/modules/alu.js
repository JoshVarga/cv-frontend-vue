import {CircuitElement} from '../circuit_element';
import {Node, findNode} from '../node';

import {correctWidth, lineTo, moveTo, fillText4} from '../canvas_api';
import {colors} from '../themer/themer';

/**
 * @class
 * ALU
 * @extends CircuitElement
 * @category modules
 */
export class ALU extends CircuitElement {
  /**
   * @param {number} x - x coordinate of element.
   * @param {number} y - y coordinate of element.
   * @param {Scope} scope - Circuit on which element is drawn
   * @param {string} dir - direction of element
   * @param {number} bitWidth - bit width per node.
   */
  constructor(x, y, scope, dir = 'RIGHT', bitWidth = 1) {
    super(x, y, scope, dir, bitWidth);
    this.message = 'ALU';

    this.setDimensions(30, 40);
    this.rectangleObject = false;

    this.inp1 = new Node(-30, -30, 0, this, this.bitwidth, 'A');
    this.inp2 = new Node(-30, 30, 0, this, this.bitwidth, 'B');

    this.controlSignalInput = new Node(-10, -40, 0, this, 3, 'Ctrl');
    this.carryOut = new Node(-10, 40, 1, this, 1, 'Cout');
    this.output = new Node(30, 0, 1, this, this.bitwidth, 'Out');
  }

  /**
     * @memberof ALU
     * function to change bitwidth of the element
     * @param {number} bitWidth - new bitwidth
     */
  newBitWidth(bitWidth) {
    this.bitWidth = bitWidth;
    this.inp1.bitWidth = bitWidth;
    this.inp2.bitWidth = bitWidth;
    this.output.bitWidth = bitWidth;
  }

  /**
   * @memberof ALU
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
        inp1: findNode(this.inp1),
        inp2: findNode(this.inp2),
        output: findNode(this.output),
        carryOut: findNode(this.carryOut),
        controlSignalInput: findNode(this.controlSignalInput),
      },
    };
    return data;
  }

  /**
   * @memberof ALU
   * function to draw element
   * @param {CanvasRenderingContext2D} ctx
   */
  customDraw(ctx) {
    const xx = this.x;
    const yy = this.y;
    ctx.strokeStyle = colors['stroke'];
    ctx.fillStyle = colors['fill'];
    ctx.lineWidth = correctWidth(3);
    ctx.beginPath();
    moveTo(ctx, 30, 10, xx, yy, this.direction);
    lineTo(ctx, 30, -10, xx, yy, this.direction);
    lineTo(ctx, 10, -40, xx, yy, this.direction);
    lineTo(ctx, -30, -40, xx, yy, this.direction);
    lineTo(ctx, -30, -20, xx, yy, this.direction);
    lineTo(ctx, -20, -10, xx, yy, this.direction);
    lineTo(ctx, -20, 10, xx, yy, this.direction);
    lineTo(ctx, -30, 20, xx, yy, this.direction);
    lineTo(ctx, -30, 40, xx, yy, this.direction);
    lineTo(ctx, 10, 40, xx, yy, this.direction);
    lineTo(ctx, 30, 10, xx, yy, this.direction);
    ctx.closePath();
    ctx.stroke();

    if (
      (this.hover && !globalScope.simulationArea.shiftDown) ||
      globalScope.simulationArea.lastSelected === this ||
      globalScope.simulationArea.multipleObjectSelections.includes(this)
    ) {
      ctx.fillStyle = colors['hover_select'];
    }
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = 'Black';
    ctx.textAlign = 'center';

    fillText4(ctx, 'B', -23, 30, xx, yy, this.direction, 6);
    fillText4(ctx, 'A', -23, -30, xx, yy, this.direction, 6);
    fillText4(ctx, 'CTR', -10, -30, xx, yy, this.direction, 6);
    fillText4(ctx, 'Carry', -10, 30, xx, yy, this.direction, 6);
    fillText4(ctx, 'Ans', 20, 0, xx, yy, this.direction, 6);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = 'DarkGreen';
    fillText4(ctx, this.message, 0, 0, xx, yy, this.direction, 12);
    ctx.fill();
  }

  /**
   * @memberof ALU
   * Determine output values and add to simulation queue.
   */
  resolve() {
    if (this.controlSignalInput.value === 0) {
      this.output.value = this.inp1.value & this.inp2.value;
      globalScope.simulationArea.simulationQueue.add(this.output);
      this.carryOut.value = 0;
      globalScope.simulationArea.simulationQueue.add(this.carryOut);
      this.message = 'A&B';
    } else if (this.controlSignalInput.value === 1) {
      this.output.value = this.inp1.value | this.inp2.value;

      globalScope.simulationArea.simulationQueue.add(this.output);
      this.carryOut.value = 0;
      globalScope.simulationArea.simulationQueue.add(this.carryOut);
      this.message = 'A|B';
    } else if (this.controlSignalInput.value === 2) {
      const sum = this.inp1.value + this.inp2.value;
      this.output.value =
        (sum << (32 - this.bitWidth)) >>> (32 - this.bitWidth);
      this.carryOut.value = +(sum >>> this.bitWidth !== 0);
      globalScope.simulationArea.simulationQueue.add(this.carryOut);
      globalScope.simulationArea.simulationQueue.add(this.output);
      this.message = 'A+B';
    } else if (this.controlSignalInput.value === 3) {
      this.message = 'ALU';
    } else if (this.controlSignalInput.value === 4) {
      this.message = 'A&~B';
      this.output.value = this.inp1.value & this.flipBits(this.inp2.value);
      globalScope.simulationArea.simulationQueue.add(this.output);
      this.carryOut.value = 0;
      globalScope.simulationArea.simulationQueue.add(this.carryOut);
    } else if (this.controlSignalInput.value === 5) {
      this.message = 'A|~B';
      this.output.value = this.inp1.value | this.flipBits(this.inp2.value);
      globalScope.simulationArea.simulationQueue.add(this.output);
      this.carryOut.value = 0;
      globalScope.simulationArea.simulationQueue.add(this.carryOut);
    } else if (this.controlSignalInput.value === 6) {
      this.message = 'A-B';
      this.output.value =
        ((this.inp1.value - this.inp2.value) <<
          (32 - this.bitWidth)) >>>
        (32 - this.bitWidth);
      globalScope.simulationArea.simulationQueue.add(this.output);
      this.carryOut.value = 0;
      globalScope.simulationArea.simulationQueue.add(this.carryOut);
    } else if (this.controlSignalInput.value === 7) {
      this.message = 'A<B';
      if (this.inp1.value < this.inp2.value) {
        this.output.value = 1;
      } else {
        this.output.value = 0;
      }
      globalScope.simulationArea.simulationQueue.add(this.output);
      this.carryOut.value = 0;
      globalScope.simulationArea.simulationQueue.add(this.carryOut);
    }
  }
}

/**
 * @memberof ALU
 * Help Tip
 * @type {string}
 * @category modules
 */
ALU.prototype.tooltipText =
  'ALU ToolTip: 0: A&B, 1:A|B, 2:A+B, 4:A&~B, 5:A|~B, 6:A-B, 7:SLT ';

/**
 * @memberof ALU
 * Help URL
 * @type {string}
 * @category modules
 */
ALU.prototype.helplink = 'https://docs.circuitverse.org/#/chapter4/8misc?id=alu';
ALU.prototype.objectType = 'ALU';
ALU.prototype.constructorParameters= ['direction', 'bitWidth'];
