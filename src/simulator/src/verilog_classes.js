import {AndGate} from './modules/and_gate';
import {NandGate} from './modules/nand_gate';
import {Multiplexer} from './modules/multiplexer';
import {XorGate} from './modules/xor_gate';
import {XnorGate} from './modules/xnor_gate';
import {OrGate} from './modules/or_gate';
import {NotGate} from './modules/not_gate';
import {Buffer} from './modules/buffer';
import {Adder} from './modules/adder';
import {verilogMultiplier} from './modules/verilog_multiplier';
import {verilogDivider} from './modules/verilog_divider';
import {verilogPower} from './modules/verilog_power';
import {verilogShiftLeft} from './modules/verilog_shift_left';
import {verilogShiftRight} from './modules/verilog_shift_right';
import {Splitter} from './modules/splitter';
import {Input} from './modules/input';
import {Output} from './modules/output';
import {ConstantVal} from './modules/constant_val';
import {NorGate} from './modules/nor_gate';
import {DigitalLed} from './modules/digital_led';
import {Button} from './modules/button';
import {LSB} from './modules/lsb';
import {ALU} from './modules/alu';
import {DflipFlop} from './sequential/d_flip_flop';
import {Clock} from './sequential/clock';
import {verilogRAM} from './sequential/verilog_ram';

function getBitWidth(bitsJSON) {
  if (Number.isInteger(bitsJSON)) {
    return bitsJSON;
  } else {
    let ans = 1;
    for (const i in bitsJSON) {
      ans = Math.max(ans, bitsJSON[i]);
    }
    return ans;
  }
}

class verilogUnaryGate {
  constructor(deviceJSON) {
    this.bitWidth = 1;
    if (deviceJSON['bits']) {
      this.bitWidth = getBitWidth(deviceJSON['bits']);
    }
  }

  getPort(portName) {
    if (portName == 'in') {
      return this.input;
    }
    if (portName == 'out') {
      return this.output;
    }
  }
}

/**
 *
 */
class verilogInput extends verilogUnaryGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);
    if (deviceJSON['net'] == 'clk' || deviceJSON['net'] == 'clock') {
      this.element = new Clock(0, 0, scope);
    } else {
      this.element = new Input(0, 0, scope, undefined, this.bitWidth);
    }
    this.output = this.element.output1;
    this.element.label = deviceJSON['net'];
  }
}

/**
 *
 */
class verilogOutput extends verilogUnaryGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);
    this.element = new Output(0, 0, scope, undefined, this.bitWidth);
    this.input = this.element.inp1;
    this.element.label = deviceJSON['net'];
  }
}

/**
 * Verilog Clock
 */
class verilogClock extends verilogUnaryGate {
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);
    this.element = new Clock(0, 0, scope);
    this.output = this.element.output1;
  }
}

class verilogButton extends verilogUnaryGate {
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);
    this.element = new Button(0, 0, scope);
    this.output = this.element.output1;
  }
}

class verilogLamp extends verilogUnaryGate {
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);
    this.element = new DigitalLed(0, 0, scope);
    this.input = this.element.inp1;
  }
}

class verilogNotGate extends verilogUnaryGate {
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);
    this.element = new NotGate(0, 0, scope, undefined, this.bitWidth);
    this.input = this.element.inp1;
    this.output = this.element.output1;
  }
}

class verilogRepeaterGate extends verilogUnaryGate {
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);
    this.element = new Buffer(0, 0, scope, undefined, this.bitWidth);
    this.input = this.element.inp1;
    this.output = this.element.output1;
  }
}

class verilogConstantVal extends verilogUnaryGate {
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);
    this.bitWidth = deviceJSON['constant'].length;
    this.state = deviceJSON['constant'];
    if (this.state[0] == 'x') {
      this.state = undefined;
    }
    this.element = new ConstantVal(
        0,
        0,
        scope,
        undefined,
        this.bitWidth,
        this.state,
    );
    this.input = this.element.inp1;
    this.output = this.element.output1;
  }
}

class verilogReduceAndGate extends verilogUnaryGate {
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);

    this.bitWidthSplit = [];
    for (let i = 0; i < this.bitWidth; i++) {
      this.bitWidthSplit.push(1);
    }

    this.splitter = new Splitter(
        0,
        0,
        scope,
        undefined,
        this.bitWidth,
        this.bitWidthSplit,
    );
    this.andGate = new AndGate(0, 0, scope, undefined, this.bitWidth, 1);

    for (let i = 0; i < this.bitWidth; i++) {
      this.splitter.outputs[i].connect(this.andGate.inp[i]);
    }

    this.input = this.splitter.inp1;
    this.output = this.andGate.output1;
  }
}

