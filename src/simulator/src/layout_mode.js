import {dots, correctWidth, fillText, rect2} from './canvas_api';
import {LayoutBuffer} from './layout/layout_buffer';

import {
  fillSubcircuitElements,
  prevPropertyObjGet,
  prevPropertyObjSet,
  showProperties,
} from './ux';
import {
  update,
  scheduleUpdate,
  willBeUpdatedSet,
  gridUpdateSet,
  gridUpdateGet,
} from './engine';
import {miniMapArea} from './minimap';
import {showMessage} from './utils_clock';
import {verilogModeSet} from './verilog_to_cv';

/**
 * Layout.js - all subcircuit layout related code is here
 * You can edit how your subcircuit for a circuit will look by
 * clicking edit layout in properties for a circuit
 * @category layoutMode
 */

let layoutMode = false;

export function layoutModeSet(param) {
  layoutMode = param;
}

export function layoutModeGet() {
  return layoutMode;
}

/**
 * @type {LayoutBuffer} - used to temporarily store all changes.
 * @category layoutMode
 */
export let tempBuffer;

/**
 * Helper function to determine alignment and position of nodes for rendering
 * @param {number} x - width of label
 * @param {number} y - height of label
 * @return {any[]}
 * @category layoutMode
 */
export function determineLabel(x, y) {
  if (x === 0) {
    return ['left', 5, 5];
  }
  if (x === tempBuffer.layout.width) {
    return ['right', -5, 5];
  }
  if (y === 0) {
    return ['center', 0, 13];
  }
  return ['center', 0, -6];
}

/**
 * Used to move the grid in the layout mode
 * @param {Scope} scope - the circuit whose subcircuit we are editing
 * @category layoutMode
 */
export function paneLayout(scope = globalScope) {
  if (!globalScope.simulationArea.selected &&
    globalScope.simulationArea.mouseDown) {
    globalScope.simulationArea.selected = true;
    globalScope.simulationArea.lastSelected = scope.root;
    globalScope.simulationArea.hover = scope.root;
  } else if (
    globalScope.simulationArea.lastSelected === scope.root &&
    globalScope.simulationArea.mouseDown
  ) {
    // pane canvas
    globalScope.ox =
        globalScope.simulationArea.mouseRawX -
        globalScope.simulationArea.mouseDownRawX +
        globalScope.simulationArea.oldX;
    globalScope.oy =
        globalScope.simulationArea.mouseRawY -
        globalScope.simulationArea.mouseDownRawY +
        globalScope.simulationArea.oldY;
    globalScope.ox = Math.round(globalScope.ox);
    globalScope.oy = Math.round(globalScope.oy);
    gridUpdateSet(true);
    if (!embed && !lightMode) {
      miniMapArea.setup();
    }
  } else if (globalScope.simulationArea.lastSelected === scope.root) {
    // Select multiple objects

    globalScope.simulationArea.lastSelected = undefined;
    globalScope.simulationArea.selected = false;
    globalScope.simulationArea.hover = undefined;
  }
}

/**
 * Function to render layout on screen in layoutMode
 * @param {Scope} scope
 * @category layoutMode
 */
