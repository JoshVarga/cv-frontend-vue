import {CircuitElement} from '../circuit_element';
import {Node, findNode} from '../node';

import {correctWidth, fillText, rect2, oppositeDirection} from '../canvas_api';
import {getNextPosition} from '../modules';
import {converters, generateId} from '../utils';
import {colors} from '../themer/themer';

/**
 * @class
 * Output
 * @extends CircuitElement
 * @param {number} x - x coordinate of element.
 * @param {number} y - y coordinate of element.
 * @param {Scope} scope - Circuit on which element is drawn
 * @param {string} dir - direction of element
 * @param {number} inputLength - number of input nodes
 * @param {number} bitWidth - bit width per node.
 * @category modules
 */
export class Output extends CircuitElement {
  /**
   * @param {number} x - x coordinate of element.
   * @param {number} y - y coordinate of element.
   * @param {Scope} scope - Circuit on which element is drawn
   * @param {string} dir - direction of element
   * @param {number} bitWidth - bit width per node.
   * @param {*} layoutProperties - custom properties of the layout
   */
  constructor(
      x,
      y,
      scope = globalScope,
      dir = 'LEFT',
      bitWidth = 1,
      layoutProperties,
  ) {
    super(x, y, scope, dir, bitWidth);
    if (layoutProperties) {
      this.layoutProperties = layoutProperties;
    } else {
      this.layoutProperties = {};
      this.layoutProperties.x = scope.layout.width;
      this.layoutProperties.y = getNextPosition(scope.layout.width, scope);
      this.layoutProperties.id = generateId();
    }

    this.rectangleObject = false;
    this.directionFixed = true;
    this.orientationFixed = false;
    this.setDimensions(this.bitWidth * 10, 10);
    this.inp1 = new Node(this.bitWidth * 10, 0, 0, this);
  }

  /**
   * @memberof Output
   * Create save JSON data of object.
   * @return {JSON}
   */
  customSave() {
    const data = {
      nodes: {
        inp1: findNode(this.inp1),
      },
      customData: {
        direction: this.direction,
        bitWidth: this.bitWidth,
        layoutProperties: this.layoutProperties,
      },
    };
    return data;
  }

  /**
     * @memberof Output
     * function to change bitwidth of the element
     * @param {number} bitWidth - new bitwidth
     */
  newBitWidth(bitWidth) {
    if (bitWidth < 1) {
      return;
    }
    const diffBitWidth = bitWidth - this.bitWidth;
    this.state = undefined;
    this.inp1.bitWidth = bitWidth;
    this.bitWidth = bitWidth;
    this.setWidth(10 * this.bitWidth);

    if (this.direction === 'RIGHT') {
      this.x -= 10 * diffBitWidth;
      this.inp1.x = 10 * this.bitWidth;
      this.inp1.leftX = 10 * this.bitWidth;
    } else if (this.direction === 'LEFT') {
      this.x += 10 * diffBitWidth;
      this.inp1.x = -10 * this.bitWidth;
      this.inp1.leftX = 10 * this.bitWidth;
    }
  }

  /**
     * @memberof Output
     * function to draw element
     * @param {CanvasRenderingContext2D} ctx
   */
  customDraw(ctx) {
    this.state = this.inp1.value; // TODO: Why is this being set?
    ctx.beginPath();
    ctx.strokeStyle = [colors['out_rect'], colors['stroke_alt']][
        +(this.inp1.value === undefined)
    ];
    ctx.fillStyle = colors['fill'];
    ctx.lineWidth = correctWidth(3);
    const xx = this.x;
    const yy = this.y;

    rect2(
        ctx,
        -10 * this.bitWidth,
        -10,
        20 * this.bitWidth,
        20,
        xx,
        yy,
        'RIGHT',
    );
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
    ctx.font = '20px Raleway';
    ctx.fillStyle = colors['input_text'];
    ctx.textAlign = 'center';
    let bin;
    if (this.state === undefined) {
      bin = 'x'.repeat(this.bitWidth);
    } else {
      bin = converters.dec2bin(this.state, this.bitWidth);
    }

    for (let k = 0; k < this.bitWidth; k++) {
      fillText(ctx, bin[k], xx - 10 * this.bitWidth + 10 + k * 20, yy + 5);
    }
    ctx.fill();
  }

  /**
     * @memberof Output
     * function to change direction of Output
     * @param {string} dir - new direction
     */
  newDirection(dir) {
    if (dir === this.direction) {
      return;
    }
    this.direction = dir;
    this.inp1.refresh();
    if (dir === 'RIGHT' || dir === 'LEFT') {
      this.inp1.leftX = 10 * this.bitWidth;
      this.inp1.leftY = 0;
    } else {
      this.inp1.leftX = 10; // 10*this.bitWidth;
      this.inp1.leftY = 0;
    }

    this.inp1.refresh();
    this.labelDirection = oppositeDirection[this.direction];
  }

  /**
   * @memberof Output
   * Generates Verilog string for this CircuitElement.
   * @return {string} String representing the Verilog.
   */
  generateVerilog() {
    return (
      'assign ' + this.verilogLabel + ' = ' + this.inp1.verilogLabel + ';'
    );
  }
}

/**
 * @memberof Output
 * Help Tip
 * @type {string}
 * @category modules
 */
Output.prototype.tooltipText =
  'Output ToolTip: Simple output element showing output in binary.';

/**
 * @memberof Output
 * Help URL
 * @type {string}
 * @category modules
 */
Output.prototype.helplink = 'https://docs.circuitverse.org/#/outputs?id=output';

/**
 * @memberof Output
 * @type {number}
 * @category modules
 */
Output.prototype.propagationDelay = 0;
Output.prototype.objectType = 'Output';
Output.prototype.constructorParameters= [
  'direction',
  'bitWidth',
  'layoutProperties',
];
