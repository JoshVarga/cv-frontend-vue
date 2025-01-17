import {RAM} from './ram';
/**
 * EEPROM Component.
 * @extends CircuitElement
 * @param {number} x - x coord of element
 * @param {number} y - y coord of element
 * @param {Scope} scope - the circuit in which we want the Element
 * @param {string} dir - direction in which element has to drawn

 *
 * This is basically a RAM component that persists its contents.
 *
 * We consider EEPROMs more 'expensive' than RAMs, so we arbitrarily limit
 * the addressWith to a maximum of 10 bits (1024 addresses) with a default
 * of 8-bit (256).
 *
 * In the EEPROM all addresses are initialized to zero.
 * This way we serialize unused values as "0" instead of "null".
 *
 * These two techniques help keep reduce the size of saved projects.
 * @category sequential
 */
export class EEPROM extends RAM {
  /**
   * @param {number} x - x coord of element
   * @param {number} y - y coord of element
   * @param {Scope} scope - the circuit in which we want the Element
   * @param {string} dir - direction in which element has to drawn
   * @param {number} bitWidth - bitwidth
   * @param {number} addressWidth - address width
   * @param {*} data - data stored.
   */
  constructor(
      x,
      y,
      scope,
      dir = 'RIGHT',
      bitWidth = 8,
      addressWidth = 8,
      data = null,
  ) {
    super(x, y, scope, dir, bitWidth, addressWidth);
    this.data = data || this.data;
  }

  /**
   * Clear all data.
   */
  clearData() {
    super.clearData();
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = this.data[i] || 0;
    }
  }

  /**
   * @memberof EEPROM
   * Create save JSON data of object.
   * @return {JSON}
   */
  customSave() {
    const saveInfo = super.customSave(this);

    // Normalize this.data to use zeroes instead of null when serialized.
    const {data} = this;

    saveInfo.customData.push({'data': data});
    return saveInfo;
  }

  /**
   * @memberof EEPROM
   * Generate Verilog string for this CircuitClement.
   * @return {string} String describing this element in Verilog.
   */
  static moduleVerilog() {
    return `
    module EEPROM(dout, addr, din, we, dmp, rst);
        parameter WIDTH = 8;
        parameter ADDR = 10;
        output [WIDTH-1:0] dout;
        input [ADDR-1:0] addr;
        input [WIDTH-1:0] din;
        input we;
        input dmp;
        input rst;
        reg [WIDTH-1:0] mem[2**ADDR-1:0];
        integer j;
    
        assign dout = mem[addr];
    
        always @ (*) begin
        if (!rst)
            for (j=0; j < 2**ADDR-1; j=j+1) begin
                mem[j] = 0;
            end
        if (!we)
            mem[addr] = din;
        dout = mem[addr];
        end
    endmodule
    `;
  }
}

EEPROM.prototype.tooltipText =
  'Electrically Erasable Programmable Read-Only Memory';
EEPROM.prototype.shortName = 'EEPROM';
EEPROM.prototype.maxAddressWidth = 10;
EEPROM.prototype.mutableProperties = {
  addressWidth: {
    name: 'Address Width',
    type: 'number',
    max: '10',
    min: '1',
    func: 'changeAddressWidth',
  },
  dump: RAM.prototype.mutableProperties.dump,
  load: RAM.prototype.mutableProperties.load,
  reset: RAM.prototype.mutableProperties.reset,
};
EEPROM.prototype.objectType = 'EEPROM';
EEPROM.prototype.constructorParameters=['data'];