export function renderLayout(scope = globalScope) {
  if (!layoutModeGet()) {
    return;
  }
  const ctx = globalScope.simulationArea.context;
  globalScope.simulationArea.clear();
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'white';
  ctx.lineWidth = correctWidth(3);
  // Draw base rectangle
  ctx.beginPath();
  rect2(
      ctx,
      0,
      0,
      tempBuffer.layout.width,
      tempBuffer.layout.height,
      0,
      0,
      'RIGHT',
  );
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.textAlign = 'center';
  ctx.fillStyle = 'black';
  if (tempBuffer.layout.titleEnabled) {
    fillText(
        ctx,
        scope.name,
        tempBuffer.layout.title_x,
        tempBuffer.layout.title_y,
        11,
    );
  }

  // Draw labels
  let info;
  for (let i = 0; i < tempBuffer.Input.length; i++) {
    if (!tempBuffer.Input[i].label) {
      continue;
    }
    info = determineLabel(
        tempBuffer.Input[i].x,
        tempBuffer.Input[i].y,
        scope,
    )
    ;[ctx.textAlign] = info;
    fillText(
        ctx,
        tempBuffer.Input[i].label,
        tempBuffer.Input[i].x + info[1],
        tempBuffer.Input[i].y + info[2],
        12,
    );
  }
  for (let i = 0; i < tempBuffer.Output.length; i++) {
    if (!tempBuffer.Output[i].label) {
      continue;
    }
    info = determineLabel(
        tempBuffer.Output[i].x,
        tempBuffer.Output[i].y,
        scope,
    )
    ;[ctx.textAlign] = info;
    fillText(
        ctx,
        tempBuffer.Output[i].label,
        tempBuffer.Output[i].x + info[1],
        tempBuffer.Output[i].y + info[2],
        12,
    );
  }
  ctx.fill();

  // Draw points
  for (let i = 0; i < tempBuffer.Input.length; i++) {
    tempBuffer.Input[i].draw();
  }
  for (let i = 0; i < tempBuffer.Output.length; i++) {
    tempBuffer.Output[i].draw();
  }

  if (gridUpdateGet()) {
    dots(globalScope);
  }

  // Update UI position
  for (let i = 0; i < tempBuffer.subElements.length; i++) {
    tempBuffer.subElements[i].update();

    // element nodes
    for (let j = 0; j < tempBuffer.subElements[i].nodeList.length; j++) {
      tempBuffer.subElements[i].nodeList[j].update();
    }
  }

  // Show properties of selected element
  if (!embed && prevPropertyObjGet() != globalScope.simulationArea.lastSelected) {
    if (globalScope.simulationArea.lastSelected) {
      showProperties(globalScope.simulationArea.lastSelected);
    }
  }
  // Render objects
  for (let i = 0; i < circuitElementList.length; i++) {
    if (globalScope[circuitElementList[i]].length === 0) {
      continue;
    }
    if (!globalScope[circuitElementList[i]][0].canShowInSubcircuit) {
      continue;
    }

    const elementName = circuitElementList[i];

    for (let j = 0; j < globalScope[elementName].length; j++) {
      if (
        globalScope[elementName][j].subcircuitMetadata.showInSubcircuit
      ) {
        globalScope[elementName][j].drawLayoutMode();
      }
    }
  }
}

/**
 * Update UI, positions of inputs and outputs
 * @param {Scope} scope - the circuit whose subcircuit we are editing
 * @category layoutMode
 */
export function layoutUpdate(scope = globalScope) {
  if (!layoutModeGet()) {
    return;
  }
  willBeUpdatedSet(false);
  for (let i = 0; i < tempBuffer.Input.length; i++) {
    tempBuffer.Input[i].update();
  }
  for (let i = 0; i < tempBuffer.Output.length; i++) {
    tempBuffer.Output[i].update();
  }

  for (let i = 0; i < circuitElementList.length; i++) {
    if (globalScope[circuitElementList[i]].length === 0) {
      continue;
    }
    if (!globalScope[circuitElementList[i]][0].canShowInSubcircuit) {
      continue;
    }
    const elementName = circuitElementList[i];

    for (let j = 0; j < globalScope[elementName].length; j++) {
      if (
        globalScope[elementName][j].subcircuitMetadata.showInSubcircuit
      ) {
        globalScope[elementName][j].layoutUpdate();
      }
    }
  }
  paneLayout(scope);
  renderLayout(scope);
}

/**
 * Helper function to reset all nodes to original default positions
 * @category layoutMode
 */
