import CircuitElement from '../circuitElement'
import Node, { findNode } from '../node'
import simulationArea from '../simulationArea'
import Scope from '../circuit'
/**
 * @class
 * UnsignedComparator
 * @extends CircuitElement
 * @param {number} x - x coordinate of element.
 * @param {number} y - y coordinate of element.
 * @param {Scope=} scope - Circuit on which element is drawn
 * @param {string=} dir - direction of element
 * @param {number=} bitWidth - input bit width.
 * @category modules
 */
export default class UnsignedComparator extends CircuitElement {
    inpA: Node
    inpB: Node
    less: Node
    equal: Node
    greater: Node

    constructor(x: number, y: number, scope: Scope = globalScope, dir: string = 'RIGHT', bitWidth: number = 1) {
        super(x, y, scope, dir, bitWidth)
        this.setDimensions(20, 20)
        this.inpA = new Node(-20, -10, 0, this, this.bitWidth, 'A')
        this.inpB = new Node(-20, 10, 0, this, this.bitWidth, 'B')
        this.less = new Node(20, -10, 1, this, 1, 'less')
        this.equal = new Node(20, 0, 1, this, 1, 'equal')
        this.greater = new Node(20, 10, 1, this, 1, 'greater')
    }

    /**
     * @memberof UnsignedComparator
     * fn to create save Json Data of object
     * @return {object}
     */
    customSave(): object {
        const data = {
            constructorParamaters: [this.direction, this.bitWidth],
            nodes: {
                inpA: findNode(this.inpA),
                inpB: findNode(this.inpB),
                less: findNode(this.less),
                equal: findNode(this.equal),
                greater: findNode(this.greater),
            },
        }
        return data
    }

    /**
     * @memberof UnsignedComparator
     * Checks if the element is resolvable
     * @return {boolean}
     */
    isResolvable(): boolean {
        return this.inpA.value !== undefined && this.inpB.value !== undefined
    }

    /**
     * @memberof UnsignedComparator
     * function to change bitwidth of the element
     * @param {number} bitWidth - new bitwidth
     */
    newBitWidth(bitWidth: number): void {
        this.bitWidth = bitWidth
        this.inpA.bitWidth = bitWidth
        this.inpB.bitWidth = bitWidth
    }

    /**
     * @memberof UnsignedComparator
     * resolve output values based on inputData
     */
    resolve(): void {
        if (this.isResolvable() === false) {
            return
        }
        this.less.value = +(this.inpA.value < this.inpB.value)
        this.equal.value = +(this.inpA.value == this.inpB.value)
        this.greater.value = +(this.inpA.value > this.inpB.value)
        simulationArea.simulationQueue.add(this.less)
        simulationArea.simulationQueue.add(this.equal)
        simulationArea.simulationQueue.add(this.greater)
    }

    /**
     * @memberof UnsignedComparator
     * Generate verilog string describing this module.
     */
    generateVerilog(): string {
        return `assign ${this.less.verilogLabel} = ${this.inpA.verilogLabel} < ${this.inpB.verilogLabel};` +
                `assign ${this.equal.verilogLabel} = ${this.inpA.verilogLabel} < ${this.inpB.verilogLabel};` +
                `assign ${this.greater.verilogLabel} = ${this.inpA.verilogLabel} < ${this.inpB.verilogLabel};`
    }
}

/**
 * @memberof UnsignedComparator
 * Help Tip
 * @type {string}
 * @category modules
 */
UnsignedComparator.prototype.tooltipText = 'UnsignedComparator ToolTip : Performs addition of numbers.'
UnsignedComparator.prototype.helplink =
    'https://docs.circuitverse.org/#/chapter4/8misc?id=UnsignedComparator'
UnsignedComparator.prototype.objectType = 'UnsignedComparator'

