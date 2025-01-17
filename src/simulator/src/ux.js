import {layoutModeGet} from './layout_mode';
import {
  scheduleUpdate,
  wireToBeCheckedSet,
  updateCanvasSet,
} from './engine';

import {logixFunction} from './data';
import {circuitProperty} from './circuit';
import {updateRestrictedElementsInScope} from './restricted_element_div';
import {updateTestbenchUI, setupTestbenchUI} from './testbench';
import {dragging} from './drag';

export const uxvar = {
  smartDropXX: 50,
  smartDropYY: 80,
};
/**
 * @type {number} - Used to calculate the position where
 * an element from sidebar is dropped
 * @category ux
 */
uxvar.smartDropXX = 50;

/**
 * @type {number} - Used to calculate the position where
 * an element from sidebar is dropped
 * @category ux
 */
uxvar.smartDropYY = 80;

/**
 * @type {Object} - Object stores the position of context menu;
 * @category ux
 */
const ctxPos = {
  x: 0,
  y: 0,
  visible: false,
};
/**
 * Function to show and hide context menu
 * @category ux
 */
function hideContextMenu() {
  const el = document.getElementById('contextMenu');
  el.style = 'opacity:0;';
  setTimeout(() => {
    el.style = 'visibility:hidden;';
    ctxPos.visible = false;
  }, 200); // Hide after 2 sec
}

/**
 * Function displays context menu
 * @return {boolean} was context menu shown.
 * @category ux
 */
function showContextMenu() {
  if (layoutModeGet()) {
    return false; // Hide context menu when it is in Layout Mode
  }
  const el = $('#contextMenu');
  el.css({
    visibility: 'visible',
    opacity: 1,
  });

  const windowHeight =
    $('.simulationArea').height() - el.height() - 10;
  const windowWidth =
    $('.simulationArea').width() - el.width() - 10;
  // for top, left, right, bottom
  let topPosition;
  let leftPosition;
  let rightPosition;
  let bottomPosition;
  if (ctxPos.y > windowHeight && ctxPos.x <= windowWidth) {
    // When user click on bottom-left part of window
    leftPosition = ctxPos.x;
    bottomPosition = $(window).height() - ctxPos.y;
    el.css({
      left: `${leftPosition}px`,
      bottom: `${bottomPosition}px`,
      right: 'auto',
      top: 'auto',
    });
  } else if (ctxPos.y > windowHeight && ctxPos.x > windowWidth) {
    // When user click on bottom-right part of window
    bottomPosition = $(window).height() - ctxPos.y;
    rightPosition = $(window).width() - ctxPos.x;
    el.css({
      left: 'auto',
      bottom: `${bottomPosition}px`,
      right: `${rightPosition}px`,
      top: 'auto',
    });
  } else if (ctxPos.y <= windowHeight && ctxPos.x <= windowWidth) {
    // When user click on top-left part of window
    leftPosition = ctxPos.x;
    topPosition = ctxPos.y;
    el.css({
      left: `${leftPosition}px`,
      bottom: 'auto',
      right: 'auto',
      top: `${topPosition}px`,
    });
  } else {
    // When user click on top-right part of window
    rightPosition = $(window).width() - ctxPos.x;
    topPosition = ctxPos.y;
    el.css({
      left: 'auto',
      bottom: 'auto',
      right: `${rightPosition}px`,
      top: `${topPosition}px`,
    });
  }
  ctxPos.visible = true;
  return false;
}

/**
 * adds some UI elements to side bar and
 * menu also attaches listeners to sidebar
 * @category ux
 */
export function setupUI() {
  const ctxEl = document.getElementById('contextMenu');
  document.addEventListener('mousedown', (e) => {
    // Check if mouse is not inside the context menu and menu is visible
    if (
      !(
        e.clientX >= ctxPos.x &&
        e.clientX <= ctxPos.x + ctxEl.offsetWidth &&
        e.clientY >= ctxPos.y &&
        e.clientY <= ctxPos.y + ctxEl.offsetHeight
      ) &&
      ctxPos.visible &&
      e.which !== 3
    ) {
      hideContextMenu();
    }

    // Change the position of context whenever mouse is clicked
    ctxPos.x = e.clientX;
    ctxPos.y = e.clientY;
  });
  document.getElementById('canvasArea').oncontextmenu = showContextMenu;

  $('.logixButton').on('click', function() {
    logixFunction[this.id]();
  });
  setupPanels();
}

/**
 * Keeps in check which property is being displayed
 * @category ux
 */
let prevPropertyObj;

export function prevPropertyObjSet(param) {
  prevPropertyObj = param;
}