class verilogReduceNandGate extends verilogUnaryGate {
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);

    this.bitWidthSplit = [];
    for (let i = 0; i < this.bitWidth; i++) {
      this.bitWidthSplit.push(1);
    }

    this.splitter = new Splitter(
        0,
        0,
        scope,
        undefined,
        this.bitWidth,
        this.bitWidthSplit,
    );
    this.nandGate = new NandGate(
        0,
        0,
        scope,
        undefined,
        this.bitWidth,
        1,
    );

    for (let i = 0; i < this.bitWidth; i++) {
      this.splitter.outputs[i].connect(this.nandGate.inp[i]);
    }

    this.input = this.splitter.inp1;
    this.output = this.nandGate.output1;
  }
}

class verilogReduceOrGate extends verilogUnaryGate {
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);

    this.bitWidthSplit = [];
    for (let i = 0; i < this.bitWidth; i++) {
      this.bitWidthSplit.push(1);
    }

    this.splitter = new Splitter(
        0,
        0,
        scope,
        undefined,
        this.bitWidth,
        this.bitWidthSplit,
    );
    this.orGate = new OrGate(0, 0, scope, undefined, this.bitWidth, 1);

    for (let i = 0; i < this.bitWidth; i++) {
      this.splitter.outputs[i].connect(this.orGate.inp[i]);
    }

    this.input = this.splitter.inp1;
    this.output = this.orGate.output1;
  }
}

/**
 *
 */
class verilogReduceNorGate extends verilogUnaryGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);

    this.bitWidthSplit = [];
    for (let i = 0; i < this.bitWidth; i++) {
      this.bitWidthSplit.push(1);
    }

    this.splitter = new Splitter(
        0,
        0,
        scope,
        undefined,
        this.bitWidth,
        this.bitWidthSplit,
    );
    this.norGate = new NorGate(0, 0, scope, undefined, this.bitWidth, 1);

    for (let i = 0; i < this.bitWidth; i++) {
      this.splitter.outputs[i].connect(this.norGate.inp[i]);
    }

    this.input = this.splitter.inp1;
    this.output = this.norGate.output1;
  }
}

/**
 *
 */
class verilogReduceXorGate extends verilogUnaryGate {
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);

    this.bitWidthSplit = [];
    for (let i = 0; i < this.bitWidth; i++) {
      this.bitWidthSplit.push(1);
    }

    this.splitter = new Splitter(
        0,
        0,
        scope,
        undefined,
        this.bitWidth,
        this.bitWidthSplit,
    );
    this.xorGate = new XorGate(0, 0, scope, undefined, this.bitWidth, 1);

    for (let i = 0; i < this.bitWidth; i++) {
      this.splitter.outputs[i].connect(this.xorGate.inp[i]);
    }

    this.input = this.splitter.inp1;
    this.output = this.xorGate.output1;
  }
}

/**
 *
 */
class verilogReduceXnorGate extends verilogUnaryGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);

    this.bitWidthSplit = [];
    for (let i = 0; i < this.bitWidth; i++) {
      this.bitWidthSplit.push(1);
    }

    this.splitter = new Splitter(
        0,
        0,
        scope,
        undefined,
        this.bitWidth,
        this.bitWidthSplit,
    );
    this.xnorGate = new XnorGate(
        0,
        0,
        scope,
        undefined,
        this.bitWidth,
        1,
    );

    for (let i = 0; i < this.bitWidth; i++) {
      this.splitter.outputs[i].connect(this.xnorGate.inp[i]);
    }

    this.input = this.splitter.inp1;
    this.output = this.xnorGate.output1;
  }
}

/**
 *
 */
class verilogBusSlice extends verilogUnaryGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);
    this.bitWidth = deviceJSON['slice']['total'];

    this.start = deviceJSON['slice']['first'];
    this.count = deviceJSON['slice']['count'];
    if (this.start == 0) {
      if (this.count == this.bitWidth) {
        this.splitter = new Splitter(
            0,
            0,
            scope,
            undefined,
            this.bitWidth,
            [this.bitWidth],
        );
      } else {
        this.splitter = new Splitter(
            0,
            0,
            scope,
            undefined,
            this.bitWidth,
            [this.count, this.bitWidth - this.count],
        );
      }

      this.input = this.splitter.inp1;
      this.output = this.splitter.outputs[0];
    } else {
      if (this.start + this.count == this.bitWidth) {
        this.splitter = new Splitter(
            0,
            0,
            scope,
            undefined,
            this.bitWidth,
            [this.start, this.count],
        );
      } else {
        this.splitter = new Splitter(
            0,
            0,
            scope,
            undefined,
            this.bitWidth,
            [
              this.start,
              this.count,
              this.bitWidth - this.start - this.count,
            ],
        );
      }
      this.input = this.splitter.inp1;
      this.output = this.splitter.outputs[1];
    }
  }
}

/**
 * Extend zero Verilog operation.
 */
