import {CircuitElement} from '../circuit_element';
import {Node, findNode} from '../node';

import {correctWidth, lineTo, moveTo, drawCircle2, arc} from '../canvas_api';
import {changeInputSize} from '../modules';
import {gateGenerateVerilog} from '../utils';
import {colors} from '../themer/themer';
/**
 * @class
 * NandGate
 * @extends CircuitElement
 * @param {number} x - x coordinate of nand Gate.
 * @param {number} y - y coordinate of nand Gate.
 * @param {Scope} scope - Circuit on which nand gate is drawn
 * @param {string} dir - direction of nand Gate
 * @param {number} inputLength - number of input nodes
 * @param {number} bitWidth - bit width per node.
 * @category modules
 */
export class NandGate extends CircuitElement {
  /**
   * @param {number} x - x coordinate of nand Gate.
   * @param {number} y - y coordinate of nand Gate.
   * @param {Scope} scope - Circuit on which nand gate is drawn
   * @param {string} dir - direction of nand Gate
   * @param {number} inputLength - number of input nodes
   * @param {number} bitWidth - bit width per node.
   */
  constructor(
      x,
      y,
      scope,
      dir = 'RIGHT',
      inputLength = 2,
      bitWidth = 1,
  ) {
    super(x, y, scope, dir, bitWidth);
    this.rectangleObject = false;
    this.setDimensions(15, 20);
    this.inp = [];
    this.inputSize = inputLength;
    // variable inputLength , node creation
    if (inputLength % 2 === 1) {
      for (let i = 0; i < inputLength / 2 - 1; i++) {
        const a = new Node(-10, -10 * (i + 1), 0, this);
        this.inp.push(a);
      }
      let a = new Node(-10, 0, 0, this);
      this.inp.push(a);
      for (let i = inputLength / 2 + 1; i < inputLength; i++) {
        a = new Node(-10, 10 * (i + 1 - inputLength / 2 - 1), 0, this);
        this.inp.push(a);
      }
    } else {
      for (let i = 0; i < inputLength / 2; i++) {
        const a = new Node(-10, -10 * (i + 1), 0, this);
        this.inp.push(a);
      }
      for (let i = inputLength / 2; i < inputLength; i++) {
        const a = new Node(-10, 10 * (i + 1 - inputLength / 2), 0, this);
        this.inp.push(a);
      }
    }
    this.output1 = new Node(30, 0, 1, this);
  }

  /**
   * @memberof NandGate
   * Create save JSON data of object.
   * @return {JSON}
   */
  customSave() {
    const data = {
      customData: {
        direction: this.direction,
        inputSize: this.inputSize,
        bitWidth: this.bitWidth,
      },
      nodes: {
        inp: this.inp.map(findNode),
        output1: findNode(this.output1),
      },
    };
    return data;
  }

  /**
   * @memberof NandGate
   * Determine output values and add to simulation queue.
   */
  resolve() {
    let result = this.inp[0].value || 0;
    if (this.isResolvable() === false) {
      return;
    }
    for (let i = 1; i < this.inputSize; i++) {
      result &= this.inp[i].value || 0;
    }
    result =
      ((~result >>> 0) << (32 - this.bitWidth)) >>> (32 - this.bitWidth);
    this.output1.value = result;
    this.scope.simulationArea.simulationQueue.add(this.output1);
  }

  /**
     * @memberof NandGate
     * function to draw nand Gate
     * @param {CanvasRenderingContext2D} ctx
   */
  customDraw(ctx) {
    ctx.beginPath();
    ctx.lineWidth = correctWidth(3);
    ctx.strokeStyle = colors['stroke'];
    ctx.fillStyle = colors['fill'];
    const xx = this.x;
    const yy = this.y;
    moveTo(ctx, -10, -20, xx, yy, this.direction);
    lineTo(ctx, 0, -20, xx, yy, this.direction);
    arc(ctx, 0, 0, 20, -Math.PI / 2, Math.PI / 2, xx, yy, this.direction);
    lineTo(ctx, -10, 20, xx, yy, this.direction);
    lineTo(ctx, -10, -20, xx, yy, this.direction);
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
    drawCircle2(ctx, 25, 0, 5, xx, yy, this.direction);
    ctx.stroke();
  }

  /**
   * @memberof NandGate
   * Generates Verilog string for this CircuitElement.
   * @return {string} String representing the Verilog.
   */
  generateVerilog() {
    return gateGenerateVerilog.call(this, '&', true);
  }
}

/**
 * @memberof NandGate
 * Help Tip
 * @type {string}
 * @category modules
 */
NandGate.prototype.tooltipText =
  'Nand Gate ToolTip : Combination of AND and NOT gates';

/**
 * @memberof NandGate
 * @type {boolean}
 * @category modules
 */
NandGate.prototype.alwaysResolve = true;

/**
 * @memberof NandGate
 * function to change input nodes of the gate
 * @category modules
 */
NandGate.prototype.changeInputSize = changeInputSize;

/**
 * @memberof NandGate
 * @type {string}
 * @category modules
 */
NandGate.prototype.verilogType = 'nand';
NandGate.prototype.helplink =
  'https://docs.circuitverse.org/#/chapter4/4gates?id=nand-gate';
NandGate.prototype.objectType = 'NandGate';
NandGate.prototype.constructorParameters= [
  'direction',
  'inputSize',
  'bitWidth',
];