export function prevPropertyObjGet() {
  return prevPropertyObj;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 *
 */
function checkValidBitWidth() {
  const selector = $('[name=\'newBitWidth\']');
  if (
    selector === undefined ||
    selector.val() > 32 ||
    selector.val() < 1 ||
    !isNumeric(selector.val())
  ) {
    // fallback to previously saves state
    selector.val(selector.attr('old-val'));
  } else {
    selector.attr('old-val', selector.val());
  }
}

export function objectPropertyAttributeUpdate(e) {
  e.preventDefault();
  checkValidBitWidth();
  scheduleUpdate();
  updateCanvasSet(true);
  wireToBeCheckedSet(1);
  let {value} = this;
  if (this.type === 'number') {
    value = parseFloat(value);
  }
  if (globalScope.simulationArea.lastSelected && globalScope.simulationArea.lastSelected[this.name]) {
    globalScope.simulationArea.lastSelected[this.name](value);
  } else {
    circuitProperty[this.name](value);
  }
}

export function objectPropertyAttributeCheckedUpdate() {
  if (this.name === 'toggleLabelInLayoutMode') {
    return;
  } // Hack to prevent toggleLabelInLayoutMode from toggling twice
  scheduleUpdate();
  updateCanvasSet(true);
  wireToBeCheckedSet(1);
  if (globalScope.simulationArea.lastSelected && globalScope.simulationArea.lastSelected[this.name]) {
    globalScope.simulationArea.lastSelected[this.name](this.value);
  } else {
    circuitProperty[this.name](this.checked);
  }
}

/**
 *
 * @param {*} value
 */
export function checkPropertiesUpdate() {
  const elements = document.getElementsByClassName('objectPropertyAttribute');
  Array.from(elements).forEach(function(element) {
    element.removeEventListener('change', objectPropertyAttributeUpdate);
    element.removeEventListener('change', objectPropertyAttributeCheckedUpdate);
    element.removeEventListener('keyup', objectPropertyAttributeUpdate);
    element.removeEventListener('keyup', objectPropertyAttributeCheckedUpdate);
    element.removeEventListener('paste', objectPropertyAttributeUpdate);
    element.removeEventListener('paste', objectPropertyAttributeCheckedUpdate);
    element.removeEventListener('click', objectPropertyAttributeUpdate);
    element.removeEventListener('click', objectPropertyAttributeCheckedUpdate);
    element.addEventListener('change', objectPropertyAttributeUpdate);
    element.addEventListener('change', objectPropertyAttributeCheckedUpdate);
    element.addEventListener('keyup', objectPropertyAttributeUpdate);
    element.addEventListener('keyup', objectPropertyAttributeCheckedUpdate);
    element.addEventListener('paste', objectPropertyAttributeUpdate);
    element.addEventListener('paste', objectPropertyAttributeCheckedUpdate);
    element.addEventListener('click', objectPropertyAttributeUpdate);
    element.addEventListener('click', objectPropertyAttributeCheckedUpdate);
  });
}

/**
 * show properties of an object.
 * @param {CircuitElement} obj - the object whose properties we want to be shown in sidebar
 * @category ux
 */
export function showProperties(obj) {
  if (obj === prevPropertyObjGet()) {
    return;
  }
  checkPropertiesUpdate();
}

/**
 * Hides the properties in sidebar.
 * @category ux
 */
export function hideProperties() {
  $('#moduleProperty-inner').empty();
  $('#moduleProperty').hide();
  prevPropertyObjSet(undefined);
  $('.objectPropertyAttribute').unbind('change keyup paste click');
}
/**
 * checks the input is safe or not
 * @param {HTML} unsafe - the html which we wants to escape
 * @category ux
 */
function escapeHtml(unsafe) {
  return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
}

export function deleteSelected() {
  if (
    globalScope.simulationArea.lastSelected &&
    !(
      globalScope.simulationArea.lastSelected.objectType === 'Node' &&
      globalScope.simulationArea.lastSelected.type !== 2
    )
  ) {
    globalScope.simulationArea.lastSelected.delete();
  }

  for (let i = 0; i < globalScope.simulationArea.multipleObjectSelections.length; i++) {
    if (
      !(
        globalScope.simulationArea.multipleObjectSelections[i].objectType ===
        'Node' &&
        globalScope.simulationArea.multipleObjectSelections[i].type !== 2
      )
    ) {
      globalScope.simulationArea.multipleObjectSelections[i].delete();
    }
  }

  globalScope.simulationArea.multipleObjectSelections = [];
  globalScope.simulationArea.lastSelected = undefined;
  showProperties(globalScope.simulationArea.lastSelected);
  // Updated restricted elements
  updateCanvasSet(true);
  scheduleUpdate();
  updateRestrictedElementsInScope();
}

export function setupPanels() {
  dragging('#dragQPanel', '.quick-btn');

  setupPanelListeners('.elementPanel');
  setupPanelListeners('.layoutElementPanel');
  setupPanelListeners('#moduleProperty');
  setupPanelListeners('#layoutDialog');
  setupPanelListeners('#verilogEditorPanel');
  setupPanelListeners('.timing-diagram-panel');
  setupPanelListeners('.testbench-manual-panel');

  // Minimize Timing Diagram (takes too much space)
  $('.timing-diagram-panel .minimize').trigger('click');

  // Update the Testbench Panel UI
  updateTestbenchUI();
  // Minimize Testbench UI
  $('.testbench-manual-panel .minimize').trigger('click');

  // Hack because minimizing panel then maximizing sets visibility recursively
  // updateTestbenchUI calls some hide()s which are undone by maximization
  // TODO: Remove hack
  $('.testbench-manual-panel .maximize').on('click', setupTestbenchUI);

  $('#projectName').on('click', () => {
    $('input[name=\'setProjectName\']').focus().select();
  });
}

function setupPanelListeners(panelSelector) {
  const headerSelector = `${panelSelector} .panel-header`;
  const minimizeSelector = `${panelSelector} .minimize`;
  const maximizeSelector = `${panelSelector} .maximize`;
  const bodySelector = `${panelSelector} > .panel-body`;

  dragging(headerSelector, panelSelector);
  // Current Panel on Top
  let minimized = false;
  $(headerSelector).on('dblclick', () =>
    minimized ?
      $(maximizeSelector).trigger('click') :
      $(minimizeSelector).trigger('click'),
  );
  // Minimize
  $(minimizeSelector).on('click', () => {
    $(bodySelector).hide();
    $(minimizeSelector).hide();
    $(maximizeSelector).show();
    minimized = true;
  });
  // Maximize
  $(maximizeSelector).on('click', () => {
    $(bodySelector).show();
    $(minimizeSelector).show();
    $(maximizeSelector).hide();
    minimized = false;
  });
}

export function exitFullView() {
  const exitViewBtn = document.querySelector('#exitViewBtn');
  if (exitViewBtn) {
    exitViewBtn.remove();
  }

  const elements = document.querySelectorAll(
      '.navbar, .modules, .report-sidebar, #tabsBar, #moduleProperty, .timing-diagram-panel, .testbench-manual-panel, .quick-btn',
  );
  elements.forEach((element) => {
    if (element instanceof HTMLElement) {
      element.style.display = '';
    }
  });
}

export function fullView() {
  const app = document.querySelector('#app');

  const exitViewEl = document.createElement('button');
  exitViewEl.id = 'exitViewBtn';
  exitViewEl.textContent = 'Exit Full Preview';

  const elements = document.querySelectorAll(
      '.navbar, .modules, .report-sidebar, #tabsBar, #moduleProperty, .timing-diagram-panel, .testbench-manual-panel, .quick-btn',
  );
  elements.forEach((element) => {
    if (element instanceof HTMLElement) {
      element.style.display = 'none';
    }
  });
  app.appendChild(exitViewEl);
  exitViewEl.addEventListener('click', exitFullView);
}

/**
    Fills the elements that can be displayed in the subcircuit, in the subcircuit menu
**/
export function fillSubcircuitElements() {
  $('#subcircuitMenu').empty();
  let subCircuitElementExists = false;
  for (const el of circuitElementList) {
    if (globalScope[el].length === 0) {
      continue;
    }
    if (!globalScope[el][0].canShowInSubcircuit) {
      continue;
    }
    let tempHTML = '';

    // add a panel for each existing group
    tempHTML += `<div class="panelHeader">${el}s</div>`;
    tempHTML += `<div class="panel">`;

    let available = false;

    // add an SVG for each element
    for (let i = 0; i < globalScope[el].length; i++) {
      if (!globalScope[el][i].subcircuitMetadata.showInSubcircuit) {
        tempHTML += `<div class="icon subcircuitModule" id="${el}-${i}" data-element-id="${i}" data-element-name="${el}">`;
        tempHTML += `<img src= "/img/${el}.svg">`;
        tempHTML += `<p class="img__description">${globalScope[el][i].label !== '' ?
          globalScope[el][i].label :
          'unlabeled'
        }</p>`;
        tempHTML += '</div>';
        available = true;
      }
    }
    tempHTML += '</div>';
    subCircuitElementExists = subCircuitElementExists || available;
    if (available) {
      $('#subcircuitMenu').append(tempHTML);
    }
  }

  if (subCircuitElementExists) {
    // $('#subcircuitMenu').accordion('refresh')
  } else {
    $('#subcircuitMenu').append('<p>No layout elements available</p>');
  }

  $('.subcircuitModule').mousedown(function() {
    const elementName = this.dataset.elementName;
    const elementIndex = this.dataset.elementId;

    const element = globalScope[elementName][elementIndex];

    element.subcircuitMetadata.showInSubcircuit = true;
    element.newElement = true;
    globalScope.simulationArea.lastSelected = element;
    this.parentElement.removeChild(this);
  });
}