class verilogZeroExtend extends verilogUnaryGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);

    this.inputBitWidth = deviceJSON['extend']['input'];
    this.outputBitWidth = deviceJSON['extend']['output'];

    const extraBits = this.outputBitWidth - this.inputBitWidth;

    let zeroState = '';
    for (let i = 0; i < extraBits; i++) {
      zeroState += '0';
    }

    this.zeroConstant = new ConstantVal(
        0,
        0,
        scope,
        undefined,
        extraBits,
        zeroState,
    );

    this.splitter = new Splitter(
        0,
        0,
        scope,
        undefined,
        this.outputBitWidth,
        [this.inputBitWidth, extraBits],
    );

    this.zeroConstant.output1.connect(this.splitter.outputs[1]);
    this.input = this.splitter.outputs[0];
    this.output = this.splitter.inp1;
  }
}

/**
 *
 */
class verilogNegationGate extends verilogUnaryGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);
    this.inputBitWidth = deviceJSON['bits']['in'];

    this.notGate = new NotGate(400, 0, scope, undefined, this.bitWidth);
    this.adder = new Adder(300, 0, scope, undefined, this.bitWidth);

    if (this.inputBitWidth != this.bitWidth) {
      const extraBits = this.bitWidth - this.inputBitWidth;
      this.splitter = new Splitter(
          600,
          600,
          scope,
          undefined,
          this.bitWidth,
          [this.inputBitWidth, extraBits],
      );

      let zeroState = '';
      for (let i = 0; i < extraBits; i++) {
        zeroState += '0';
      }

      this.zeroConstant = new ConstantVal(
          550,
          550,
          scope,
          undefined,
          extraBits,
          zeroState,
      );

      this.zeroConstant.output1.connect(this.splitter.outputs[1]);
      this.splitter.inp1.connect(this.notGate.inp1);

      this.input = this.splitter.outputs[0];
    } else {
      this.input = this.notGate.inp1;
    }

    let oneVal = '';
    for (let i = 0; i < this.bitWidth - 1; i++) {
      oneVal += '0';
    }
    oneVal += '1';

    this.oneConstant = new ConstantVal(
        0,
        0,
        scope,
        undefined,
        this.bitWidth,
        oneVal,
    );

    this.notGate.output1.connect(this.adder.inpA);
    this.oneConstant.output1.connect(this.adder.inpB);

    this.output = this.adder.sum;
  }
}

/**
 *
 */
class verilogBinaryGate {
  /**
   *
   * @param {*} deviceJSON
   */
  constructor(deviceJSON) {
    this.bitWidth = 1;
    if (deviceJSON['bits']) {
      this.bitWidth = getBitWidth(deviceJSON['bits']);
    }
  }

  /**
   *
   * @param {*} portName
   * @returns
   */
  getPort(portName) {
    if (portName == 'in1') {
      return this.input[0];
    } else if (portName == 'in2') {
      return this.input[1];
    } else if (portName == 'out') {
      return this.output;
    }
  }
}

/**
 *
 */
class verilogAndGate extends verilogBinaryGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);
    this.element = new AndGate(
        0,
        0,
        scope,
        undefined,
        undefined,
        this.bitWidth,
    );
    this.input = [this.element.inp[0], this.element.inp[1]];
    this.output = this.element.output1;
  }
}

/**
 *
 */
class verilogNandGate extends verilogBinaryGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);
    this.element = new NandGate(
        0,
        0,
        scope,
        undefined,
        undefined,
        this.bitWidth,
    );
    this.input = [this.element.inp[0], this.element.inp[1]];
    this.output = this.element.output1;
  }
}

/**
 *
 */
class verilogOrGate extends verilogBinaryGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);
    this.element = new OrGate(
        0,
        0,
        scope,
        undefined,
        undefined,
        this.bitWidth,
    );
    this.input = [this.element.inp[0], this.element.inp[1]];
    this.output = this.element.output1;
  }
}

/**
 *
 */
class verilogNorGate extends verilogBinaryGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);
    this.element = new NorGate(
        0,
        0,
        scope,
        undefined,
        undefined,
        this.bitWidth,
    );
    this.input = [this.element.inp[0], this.element.inp[1]];
    this.output = this.element.output1;
  }
}

/**
 *
 */
class verilogXorGate extends verilogBinaryGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);
    this.element = new XorGate(
        0,
        0,
        scope,
        undefined,
        undefined,
        this.bitWidth,
    );
    this.input = [this.element.inp[0], this.element.inp[1]];
    this.output = this.element.output1;
  }
}

/**
 *
 */
class verilogXnorGate extends verilogBinaryGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);
    this.element = new XnorGate(
        0,
        0,
        scope,
        undefined,
        undefined,
        this.bitWidth,
    );
    this.input = [this.element.inp[0], this.element.inp[1]];
    this.output = this.element.output1;
  }
}

/**
 *
 */
