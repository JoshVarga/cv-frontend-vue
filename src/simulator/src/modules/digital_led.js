import {CircuitElement} from '../circuit_element';
import {Node, findNode} from '../node';

import {
  correctWidth,
  lineTo,
  moveTo,
  arc,
  colorToRGBA,
  drawCircle2,
  validColor,
} from '../canvas_api';
import {colors} from '../themer/themer';

/**
 * @class
 * DigitalLed
 * @extends CircuitElement
 * @param {number} x - x coordinate of element.
 * @param {number} y - y coordinate of element.
 * @param {Scope} scope - Circuit on which element is drawn.
 * @param {string} color - color of the LED.
 * @category modules
 */
export class DigitalLed extends CircuitElement {
  /**
   * @param {number} x - x coordinate of element.
   * @param {number} y - y coordinate of element.
   * @param {Scope} scope - Circuit on which element is drawn.
   * @param {string} color - color of the LED.
   */
  constructor(x, y, scope, color = 'Red') {
    super(x, y, scope, 'UP', 1);
    this.rectangleObject = false;
    this.setDimensions(10, 20);
    this.inp1 = new Node(-40, 0, 0, this, 1);
    this.directionFixed = true;
    this.fixedBitWidth = true;
    this.color = color;
    const temp = colorToRGBA(this.color);
    this.actualColor = `rgba(${temp[0]},${temp[1]},${temp[2]},${0.8})`;
  }

  /**
   * @memberof DigitalLed
   * Create save JSON data of object.
   * @return {JSON}
   */
  customSave() {
    const data = {
      customData: {
        color: this.color,
      },
      nodes: {
        inp1: findNode(this.inp1),
      },
    };
    return data;
  }

  /**
   * @memberof DigitalLed
   * function to change color of the led
   */
  changeColor(value) {
    if (validColor(value)) {
      this.color = value;
      const temp = colorToRGBA(this.color);
      this.actualColor = `rgba(${temp[0]},${temp[1]},${temp[2]},${0.8})`;
    }
  }

  /**
     * @memberof DigitalLed
     * function to draw element
     * @param {CanvasRenderingContext2D} ctx
   */
  customDraw(ctx) {
    const xx = this.x;
    const yy = this.y;
    ctx.strokeStyle = '#e3e4e5';
    ctx.lineWidth = correctWidth(3);
    ctx.beginPath();
    moveTo(ctx, -20, 0, xx, yy, this.direction);
    lineTo(ctx, -40, 0, xx, yy, this.direction);
    ctx.stroke();

    ctx.strokeStyle = '#d3d4d5';
    ctx.fillStyle = ['rgba(227,228,229,0.8)', this.actualColor][
        this.inp1.value || 0
    ];
    ctx.lineWidth = correctWidth(1);

    ctx.beginPath();

    moveTo(ctx, -15, -9, xx, yy, this.direction);
    lineTo(ctx, 0, -9, xx, yy, this.direction);
    arc(ctx, 0, 0, 9, -Math.PI / 2, Math.PI / 2, xx, yy, this.direction);
    lineTo(ctx, -15, 9, xx, yy, this.direction);
    lineTo(ctx, -18, 12, xx, yy, this.direction);
    arc(
        ctx,
        0,
        0,
        Math.sqrt(468),
        Math.PI / 2 + Math.acos(12 / Math.sqrt(468)),
        -Math.PI / 2 - Math.asin(18 / Math.sqrt(468)),
        xx,
        yy,
        this.direction,
    );
    lineTo(ctx, -15, -9, xx, yy, this.direction);
    ctx.stroke();
    if (
      (this.hover && !this.scope.simulationArea.shiftDown) ||
      this.scope.simulationArea.lastSelected === this ||
      this.scope.simulationArea.multipleObjectSelections.includes(this)
    ) {
      ctx.fillStyle = colors['hover_select'];
    }
    ctx.fill();
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

    ctx.strokeStyle = '#090a0a';
    ctx.fillStyle = ['rgba(227,228,229,0.8)', this.actualColor][
        this.inp1.value || 0
    ];
    ctx.lineWidth = correctWidth(1);

    ctx.beginPath();
    drawCircle2(ctx, 0, 0, 6, xx, yy, this.direction);
    ctx.stroke();

    if (
      (this.hover && !this.scope.simulationArea.shiftDown) ||
      this.scope.simulationArea.lastSelected == this ||
      this.scope.simulationArea.multipleObjectSelections.includes(this)
    ) {
      ctx.fillStyle = 'rgba(255, 255, 32,0.8)';
    }
    ctx.fill();
  }

  /**
   * @memberof DigitalLed
   * Generates Verilog string for this CircuitElement.
   * @return {string} String representing the Verilog.
   */
  generateVerilog() {
    const label = this.label ? this.verilogLabel : this.inp1.verilogLabel;
    return `
      always @ (*)
        $display("DigitalLed:${label}=%d", ${this.inp1.verilogLabel});`;
  }
}

/**
 * @memberof DigitalLed
 * Help Tip
 * @type {string}
 * @category modules
 */
DigitalLed.prototype.tooltipText =
  'Digital Led ToolTip: Digital LED glows high when input is High(1).';

/**
 * @memberof DigitalLed
 * Help URL
 * @type {string}
 * @category modules
 */
DigitalLed.prototype.helplink =
  'https://docs.circuitverse.org/#/chapter4/3output?id=digital-led';

/**
 * @memberof DigitalLed
 * Mutable properties of the element
 * @type {JSON}
 * @category modules
 */
DigitalLed.prototype.mutableProperties = {
  color: {
    name: 'Color: ',
    type: 'text',
    func: 'changeColor',
  },
};
DigitalLed.prototype.objectType = 'DigitalLed';
DigitalLed.prototype.canShowInSubcircuit = true;
DigitalLed.prototype.constructorParameters= ['color'];