export function layoutResetNodes() {
  tempBuffer.layout.width = 100;
  tempBuffer.layout.height =
    Math.max(tempBuffer.Input.length, tempBuffer.Output.length) * 20 + 20;
  for (let i = 0; i < tempBuffer.Input.length; i++) {
    tempBuffer.Input[i].x = 0;
    tempBuffer.Input[i].y = i * 20 + 20;
  }
  for (let i = 0; i < tempBuffer.Output.length; i++) {
    tempBuffer.Output[i].x = tempBuffer.layout.width;
    tempBuffer.Output[i].y = i * 20 + 20;
  }
}

/**
 * Increase width, and move all nodes
 * @category layoutMode
 */
export function increaseLayoutWidth() {
  for (let i = 0; i < tempBuffer.Input.length; i++) {
    if (tempBuffer.Input[i].x === tempBuffer.layout.width) {
      tempBuffer.Input[i].x += 10;
    }
  }
  for (let i = 0; i < tempBuffer.Output.length; i++) {
    if (tempBuffer.Output[i].x === tempBuffer.layout.width) {
      tempBuffer.Output[i].x += 10;
    }
  }
  tempBuffer.layout.width += 10;
}

/**
 * Increase Height, and move all nodes
 * @category layoutMode
 */
export function increaseLayoutHeight() {
  for (let i = 0; i < tempBuffer.Input.length; i++) {
    if (tempBuffer.Input[i].y === tempBuffer.layout.height) {
      tempBuffer.Input[i].y += 10;
    }
  }
  for (let i = 0; i < tempBuffer.Output.length; i++) {
    if (tempBuffer.Output[i].y === tempBuffer.layout.height) {
      tempBuffer.Output[i].y += 10;
    }
  }
  tempBuffer.layout.height += 10;
}

/**
 * Decrease Width, and move all nodes, check if space is there
 * @category layoutMode
 */
export function decreaseLayoutWidth() {
  if (tempBuffer.layout.width < 30) {
    return;
  }
  for (let i = 0; i < tempBuffer.Input.length; i++) {
    if (tempBuffer.Input[i].x === tempBuffer.layout.width - 10) {
      showMessage('No space. Move or delete some nodes to make space.');
      return;
    }
  }
  for (let i = 0; i < tempBuffer.Output.length; i++) {
    if (tempBuffer.Output[i].x === tempBuffer.layout.width - 10) {
      showMessage('No space. Move or delete some nodes to make space.');
      return;
    }
  }

  for (let i = 0; i < tempBuffer.Input.length; i++) {
    if (tempBuffer.Input[i].x === tempBuffer.layout.width) {
      tempBuffer.Input[i].x -= 10;
    }
  }
  for (let i = 0; i < tempBuffer.Output.length; i++) {
    if (tempBuffer.Output[i].x === tempBuffer.layout.width) {
      tempBuffer.Output[i].x -= 10;
    }
  }
  tempBuffer.layout.width -= 10;
}

/**
 * Decrease Height, and move all nodes, check if space is there
 * @category layoutMode
 */
export function decreaseLayoutHeight() {
  if (tempBuffer.layout.height < 30) {
    return;
  }
  for (let i = 0; i < tempBuffer.Input.length; i++) {
    if (tempBuffer.Input[i].y === tempBuffer.layout.height - 10) {
      showMessage('No space. Move or delete some nodes to make space.');
      return;
    }
  }
  for (let i = 0; i < tempBuffer.Output.length; i++) {
    if (tempBuffer.Output[i].y === tempBuffer.layout.height - 10) {
      showMessage('No space. Move or delete some nodes to make space.');
      return;
    }
  }

  for (let i = 0; i < tempBuffer.Input.length; i++) {
    if (tempBuffer.Input[i].y === tempBuffer.layout.height) {
      tempBuffer.Input[i].y -= 10;
    }
  }
  for (let i = 0; i < tempBuffer.Output.length; i++) {
    if (tempBuffer.Output[i].y === tempBuffer.layout.height) {
      tempBuffer.Output[i].y -= 10;
    }
  }
  tempBuffer.layout.height -= 10;
}