class verilogMathGate extends verilogBinaryGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} includeOutBitWidth
   * @param {*} scope
   */
  constructor(deviceJSON, includeOutBitWidth, scope = globalScope) {
    super(deviceJSON);

    this.bitWidth = Math.max(
        deviceJSON['bits']['in1'],
        deviceJSON['bits']['in2'],
    );

    if (includeOutBitWidth) {
      this.bitWidth = Math.max(deviceJSON['bits']['out'], this.bitWidth);
    }

    if (!Number.isInteger(deviceJSON['bits'])) {
      this.in1BitWidth = deviceJSON['bits']['in1'];
      this.in2BitWidth = deviceJSON['bits']['in2'];
    }

    this.input = [];

    let extraBits = this.bitWidth - this.in1BitWidth;

    if (extraBits != 0) {
      this.in1Splitter = new Splitter(
          0,
          0,
          scope,
          undefined,
          this.bitWidth,
          [this.in1BitWidth, extraBits],
      );

      let zeroState = '';
      for (let i = 0; i < extraBits; i++) {
        zeroState += '0';
      }
      this.in1ZeroConstant = new ConstantVal(
          0,
          0,
          scope,
          undefined,
          extraBits,
          zeroState,
      );
      this.in1ZeroConstant.output1.connect(this.in1Splitter.outputs[1]);
    } else {
      this.in1Splitter = new Splitter(
          0,
          0,
          scope,
          undefined,
          this.bitWidth,
          [this.bitWidth],
      );
    }

    extraBits = this.bitWidth - this.in2BitWidth;
    if (extraBits != 0) {
      this.in2Splitter = new Splitter(
          0,
          0,
          scope,
          undefined,
          this.bitWidth,
          [this.in2BitWidth, extraBits],
      );
      let zeroState = '';
      for (let i = 0; i < extraBits; i++) {
        zeroState += '0';
      }

      this.in2ZeroConstant = new ConstantVal(
          0,
          0,
          scope,
          undefined,
          extraBits,
          zeroState,
      );
      this.in2ZeroConstant.output1.connect(this.in2Splitter.outputs[1]);
    } else {
      this.in2Splitter = new Splitter(
          0,
          0,
          scope,
          undefined,
          this.bitWidth,
          [this.bitWidth],
      );
    }

    this.input = [this.in1Splitter.outputs[0], this.in2Splitter.outputs[0]];
  }
}

/**
 *
 */
class verilogEqGate extends verilogMathGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON, false);

    const bitWidthSplit = [];

    for (let i = 0; i < this.bitWidth; i++) {
      bitWidthSplit.push(1);
    }

    this.xnorGate = new XnorGate(
        0,
        0,
        scope,
        undefined,
        undefined,
        this.bitWidth,
    );
    this.splitter = new Splitter(
        0,
        0,
        scope,
        undefined,
        this.bitWidth,
        bitWidthSplit,
    );
    this.andGate = new AndGate(0, 0, scope, undefined, this.bitWidth);
    this.in1Splitter.inp1.connect(this.xnorGate.inp[0]);
    this.in2Splitter.inp1.connect(this.xnorGate.inp[1]);

    this.xnorGate.output1.connect(this.splitter.inp1);
    for (let i = 0; i < this.bitWidth; i++) {
      this.splitter.outputs[i].connect(this.andGate.inp[i]);
    }

    this.output = this.andGate.output1;
  }
}

/**
 *
 */
class verilogNeGate extends verilogMathGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON, false);

    const bitWidthSplit = [];

    for (let i = 0; i < this.bitWidth; i++) {
      bitWidthSplit.push(1);
    }

    this.xnorGate = new XnorGate(
        0,
        0,
        scope,
        undefined,
        undefined,
        this.bitWidth,
    );
    this.splitter = new Splitter(
        0,
        0,
        scope,
        undefined,
        this.bitWidth,
        bitWidthSplit,
    );
    this.nandGate = new NandGate(0, 0, scope, undefined, this.bitWidth);

    this.in1Splitter.inp1.connect(this.xnorGate.inp[0]);
    this.in2Splitter.inp1.connect(this.xnorGate.inp[1]);

    this.xnorGate.output1.connect(this.splitter.inp1);
    for (let i = 0; i < this.bitWidth; i++) {
      this.splitter.outputs[i].connect(this.nandGate.inp[i]);
    }

    this.output = this.nandGate.output1;
  }
}

/**
 *
 */
class verilogLtGate extends verilogMathGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON, false);
    this.constant7 = new ConstantVal(0, 0, scope, undefined, 3, '111');
    this.alu = new ALU(0, 0, scope, undefined, this.bitWidth);
    this.splitter = new Splitter(
        0,
        0,
        scope,
        undefined,
        this.bitWidth,
        [1],
    );

    this.in1Splitter.inp1.connect(this.alu.inp1);
    this.in2Splitter.inp1.connect(this.alu.inp2);

    this.constant7.output1.connect(this.alu.controlSignalInput);
    this.alu.output.connect(this.splitter.inp1);

    this.output = this.splitter.outputs[0];
  }
}

/**
 *
 */
class verilogGtGate extends verilogMathGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON, false);
    this.constant7 = new ConstantVal(0, 0, scope, undefined, 3, '111');
    this.alu = new ALU(0, 0, scope, undefined, this.bitWidth);
    this.splitter = new Splitter(
        0,
        0,
        scope,
        undefined,
        this.bitWidth,
        [1],
    );

    this.in1Splitter.inp1.connect(this.alu.inp1);
    this.in2Splitter.inp1.connect(this.alu.inp2);

    this.constant7.output1.connect(this.alu.controlSignalInput);
    this.alu.output.connect(this.splitter.inp1);

    this.output = this.splitter.outputs[0];
  }
}

