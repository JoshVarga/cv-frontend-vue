import {Scope, scopeList, switchCircuit, newCircuit} from './circuit';

import {loadScope} from './data/load';
import {
  scheduleUpdate,
  updateSimulationSet,
  updateSubcircuitSet,
  forceResetNodesSet,
} from './engine';
import {backUp} from './data/backup_circuit';
import {getNextPosition} from './modules';
import {generateId} from './utils';

import {TestbenchData} from './testbench';

/**
 * Helper function to paste
 * @param {JSON} copyData - the data to be pasted
 * @category events
 */
export function paste(copyData) {
  if (copyData === undefined) {
    return;
  }
  const data = JSON.parse(copyData);
  if (!data.logixClipBoardData) {
    return;
  }

  const currentScopeId = globalScope.id;
  for (let i = 0; i < data.scopes.length; i++) {
    if (scopeList[data.scopes[i].id] === undefined) {
      let isVerilogCircuit = false;
      let isMainCircuit = false;
      if (data.scopes[i].verilogMetadata) {
        isVerilogCircuit =
          data.scopes[i].verilogMetadata.isVerilogCircuit;
        isMainCircuit = data.scopes[i].verilogMetadata.isMainCircuit;
      }
      const scope = newCircuit(
          data.scopes[i].name,
          data.scopes[i].id,
          isVerilogCircuit,
          isMainCircuit,
      );
      loadScope(scope, data.scopes[i]);
      scopeList[data.scopes[i].id] = scope;
    }
  }

  switchCircuit(currentScopeId);
  const tempScope = new Scope(globalScope.name, globalScope.id);
  const oldOx = globalScope.ox;
  const oldOy = globalScope.oy;
  const oldScale = globalScope.scale;
  loadScope(tempScope, data);

  let prevLength = tempScope.allNodes.length;
  for (let i = 0; i < tempScope.allNodes.length; i++) {
    tempScope.allNodes[i].checkDeleted();
    if (tempScope.allNodes.length != prevLength) {
      prevLength--;
      i--;
    }
  }

  let approxX = 0;
  let approxY = 0;
  let count = 0;

  for (let i = 0; i < updateOrder.length; i++) {
    for (let j = 0; j < tempScope[updateOrder[i]].length; j++) {
      const obj = tempScope[updateOrder[i]][j];
      obj.updateScope(globalScope);
      if (obj.objectType != 'Wire') {
        approxX += obj.x;
        approxY += obj.y;
        count++;
      }
    }
  }

  for (let j = 0; j < tempScope.CircuitElement.length; j++) {
    const obj = tempScope.CircuitElement[j];
    obj.updateScope(globalScope);
  }

  approxX /= count;
  approxY /= count;

  approxX = Math.round(approxX / 10) * 10;
  approxY = Math.round(approxY / 10) * 10;

  for (let i = 0; i < updateOrder.length; i++) {
    for (let j = 0; j < tempScope[updateOrder[i]].length; j++) {
      const obj = tempScope[updateOrder[i]][j];
      if (obj.objectType !== 'Wire') {
        obj.x += globalScope.simulationArea.mouseX - approxX;
        obj.y += globalScope.simulationArea.mouseY - approxY;
      }
    }
  }

  Object.keys(tempScope).forEach((l) => {
    if (
      tempScope[l] instanceof Array &&
      l !== 'objects' &&
      l !== 'CircuitElement'
    ) {
      globalScope[l] = globalScope[l].concat(tempScope[l]);
    }
  });
  for (let i = 0; i < tempScope.Input.length; i++) {
    tempScope.Input[i].layoutProperties.y = getNextPosition(0, globalScope);
    tempScope.Input[i].layoutProperties.id = generateId();
  }
  for (let i = 0; i < tempScope.Output.length; i++) {
    tempScope.Output[i].layoutProperties.x = globalScope.layout.width;
    tempScope.Output[i].layoutProperties.id = generateId();
    tempScope.Output[i].layoutProperties.y = getNextPosition(
        globalScope.layout.width,
        globalScope,
    );
  }
  updateSimulationSet(true);
  updateSubcircuitSet(true);
  scheduleUpdate();
  globalScope.ox = oldOx;
  globalScope.oy = oldOy;
  globalScope.scale = oldScale;

  forceResetNodesSet(true);
}
/**
 * Helper function for cut
 * @param {JSON} copyList - The selected elements
 * @return {any} data that was cut.
 * @category events
 */
