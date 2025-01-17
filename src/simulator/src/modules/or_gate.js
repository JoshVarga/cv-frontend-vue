import {CircuitElement} from '../circuit_element';
import {Node, findNode} from '../node';

import {correctWidth, bezierCurveTo, moveTo} from '../canvas_api';
import {changeInputSize} from '../modules';
import {gateGenerateVerilog} from '../utils';
import {colors} from '../themer/themer';
/**
 * @class
 * OrGate
 * @extends CircuitElement
 * @category modules
 */
export class OrGate extends CircuitElement {
  /**
   * @param {number} x - x coordinate of element.
   * @param {number} y - y coordinate of element.
   * @param {Scope} scope - Circuit on which element is drawn
   * @param {string} dir - direction of element
   * @param {number} inputs - number of input nodes
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
    // Inherit base class prototype
    this.inp = [];
    this.inputSize = inputs;
    if (inputs % 2 === 1) {
      for (let i = Math.floor(inputs / 2) - 1; i >= 0; i--) {
        const a = new Node(-10, -10 * (i + 1), 0, this);
        this.inp.push(a);
      }
      let a = new Node(-10, 0, 0, this);
      this.inp.push(a);
      for (let i = 0; i < Math.floor(inputs / 2); i++) {
        a = new Node(-10, 10 * (i + 1), 0, this);
        this.inp.push(a);
      }
    } else {
      for (let i = inputs / 2 - 1; i >= 0; i--) {
        const a = new Node(-10, -10 * (i + 1), 0, this);
        this.inp.push(a);
      }
      for (let i = 0; i < inputs / 2; i++) {
        const a = new Node(-10, 10 * (i + 1), 0, this);
        this.inp.push(a);
      }
    }
    this.output1 = new Node(20, 0, 1, this);
  }

  /**
   * @memberof OrGate
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
   * @memberof OrGate
   * Determine output values and add to simulation queue.
   */
  resolve() {
    let result = this.inp[0].value || 0;
    if (this.isResolvable() === false) {
      return;
    }
    for (let i = 1; i < this.inputSize; i++) {
      result |= this.inp[i].value || 0;
    }
    this.output1.value = result >>> 0;
    this.scope.simulationArea.simulationQueue.add(this.output1);
  }

  /**
   * @memberof OrGate
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
  }

  /**
   * @memberof OrGate
   * Generates Verilog string for this CircuitElement.
   * @return {string} String representing the Verilog.
   */
  generateVerilog() {
    return gateGenerateVerilog.call(this, '|');
  }
}

/**
 * @memberof OrGate
 * Help Tip
 * @type {string}
 * @category modules
 */
OrGate.prototype.tooltipText =
  'Or Gate Tooltip : Implements logical disjunction';

/**
 * @memberof OrGate
 * function to change input nodes of the element
 * @category modules
 */
OrGate.prototype.changeInputSize = changeInputSize;

/**
 * @memberof SevenSegDisplay
 * @type {boolean}
 * @category modules
 */
OrGate.prototype.alwaysResolve = true;

/**
 * @memberof SevenSegDisplay
 * @type {string}
 * @category modules
 */
OrGate.prototype.verilogType = 'or';
OrGate.prototype.helplink = 'https://docs.circuitverse.org/#/chapter4/4gates?id=or-gate';
OrGate.prototype.objectType = 'OrGate';
OrGate.prototype.constructorParameters= ['direction', 'inputSize', 'bitWidth'];