/**
 *
 */
class verilogGeGate extends verilogMathGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON, false);
    this.constant7 = new ConstantVal(0, 0, scope, undefined, 3, '111');
    this.alu = new ALU(0, 0, scope, undefined, this.bitWidth);
    this.splitter = new Splitter(
        0,
        0,
        scope,
        undefined,
        this.bitWidth,
        [1],
    );
    this.notGate = new NotGate(0, 0, scope);

    this.in1Splitter.inp1.connect(this.alu.inp1);
    this.in2Splitter.inp1.connect(this.alu.inp2);

    this.constant7.output1.connect(this.alu.controlSignalInput);
    this.alu.output.connect(this.splitter.inp1);
    this.splitter.outputs[0].connect(this.notGate.inp1);

    this.output = this.notGate.output1;
  }
}

/**
 *
 */
class verilogLeGate extends verilogMathGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON, false);
    this.constant7 = new ConstantVal(0, 0, scope, undefined, 3, '111');
    this.alu = new ALU(0, 0, scope, undefined, this.bitWidth);
    this.splitter = new Splitter(
        0,
        0,
        scope,
        undefined,
        this.bitWidth,
        [1],
    );
    this.notGate = new NotGate(0, 0, scope);

    this.in1Splitter.inp1.connect(this.alu.inp1);
    this.in2Splitter.inp1.connect(this.alu.inp2);

    this.constant7.output1.connect(this.alu.controlSignalInput);
    this.alu.output.connect(this.splitter.inp1);
    this.splitter.outputs[0].connect(this.notGate.inp1);

    this.output = this.notGate.output1;
  }
}

/**
 *
 */
class verilogAdditionGate extends verilogMathGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON, false);

    this.outBitWidth = deviceJSON['bits']['out'];

    this.adder = new Adder(0, 0, scope, undefined, this.bitWidth);

    this.in1Splitter.inp1.connect(this.adder.inpA);
    this.in2Splitter.inp1.connect(this.adder.inpB);

    if (this.outBitWidth == this.bitWidth) {
      this.output = this.adder.sum;
    } else if (this.outBitWidth == this.bitWidth + 1) {
      this.outputSplitter = new Splitter(
          0,
          0,
          scope,
          undefined,
          this.outBitWidth,
          [this.bitWidth, 1],
      );
      this.adder.sum.connect(this.outputSplitter.outputs[0]);
      this.adder.carryOut.connect(this.outputSplitter.outputs[1]);
      this.output = this.outputSplitter.inp1;
    }
  }
}

/**
 *
 */
class verilogMultiplicationGate extends verilogMathGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);

    this.outBitWidth = deviceJSON['bits']['out'];

    this.verilogMultiplier = new verilogMultiplier(
        300,
        300,
        scope,
        undefined,
        this.bitWidth,
        this.outBitWidth,
    );

    this.in1Splitter.inp1.connect(this.verilogMultiplier.inpA);
    this.in2Splitter.inp1.connect(this.verilogMultiplier.inpB);

    this.output = this.verilogMultiplier.product;
  }
}

/**
 *
 */
class verilogDivisionGate extends verilogMathGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);

    this.outBitWidth = deviceJSON['bits']['out'];

    this.verilogDivider = new verilogDivider(
        300,
        300,
        scope,
        undefined,
        this.bitWidth,
        this.outBitWidth,
    );

    this.in1Splitter.inp1.connect(this.verilogDivider.inpA);
    this.in2Splitter.inp1.connect(this.verilogDivider.inpB);

    this.output = this.verilogDivider.quotient;
  }
}

/**
 *
 */
class verilogPowerGate extends verilogMathGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);

    this.outBitWidth = deviceJSON['bits']['out'];

    this.verilogPower = new verilogPower(
        300,
        300,
        scope,
        undefined,
        this.bitWidth,
        this.outBitWidth,
    );

    this.in1Splitter.inp1.connect(this.verilogPower.inpA);
    this.in2Splitter.inp1.connect(this.verilogPower.inpB);

    this.output = this.verilogPower.answer;
  }
}

/**
 *
 */
class verilogModuloGate extends verilogMathGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);

    this.outBitWidth = deviceJSON['bits']['out'];

    this.verilogDivider = new verilogDivider(
        300,
        300,
        scope,
        undefined,
        this.bitWidth,
        this.outBitWidth,
    );

    this.in1Splitter.inp1.connect(this.verilogDivider.inpA);
    this.in2Splitter.inp1.connect(this.verilogDivider.inpB);

    this.output = this.verilogDivider.remainder;
  }
}

/**
 *
 */
