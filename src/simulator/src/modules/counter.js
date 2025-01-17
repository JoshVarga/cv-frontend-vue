import {CircuitElement} from '../circuit_element';
import {Node, findNode} from '../node';

import {lineTo, moveTo, fillText, correctWidth, rect2} from '../canvas_api';
import {colors} from '../themer/themer';

/**
 * Counter component.
 * Counts from zero to a particular maximum value, which is either
 * specified by an input pin or determined by the Counter's bitWidth.
 * The counter outputs its current value and a flag that indicates
 * when the output value is zero and the clock is 1.
 * The counter can be reset to zero at any point using the RESET pin.
 * @extends CircuitElement
 * @param {number} x - x coordinate of element.
 * @param {number} y - y coordinate of element.
 * @param {Scope} scope - Circuit on which element is drawn.
 * @param {number} bitWidth - bit width.
 * @category modules
 */
export class Counter extends CircuitElement {
  /**
   * @param {number} x - x coordinate of element.
   * @param {number} y - y coordinate of element.
   * @param {Scope} scope - Circuit on which element is drawn.
   * @param {number} bitWidth - bit width.
   */
  constructor(x, y, scope, bitWidth = 8) {
    super(x, y, scope, 'RIGHT', bitWidth);
    this.directionFixed = true;
    this.rectangleObject = true;

    this.setDimensions(20, 20);

    this.maxValue = new Node(-20, -10, 0, this, this.bitWidth, 'MaxValue');
    this.clock = new Node(-20, +10, 0, this, 1, 'Clock');
    this.reset = new Node(0, 20, 0, this, 1, 'Reset');
    this.output = new Node(20, -10, 1, this, this.bitWidth, 'Value');
    this.zero = new Node(20, 10, 1, this, 1, 'Zero');

    this.value = 0;
    this.prevClockState = undefined;
  }

  /**
   * @memberof Counter
   * Create save JSON data of object.
   * @return {JSON}
   */
  customSave() {
    return {
      nodes: {
        maxValue: findNode(this.maxValue),
        clock: findNode(this.clock),
        reset: findNode(this.reset),
        output: findNode(this.output),
        zero: findNode(this.zero),
      },
      customData: {
        bitWidth: this.bitWidth,
      },
    };
  }

  /**
   * Update the bitwidth of all nodes.
   * @param {number} bitWidth
   */
  newBitWidth(bitWidth) {
    this.bitWidth = bitWidth;
    this.maxValue.bitWidth = bitWidth;
    this.output.bitWidth = bitWidth;
  }

  isResolvable() {
    return true;
  }

  /**
   * @memberof Counter
   * Determine output values and add to simulation queue.
   */
  resolve() {
    // Either the value in the input pin or the max allowed by the bitWidth.
    const maxValue =
      this.maxValue.value != undefined ?
        this.maxValue.value :
        (1 << this.bitWidth) - 1;
    let outputValue = this.value;

    // Increase value when clock is raised
    if (this.clock.value != this.prevClockState && this.clock.value == 1) {
      outputValue++;
    }
    this.prevClockState = this.clock.value;

    // Limit to the effective maximum value; this also accounts for bitWidth changes.
    outputValue = outputValue % (maxValue + 1);

    // Reset to zero if RESET pin is on
    if (this.reset.value == 1) {
      outputValue = 0;
    }

    // Output the new value
    this.value = outputValue;
    if (this.output.value != outputValue) {
      this.output.value = outputValue;
      this.scope.simulationArea.simulationQueue.add(this.output);
    }

    // Output the zero signal
    const zeroValue = this.clock.value == 1 && outputValue == 0 ? 1 : 0;
    if (this.zero.value != zeroValue) {
      this.zero.value = zeroValue;
      this.scope.simulationArea.simulationQueue.add(this.zero);
    }
  }
  /**
   * Custom draw.
  * @param {CanvasRenderingContext2D} ctx
  */
  customDraw(ctx) {
    const xx = this.x;
    const yy = this.y;

    ctx.beginPath();
    ctx.font = '20px Raleway';
    ctx.fillStyle = colors['input_text'];
    ctx.textAlign = 'center';
    fillText(ctx, this.value.toString(16), this.x, this.y + 5);
    ctx.fill();

    ctx.strokeStyle = colors['stroke'];
    ctx.beginPath();
    moveTo(ctx, -20, 5, xx, yy, this.direction);
    lineTo(ctx, -15, 10, xx, yy, this.direction);
    lineTo(ctx, -20, 15, xx, yy, this.direction);
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

    ctx.beginPath();
    ctx.font = '20px Raleway';
    ctx.fillStyle = 'green';
    ctx.textAlign = 'center';
    fillText(ctx, this.value.toString(16), xx + 10, yy + 17);
    ctx.fill();

    ctx.beginPath();
    ctx.lineWidth = correctWidth(1);
    rect2(ctx, 0, 0, 20, 20, xx, yy, this.direction);
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
   * @memberof Counter
   * Generate Verilog string for this CircuitClement.
   * @return {string} String describing this element in Verilog.
   */
  static moduleVerilog() {
    return `
    module Counter(val, zero, max, clk, rst);
      parameter WIDTH = 1;
      output reg [WIDTH-1:0] val;
      output reg zero;
      input [WIDTH-1:0] max;
      input clk, rst;
    
      initial
        val = 0;
    
      always @ (val)
        if (val == 0)
          zero = 1;
        else
          zero = 0;
    
      always @ (posedge clk or posedge rst) begin
        if (rst)
          val <= 0;
        else
          if (val == max)
            val <= 0;
          else
            val <= val + 1;
      end
    endmodule`;
  }
}

Counter.prototype.tooltipText =
  'Counter: a binary counter from zero to a given maximum value';
Counter.prototype.helplink =
  'https://docs.circuitverse.org/#/chapter4/2input?id=counter';
Counter.prototype.objectType = 'Counter';
Counter.prototype.objectType = 'Counter';
Counter.prototype.canShowInSubcircuit = true;
Counter.prototype.layoutProperties = {
  rightDimensionX: 20,
  leftDimensionX: 0,
  upDimensionY: 0,
  downDimensionY: 20,
};
Counter.prototype.constructorParameters= ['bitWidth'];
