import {CircuitElement} from '../circuit_element';
import {Node, findNode} from '../node';


/**
 * @class
 * verilogShiftLeft
 * @extends CircuitElement
 * @param {number} x - x coordinate of element.
 * @param {number} y - y coordinate of element.
 * @param {Scope} scope - Circuit on which element is drawn.
 * @param {string} dir - direction of element.
 * @param {number} bitWidth - bit width per node. modules.
 * @category modules
 */
export class verilogShiftLeft extends CircuitElement {
  /**
   * @param {number} x - x coordinate of element.
   * @param {number} y - y coordinate of element.
   * @param {Scope} scope - Circuit on which element is drawn.
   * @param {string} dir - direction of element.
   * @param {number} bitWidth - bit width per node. modules.
   * @param {number} outputBitWidth - output bit width.
   */
  constructor(
      x,
      y,
      scope,
      dir = 'RIGHT',
      bitWidth = 1,
      outputBitWidth = 1,
  ) {
    super(x, y, scope, dir, bitWidth);
    this.setDimensions(20, 20);
    this.outputBitWidth = outputBitWidth;
    this.inp1 = new Node(-20, -10, 0, this, this.bitWidth, 'Input');
    this.shiftInp = new Node(-20, 0, 0, this, this.bitWidth, 'ShiftInput');
    this.output1 = new Node(20, 0, 1, this, this.outputBitWidth, 'Output');
  }

  /**
   * @memberof verilogShiftLeft
   * Create save JSON data of object.
   * @return {JSON}
   */
  customSave() {
    const data = {
      customData: {
        direction: this.direction,
        bitWidth: this.bitWidth,
        outputBitWidth: this.outputBitWidth,
      },
      nodes: {
        inp1: findNode(this.inp1),
        shiftInp: findNode(this.shiftInp),
        output1: findNode(this.output1),
      },
    };
    return data;
  }

  /**
   * @memberof verilogShiftLeft
   * Checks if the output value can be determined.
   * @return {boolean}
   */
  isResolvable() {
    return (
      this.inp1.value !== undefined && this.shiftInp.value !== undefined
    );
  }

  /**
   * @memberof verilogShiftLeft
   * function to change bitwidth of the element
   * @param {number} bitWidth - new bitwidth
   */
  newBitWidth(bitWidth) {
    this.bitWidth = bitWidth;
    this.inp1.bitWidth = bitWidth;
    this.shiftInp.bitWidth = bitWidth;
    this.output1.bitWidth = bitWidth;
  }

  /**
   * @memberof verilogShiftLeft
   * Determine output values and add to simulation queue.
   */
  resolve() {
    if (this.isResolvable() === false) {
      return;
    }
    const output1 = this.inp1.value << this.shiftInp.value;

    this.output1.value =
      (output1 << (32 - this.outputBitWidth)) >>>
      (32 - this.outputBitWidth);
    globalScope.simulationArea.simulationQueue.add(this.output1);
  }
}

/**
 * @memberof verilogShiftLeft
 * Help Tip
 * @type {string}
 * @category modules
 */
verilogShiftLeft.prototype.tooltipText =
  'verilogShiftLeft ToolTip : Performs addition of numbers.';
verilogShiftLeft.prototype.helplink =
  'https://docs.circuitverse.org/#/miscellaneous?id=verilogShiftLeft';
verilogShiftLeft.prototype.objectType = 'verilogShiftLeft';
verilogShiftLeft.prototype.constructorParameters= [
  'direction',
  'bitWidth',
  'outputBitWidth',
];