class verilogShiftLeftGate extends verilogMathGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);

    this.outBitWidth = deviceJSON['bits']['out'];

    this.verilogShiftLeft = new verilogShiftLeft(
        300,
        300,
        scope,
        undefined,
        this.bitWidth,
        this.outBitWidth,
    );

    this.in1Splitter.inp1.connect(this.verilogShiftLeft.inp1);
    this.in2Splitter.inp1.connect(this.verilogShiftLeft.shiftInp);

    this.output = this.verilogShiftLeft.output1;
  }
}

/**
 *
 */
class verilogShiftRightGate extends verilogMathGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON);

    this.outBitWidth = deviceJSON['bits']['out'];

    this.verilogShiftRight = new verilogShiftRight(
        300,
        300,
        scope,
        undefined,
        this.bitWidth,
        this.outBitWidth,
    );

    this.in1Splitter.inp1.connect(this.verilogShiftRight.inp1);
    this.in2Splitter.inp1.connect(this.verilogShiftRight.shiftInp);

    this.output = this.verilogShiftRight.output1;
  }
}

/**
 *
 */
class verilogSubtractionGate extends verilogMathGate {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    super(deviceJSON, true);

    this.alu = new ALU(0, 0, scope, undefined, this.bitWidth);

    this.controlConstant = new ConstantVal(
        0,
        0,
        scope,
        undefined,
        3,
        '110',
    );
    this.alu.controlSignalInput.connect(this.controlConstant.output1);

    this.in1Splitter.inp1.connect(this.alu.inp1);
    this.in2Splitter.inp1.connect(this.alu.inp2);

    this.output = this.alu.output;
  }
}

/**
 *
 */
class verilogDff {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    this.bitWidth = 1;
    if (deviceJSON['bits']) {
      this.bitWidth = getBitWidth(deviceJSON['bits']);
    }

    this.dff = new DflipFlop(0, 0, scope, undefined, this.bitWidth);
    this.clockInput = this.dff.clockInp;
    this.arstInput = this.dff.reset;
    this.enableInput = this.dff.en;

    this.clockPolarity = true;
    this.arstPolarity = true;
    this.enablePolarity = true;

    if (deviceJSON['polarity']['clock'] != undefined) {
      this.clockPolarity = deviceJSON['polarity']['clock'];
    }
    if (this.clockPolarity == false) {
      this.notGateClock = new NotGate(0, 0, scope);
      this.notGateClock.output1.connect(this.dff.clockInp);
      this.clockInput = this.notGateClock.inp1;
    }

    if (deviceJSON['polarity']['enable'] != undefined) {
      this.enablePolarity = deviceJSON['polarity']['enable'];
    }
    if (this.enablePolarity == false) {
      this.notGateEnable = new NotGate(0, 0, scope);
      this.notGateEnable.output1.connect(this.dff.en);
      this.enableInput = this.notGateEnable.inp1;
    }

    if (deviceJSON['polarity']['arst'] != undefined) {
      this.arstPolarity = deviceJSON['polarity']['arst'];
    }
    if (this.arstPolarity == false) {
      this.notGateArst = new NotGate(0, 0, scope);
      this.notGateArst.output1.connect(this.dff.reset);
      this.arstInput = this.notGateArst.inp1;
    }
    if (deviceJSON['arst_value'] != undefined) {
      this.arst_value_constant = new ConstantVal(
          0,
          0,
          scope,
          undefined,
          this.bitWidth,
          deviceJSON['arst_value'],
      );
      this.arst_value_constant.output1.connect(this.dff.preset);
    }

    this.dInput = this.dff.dInp;
    this.qOutput = this.dff.qOutput;
  }

  /**
   * Mapping the Verilog name for a port to the Node representing it.
   * @param {string} portName - verilog name for the port.
   * @return {Node} Node representing the port.
   */
  getPort(portName) {
    if (portName == 'clk') {
      return this.clockInput;
    } else if (portName == 'in') {
      return this.dInput;
    } else if (portName == 'arst') {
      return this.arstInput;
    } else if (portName == 'en') {
      return this.enableInput;
    } else if (portName == 'out') {
      return this.qOutput;
    }
  }
}

/**
 *
 */
class verilogMultiplexer {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    this.bitWidth = 1;
    this.selectBitWidth = undefined;
    if (deviceJSON['bits']['in'] != undefined) {
      this.bitWidth = deviceJSON['bits']['in'];
    }

    if (deviceJSON['bits']['sel'] != undefined) {
      this.selectBitWidth = deviceJSON['bits']['sel'];
    }

    this.multiplexer = new Multiplexer(
        0,
        0,
        scope,
        undefined,
        this.bitWidth,
        this.selectBitWidth,
    );

    this.input = this.multiplexer.inp;
    this.selectInput = this.multiplexer.controlSignalInput;
    this.output = this.multiplexer.output1;
  }

  /**
   *
   * @param {*} portName
   * @returns
   */
  getPort(portName) {
    if (portName == 'sel') {
      return this.selectInput;
    } else if (portName == 'out') {
      return this.output;
    } else {
      const len = portName.length;
      const index = parseInt(portName.substring(2, len));

      return this.input[index];
    }
  }
}

