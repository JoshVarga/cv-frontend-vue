import {CircuitElement} from '../circuit_element';
import {Node, findNode} from '../node';

import {
  colorToRGBA,
  correctWidth,
  lineTo,
  moveTo,
  rect,
  rect2,
  validColor,
} from '../canvas_api';

/**
 * @class
 * SevenSegDisplay
 * @extends CircuitElement
 * @category modules
 */
export class SevenSegDisplay extends CircuitElement {
  /**
   * @param {number} x - x coordinate of element.
   * @param {number} y - y coordinate of element.
   * @param {Scope} scope - Circuit on which element is drawn
   * @param {string} color - color of the segment lights.
   */
  constructor(x, y, scope, color = 'Red') {
    super(x, y, scope, 'RIGHT', 1);
    this.fixedBitWidth = true;
    this.directionFixed = true;
    this.setDimensions(30, 50);

    this.g = new Node(-20, -50, 0, this);
    this.f = new Node(-10, -50, 0, this);
    this.a = new Node(+10, -50, 0, this);
    this.b = new Node(+20, -50, 0, this);
    this.e = new Node(-20, +50, 0, this);
    this.d = new Node(-10, +50, 0, this);
    this.c = new Node(+10, +50, 0, this);
    this.dot = new Node(+20, +50, 0, this);
    this.direction = 'RIGHT';
    this.color = color;
    this.actualColor = color;
  }

  /**
   * @memberof SevenSegDisplay
   * Change the color of SevenSegDisplay
   * @param {string} value - color name
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
   * @memberof SevenSegDisplay
   * Create save JSON data of object.
   * @return {JSON}
   */
  customSave() {
    const data = {
      customData: {
        color: this.color,
      },
      nodes: {
        g: findNode(this.g),
        f: findNode(this.f),
        a: findNode(this.a),
        b: findNode(this.b),
        d: findNode(this.d),
        e: findNode(this.e),
        c: findNode(this.c),
        dot: findNode(this.dot),
      },
    };
    return data;
  }

  /**
   * @memberof SevenSegDisplay
   * helper function to create save Json Data of object
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
     * @memberof SevenSegDisplay
     * function to draw element
     * @param {CanvasRenderingContext2D} ctx
   */
  customDraw(ctx) {
    const xx = this.x;
    const yy = this.y;
    const col = ['lightgrey', this.actualColor];
    this.customDrawSegment(
        ctx,
        18,
        -3,
        18,
        -38,
        col[this.b.value],
    );
    this.customDrawSegment(
        ctx,
        18,
        3,
        18,
        38,
        col[this.c.value],
    );
    this.customDrawSegment(
        ctx,
        -18,
        -3,
        -18,
        -38,
        col[this.f.value],
    );
    this.customDrawSegment(
        ctx,
        -18,
        3,
        -18,
        38,
        col[this.e.value],
    );
    this.customDrawSegment(
        ctx,
        -17,
        -38,
        17,
        -38,
        col[this.a.value],
    );
    this.customDrawSegment(
        ctx,
        -17,
        0,
        17,
        0,
        col[this.g.value],
    );
    this.customDrawSegment(
        ctx,
        -15,
        38,
        17,
        38,
        col[this.d.value],
    );
    ctx.beginPath();
    const dotColor = col[this.dot.value] || 'lightgrey';
    ctx.strokeStyle = dotColor;
    rect(ctx, xx + 22, yy + 42, 2, 2);
    ctx.stroke();
  }

  /**
   * Subcircuit draw segment.
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
    const col = ['lightgrey', this.actualColor];
    this.subcircuitDrawSegment(
        ctx,
        10,
        -20,
        10,
        -38,
        col[this.b.value],
        xx,
        yy,
    );
    this.subcircuitDrawSegment(
        ctx,
        10,
        -17,
        10,
        1,
        col[this.c.value],
        xx,
        yy,
    );
    this.subcircuitDrawSegment(
        ctx,
        -10,
        -20,
        -10,
        -38,
        col[this.f.value],
        xx,
        yy,
    );
    this.subcircuitDrawSegment(
        ctx,
        -10,
        -17,
        -10,
        1,
        col[this.e.value],
        xx,
        yy,
    );
    this.subcircuitDrawSegment(
        ctx,
        -8,
        -38,
        8,
        -38,
        col[this.a.value],
        xx,
        yy,
    );
    this.subcircuitDrawSegment(
        ctx,
        -8,
        -18,
        8,
        -18,
        col[this.g.value],
        xx,
        yy,
    );
    this.subcircuitDrawSegment(
        ctx,
        -8,
        1,
        8,
        1,
        col[this.d.value],
        xx,
        yy,
    );

    ctx.beginPath();
    const dotColor = col[this.dot.value] || 'lightgrey';
    ctx.strokeStyle = dotColor;
    rect(ctx, xx + 13, yy + 5, 1, 1);
    ctx.stroke();

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
   * @memberof SevenSegDisplay
   * Generates Verilog string for this CircuitElement.
   * @return {string} String representing the Verilog.
   */
  generateVerilog() {
    return `
      always @ (*)
        $display("SevenSegDisplay:${this.verilogLabel}.abcdefg. = ` +
        `%b%b%b%b%b%b%b%b}",
            ${this.a.verilogLabel}, ${this.b.verilogLabel}, ` +
            `${this.c.verilogLabel}, ${this.d.verilogLabel}, ` +
            `${this.e.verilogLabel}, ${this.f.verilogLabel}, ` +
            `${this.g.verilogLabel}, ${this.dot.verilogLabel});`;
  }
}

/**
 * @memberof SevenSegDisplay
 * Help Tip
 * @type {string}
 * @category modules
 */
SevenSegDisplay.prototype.tooltipText =
  'Seven Display ToolTip: Consists of 7+1 single bit inputs.';

/**
 * @memberof SevenSegDisplay
 * Help URL
 * @type {string}
 * @category modules
 */
SevenSegDisplay.prototype.helplink =
  'https://docs.circuitverse.org/#/chapter4/3output?id=sevensegdisplay';
SevenSegDisplay.prototype.objectType = 'SevenSegDisplay';
SevenSegDisplay.prototype.canShowInSubcircuit = true;
SevenSegDisplay.prototype.layoutProperties = {
  rightDimensionX: 20,
  leftDimensionX: 15,
  upDimensionY: 42,
  downDimensionY: 10,
};

/**
 * @memberof SevenSegDisplay
 * Mutable properties of the element
 * @type {JSON}
 * @category modules
 */
SevenSegDisplay.prototype.mutableProperties = {
  color: {
    name: 'Color: ',
    type: 'text',
    func: 'changeColor',
  },
};
SevenSegDisplay.prototype.constructorParameters= ['color'];