/**
 * Helper functions to move the titles
 * @category layoutMode
 */
export function layoutTitleUp() {
  tempBuffer.layout.title_y -= 5;
}

/**
 * Helper functions to move the titles
 * @category layoutMode
 */
export function layoutTitleDown() {
  tempBuffer.layout.title_y += 5;
}

/**
 * Helper functions to move the titles
 * @category layoutMode
 */
export function layoutTitleRight() {
  tempBuffer.layout.title_x += 5;
}

/**
 * Helper functions to move the titles
 * @category layoutMode
 */
export function layoutTitleLeft() {
  tempBuffer.layout.title_x -= 5;
}

/**
 * Helper functions to move the titles
 * @category layoutMode
 */
export function toggleLayoutTitle() {
  tempBuffer.layout.titleEnabled = !tempBuffer.layout.titleEnabled;
}

/**
 * just toggles back to normal mode
 * @category layoutMode
 */
export function cancelLayout() {
  if (layoutModeGet()) {
    toggleLayoutMode();
  }
}

/**
 * Store all data into layout and exit
 * @category layoutMode
 */
export function saveLayout() {
  if (layoutModeGet()) {
    for (let i = 0; i < tempBuffer.Input.length; i++) {
      tempBuffer.Input[i].parent.layoutProperties.x =
        tempBuffer.Input[i].x;
      tempBuffer.Input[i].parent.layoutProperties.y =
        tempBuffer.Input[i].y;
    }
    for (let i = 0; i < tempBuffer.Output.length; i++) {
      tempBuffer.Output[i].parent.layoutProperties.x =
        tempBuffer.Output[i].x;
      tempBuffer.Output[i].parent.layoutProperties.y =
        tempBuffer.Output[i].y;
    }
    globalScope.layout = {...tempBuffer.layout};
    toggleLayoutMode();
  }
}

/**
 * Function to toggle between layoutMode and normal Mode
 * the sidebar is disabled and n properties are shown.
 * @category layoutMode
 */
export function toggleLayoutMode() {
  // hideProperties()
  // lines from hideProperty function() <---
  prevPropertyObjSet(undefined);
  $('.objectPropertyAttribute').unbind('change keyup paste click');

  if (layoutModeGet()) {
    layoutModeSet(false);
    $('#layoutDialog').fadeOut();
    $('.layoutElementPanel').fadeOut();
    $('.elementPanel').fadeIn();
    $('.timing-diagram-panel').fadeIn();
    $('.testbench-manual-panel').fadeIn();
    globalScope.centerFocus(false);
    if (globalScope.verilogMetadata.isVerilogCircuit) {
      verilogModeSet(true);
    }
    dots(globalScope);
  } else {
    layoutModeSet(true);
    verilogModeSet(false);
    $('#layoutDialog').fadeIn();
    $('.layoutElementPanel').fadeIn();
    $('.elementPanel').fadeOut();
    $('.timing-diagram-panel').fadeOut();
    $('.testbench-manual-panel').fadeOut();
    fillSubcircuitElements();

    globalScope.ox = 0;
    globalScope.oy = 0;
    globalScope.scale = DPR * 1.3;
    dots(globalScope);
    tempBuffer = new LayoutBuffer();
    // $('#toggleLayoutTitle')[0].checked = tempBuffer.layout.titleEnabled
  }
  update(globalScope, true);
  scheduleUpdate();
}

export const layoutFunctions = {
  decreaseLayoutWidth,
  increaseLayoutWidth,
  decreaseLayoutHeight,
  increaseLayoutHeight,
  layoutResetNodes,
  layoutTitleUp,
  layoutTitleDown,
  layoutTitleLeft,
  layoutTitleRight,
  toggleLayoutTitle,
  cancelLayout,
  saveLayout,
  toggleLayoutMode,
};
