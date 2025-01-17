
import {colors} from './themer/themer';
import {layoutModeGet} from './layout_mode';

/**
 * @type {Object} miniMapArea
 * This object is used to draw the miniMap.
 * @property {number} pageY.
 * @property {number} pageX.
 * @property {HTMLCanvasObject} canvas - the canvas object.
 * @property {function} setup - used to setup the parameters and dimensions.
 * @property {function} play - used to draw outline of minimap and call resolve.
 * @property {function} resolve - Resolve all objects and draw them on minimap.
 * @property {function} clear - used to clear minimap.
 * @category minimap
 */
export const miniMapArea = {
  canvas: document.getElementById('miniMapArea'),
  setup() {
    if (lightMode) {
      return;
    }
    this.canvas = document.getElementById('miniMapArea');
    this.pageHeight = height;
    this.pageWidth = width;
    this.pageY = this.pageHeight - globalScope.oy;
    this.pageX = this.pageWidth - globalScope.ox;

    if (globalScope.simulationArea.minHeight != undefined) {
      this.minY = Math.min(
          globalScope.simulationArea.minHeight,
          -globalScope.oy / globalScope.scale,
      );
    } else {
      this.minY = -globalScope.oy / globalScope.scale;
    }
    if (globalScope.simulationArea.maxHeight != undefined) {
      this.maxY = Math.max(
          globalScope.simulationArea.maxHeight,
          this.pageY / globalScope.scale,
      );
    } else {
      this.maxY = this.pageY / globalScope.scale;
    }
    if (globalScope.simulationArea.minWidth != undefined) {
      this.minX = Math.min(
          globalScope.simulationArea.minWidth,
          -globalScope.ox / globalScope.scale,
      );
    } else {
      this.minX = -globalScope.ox / globalScope.scale;
    }
    if (globalScope.simulationArea.maxWidth != undefined) {
      this.maxX = Math.max(
          globalScope.simulationArea.maxWidth,
          this.pageX / globalScope.scale,
      );
    } else {
      this.maxX = this.pageX / globalScope.scale;
    }

    const h = this.maxY - this.minY;
    const w = this.maxX - this.minX;

    const ratio = Math.min(250 / h, 250 / w);
    if (h > w) {
      this.canvas.height = 250.0;
      this.canvas.width = (250.0 * w) / h;
    } else {
      this.canvas.width = 250.0;
      this.canvas.height = (250.0 * h) / w;
    }

    this.canvas.height += 5;
    this.canvas.width += 5;

    document.getElementById('miniMap').style.height = this.canvas.height;
    document.getElementById('miniMap').style.width = this.canvas.width;
    this.ctx = this.canvas.getContext('2d');
    this.play(ratio);
  },

  play(ratio) {
    if (lightMode || layoutModeGet()) {
      return;
    }

    this.ctx.fillStyle = '#bbb';
    this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fill();
    this.resolve(ratio);
  },
  resolve(ratio) {
    if (lightMode) {
      return;
    }

    this.ctx.fillStyle = '#ddd';
    this.ctx.beginPath();
    this.ctx.rect(
        2.5 + ((this.pageX - this.pageWidth) / globalScope.scale - this.minX) *
                    ratio,
        2.5 + ((this.pageY - this.pageHeight) / globalScope.scale - this.minY) *
                    ratio,
        (this.pageWidth * ratio) / globalScope.scale,
        (this.pageHeight * ratio) / globalScope.scale,
    );
    this.ctx.fill();

    //  to show the area of current canvas
    const lst = updateOrder;
    const miniFill = colors['mini_fill'];
    const miniStroke = colors['mini_stroke'];

    this.ctx.strokeStyle = miniStroke;
    this.ctx.fillStyle = miniFill;
    for (let i = 0; i < lst.length; i++) {
      if (lst[i] === 'wires') {
        for (let j = 0; j < globalScope[lst[i]].length; j++) {
          this.ctx.beginPath();
          this.ctx.moveTo(
              2.5 + (globalScope[lst[i]][j].node1.absX() - this.minX) * ratio,
              2.5 + (globalScope[lst[i]][j].node1.absY() - this.minY) * ratio,
          );
          this.ctx.lineTo(
              2.5 + (globalScope[lst[i]][j].node2.absX() - this.minX) * ratio,
              2.5 + (globalScope[lst[i]][j].node2.absY() - this.minY) * ratio,
          );
          this.ctx.stroke();
        }
      } else if (lst[i] != 'nodes') {
        // Don't include SquareRGBLed here; it has correct size.
        let ledY = 0;
        if (
          lst[i] == 'DigitalLed' ||
                    lst[i] == 'VariableLed' ||
                    lst[i] == 'RGBLed'
        ) {
          ledY = 20;
        }

        for (let j = 0; j < globalScope[lst[i]].length; j++) {
          this.ctx.beginPath();
          const obj = globalScope[lst[i]][j];
          this.ctx.rect(
              2.5 + (obj.x - obj.leftDimensionX - this.minX) * ratio,
              2.5 + (obj.y - obj.upDimensionY - this.minY) * ratio,
              (obj.rightDimensionX + obj.leftDimensionX) * ratio,
              (obj.downDimensionY + obj.upDimensionY + ledY) * ratio,
          );

          this.ctx.fill();
          this.ctx.stroke();
        }
      }
    }
  },
  clear() {
    if (lightMode) {
      return;
    }
    $('#miniMapArea').css('z-index', '-1');
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
};
let lastMiniMapShown;

/**
 *
 */
export function updateLastMinimapShown() {
  lastMiniMapShown = new Date().getTime();
}

/**
 * Remove the minimap.
 */
export function removeMiniMap() {
  if (lightMode) {
    return;
  }

  if (
    globalScope.simulationArea.lastSelected == globalScope.root &&
        globalScope.simulationArea.mouseDown
  ) {
    return;
  }
  if (lastMiniMapShown + 2000 >= new Date().getTime()) {
    setTimeout(
        removeMiniMap,
        lastMiniMapShown + 2000 - new Date().getTime(),
    );
    return;
  }
  $('#miniMap').fadeOut('fast');
}
