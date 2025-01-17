import {CircuitElement} from '../circuit_element';
import {Node, findNode} from '../node';

import {
  correctWidth,
  lineTo,
  moveTo,
  rect2,
  validColor,
  colorToRGBA,
} from '../canvas_api';
import {colors} from '../themer/themer';
/**
 * @class
 * HexDisplay
 * @extends CircuitElement
 * @category modules
 */
export class HexDisplay extends CircuitElement {
  /**
   * @param {number} x - x coordinate of element.
   * @param {number} y - y coordinate of element.
   * @param {Scope} scope - Circuit on which element is drawn
   * @param {*} color
   */
  constructor(x, y, scope, color = 'Red') {
    super(x, y, scope, 'RIGHT', 4);
    this.directionFixed = true;
    this.fixedBitWidth = true;
    this.setDimensions(30, 50);
    this.inp = new Node(0, -50, 0, this, 4);
    this.direction = 'RIGHT';
    this.color = color;
    this.actualColor = color;
  }

  /**
   * @memberof HexDisplay
   * fn to change the color of HexDisplay
   * @param {string} value Color to change to.
   */
  changeColor(value) {
    if (validColor(value)) {
      if (value.trim() === '') {
        this.color = 'Red';
        this.actualColor = 'rgba(255, 0, 0, 1)';
      } else {
        this.color = value;
        const temp = colorToRGBA(value);
        this.actualColor = `rgba(${temp[0]},${temp[1]},${temp[2]}, ${temp[3]})`;
      }
    }
  }

  /**
   * @memberof HexDisplay
   * Create save JSON data of object.
   * @return {JSON}
   */
  customSave() {
    const data = {
      customData: {
        color: this.color,
      },
      nodes: {
        inp: findNode(this.inp),
      },
    };
    return data;
  }

  /**
   * @memberof HexDisplay
   * Draw element
   * @param {*} ctx
   * @param {*} x1
   * @param {*} y1
   * @param {*} x2
   * @param {*} y2
   * @param {*} color
   */
  customDrawSegment(ctx, x1, y1, x2, y2, color) {
    if (color === undefined) {
      color = 'lightgrey';
    }
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = correctWidth(5);
    const xx = this.x;
    const yy = this.y;

    moveTo(ctx, x1, y1, xx, yy, this.direction);
    lineTo(ctx, x2, y2, xx, yy, this.direction);
    ctx.closePath();
    ctx.stroke();
  }

  /**
     * @memberof HexDisplay
     * function to draw element
     * @param {CanvasRenderingContext2D} ctx
   */
  customDraw(ctx) {
    ctx.strokeStyle = colors['stroke'];
    ctx.lineWidth = correctWidth(3);

    let a = 0;
    let b = 0;
    let c = 0;
    let d = 0;
    let e = 0;
    let f = 0;
    let g = 0;
    switch (this.inp.value) {
      case 0:
        a = b = c = d = e = f = 1;
        break;
      case 1:
        b = c = 1;
        break;
      case 2:
        a = b = g = e = d = 1;
        break;
      case 3:
        a = b = g = c = d = 1;
        break;
      case 4:
        f = g = b = c = 1;
        break;
      case 5:
        a = f = g = c = d = 1;
        break;
      case 6:
        a = f = g = e = c = d = 1;
        break;
      case 7:
        a = b = c = 1;
        break;
      case 8:
        a = b = c = d = e = g = f = 1;
        break;
      case 9:
        a = f = g = b = c = 1;
        break;
      case 0xa:
        a = f = b = c = g = e = 1;
        break;
      case 0xb:
        f = e = g = c = d = 1;
        break;
      case 0xc:
        a = f = e = d = 1;
        break;
      case 0xd:
        b = c = g = e = d = 1;
        break;
      case 0xe:
        a = f = g = e = d = 1;
        break;
      case 0xf:
        a = f = g = e = 1;
        break;
      default:
    }
    const col = ['lightgrey', this.actualColor];
    this.customDrawSegment(
        ctx,
        18,
        -3,
        18,
        -38,
        col[b],
    );
    this.customDrawSegment(
        ctx,
        18,
        3,
        18,
        38,
        col[c],
    );
    this.customDrawSegment(
        ctx,
        -18,
        -3,
        -18,
        -38,
        col[f],
    );
    this.customDrawSegment(
        ctx,
        -18,
        3,
        -18,
        38,
        col[e],
    );
    this.customDrawSegment(
        ctx,
        -17,
        -38,
        17,
        -38,
        col[a],
    );
    this.customDrawSegment(
        ctx,
        -17,
        0,
        17,
        0,
        col[g],
    );
    this.customDrawSegment(
        ctx,
        -15,
        38,
        17,
        38,
        col[d],
    );
  }

