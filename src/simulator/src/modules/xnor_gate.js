import {CircuitElement} from '../circuit_element';
import {Node, findNode} from '../node';

import {
  correctWidth,
  bezierCurveTo,
  moveTo,
  arc2,
  drawCircle2,
} from '../canvas_api';
import {gateGenerateVerilog} from '../utils';
import {changeInputSize} from '../modules';
import {colors} from '../themer/themer';

/**
 * @class
 * XnorGate
 * @extends CircuitElement
 * @category modules
 */
export class XnorGate extends CircuitElement {
  /**
   * @param {number} x - x coordinate of element.
   * @param {number} y - y coordinate of element.
   * @param {Scope} scope - Circuit on which element is drawn.
   * @param {string} dir - direction of element.
   * @param {number} inputs - number of input nodes.
   * @param {number} bitWidth - bit width per node.
   */
  constructor(
      x,
      y,
      scope,
      dir = 'RIGHT',
      inputs = 2,
      bitWidth = 1,
  ) {
    super(x, y, scope, dir, bitWidth);
    this.rectangleObject = false;
    this.setDimensions(15, 20);

    this.inp = [];
    this.inputSize = inputs;

    if (inputs % 2 === 1) {
      for (let i = 0; i < inputs / 2 - 1; i++) {
        const a = new Node(-20, -10 * (i + 1), 0, this);
        this.inp.push(a);
      }
      let a = new Node(-20, 0, 0, this);
      this.inp.push(a);
      for (let i = inputs / 2 + 1; i < inputs; i++) {
        a = new Node(-20, 10 * (i + 1 - inputs / 2 - 1), 0, this);
        this.inp.push(a);
      }
    } else {
      for (let i = 0; i < inputs / 2; i++) {
        const a = new Node(-20, -10 * (i + 1), 0, this);
        this.inp.push(a);
      }
      for (let i = inputs / 2; i < inputs; i++) {
        const a = new Node(-20, 10 * (i + 1 - inputs / 2), 0, this);
        this.inp.push(a);
      }
    }
    this.output1 = new Node(30, 0, 1, this);
  }

  /**
   * @memberof XnorGate
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
   * @memberof XnorGate
   * Determine output values and add to simulation queue.
   */
  resolve() {
    let result = this.inp[0].value || 0;
    if (this.isResolvable() === false) {
      return;
    }
    for (let i = 1; i < this.inputSize; i++) {
      result ^= this.inp[i].value || 0;
    }
    result =
      ((~result >>> 0) << (32 - this.bitWidth)) >>> (32 - this.bitWidth);
    this.output1.value = result;
    this.scope.simulationArea.simulationQueue.add(this.output1);
  }

  /**
     * @memberof XnorGate
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
    moveTo(ctx, -10, -20, xx, yy, this.direction, true);
    bezierCurveTo(0, -20, +15, -10, 20, 0, xx, yy, this.direction);
    bezierCurveTo(
        0 + 15,
        0 + 10,
        0,
        0 + 20,
        -10,
        +20,
        xx,
        yy,
        this.direction,
    );
    bezierCurveTo(0, 0, 0, 0, -10, -20, xx, yy, this.direction);
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
    arc2(
        ctx,
        -35,
        0,
        25,
        1.7 * Math.PI,
        0.3 * Math.PI,
        xx,
        yy,
        this.direction,
    );
    ctx.stroke();
    ctx.beginPath();
    drawCircle2(ctx, 25, 0, 5, xx, yy, this.direction);
    ctx.stroke();
  }

  /**
   * @memberof XnorGate
   * Generates Verilog string for this CircuitElement.
   * @return {string} String representing the Verilog.
   */
  generateVerilog() {
    return gateGenerateVerilog.call(this, '^', true);
  }
}

/**
 * @memberof XnorGate
 * @type {boolean}
 * @category modules
 */
XnorGate.prototype.alwaysResolve = true;

/**
 * @memberof XnorGate
 * Help Tip
 * @type {string}
 * @category modules
 */
XnorGate.prototype.tooltipText =
  'Xnor Gate ToolTip : Logical complement of the XOR gate';

/**
 * @memberof XnorGate
 * function to change input nodes of the element
 * @category modules
 */
XnorGate.prototype.changeInputSize = changeInputSize;

/**
 * @memberof XnorGate
 * @type {string}
 * @category modules
 */
XnorGate.prototype.verilogType = 'xnor';
XnorGate.prototype.helplink =
  'https://docs.circuitverse.org/#/chapter4/4gates?id=xnor-gate';
XnorGate.prototype.objectType = 'XnorGate';
XnorGate.prototype.constructorParameters= [
  'direction',
  'inputSize',
  'bitWidth',
];