/**
 *
 */
class verilogMultiplexer1Hot {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    this.bitWidth = 1;
    this.selectBitWidth = undefined;
    if (deviceJSON['bits']['in'] != undefined) {
      this.bitWidth = deviceJSON['bits']['in'];
    }

    if (deviceJSON['bits']['sel'] != undefined) {
      this.selectBitWidth = deviceJSON['bits']['sel'];
    }

    this.multiplexer = new Multiplexer(
        0,
        0,
        scope,
        undefined,
        this.bitWidth,
        this.selectBitWidth,
    );
    this.lsb = new LSB(0, 0, scope, undefined, this.selectBitWidth);
    this.adder = new Adder(0, 0, scope, undefined, this.selectBitWidth);

    let zeroState = '';
    for (let i = 0; i < this.selectBitWidth - 1; i++) {
      zeroState += '0';
    }
    this.zeroPadEnable = new ConstantVal(
        0,
        0,
        scope,
        undefined,
        this.selectBitWidth - 1,
        zeroState,
    );

    this.enbaleSplitter = new Splitter(
        0,
        0,
        scope,
        undefined,
        this.selectBitWidth,
        [1, this.selectBitWidth - 1],
    );

    this.lsb.enable.connect(this.enbaleSplitter.outputs[0]);
    this.zeroPadEnable.output1.connect(this.enbaleSplitter.outputs[1]);

    this.adder.inpA.connect(this.lsb.output1);
    this.adder.inpB.connect(this.enbaleSplitter.inp1);

    this.adder.sum.connect(this.multiplexer.controlSignalInput);
    this.input = this.multiplexer.inp;
    this.selectInput = this.lsb.inp1;
    this.output = this.multiplexer.output1;
  }

  /**
   *
   * @param {*} portName
   * @return {Node}
   */
  getPort(portName) {
    if (portName == 'sel') {
      return this.selectInput;
    } else if (portName == 'out') {
      return this.output;
    } else {
      const len = portName.length;
      const index = parseInt(portName.substring(2, len));

      return this.input[index];
    }
  }
}

/**
 *
 */
class verilogBusGroup {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    this.bitWidth = 0;
    this.bitWidthSplit = deviceJSON['groups'];

    for (let i = 0; i < this.bitWidthSplit.length; i++) {
      this.bitWidth += this.bitWidthSplit[i];
    }

    this.splitter = new Splitter(
        0,
        0,
        scope,
        undefined,
        this.bitWidth,
        this.bitWidthSplit,
    );

    this.input = this.splitter.outputs;
    this.output = this.splitter.inp1;
  }

  /**
   *
   * @param {*} portName
   * @return {Node}
   */
  getPort(portName) {
    if (portName == 'out') {
      return this.output;
    } else {
      const len = portName.length;
      const index = parseInt(portName.substring(2, len));

      return this.input[index];
    }
  }
}

/**
 *
 */
class verilogBusUngroup {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    this.bitWidth = 0;
    this.bitWidthSplit = deviceJSON['groups'];

    for (let i = 0; i < this.bitWidthSplit.length; i++) {
      this.bitWidth += this.bitWidthSplit[i];
    }

    this.splitter = new Splitter(
        0,
        0,
        scope,
        undefined,
        this.bitWidth,
        this.bitWidthSplit,
    );

    this.input = this.splitter.inp1;
    this.output = this.splitter.outputs;
  }

  /**
   *
   * @param {string} portName
   * @return {Node}
   */
  getPort(portName) {
    if (portName == 'in') {
      return this.input;
    } else {
      const len = portName.length;
      const index = parseInt(portName.substring(3, len));

      return this.output[index];
    }
  }
}

/**
 * Verilog memory
 */
class verilogMemory {
  /**
   *
   * @param {*} deviceJSON
   * @param {*} scope
   */
  constructor(deviceJSON, scope = globalScope) {
    this.memData = deviceJSON['memdata'];
    this.dataBitWidth = deviceJSON['bits'];
    this.addressBitWidth = deviceJSON['abits'];
    this.words = deviceJSON['words'];

    this.numRead = deviceJSON['rdports'].length;
    this.numWrite = deviceJSON['wrports'].length;

    this.verilogRAM = new verilogRAM(
        0,
        0,
        scope,
        undefined,
        this.dataBitWidth,
        this.addressBitWidth,
        this.memData,
        this.words,
        this.numRead,
        this.numWrite,
        deviceJSON['rdports'],
        deviceJSON['wrports'],
    );

    this.writeAddressInput = this.verilogRAM.writeAddress;
    this.readAddressInput = this.verilogRAM.readAddress;
    this.writeDataInput = this.verilogRAM.writeDataIn;
    this.writeEnableInput = this.verilogRAM.writeEnable;
    this.readDataOutput = this.verilogRAM.dataOut;
    this.readDffOut = this.verilogRAM.readDff;

    for (let i = 0; i < this.numWrite; i++) {
      const writeEnInput = new Input(
          0,
          0,
          scope,
          undefined,
          1,
          undefined,
      );
      writeEnInput.label = 'en' + i.toString();
      writeEnInput.output1.connect(this.verilogRAM.writeEnable[i]);
    }
  }