export function cut(copyList) {
  if (copyList.length === 0) {
    return;
  }
  const tempScope = new Scope(globalScope.name, globalScope.id);
  const oldOx = globalScope.ox;
  const oldOy = globalScope.oy;
  const oldScale = globalScope.scale;
  d = backUp(globalScope);
  loadScope(tempScope, d);
  scopeList[tempScope.id] = tempScope;

  for (let i = 0; i < copyList.length; i++) {
    const obj = copyList[i];
    if (obj.objectType === 'Node') {
      obj.objectType = 'allNodes';
    }
    for (let j = 0; j < tempScope[obj.objectType].length; j++) {
      if (
        tempScope[obj.objectType][j].x === obj.x &&
        tempScope[obj.objectType][j].y === obj.y &&
        (obj.objectType != 'Node' || obj.type === 2)
      ) {
        tempScope[obj.objectType][j].delete();
        break;
      }
    }
  }
  tempScope.backups = globalScope.backups;
  for (let i = 0; i < updateOrder.length; i++) {
    let prevLength = globalScope[updateOrder[i]].length;
    for (let j = 0; j < globalScope[updateOrder[i]].length; j++) {
      const obj = globalScope[updateOrder[i]][j];
      if (obj.objectType != 'Wire') {
        if (!copyList.includes(globalScope[updateOrder[i]][j])) {
          globalScope[updateOrder[i]][j].delete();
        }
      }

      if (globalScope[updateOrder[i]].length != prevLength) {
        prevLength--;
        j--;
      }
    }
  }

  let prevLength = globalScope.wires.length;
  for (let i = 0; i < globalScope.wires.length; i++) {
    globalScope.wires[i].checkConnections();
    if (globalScope.wires.length != prevLength) {
      prevLength--;
      i--;
    }
  }

  updateSimulationSet(true);

  let data = backUp(globalScope);
  data.logixClipBoardData = true;
  const dependencyList = globalScope.getDependencies();
  data.dependencies = {};
  Object.keys(dependencyList).forEach((dependency) => {
    data.dependencies[dependency] = backUp(scopeList[dependency]);
  });
  data.logixClipBoardData = true;
  data = JSON.stringify(data);

  globalScope.simulationArea.multipleObjectSelections = [];
  globalScope.simulationArea.copyList = [];
  updateSimulationSet(true);
  globalScope = tempScope;
  scheduleUpdate();
  globalScope.ox = oldOx;
  globalScope.oy = oldOy;
  globalScope.scale = oldScale;
  forceResetNodesSet(true);
  return data;
}

/**
 * Helper function for copy
 * @param {JSON} copyList - The data to copied
 * @param {boolean} cutFlag - false if we want to copy
 * @return {any} copied data.
 * @category events
 */
export function copy(copyList, cutFlag = false) {
  if (copyList.length === 0) {
    return null;
  }
  const tempScope = new Scope(globalScope.name, globalScope.id);
  const oldOx = globalScope.ox;
  const oldOy = globalScope.oy;
  const oldScale = globalScope.scale;
  const d = backUp(globalScope);
  const oldTestbenchData = globalScope.testbenchData;

  loadScope(tempScope, d);
  scopeList[tempScope.id] = tempScope;

  if (cutFlag) {
    for (let i = 0; i < copyList.length; i++) {
      const obj = copyList[i];
      if (obj.objectType === 'Node') {
        obj.objectType = 'allNodes';
      }
      for (let j = 0; j < tempScope[obj.objectType].length; j++) {
        if (
          tempScope[obj.objectType][j].x === obj.x &&
          tempScope[obj.objectType][j].y === obj.y &&
          (obj.objectType != 'Node' || obj.type === 2)
        ) {
          tempScope[obj.objectType][j].delete();
          break;
        }
      }
    }
  }
  tempScope.backups = globalScope.backups;
  for (let i = 0; i < updateOrder.length; i++) {
    let prevLength = globalScope[updateOrder[i]].length;
    for (let j = 0; j < globalScope[updateOrder[i]].length; j++) {
      const obj = globalScope[updateOrder[i]][j];
      if (obj.objectType != 'Wire') {
        if (!copyList.includes(globalScope[updateOrder[i]][j])) {
          globalScope[updateOrder[i]][j].delete();
        }
      }

      if (globalScope[updateOrder[i]].length != prevLength) {
        prevLength--;
        j--;
      }
    }
  }

  let prevLength = globalScope.wires.length;
  for (let i = 0; i < globalScope.wires.length; i++) {
    globalScope.wires[i].checkConnections();
    if (globalScope.wires.length != prevLength) {
      prevLength--;
      i--;
    }
  }

  updateSimulationSet(true);

  let data = backUp(globalScope);
  data.scopes = [];
  const dependencyList = {};
  const requiredDependencies = globalScope.getDependencies();
  const completed = {};
  Object.keys(scopeList).forEach((id) => {
    dependencyList[id] = scopeList[id].getDependencies();
  });
  function saveScope(id) {
    if (completed[id]) {
      return;
    }
    for (let i = 0; i < dependencyList[id].length; i++) {
      saveScope(dependencyList[id][i]);
    }
    completed[id] = true;
    data.scopes.push(backUp(scopeList[id]));
  }
  for (let i = 0; i < requiredDependencies.length; i++) {
    saveScope(requiredDependencies[i]);
  }
  data.logixClipBoardData = true;
  data.testbenchData = undefined; // Don't copy testbench data
  data = JSON.stringify(data);
  globalScope.simulationArea.multipleObjectSelections = [];
  globalScope.simulationArea.copyList = [];
  updateSimulationSet(true);
  globalScope = tempScope;
  scheduleUpdate();
  globalScope.ox = oldOx;
  globalScope.oy = oldOy;
  globalScope.scale = oldScale;
  // Restore testbench data
  if (oldTestbenchData) {
    globalScope.testbenchData = new TestbenchData(
        oldTestbenchData.testData,
        oldTestbenchData.currentGroup,
        oldTestbenchData.currentCase,
    );
  }

  forceResetNodesSet(true);
  // needs to be fixed
  return data;
}

/**
 * Function selects all the elements from the scope
 * @param {Scope} scope - Scope from which to select all.
 * @category events
 */
export function selectAll(scope = globalScope) {
  moduleList.forEach((val, _, __) => {
    if (scope.hasOwnProperty(val)) {
      globalScope.simulationArea.multipleObjectSelections.push(...scope[val]);
    }
  });

  if (scope.nodes) {
    globalScope.simulationArea.multipleObjectSelections.push(...scope.nodes);
  }
}
