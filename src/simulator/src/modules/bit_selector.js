import {CircuitElement} from '../circuit_element';
import {Node, findNode, extractBits} from '../node';

import {correctWidth, rect, fillText} from '../canvas_api';
import {colors} from '../themer/themer';

/**
 * @class
 * BitSelector
 * @extends CircuitElement
 * @category modules
 */
export class BitSelector extends CircuitElement {
  /**
   *
   * @param {number} x - x coordinate of element.
   * @param {number} y - y coordinate of element.
   * @param {Scope} scope - Circuit on which element is drawn
   * @param {string} dir - direction of element
   * @param {number} bitWidth - bit width per node.
   * @param {number} selectorBitWidth - 1 by default
   */
  constructor(
      x,
      y,
      scope,
      dir = 'RIGHT',
      bitWidth = 2,
      selectorBitWidth = 1,
  ) {
    super(x, y, scope, dir, bitWidth);
    this.setDimensions(20, 20);
    this.selectorBitWidth =
      selectorBitWidth || parseInt(prompt('Enter Selector bitWidth'), 10);
    this.rectangleObject = false;
    this.inp1 = new Node(-20, 0, 0, this, this.bitWidth, 'Input');
    this.output1 = new Node(20, 0, 1, this, 1, 'Output');
    this.bitSelectorInp = new Node(
        0,
        20,
        0,
        this,
        this.selectorBitWidth,
        'Bit Selector',
    );
  }

  /**
     * @memberof BitSelector
     * Function to change selector Bitwidth
     * @param {number} size bitwidth
     */
  changeSelectorBitWidth(size) {
    if (size === undefined || size < 1 || size > 32) {
      return;
    }
    this.selectorBitWidth = size;
    this.bitSelectorInp.bitWidth = size;
  }

  /**
   * @memberof BitSelector
   * Create save JSON data of object.
   * @return {JSON}
   */
  customSave() {
    const data = {
      nodes: {
        inp1: findNode(this.inp1),
        output1: findNode(this.output1),
        bitSelectorInp: findNode(this.bitSelectorInp),
      },
      customData: {
        direction: this.direction,
        bitWidth: this.bitWidth,
        selectorBitWidth: this.selectBitWidth,
      },
    };
    return data;
  }

  /**
     * @memberof BitSelector
     * function to change bitwidth of the element
     * @param {number} bitWidth - new bitwidth
     */
  newBitWidth(bitWidth) {
    this.inp1.bitWidth = bitWidth;
    this.bitWidth = bitWidth;
  }

  /**
   * @memberof BitSelector
   * Determine output values and add to simulation queue.
   */
  resolve() {
    this.output1.value = extractBits(
        this.inp1.value,
        this.bitSelectorInp.value + 1,
        this.bitSelectorInp.value + 1,
    );
    globalScope.simulationArea.simulationQueue.add(this.output1);
  }

  /**
   * @memberof BitSelector
   * function to draw element
   * @param {CanvasRenderingContext2D} ctx
   */
  customDraw(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = ['blue', colors['stroke_alt']][
        (this.state === undefined) + 0
    ];
    ctx.fillStyle = colors['fill'];
    ctx.lineWidth = correctWidth(3);
    const xx = this.x;
    const yy = this.y;
    rect(ctx, xx - 20, yy - 20, 40, 40);
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
    let bit;
    if (this.bitSelectorInp.value === undefined) {
      bit = 'x';
    } else {
      bit = this.bitSelectorInp.value;
    }

    fillText(ctx, bit, xx, yy + 5);
    ctx.fill();
  }

  /**
   * @memberof BitSelector
   * Generates Verilog string for this CircuitElement.
   * @return {string} String representing the Verilog.
   */
  generateVerilog() {
    return `assign ${this.output1.verilogLabel} = ${this.inp1.verilogLabel} ` +
          `>> ${this.bitSelectorInp.verilogLabel};`;
  }
}

/**
 * @memberof BitSelector
 * Help Tip
 * @type {string}
 * @category modules
 */
BitSelector.prototype.tooltipText =
  'BitSelector ToolTip : Divides input bits into several equal-sized groups.';
BitSelector.prototype.helplink =
  'https://docs.circuitverse.org/#/chapter4/5muxandplex?id=bitselector';

/**
 * @memberof BitSelector
 * Mutable properties of the element
 * @type {JSON}
 * @category modules
 */
BitSelector.prototype.mutableProperties = {
  selectorBitWidth: {
    name: 'Selector Bit Width: ',
    type: 'number',
    max: '32',
    min: '1',
    func: 'changeSelectorBitWidth',
  },
};
BitSelector.prototype.objectType = 'BitSelector';

BitSelector.prototype.constructorParameters= ['direction',
  'bitWidth',
  'selectorBitWidth',
];