  /**
   *
   * @param {*} portName
   * @return {number}
   */
  getPort(portName) {
    const len = portName.length;
    const isPortAddr = portName.slice(len - 4, len) == 'addr';
    const isPortData = portName.slice(len - 4, len) == 'data';
    const isPortClk = portName.slice(len - 3, len) == 'clk';
    const isPortEn = portName.slice(len - 2, len) == 'en';
    if (portName.startsWith('rd')) {
      if (isPortAddr) {
        let portNum = portName.slice(2, len - 4);
        portNum = parseInt(portNum);
        return this.readAddressInput[portNum];
      }
      if (isPortData) {
        let portNum = portName.slice(2, len - 4);
        portNum = parseInt(portNum);
        return this.verilogRAM.readDffQOutput[portNum];
      }
      if (isPortClk) {
        let portNum = portName.slice(2, len - 3);
        portNum = parseInt(portNum);
        return this.verilogRAM.readDffClock[portNum];
      }
      if (isPortEn) {
        let portNum = portName.slice(2, len - 2);
        portNum = parseInt(portNum);
        return this.verilogRAM.readDffEn[portNum];
      }
    } else {
      if (isPortAddr) {
        let portNum = portName.slice(2, len - 4);
        portNum = parseInt(portNum);
        return this.writeAddressInput[portNum];
      }
      if (isPortData) {
        let portNum = portName.slice(2, len - 4);
        portNum = parseInt(portNum);
        return this.writeDataInput[portNum];
      }
      if (isPortClk) {
        let portNum = portName.slice(2, len - 3);
        portNum = parseInt(portNum);
        return this.verilogRAM.writeDffClock[portNum];
      }
      if (isPortEn) {
        let portNum = portName.slice(2, len - 2);
        portNum = parseInt(portNum);
        return this.verilogRAM.writeDffEn[portNum];
      }
    }
  }
}

const yosysTypeMap = {};

yosysTypeMap['Not'] = verilogNotGate;
yosysTypeMap['Repeater'] = verilogRepeaterGate;
yosysTypeMap['And'] = verilogAndGate;
yosysTypeMap['Nand'] = verilogNandGate;
yosysTypeMap['Or'] = verilogOrGate;
yosysTypeMap['Nor'] = verilogNorGate;
yosysTypeMap['Xor'] = verilogXorGate;
yosysTypeMap['Xnor'] = verilogXnorGate;
yosysTypeMap['Constant'] = verilogConstantVal;
yosysTypeMap['Input'] = verilogInput;
yosysTypeMap['Output'] = verilogOutput;
yosysTypeMap['AndReduce'] = verilogReduceAndGate;
yosysTypeMap['NandReduce'] = verilogReduceNandGate;
yosysTypeMap['OrReduce'] = verilogReduceOrGate;
yosysTypeMap['NorReduce'] = verilogReduceNorGate;
yosysTypeMap['XorReduce'] = verilogReduceXorGate;
yosysTypeMap['XnorReduce'] = verilogReduceXnorGate;

yosysTypeMap['Eq'] = verilogEqGate;
yosysTypeMap['Ne'] = verilogNeGate;

yosysTypeMap['Lt'] = verilogLtGate;
yosysTypeMap['Le'] = verilogLeGate;
yosysTypeMap['Ge'] = verilogGeGate;
yosysTypeMap['Gt'] = verilogGtGate;

yosysTypeMap['ZeroExtend'] = verilogZeroExtend;
yosysTypeMap['Negation'] = verilogNegationGate;

yosysTypeMap['Dff'] = verilogDff;
yosysTypeMap['Mux'] = verilogMultiplexer;
yosysTypeMap['Mux1Hot'] = verilogMultiplexer1Hot;
yosysTypeMap['BusSlice'] = verilogBusSlice;
yosysTypeMap['BusGroup'] = verilogBusGroup;
yosysTypeMap['BusUngroup'] = verilogBusUngroup;

yosysTypeMap['Addition'] = verilogAdditionGate;
yosysTypeMap['Subtraction'] = verilogSubtractionGate;
yosysTypeMap['Multiplication'] = verilogMultiplicationGate;
yosysTypeMap['Division'] = verilogDivisionGate;
yosysTypeMap['Modulo'] = verilogModuloGate;
yosysTypeMap['Power'] = verilogPowerGate;
yosysTypeMap['ShiftLeft'] = verilogShiftLeftGate;
yosysTypeMap['ShiftRight'] = verilogShiftRightGate;

yosysTypeMap['Clock'] = verilogClock;
yosysTypeMap['Lamp'] = verilogLamp;
yosysTypeMap['Button'] = verilogButton;

yosysTypeMap['Memory'] = verilogMemory;

export default yosysTypeMap;