  /**
   *
   * @param {*} ctx
   * @param {*} x1
   * @param {*} y1
   * @param {*} x2
   * @param {*} y2
   * @param {*} color
   * @param {*} xxSegment
   * @param {*} yySegment
   */
  subcircuitDrawSegment(ctx, x1, y1, x2, y2, color, xxSegment, yySegment) {
    if (color == undefined) {
      color = 'lightgrey';
    }
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = correctWidth(3);
    const xx = xxSegment;
    const yy = yySegment;

    moveTo(ctx, x1, y1, xx, yy, this.direction);
    lineTo(ctx, x2, y2, xx, yy, this.direction);
    ctx.closePath();
    ctx.stroke();
  }

  /**
   * Draws the element in the subcircuit. Used in layout mode
   * @param {CanvasRenderingContext2D} ctx
   * @param {*} xOffset
   * @param {*} yOffset
   */
  subcircuitDraw(ctx, xOffset = 0, yOffset = 0) {
    const xx = this.subcircuitMetadata.x + xOffset;
    const yy = this.subcircuitMetadata.y + yOffset;

    ctx.strokeStyle = 'black';
    ctx.lineWidth = correctWidth(3);
    let a = 0;
    let b = 0;
    let c = 0;
    let d = 0;
    let e = 0;
    let f = 0;
    let g = 0;

    switch (this.inp.value) {
      case 0:
        a = b = c = d = e = f = 1;
        break;
      case 1:
        b = c = 1;
        break;
      case 2:
        a = b = g = e = d = 1;
        break;
      case 3:
        a = b = g = c = d = 1;
        break;
      case 4:
        f = g = b = c = 1;
        break;
      case 5:
        a = f = g = c = d = 1;
        break;
      case 6:
        a = f = g = e = c = d = 1;
        break;
      case 7:
        a = b = c = 1;
        break;
      case 8:
        a = b = c = d = e = g = f = 1;
        break;
      case 9:
        a = f = g = b = c = 1;
        break;
      case 0xa:
        a = f = b = c = g = e = 1;
        break;
      case 0xb:
        f = e = g = c = d = 1;
        break;
      case 0xc:
        a = f = e = d = 1;
        break;
      case 0xd:
        b = c = g = e = d = 1;
        break;
      case 0xe:
        a = f = g = e = d = 1;
        break;
      case 0xf:
        a = f = g = e = 1;
        break;
      default:
    }
    const col = ['lightgrey', this.actualColor];
    this.subcircuitDrawSegment(ctx,
        10,
        -20,
        10,
        -38,
        col[b],
        xx,
        yy,
    );
    this.subcircuitDrawSegment(
        ctx,
        10,
        -17,
        10,
        1,
        col[c],
        xx,
        yy,
    );
    this.subcircuitDrawSegment(
        ctx,
        -10,
        -20,
        -10,
        -38,
        col[f],
        xx,
        yy,
    );
    this.subcircuitDrawSegment(
        ctx,
        -10,
        -17,
        -10,
        1,
        col[e],
        xx,
        yy,
    );
    this.subcircuitDrawSegment(
        ctx,
        -8,
        -38,
        8,
        -38,
        col[a],
        xx,
        yy,
    );
    this.subcircuitDrawSegment(
        ctx,
        -8,
        -18,
        8,
        -18,
        col[g],
        xx,
        yy,
    );
    this.subcircuitDrawSegment(
        ctx,
        -8,
        1,
        8,
        1,
        col[d],
        xx,
        yy,
    );

    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = correctWidth(1);
    rect2(ctx, -15, -42, 33, 51, xx, yy, this.direction);
    ctx.stroke();

    if (
      (this.hover && !this.scope.simulationArea.shiftDown) ||
      this.scope.simulationArea.lastSelected == this ||
      this.scope.simulationArea.multipleObjectSelections.includes(this)
    ) {
      ctx.fillStyle = 'rgba(255, 255, 32,0.6)';
      ctx.fill();
    }
  }

  /**
   * @memberof HexDisplay
   * Generates Verilog string for this CircuitElement.
   * @return {string} String representing the Verilog.
   */
  generateVerilog() {
    return `
      always @ (*)
        $display("HexDisplay:${this.verilogLabel}=%d", ` +
        `${this.inp.verilogLabel});`;
  }
}

/**
 * @memberof HexDisplay
 * Help Tip
 * @type {string}
 * @category modules
 */
HexDisplay.prototype.tooltipText =
  'Hex Display ToolTip: Inputs a 4 Bit Hex number and displays it.';

/**
 * @memberof HexDisplay
 * Help URL
 * @type {string}
 * @category modules
 */
HexDisplay.prototype.helplink =
  'https://docs.circuitverse.org/#/chapter4/3output?id=hexdisplay';
HexDisplay.prototype.objectType = 'HexDisplay';
HexDisplay.prototype.canShowInSubcircuit = true;
HexDisplay.prototype.layoutProperties = {
  rightDimensionX: 20,
  leftDimensionX: 15,
  upDimensionY: 42,
  downDimensionY: 10,
};

/**
 * @memberof HexDisplay
 * Mutable properties of the element
 * @type {JSON}
 * @category modules
 */
HexDisplay.prototype.mutableProperties = {
  color: {
    name: 'Color: ',
    type: 'text',
    func: 'changeColor',
  },
};
HexDisplay.prototype.constructorParameters= ['color'];
