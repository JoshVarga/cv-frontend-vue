import {CircuitElement} from '../circuit_element';

import {rect2, fillText} from '../canvas_api';
import {colors} from '../themer/themer';
import {copy, paste} from '../events';

/**
 * @class
 * Text
 * @extends CircuitElement
 * @param {number} x - x coordinate of element.
 * @param {number} y - y coordinate of element.
 * @param {Scope} scope - Circuit on which element is drawn
 * @param {string} label - label of element
 * @param {number} fontSize - font size
 * @category modules
*/
export class Text extends CircuitElement {
  /**
   * @param {number} x - x coordinate of element.
   * @param {number} y - y coordinate of element.
   * @param {Scope} scope - Circuit on which element is drawn
   * @param {string} label - label of element
   * @param {number} fontSize - font size
   */
  constructor(x, y, scope, label = '', fontSize = 14) {
    super(x, y, scope, 'RIGHT', 1);
    this.fixedBitWidth = true;
    this.directionFixed = true;
    this.labelDirectionFixed = true;
    this.setLabel(label);
    this.setFontSize(fontSize);
  }

  /**
     * @memberof Text
     * function for setting text inside the element
     * @param {string} str - the label
     */
  setLabel(str = '') {
    this.label = str;
    const ctx = this.scope.simulationArea.context;
    ctx.font = `${this.fontSize}px Raleway`;
    this.leftDimensionX = 10;
    this.rightDimensionX = ctx.measureText(this.label).width + 10;
    this.setTextboxSize();
  }

  /**
     * @memberof Text
     * function for setting font size inside the element
     * @param {number} fontSize - the font size
     */
  setFontSize(fontSize = 14) {
    this.fontSize = fontSize;
    const ctx = this.scope.simulationArea.context;
    ctx.font = `${this.fontSize}px Raleway`;
    this.setTextboxSize();
  }

  /**
   * set the textbox size
   */
  setTextboxSize() {
    this.leftDimensionX = 10;
    let maxWidth = 0;
    const labels = this.label.split('\n');
    const ctx = this.scope.simulationArea.context;
    labels.forEach(
        (l) => (maxWidth = Math.max(maxWidth, ctx.measureText(l).width)),
    );
    this.rightDimensionX = maxWidth + 10;
    this.downDimensionY = labels.length * this.fontSize;
  }

  /**
   * @memberof Text
   * Create save JSON data of object.
   * @return {JSON}
   */
  customSave() {
    const data = {
      customData: {
        label: this.label,
        fontSize: this.fontSize,
      },
    };
    return data;
  }

  /**
     * @memberof Text
     * Listener function for Text Box
     * @param {string} key - the label
     */
  keyDown(key) {
    if (this.scope.simulationArea.controlDown && (key === 'c' || key === 'C')) {
      const textToPutOnClipboard = copy([this]);
      navigator.clipboard.writeText(textToPutOnClipboard);
      localStorage.setItem('clipboardData', textToPutOnClipboard);
    } else if (this.scope.simulationArea.controlDown && (key === 'v' || key === 'V')) {
      paste(localStorage.getItem('clipboardData'));
    } else if (key.length === 1) {
      if (this.label === 'Enter Text Here') {
        this.setLabel(key);
      } else {
        this.setLabel(this.label + key);
      }
    } else if (key === 'Backspace') {
      if (this.label === 'Enter Text Here') {
        this.setLabel('');
      } else {
        this.setLabel(this.label.slice(0, -1));
      }
    } else if (key === 'Enter') {
      if (this.label === 'Enter Text Here') {
        this.setLabel('');
      } else {
        this.setLabel(this.label + '\n');
      }
    }
    document.querySelector('[name=setLabel]').value = this.label;
  }

  /**
     * @memberof Text
     * Function for drawing text box
     */
  draw() {
    if (this.label.length === 0 &&
        this.scope.simulationArea.lastSelected !== this) {
      this.delete();
    }
    const ctx = this.scope.simulationArea.context;
    ctx.strokeStyle = colors['stroke'];
    ctx.lineWidth = 1;
    const xx = this.x;
    const yy = this.y;
    if (
      (this.hover && !this.scope.simulationArea.shiftDown) ||
      this.scope.simulationArea.lastSelected === this ||
      this.scope.simulationArea.multipleObjectSelections.includes(this)
    ) {
      ctx.beginPath();
      ctx.fillStyle = colors['fill'];
      const magicDimension = this.fontSize - 14;
      rect2(
          ctx,
          -this.leftDimensionX,
          -this.upDimensionY - magicDimension,
          this.leftDimensionX + this.rightDimensionX,
          this.upDimensionY + this.downDimensionY + magicDimension,
          this.x,
          this.y,
          'RIGHT',
      );
      ctx.fillStyle = 'rgba(255, 255, 32,0.1)';
      ctx.fill();
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.textAlign = 'left';
    ctx.fillStyle = colors['text'];
    const labels = this.label.split('\n');
    for (let i = 0; i < labels.length; i++) {
      fillText(
          ctx,
          labels[i],
          xx,
          yy + 5 + i * this.fontSize,
          this.fontSize,
      );
    }
    ctx.fill();
  }
}

/**
 * @memberof Text
 * Help Tip
 * @type {string}
 * @category modules
 */
Text.prototype.tooltipText = 'Text ToolTip: Use this to document your circuit.';

/**
 * @memberof Text
 * Help URL
 * @type {string}
 * @category modules
 */
Text.prototype.helplink =
  'https://docs.circuitverse.org/#/chapter4/7annotation?id=text';

/**
 * @memberof Text
 * Mutable properties of the element
 * @type {JSON}
 * @category modules
 */
Text.prototype.mutableProperties = {
  fontSize: {
    name: 'Font size: ',
    type: 'number',
    max: '84',
    min: '14',
    func: 'setFontSize',
  },
  label: {
    name: 'Text: ',
    type: 'textarea',
    func: 'setLabel',
  },
};
Text.prototype.disableLabel = true;
Text.prototype.objectType = 'Text';
Text.prototype.propagationDelayFixed = true;
Text.prototype.constructorParameters= ['label', 'fontSize'];
