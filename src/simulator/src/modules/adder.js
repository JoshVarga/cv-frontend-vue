import {CircuitElement} from '../circuit_element';
import {Node, findNode} from '../node';


/**
 * @class
 * Adder
 * @extends CircuitElement
 * @category modules
 */
export class Adder extends CircuitElement {
  /**
   * @param {number} x - x coordinate of element.
   * @param {number} y - y coordinate of element.
   * @param {Scope} scope - Circuit on which element is drawn
   * @param {string} dir - direction of element
   * @param {number} bitWidth - bit width per node. modules
   */
  constructor(x, y, scope, dir = 'RIGHT', bitWidth = 1) {
    super(x, y, scope, dir, bitWidth);
    this.setDimensions(20, 20);

    this.inpA = new Node(-20, -10, 0, this, this.bitWidth, 'A');
    this.inpB = new Node(-20, 0, 0, this, this.bitWidth, 'B');
    this.carryIn = new Node(-20, 10, 0, this, 1, 'Cin');
    this.sum = new Node(20, 0, 1, this, this.bitWidth, 'Sum');
    this.carryOut = new Node(20, 10, 1, this, 1, 'Cout');
  }

  /**
   * @memberof Adder
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
        inpA: findNode(this.inpA),
        inpB: findNode(this.inpB),
        carryIn: findNode(this.carryIn),
        carryOut: findNode(this.carryOut),
        sum: findNode(this.sum),
      },
    };
    return data;
  }

  /**
   * @memberof Adder
   * Checks if the output value can be determined.
   * @return {boolean}
   */
  isResolvable() {
    return this.inpA.value !== undefined && this.inpB.value !== undefined;
  }

  /**
   * @memberof Adder
   * function to change bitwidth of the element
   * @param {number} bitWidth - new bitwidth
   */
  newBitWidth(bitWidth) {
    this.bitWidth = bitWidth;
    this.inpA.bitWidth = bitWidth;
    this.inpB.bitWidth = bitWidth;
    this.sum.bitWidth = bitWidth;
  }

  /**
   * @memberof Adder
   * Determine output values and add to simulation queue.
   */
  resolve() {
    if (this.isResolvable() === false) {
      return;
    }
    let carryIn = this.carryIn.value;
    if (carryIn === undefined) {
      carryIn = 0;
    }
    const sum = this.inpA.value + this.inpB.value + carryIn;

    this.sum.value = (sum << (32 - this.bitWidth)) >>> (32 - this.bitWidth);
    this.carryOut.value = +(sum >>> this.bitWidth !== 0);
    globalScope.simulationArea.simulationQueue.add(this.carryOut);
    globalScope.simulationArea.simulationQueue.add(this.sum);
  }

  /**
   * @memberof Adder
   * Generates Verilog string for this CircuitElement.
   * @return {string} String representing the Verilog.
   */
  generateVerilog() {
    if (this.carryIn.verilogLabel) {
      return `assign ${this.sum.verilogLabel} = ${this.inpA.verilogLabel} + ` +
              `${this.inpB.verilogLabel} + ${this.carryIn.verilogLabel};`;
    }
    return `assign ${this.sum.verilogLabel} = ${this.inpA.verilogLabel} + ` +
            `${this.inpB.verilogLabel};`;
  }
}

/**
 * @memberof Adder
 * Help Tip
 * @type {string}
 * @category modules
 */
Adder.prototype.tooltipText = 'Adder ToolTip : Performs addition of numbers.';
Adder.prototype.helplink =
  'https://docs.circuitverse.org/#/chapter4/8misc?id=adder';
Adder.prototype.objectType = 'Adder';
Adder.prototype.constructorParameters= ['direction', 'bitWidth'];
