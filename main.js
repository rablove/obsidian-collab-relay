var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all2) => {
  for (var name in all2)
    __defProp(target, name, { get: all2[name], enumerable: true });
};
var __copyProps = (to, from2, except, desc) => {
  if (from2 && typeof from2 === "object" || typeof from2 === "function") {
    for (let key of __getOwnPropNames(from2))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/main.js
var main_exports = {};
__export(main_exports, {
  default: () => VaultSyncCollab
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

// node_modules/lib0/map.js
var create = () => /* @__PURE__ */ new Map();
var copy = (m) => {
  const r = create();
  m.forEach((v, k) => {
    r.set(k, v);
  });
  return r;
};
var setIfUndefined = (map3, key, createT) => {
  let set = map3.get(key);
  if (set === void 0) {
    map3.set(key, set = createT());
  }
  return set;
};
var map = (m, f) => {
  const res = [];
  for (const [key, value] of m) {
    res.push(f(value, key));
  }
  return res;
};
var any = (m, f) => {
  for (const [key, value] of m) {
    if (f(value, key)) {
      return true;
    }
  }
  return false;
};

// node_modules/lib0/set.js
var create2 = () => /* @__PURE__ */ new Set();

// node_modules/lib0/array.js
var last = (arr) => arr[arr.length - 1];
var appendTo = (dest, src) => {
  for (let i = 0; i < src.length; i++) {
    dest.push(src[i]);
  }
};
var from = Array.from;
var every = (arr, f) => {
  for (let i = 0; i < arr.length; i++) {
    if (!f(arr[i], i, arr)) {
      return false;
    }
  }
  return true;
};
var some = (arr, f) => {
  for (let i = 0; i < arr.length; i++) {
    if (f(arr[i], i, arr)) {
      return true;
    }
  }
  return false;
};
var unfold = (len, f) => {
  const array = new Array(len);
  for (let i = 0; i < len; i++) {
    array[i] = f(i, array);
  }
  return array;
};
var isArray = Array.isArray;

// node_modules/lib0/observable.js
var ObservableV2 = class {
  constructor() {
    this._observers = create();
  }
  /**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */
  on(name, f) {
    setIfUndefined(
      this._observers,
      /** @type {string} */
      name,
      create2
    ).add(f);
    return f;
  }
  /**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */
  once(name, f) {
    const _f = (...args2) => {
      this.off(
        name,
        /** @type {any} */
        _f
      );
      f(...args2);
    };
    this.on(
      name,
      /** @type {any} */
      _f
    );
  }
  /**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */
  off(name, f) {
    const observers = this._observers.get(name);
    if (observers !== void 0) {
      observers.delete(f);
      if (observers.size === 0) {
        this._observers.delete(name);
      }
    }
  }
  /**
   * Emit a named event. All registered event listeners that listen to the
   * specified name will receive the event.
   *
   * @todo This should catch exceptions
   *
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name The event name.
   * @param {Parameters<EVENTS[NAME]>} args The arguments that are applied to the event listener.
   */
  emit(name, args2) {
    return from((this._observers.get(name) || create()).values()).forEach((f) => f(...args2));
  }
  destroy() {
    this._observers = create();
  }
};
var Observable = class {
  constructor() {
    this._observers = create();
  }
  /**
   * @param {N} name
   * @param {function} f
   */
  on(name, f) {
    setIfUndefined(this._observers, name, create2).add(f);
  }
  /**
   * @param {N} name
   * @param {function} f
   */
  once(name, f) {
    const _f = (...args2) => {
      this.off(name, _f);
      f(...args2);
    };
    this.on(name, _f);
  }
  /**
   * @param {N} name
   * @param {function} f
   */
  off(name, f) {
    const observers = this._observers.get(name);
    if (observers !== void 0) {
      observers.delete(f);
      if (observers.size === 0) {
        this._observers.delete(name);
      }
    }
  }
  /**
   * Emit a named event. All registered event listeners that listen to the
   * specified name will receive the event.
   *
   * @todo This should catch exceptions
   *
   * @param {N} name The event name.
   * @param {Array<any>} args The arguments that are applied to the event listener.
   */
  emit(name, args2) {
    return from((this._observers.get(name) || create()).values()).forEach((f) => f(...args2));
  }
  destroy() {
    this._observers = create();
  }
};

// node_modules/lib0/math.js
var floor = Math.floor;
var abs = Math.abs;
var min = (a, b) => a < b ? a : b;
var max = (a, b) => a > b ? a : b;
var isNaN = Number.isNaN;
var pow = Math.pow;
var isNegativeZero = (n) => n !== 0 ? n < 0 : 1 / n < 0;

// node_modules/lib0/binary.js
var BIT1 = 1;
var BIT2 = 2;
var BIT3 = 4;
var BIT4 = 8;
var BIT6 = 32;
var BIT7 = 64;
var BIT8 = 128;
var BIT18 = 1 << 17;
var BIT19 = 1 << 18;
var BIT20 = 1 << 19;
var BIT21 = 1 << 20;
var BIT22 = 1 << 21;
var BIT23 = 1 << 22;
var BIT24 = 1 << 23;
var BIT25 = 1 << 24;
var BIT26 = 1 << 25;
var BIT27 = 1 << 26;
var BIT28 = 1 << 27;
var BIT29 = 1 << 28;
var BIT30 = 1 << 29;
var BIT31 = 1 << 30;
var BIT32 = 1 << 31;
var BITS5 = 31;
var BITS6 = 63;
var BITS7 = 127;
var BITS17 = BIT18 - 1;
var BITS18 = BIT19 - 1;
var BITS19 = BIT20 - 1;
var BITS20 = BIT21 - 1;
var BITS21 = BIT22 - 1;
var BITS22 = BIT23 - 1;
var BITS23 = BIT24 - 1;
var BITS24 = BIT25 - 1;
var BITS25 = BIT26 - 1;
var BITS26 = BIT27 - 1;
var BITS27 = BIT28 - 1;
var BITS28 = BIT29 - 1;
var BITS29 = BIT30 - 1;
var BITS30 = BIT31 - 1;
var BITS31 = 2147483647;

// node_modules/lib0/number.js
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
var MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;
var LOWEST_INT32 = 1 << 31;
var isInteger = Number.isInteger || ((num) => typeof num === "number" && isFinite(num) && floor(num) === num);
var isNaN2 = Number.isNaN;
var parseInt2 = Number.parseInt;

// node_modules/lib0/string.js
var fromCharCode = String.fromCharCode;
var fromCodePoint = String.fromCodePoint;
var MAX_UTF16_CHARACTER = fromCharCode(65535);
var toLowerCase = (s) => s.toLowerCase();
var trimLeftRegex = /^\s*/g;
var trimLeft = (s) => s.replace(trimLeftRegex, "");
var fromCamelCaseRegex = /([A-Z])/g;
var fromCamelCase = (s, separator) => trimLeft(s.replace(fromCamelCaseRegex, (match2) => `${separator}${toLowerCase(match2)}`));
var _encodeUtf8Polyfill = (str) => {
  const encodedString = unescape(encodeURIComponent(str));
  const len = encodedString.length;
  const buf = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buf[i] = /** @type {number} */
    encodedString.codePointAt(i);
  }
  return buf;
};
var utf8TextEncoder = (
  /** @type {TextEncoder} */
  typeof TextEncoder !== "undefined" ? new TextEncoder() : null
);
var _encodeUtf8Native = (str) => utf8TextEncoder.encode(str);
var encodeUtf8 = utf8TextEncoder ? _encodeUtf8Native : _encodeUtf8Polyfill;
var utf8TextDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
if (utf8TextDecoder && utf8TextDecoder.decode(new Uint8Array()).length === 1) {
  utf8TextDecoder = null;
}
var repeat = (source, n) => unfold(n, () => source).join("");

// node_modules/lib0/encoding.js
var Encoder = class {
  constructor() {
    this.cpos = 0;
    this.cbuf = new Uint8Array(100);
    this.bufs = [];
  }
};
var createEncoder = () => new Encoder();
var length = (encoder) => {
  let len = encoder.cpos;
  for (let i = 0; i < encoder.bufs.length; i++) {
    len += encoder.bufs[i].length;
  }
  return len;
};
var toUint8Array = (encoder) => {
  const uint8arr = new Uint8Array(length(encoder));
  let curPos = 0;
  for (let i = 0; i < encoder.bufs.length; i++) {
    const d = encoder.bufs[i];
    uint8arr.set(d, curPos);
    curPos += d.length;
  }
  uint8arr.set(new Uint8Array(encoder.cbuf.buffer, 0, encoder.cpos), curPos);
  return uint8arr;
};
var verifyLen = (encoder, len) => {
  const bufferLen = encoder.cbuf.length;
  if (bufferLen - encoder.cpos < len) {
    encoder.bufs.push(new Uint8Array(encoder.cbuf.buffer, 0, encoder.cpos));
    encoder.cbuf = new Uint8Array(max(bufferLen, len) * 2);
    encoder.cpos = 0;
  }
};
var write = (encoder, num) => {
  const bufferLen = encoder.cbuf.length;
  if (encoder.cpos === bufferLen) {
    encoder.bufs.push(encoder.cbuf);
    encoder.cbuf = new Uint8Array(bufferLen * 2);
    encoder.cpos = 0;
  }
  encoder.cbuf[encoder.cpos++] = num;
};
var writeUint8 = write;
var writeVarUint = (encoder, num) => {
  while (num > BITS7) {
    write(encoder, BIT8 | BITS7 & num);
    num = floor(num / 128);
  }
  write(encoder, BITS7 & num);
};
var writeVarInt = (encoder, num) => {
  const isNegative = isNegativeZero(num);
  if (isNegative) {
    num = -num;
  }
  write(encoder, (num > BITS6 ? BIT8 : 0) | (isNegative ? BIT7 : 0) | BITS6 & num);
  num = floor(num / 64);
  while (num > 0) {
    write(encoder, (num > BITS7 ? BIT8 : 0) | BITS7 & num);
    num = floor(num / 128);
  }
};
var _strBuffer = new Uint8Array(3e4);
var _maxStrBSize = _strBuffer.length / 3;
var _writeVarStringNative = (encoder, str) => {
  if (str.length < _maxStrBSize) {
    const written = utf8TextEncoder.encodeInto(str, _strBuffer).written || 0;
    writeVarUint(encoder, written);
    for (let i = 0; i < written; i++) {
      write(encoder, _strBuffer[i]);
    }
  } else {
    writeVarUint8Array(encoder, encodeUtf8(str));
  }
};
var _writeVarStringPolyfill = (encoder, str) => {
  const encodedString = unescape(encodeURIComponent(str));
  const len = encodedString.length;
  writeVarUint(encoder, len);
  for (let i = 0; i < len; i++) {
    write(
      encoder,
      /** @type {number} */
      encodedString.codePointAt(i)
    );
  }
};
var writeVarString = utf8TextEncoder && /** @type {any} */
utf8TextEncoder.encodeInto ? _writeVarStringNative : _writeVarStringPolyfill;
var writeUint8Array = (encoder, uint8Array) => {
  const bufferLen = encoder.cbuf.length;
  const cpos = encoder.cpos;
  const leftCopyLen = min(bufferLen - cpos, uint8Array.length);
  const rightCopyLen = uint8Array.length - leftCopyLen;
  encoder.cbuf.set(uint8Array.subarray(0, leftCopyLen), cpos);
  encoder.cpos += leftCopyLen;
  if (rightCopyLen > 0) {
    encoder.bufs.push(encoder.cbuf);
    encoder.cbuf = new Uint8Array(max(bufferLen * 2, rightCopyLen));
    encoder.cbuf.set(uint8Array.subarray(leftCopyLen));
    encoder.cpos = rightCopyLen;
  }
};
var writeVarUint8Array = (encoder, uint8Array) => {
  writeVarUint(encoder, uint8Array.byteLength);
  writeUint8Array(encoder, uint8Array);
};
var writeOnDataView = (encoder, len) => {
  verifyLen(encoder, len);
  const dview = new DataView(encoder.cbuf.buffer, encoder.cpos, len);
  encoder.cpos += len;
  return dview;
};
var writeFloat32 = (encoder, num) => writeOnDataView(encoder, 4).setFloat32(0, num, false);
var writeFloat64 = (encoder, num) => writeOnDataView(encoder, 8).setFloat64(0, num, false);
var writeBigInt64 = (encoder, num) => (
  /** @type {any} */
  writeOnDataView(encoder, 8).setBigInt64(0, num, false)
);
var floatTestBed = new DataView(new ArrayBuffer(4));
var isFloat32 = (num) => {
  floatTestBed.setFloat32(0, num);
  return floatTestBed.getFloat32(0) === num;
};
var writeAny = (encoder, data) => {
  switch (typeof data) {
    case "string":
      write(encoder, 119);
      writeVarString(encoder, data);
      break;
    case "number":
      if (isInteger(data) && abs(data) <= BITS31) {
        write(encoder, 125);
        writeVarInt(encoder, data);
      } else if (isFloat32(data)) {
        write(encoder, 124);
        writeFloat32(encoder, data);
      } else {
        write(encoder, 123);
        writeFloat64(encoder, data);
      }
      break;
    case "bigint":
      write(encoder, 122);
      writeBigInt64(encoder, data);
      break;
    case "object":
      if (data === null) {
        write(encoder, 126);
      } else if (isArray(data)) {
        write(encoder, 117);
        writeVarUint(encoder, data.length);
        for (let i = 0; i < data.length; i++) {
          writeAny(encoder, data[i]);
        }
      } else if (data instanceof Uint8Array) {
        write(encoder, 116);
        writeVarUint8Array(encoder, data);
      } else {
        write(encoder, 118);
        const keys2 = Object.keys(data);
        writeVarUint(encoder, keys2.length);
        for (let i = 0; i < keys2.length; i++) {
          const key = keys2[i];
          writeVarString(encoder, key);
          writeAny(encoder, data[key]);
        }
      }
      break;
    case "boolean":
      write(encoder, data ? 120 : 121);
      break;
    default:
      write(encoder, 127);
  }
};
var RleEncoder = class extends Encoder {
  /**
   * @param {function(Encoder, T):void} writer
   */
  constructor(writer) {
    super();
    this.w = writer;
    this.s = null;
    this.count = 0;
  }
  /**
   * @param {T} v
   */
  write(v) {
    if (this.s === v) {
      this.count++;
    } else {
      if (this.count > 0) {
        writeVarUint(this, this.count - 1);
      }
      this.count = 1;
      this.w(this, v);
      this.s = v;
    }
  }
};
var flushUintOptRleEncoder = (encoder) => {
  if (encoder.count > 0) {
    writeVarInt(encoder.encoder, encoder.count === 1 ? encoder.s : -encoder.s);
    if (encoder.count > 1) {
      writeVarUint(encoder.encoder, encoder.count - 2);
    }
  }
};
var UintOptRleEncoder = class {
  constructor() {
    this.encoder = new Encoder();
    this.s = 0;
    this.count = 0;
  }
  /**
   * @param {number} v
   */
  write(v) {
    if (this.s === v) {
      this.count++;
    } else {
      flushUintOptRleEncoder(this);
      this.count = 1;
      this.s = v;
    }
  }
  /**
   * Flush the encoded state and transform this to a Uint8Array.
   *
   * Note that this should only be called once.
   */
  toUint8Array() {
    flushUintOptRleEncoder(this);
    return toUint8Array(this.encoder);
  }
};
var flushIntDiffOptRleEncoder = (encoder) => {
  if (encoder.count > 0) {
    const encodedDiff = encoder.diff * 2 + (encoder.count === 1 ? 0 : 1);
    writeVarInt(encoder.encoder, encodedDiff);
    if (encoder.count > 1) {
      writeVarUint(encoder.encoder, encoder.count - 2);
    }
  }
};
var IntDiffOptRleEncoder = class {
  constructor() {
    this.encoder = new Encoder();
    this.s = 0;
    this.count = 0;
    this.diff = 0;
  }
  /**
   * @param {number} v
   */
  write(v) {
    if (this.diff === v - this.s) {
      this.s = v;
      this.count++;
    } else {
      flushIntDiffOptRleEncoder(this);
      this.count = 1;
      this.diff = v - this.s;
      this.s = v;
    }
  }
  /**
   * Flush the encoded state and transform this to a Uint8Array.
   *
   * Note that this should only be called once.
   */
  toUint8Array() {
    flushIntDiffOptRleEncoder(this);
    return toUint8Array(this.encoder);
  }
};
var StringEncoder = class {
  constructor() {
    this.sarr = [];
    this.s = "";
    this.lensE = new UintOptRleEncoder();
  }
  /**
   * @param {string} string
   */
  write(string) {
    this.s += string;
    if (this.s.length > 19) {
      this.sarr.push(this.s);
      this.s = "";
    }
    this.lensE.write(string.length);
  }
  toUint8Array() {
    const encoder = new Encoder();
    this.sarr.push(this.s);
    this.s = "";
    writeVarString(encoder, this.sarr.join(""));
    writeUint8Array(encoder, this.lensE.toUint8Array());
    return toUint8Array(encoder);
  }
};

// node_modules/lib0/error.js
var create3 = (s) => new Error(s);
var methodUnimplemented = () => {
  throw create3("Method unimplemented");
};
var unexpectedCase = () => {
  throw create3("Unexpected case");
};

// node_modules/lib0/decoding.js
var errorUnexpectedEndOfArray = create3("Unexpected end of array");
var errorIntegerOutOfRange = create3("Integer out of Range");
var Decoder = class {
  /**
   * @param {Uint8Array<Buf>} uint8Array Binary data to decode
   */
  constructor(uint8Array) {
    this.arr = uint8Array;
    this.pos = 0;
  }
};
var createDecoder = (uint8Array) => new Decoder(uint8Array);
var hasContent = (decoder) => decoder.pos !== decoder.arr.length;
var readUint8Array = (decoder, len) => {
  const view = new Uint8Array(decoder.arr.buffer, decoder.pos + decoder.arr.byteOffset, len);
  decoder.pos += len;
  return view;
};
var readVarUint8Array = (decoder) => readUint8Array(decoder, readVarUint(decoder));
var readUint8 = (decoder) => decoder.arr[decoder.pos++];
var readVarUint = (decoder) => {
  let num = 0;
  let mult = 1;
  const len = decoder.arr.length;
  while (decoder.pos < len) {
    const r = decoder.arr[decoder.pos++];
    num = num + (r & BITS7) * mult;
    mult *= 128;
    if (r < BIT8) {
      return num;
    }
    if (num > MAX_SAFE_INTEGER) {
      throw errorIntegerOutOfRange;
    }
  }
  throw errorUnexpectedEndOfArray;
};
var readVarInt = (decoder) => {
  let r = decoder.arr[decoder.pos++];
  let num = r & BITS6;
  let mult = 64;
  const sign = (r & BIT7) > 0 ? -1 : 1;
  if ((r & BIT8) === 0) {
    return sign * num;
  }
  const len = decoder.arr.length;
  while (decoder.pos < len) {
    r = decoder.arr[decoder.pos++];
    num = num + (r & BITS7) * mult;
    mult *= 128;
    if (r < BIT8) {
      return sign * num;
    }
    if (num > MAX_SAFE_INTEGER) {
      throw errorIntegerOutOfRange;
    }
  }
  throw errorUnexpectedEndOfArray;
};
var _readVarStringPolyfill = (decoder) => {
  let remainingLen = readVarUint(decoder);
  if (remainingLen === 0) {
    return "";
  } else {
    let encodedString = String.fromCodePoint(readUint8(decoder));
    if (--remainingLen < 100) {
      while (remainingLen--) {
        encodedString += String.fromCodePoint(readUint8(decoder));
      }
    } else {
      while (remainingLen > 0) {
        const nextLen = remainingLen < 1e4 ? remainingLen : 1e4;
        const bytes = decoder.arr.subarray(decoder.pos, decoder.pos + nextLen);
        decoder.pos += nextLen;
        encodedString += String.fromCodePoint.apply(
          null,
          /** @type {any} */
          bytes
        );
        remainingLen -= nextLen;
      }
    }
    return decodeURIComponent(escape(encodedString));
  }
};
var _readVarStringNative = (decoder) => (
  /** @type any */
  utf8TextDecoder.decode(readVarUint8Array(decoder))
);
var readVarString = utf8TextDecoder ? _readVarStringNative : _readVarStringPolyfill;
var readFromDataView = (decoder, len) => {
  const dv = new DataView(decoder.arr.buffer, decoder.arr.byteOffset + decoder.pos, len);
  decoder.pos += len;
  return dv;
};
var readFloat32 = (decoder) => readFromDataView(decoder, 4).getFloat32(0, false);
var readFloat64 = (decoder) => readFromDataView(decoder, 8).getFloat64(0, false);
var readBigInt64 = (decoder) => (
  /** @type {any} */
  readFromDataView(decoder, 8).getBigInt64(0, false)
);
var readAnyLookupTable = [
  (decoder) => void 0,
  // CASE 127: undefined
  (decoder) => null,
  // CASE 126: null
  readVarInt,
  // CASE 125: integer
  readFloat32,
  // CASE 124: float32
  readFloat64,
  // CASE 123: float64
  readBigInt64,
  // CASE 122: bigint
  (decoder) => false,
  // CASE 121: boolean (false)
  (decoder) => true,
  // CASE 120: boolean (true)
  readVarString,
  // CASE 119: string
  (decoder) => {
    const len = readVarUint(decoder);
    const obj = {};
    for (let i = 0; i < len; i++) {
      const key = readVarString(decoder);
      obj[key] = readAny(decoder);
    }
    return obj;
  },
  (decoder) => {
    const len = readVarUint(decoder);
    const arr = [];
    for (let i = 0; i < len; i++) {
      arr.push(readAny(decoder));
    }
    return arr;
  },
  readVarUint8Array
  // CASE 116: Uint8Array
];
var readAny = (decoder) => readAnyLookupTable[127 - readUint8(decoder)](decoder);
var RleDecoder = class extends Decoder {
  /**
   * @param {Uint8Array} uint8Array
   * @param {function(Decoder):T} reader
   */
  constructor(uint8Array, reader) {
    super(uint8Array);
    this.reader = reader;
    this.s = null;
    this.count = 0;
  }
  read() {
    if (this.count === 0) {
      this.s = this.reader(this);
      if (hasContent(this)) {
        this.count = readVarUint(this) + 1;
      } else {
        this.count = -1;
      }
    }
    this.count--;
    return (
      /** @type {T} */
      this.s
    );
  }
};
var UintOptRleDecoder = class extends Decoder {
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor(uint8Array) {
    super(uint8Array);
    this.s = 0;
    this.count = 0;
  }
  read() {
    if (this.count === 0) {
      this.s = readVarInt(this);
      const isNegative = isNegativeZero(this.s);
      this.count = 1;
      if (isNegative) {
        this.s = -this.s;
        this.count = readVarUint(this) + 2;
      }
    }
    this.count--;
    return (
      /** @type {number} */
      this.s
    );
  }
};
var IntDiffOptRleDecoder = class extends Decoder {
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor(uint8Array) {
    super(uint8Array);
    this.s = 0;
    this.count = 0;
    this.diff = 0;
  }
  /**
   * @return {number}
   */
  read() {
    if (this.count === 0) {
      const diff = readVarInt(this);
      const hasCount = diff & 1;
      this.diff = floor(diff / 2);
      this.count = 1;
      if (hasCount) {
        this.count = readVarUint(this) + 2;
      }
    }
    this.s += this.diff;
    this.count--;
    return this.s;
  }
};
var StringDecoder = class {
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor(uint8Array) {
    this.decoder = new UintOptRleDecoder(uint8Array);
    this.str = readVarString(this.decoder);
    this.spos = 0;
  }
  /**
   * @return {string}
   */
  read() {
    const end = this.spos + this.decoder.read();
    const res = this.str.slice(this.spos, end);
    this.spos = end;
    return res;
  }
};

// node_modules/lib0/webcrypto.js
var subtle = crypto.subtle;
var getRandomValues = crypto.getRandomValues.bind(crypto);

// node_modules/lib0/random.js
var uint32 = () => getRandomValues(new Uint32Array(1))[0];
var uuidv4Template = "10000000-1000-4000-8000" + -1e11;
var uuidv4 = () => uuidv4Template.replace(
  /[018]/g,
  /** @param {number} c */
  (c) => (c ^ uint32() & 15 >> c / 4).toString(16)
);

// node_modules/lib0/time.js
var getUnixTime = Date.now;

// node_modules/lib0/promise.js
var create4 = (f) => (
  /** @type {Promise<T>} */
  new Promise(f)
);
var all = Promise.all.bind(Promise);

// node_modules/lib0/conditions.js
var undefinedToNull = (v) => v === void 0 ? null : v;

// node_modules/lib0/storage.js
var VarStoragePolyfill = class {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  /**
   * @param {string} key
   * @param {any} newValue
   */
  setItem(key, newValue) {
    this.map.set(key, newValue);
  }
  /**
   * @param {string} key
   */
  getItem(key) {
    return this.map.get(key);
  }
};
var _localStorage = new VarStoragePolyfill();
var usePolyfill = true;
try {
  if (typeof localStorage !== "undefined" && localStorage) {
    _localStorage = localStorage;
    usePolyfill = false;
  }
} catch (e) {
}
var varStorage = _localStorage;
var onChange = (eventHandler) => usePolyfill || addEventListener(
  "storage",
  /** @type {any} */
  eventHandler
);
var offChange = (eventHandler) => usePolyfill || removeEventListener(
  "storage",
  /** @type {any} */
  eventHandler
);

// node_modules/lib0/trait/equality.js
var EqualityTraitSymbol = Symbol("Equality");
var equals = (a, b) => {
  var _a;
  return a === b || !!((_a = a == null ? void 0 : a[EqualityTraitSymbol]) == null ? void 0 : _a.call(a, b)) || false;
};

// node_modules/lib0/object.js
var isObject = (o) => typeof o === "object";
var assign = Object.assign;
var keys = Object.keys;
var forEach = (obj, f) => {
  for (const key in obj) {
    f(obj[key], key);
  }
};
var map2 = (obj, f) => {
  const results = [];
  for (const key in obj) {
    results.push(f(obj[key], key));
  }
  return results;
};
var size = (obj) => keys(obj).length;
var isEmpty = (obj) => {
  for (const _k in obj) {
    return false;
  }
  return true;
};
var every2 = (obj, f) => {
  for (const key in obj) {
    if (!f(obj[key], key)) {
      return false;
    }
  }
  return true;
};
var hasProperty = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
var equalFlat = (a, b) => a === b || size(a) === size(b) && every2(a, (val, key) => (val !== void 0 || hasProperty(b, key)) && equals(b[key], val));
var freeze = Object.freeze;
var deepFreeze = (o) => {
  for (const key in o) {
    const c = o[key];
    if (typeof c === "object" || typeof c === "function") {
      deepFreeze(o[key]);
    }
  }
  return freeze(o);
};

// node_modules/lib0/function.js
var callAll = (fs, args2, i = 0) => {
  try {
    for (; i < fs.length; i++) {
      fs[i](...args2);
    }
  } finally {
    if (i < fs.length) {
      callAll(fs, args2, i + 1);
    }
  }
};
var id = (a) => a;
var equalityDeep = (a, b) => {
  if (a === b) {
    return true;
  }
  if (a == null || b == null || a.constructor !== b.constructor && (a.constructor || Object) !== (b.constructor || Object)) {
    return false;
  }
  if (a[EqualityTraitSymbol] != null) {
    return a[EqualityTraitSymbol](b);
  }
  switch (a.constructor) {
    case ArrayBuffer:
      a = new Uint8Array(a);
      b = new Uint8Array(b);
    // eslint-disable-next-line no-fallthrough
    case Uint8Array: {
      if (a.byteLength !== b.byteLength) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
          return false;
        }
      }
      break;
    }
    case Set: {
      if (a.size !== b.size) {
        return false;
      }
      for (const value of a) {
        if (!b.has(value)) {
          return false;
        }
      }
      break;
    }
    case Map: {
      if (a.size !== b.size) {
        return false;
      }
      for (const key of a.keys()) {
        if (!b.has(key) || !equalityDeep(a.get(key), b.get(key))) {
          return false;
        }
      }
      break;
    }
    case void 0:
    case Object:
      if (size(a) !== size(b)) {
        return false;
      }
      for (const key in a) {
        if (!hasProperty(a, key) || !equalityDeep(a[key], b[key])) {
          return false;
        }
      }
      break;
    case Array:
      if (a.length !== b.length) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (!equalityDeep(a[i], b[i])) {
          return false;
        }
      }
      break;
    default:
      return false;
  }
  return true;
};
var isOneOf = (value, options) => options.includes(value);

// node_modules/lib0/environment.js
var isNode = typeof process !== "undefined" && process.release && /node|io\.js/.test(process.release.name) && Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";
var isBrowser = typeof window !== "undefined" && typeof document !== "undefined" && !isNode;
var isMac = typeof navigator !== "undefined" ? /Mac/.test(navigator.platform) : false;
var params;
var args = [];
var computeParams = () => {
  if (params === void 0) {
    if (isNode) {
      params = create();
      const pargs = process.argv;
      let currParamName = null;
      for (let i = 0; i < pargs.length; i++) {
        const parg = pargs[i];
        if (parg[0] === "-") {
          if (currParamName !== null) {
            params.set(currParamName, "");
          }
          currParamName = parg;
        } else {
          if (currParamName !== null) {
            params.set(currParamName, parg);
            currParamName = null;
          } else {
            args.push(parg);
          }
        }
      }
      if (currParamName !== null) {
        params.set(currParamName, "");
      }
    } else if (typeof location === "object") {
      params = create();
      (location.search || "?").slice(1).split("&").forEach((kv) => {
        if (kv.length !== 0) {
          const [key, value] = kv.split("=");
          params.set(`--${fromCamelCase(key, "-")}`, value);
          params.set(`-${fromCamelCase(key, "-")}`, value);
        }
      });
    } else {
      params = create();
    }
  }
  return params;
};
var hasParam = (name) => computeParams().has(name);
var getVariable = (name) => isNode ? undefinedToNull(process.env[name.toUpperCase().replaceAll("-", "_")]) : undefinedToNull(varStorage.getItem(name));
var hasConf = (name) => hasParam("--" + name) || getVariable(name) !== null;
var production = hasConf("production");
var forceColor = isNode && isOneOf(process.env.FORCE_COLOR, ["true", "1", "2"]);
var supportsColor = forceColor || !hasParam("--no-colors") && // @todo deprecate --no-colors
!hasConf("no-color") && (!isNode || process.stdout.isTTY) && (!isNode || hasParam("--color") || getVariable("COLORTERM") !== null || (getVariable("TERM") || "").includes("color"));

// node_modules/lib0/buffer.js
var createUint8ArrayFromLen = (len) => new Uint8Array(len);
var createUint8ArrayViewFromArrayBuffer = (buffer, byteOffset, length2) => new Uint8Array(buffer, byteOffset, length2);
var createUint8ArrayFromArrayBuffer = (buffer) => new Uint8Array(buffer);
var toBase64Browser = (bytes) => {
  let s = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    s += fromCharCode(bytes[i]);
  }
  return btoa(s);
};
var toBase64Node = (bytes) => Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString("base64");
var fromBase64Browser = (s) => {
  const a = atob(s);
  const bytes = createUint8ArrayFromLen(a.length);
  for (let i = 0; i < a.length; i++) {
    bytes[i] = a.charCodeAt(i);
  }
  return bytes;
};
var fromBase64Node = (s) => {
  const buf = Buffer.from(s, "base64");
  return createUint8ArrayViewFromArrayBuffer(buf.buffer, buf.byteOffset, buf.byteLength);
};
var toBase64 = isBrowser ? toBase64Browser : toBase64Node;
var fromBase64 = isBrowser ? fromBase64Browser : fromBase64Node;
var copyUint8Array = (uint8Array) => {
  const newBuf = createUint8ArrayFromLen(uint8Array.byteLength);
  newBuf.set(uint8Array);
  return newBuf;
};

// node_modules/lib0/pair.js
var Pair = class {
  /**
   * @param {L} left
   * @param {R} right
   */
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }
};
var create5 = (left, right) => new Pair(left, right);
var forEach2 = (arr, f) => arr.forEach((p) => f(p.left, p.right));

// node_modules/lib0/prng.js
var bool = (gen) => gen.next() >= 0.5;
var int53 = (gen, min2, max2) => floor(gen.next() * (max2 + 1 - min2) + min2);
var int32 = (gen, min2, max2) => floor(gen.next() * (max2 + 1 - min2) + min2);
var int31 = (gen, min2, max2) => int32(gen, min2, max2);
var letter = (gen) => fromCharCode(int31(gen, 97, 122));
var word = (gen, minLen = 0, maxLen = 20) => {
  const len = int31(gen, minLen, maxLen);
  let str = "";
  for (let i = 0; i < len; i++) {
    str += letter(gen);
  }
  return str;
};
var oneOf = (gen, array) => array[int31(gen, 0, array.length - 1)];

// node_modules/lib0/schema.js
var schemaSymbol = Symbol("0schema");
var ValidationError = class {
  constructor() {
    this._rerrs = [];
  }
  /**
   * @param {string?} path
   * @param {string} expected
   * @param {string} has
   * @param {string?} message
   */
  extend(path, expected, has, message = null) {
    this._rerrs.push({ path, expected, has, message });
  }
  toString() {
    const s = [];
    for (let i = this._rerrs.length - 1; i > 0; i--) {
      const r = this._rerrs[i];
      s.push(repeat(" ", (this._rerrs.length - i) * 2) + `${r.path != null ? `[${r.path}] ` : ""}${r.has} doesn't match ${r.expected}. ${r.message}`);
    }
    return s.join("\n");
  }
};
var shapeExtends = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null || a.constructor !== b.constructor) return false;
  if (a[EqualityTraitSymbol]) return equals(a, b);
  if (isArray(a)) {
    return every(
      a,
      (aitem) => some(b, (bitem) => shapeExtends(aitem, bitem))
    );
  } else if (isObject(a)) {
    return every2(
      a,
      (aitem, akey) => shapeExtends(aitem, b[akey])
    );
  }
  return false;
};
var Schema = class {
  /**
   * @param {Schema<any>} other
   */
  extends(other) {
    let [a, b] = [
      /** @type {any} */
      this.shape,
      /** @type {any} */
      other.shape
    ];
    if (
      /** @type {typeof Schema<any>} */
      this.constructor._dilutes
    ) [b, a] = [a, b];
    return shapeExtends(a, b);
  }
  /**
   * Overwrite this when necessary. By default, we only check the `shape` property which every shape
   * should have.
   * @param {Schema<any>} other
   */
  equals(other) {
    return this.constructor === other.constructor && equalityDeep(this.shape, other.shape);
  }
  [schemaSymbol]() {
    return true;
  }
  /**
   * @param {object} other
   */
  [EqualityTraitSymbol](other) {
    return this.equals(
      /** @type {any} */
      other
    );
  }
  /**
   * Use `schema.validate(obj)` with a typed parameter that is already of typed to be an instance of
   * Schema. Validate will check the structure of the parameter and return true iff the instance
   * really is an instance of Schema.
   *
   * @param {T} o
   * @return {boolean}
   */
  validate(o) {
    return this.check(o);
  }
  /* c8 ignore start */
  /**
   * Similar to validate, but this method accepts untyped parameters.
   *
   * @param {any} _o
   * @param {ValidationError} [_err]
   * @return {_o is T}
   */
  check(_o, _err) {
    methodUnimplemented();
  }
  /* c8 ignore stop */
  /**
   * @type {Schema<T?>}
   */
  get nullable() {
    return $union(this, $null);
  }
  /**
   * @type {$Optional<Schema<T>>}
   */
  get optional() {
    return new $Optional(
      /** @type {Schema<T>} */
      this
    );
  }
  /**
   * Cast a variable to a specific type. Returns the casted value, or throws an exception otherwise.
   * Use this if you know that the type is of a specific type and you just want to convince the type
   * system.
   *
   * **Do not rely on these error messages!**
   * Performs an assertion check only if not in a production environment.
   *
   * @template OO
   * @param {OO} o
   * @return {Extract<OO, T> extends never ? T : (OO extends Array<never> ? T : Extract<OO,T>)}
   */
  cast(o) {
    assert(o, this);
    return (
      /** @type {any} */
      o
    );
  }
  /**
   * EXPECTO PATRONUM!! 🪄
   * This function protects against type errors. Though it may not work in the real world.
   *
   * "After all this time?"
   * "Always." - Snape, talking about type safety
   *
   * Ensures that a variable is a a specific type. Returns the value, or throws an exception if the assertion check failed.
   * Use this if you know that the type is of a specific type and you just want to convince the type
   * system.
   *
   * Can be useful when defining lambdas: `s.lambda(s.$number, s.$void).expect((n) => n + 1)`
   *
   * **Do not rely on these error messages!**
   * Performs an assertion check if not in a production environment.
   *
   * @param {T} o
   * @return {o extends T ? T : never}
   */
  expect(o) {
    assert(o, this);
    return o;
  }
};
// this.shape must not be defined on Schema. Otherwise typecheck on metatypes (e.g. $$object) won't work as expected anymore
/**
 * If true, the more things are added to the shape the more objects this schema will accept (e.g.
 * union). By default, the more objects are added, the the fewer objects this schema will accept.
 * @protected
 */
__publicField(Schema, "_dilutes", false);
var $ConstructedBy = class extends Schema {
  /**
   * @param {C} c
   * @param {((o:Instance<C>)=>boolean)|null} check
   */
  constructor(c, check) {
    super();
    this.shape = c;
    this._c = check;
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is C extends ((...args:any[]) => infer T) ? T : (C extends (new (...args:any[]) => any) ? InstanceType<C> : never)} o
   */
  check(o, err = void 0) {
    const c = (o == null ? void 0 : o.constructor) === this.shape && (this._c == null || this._c(o));
    !c && (err == null ? void 0 : err.extend(null, this.shape.name, o == null ? void 0 : o.constructor.name, (o == null ? void 0 : o.constructor) !== this.shape ? "Constructor match failed" : "Check failed"));
    return c;
  }
};
var $constructedBy = (c, check = null) => new $ConstructedBy(c, check);
var $$constructedBy = $constructedBy($ConstructedBy);
var $Custom = class extends Schema {
  /**
   * @param {(o:any) => boolean} check
   */
  constructor(check) {
    super();
    this.shape = check;
  }
  /**
   * @param {any} o
   * @param {ValidationError} err
   * @return {o is any}
   */
  check(o, err) {
    const c = this.shape(o);
    !c && (err == null ? void 0 : err.extend(null, "custom prop", o == null ? void 0 : o.constructor.name, "failed to check custom prop"));
    return c;
  }
};
var $custom = (check) => new $Custom(check);
var $$custom = $constructedBy($Custom);
var $Literal = class extends Schema {
  /**
   * @param {Array<T>} literals
   */
  constructor(literals) {
    super();
    this.shape = literals;
  }
  /**
   *
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is T}
   */
  check(o, err) {
    const c = this.shape.some((a) => a === o);
    !c && (err == null ? void 0 : err.extend(null, this.shape.join(" | "), o.toString()));
    return c;
  }
};
var $literal = (...literals) => new $Literal(literals);
var $$literal = $constructedBy($Literal);
var _regexEscape = (
  /** @type {any} */
  RegExp.escape || /** @type {(str:string) => string} */
  ((str) => str.replace(/[().|&,$^[\]]/g, (s) => "\\" + s))
);
var _schemaStringTemplateToRegex = (s) => {
  if ($string.check(s)) {
    return [_regexEscape(s)];
  }
  if ($$literal.check(s)) {
    return (
      /** @type {Array<string|number>} */
      s.shape.map((v) => v + "")
    );
  }
  if ($$number.check(s)) {
    return ["[+-]?\\d+.?\\d*"];
  }
  if ($$string.check(s)) {
    return [".*"];
  }
  if ($$union.check(s)) {
    return s.shape.map(_schemaStringTemplateToRegex).flat(1);
  }
  unexpectedCase();
};
var $StringTemplate = class extends Schema {
  /**
   * @param {T} shape
   */
  constructor(shape) {
    super();
    this.shape = shape;
    this._r = new RegExp("^" + shape.map(_schemaStringTemplateToRegex).map((opts) => `(${opts.join("|")})`).join("") + "$");
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is CastStringTemplateArgsToTemplate<T>}
   */
  check(o, err) {
    const c = this._r.exec(o) != null;
    !c && (err == null ? void 0 : err.extend(null, this._r.toString(), o.toString(), "String doesn't match string template."));
    return c;
  }
};
var $$stringTemplate = $constructedBy($StringTemplate);
var isOptionalSymbol = Symbol("optional");
var $Optional = class extends Schema {
  /**
   * @param {S} shape
   */
  constructor(shape) {
    super();
    this.shape = shape;
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is (Unwrap<S>|undefined)}
   */
  check(o, err) {
    const c = o === void 0 || this.shape.check(o);
    !c && (err == null ? void 0 : err.extend(null, "undefined (optional)", "()"));
    return c;
  }
  get [isOptionalSymbol]() {
    return true;
  }
};
var $$optional = $constructedBy($Optional);
var $Never = class extends Schema {
  /**
   * @param {any} _o
   * @param {ValidationError} [err]
   * @return {_o is never}
   */
  check(_o, err) {
    err == null ? void 0 : err.extend(null, "never", typeof _o);
    return false;
  }
};
var $never = new $Never();
var $$never = $constructedBy($Never);
var _$Object = class _$Object extends Schema {
  /**
   * @param {S} shape
   * @param {boolean} partial
   */
  constructor(shape, partial = false) {
    super();
    this.shape = shape;
    this._isPartial = partial;
  }
  /**
   * @type {Schema<Partial<$ObjectToType<S>>>}
   */
  get partial() {
    return new _$Object(this.shape, true);
  }
  /**
   * @param {any} o
   * @param {ValidationError} err
   * @return {o is $ObjectToType<S>}
   */
  check(o, err) {
    if (o == null) {
      err == null ? void 0 : err.extend(null, "object", "null");
      return false;
    }
    return every2(this.shape, (vv, vk) => {
      const c = this._isPartial && !hasProperty(o, vk) || vv.check(o[vk], err);
      !c && (err == null ? void 0 : err.extend(vk.toString(), vv.toString(), typeof o[vk], "Object property does not match"));
      return c;
    });
  }
};
__publicField(_$Object, "_dilutes", true);
var $Object = _$Object;
var $object = (def) => (
  /** @type {any} */
  new $Object(def)
);
var $$object = $constructedBy($Object);
var $objectAny = $custom((o) => o != null && (o.constructor === Object || o.constructor == null));
var $Record = class extends Schema {
  /**
   * @param {Keys} keys
   * @param {Values} values
   */
  constructor(keys2, values) {
    super();
    this.shape = {
      keys: keys2,
      values
    };
  }
  /**
   * @param {any} o
   * @param {ValidationError} err
   * @return {o is { [key in Unwrap<Keys>]: Unwrap<Values> }}
   */
  check(o, err) {
    return o != null && every2(o, (vv, vk) => {
      const ck = this.shape.keys.check(vk, err);
      !ck && (err == null ? void 0 : err.extend(vk + "", "Record", typeof o, ck ? "Key doesn't match schema" : "Value doesn't match value"));
      return ck && this.shape.values.check(vv, err);
    });
  }
};
var $record = (keys2, values) => new $Record(keys2, values);
var $$record = $constructedBy($Record);
var $Tuple = class extends Schema {
  /**
   * @param {S} shape
   */
  constructor(shape) {
    super();
    this.shape = shape;
  }
  /**
   * @param {any} o
   * @param {ValidationError} err
   * @return {o is { [K in keyof S]: S[K] extends Schema<infer Type> ? Type : never }}
   */
  check(o, err) {
    return o != null && every2(this.shape, (vv, vk) => {
      const c = (
        /** @type {Schema<any>} */
        vv.check(o[vk], err)
      );
      !c && (err == null ? void 0 : err.extend(vk.toString(), "Tuple", typeof vv));
      return c;
    });
  }
};
var $tuple = (...def) => new $Tuple(def);
var $$tuple = $constructedBy($Tuple);
var $Array = class extends Schema {
  /**
   * @param {Array<S>} v
   */
  constructor(v) {
    super();
    this.shape = v.length === 1 ? v[0] : new $Union(v);
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is Array<S extends Schema<infer T> ? T : never>} o
   */
  check(o, err) {
    const c = isArray(o) && every(o, (oi) => this.shape.check(oi));
    !c && (err == null ? void 0 : err.extend(null, "Array", ""));
    return c;
  }
};
var $array = (...def) => new $Array(def);
var $$array = $constructedBy($Array);
var $arrayAny = $custom((o) => isArray(o));
var $InstanceOf = class extends Schema {
  /**
   * @param {new (...args:any) => T} constructor
   * @param {((o:T) => boolean)|null} check
   */
  constructor(constructor, check) {
    super();
    this.shape = constructor;
    this._c = check;
  }
  /**
   * @param {any} o
   * @param {ValidationError} err
   * @return {o is T}
   */
  check(o, err) {
    const c = o instanceof this.shape && (this._c == null || this._c(o));
    !c && (err == null ? void 0 : err.extend(null, this.shape.name, o == null ? void 0 : o.constructor.name));
    return c;
  }
};
var $instanceOf = (c, check = null) => new $InstanceOf(c, check);
var $$instanceOf = $constructedBy($InstanceOf);
var $$schema = $instanceOf(Schema);
var $Lambda = class extends Schema {
  /**
   * @param {Args} args
   */
  constructor(args2) {
    super();
    this.len = args2.length - 1;
    this.args = $tuple(...args2.slice(-1));
    this.res = args2[this.len];
  }
  /**
   * @param {any} f
   * @param {ValidationError} err
   * @return {f is _LArgsToLambdaDef<Args>}
   */
  check(f, err) {
    const c = f.constructor === Function && f.length <= this.len;
    !c && (err == null ? void 0 : err.extend(null, "function", typeof f));
    return c;
  }
};
var $$lambda = $constructedBy($Lambda);
var $function = $custom((o) => typeof o === "function");
var $Intersection = class extends Schema {
  /**
   * @param {T} v
   */
  constructor(v) {
    super();
    this.shape = v;
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is Intersect<UnwrapArray<T>>}
   */
  check(o, err) {
    const c = every(this.shape, (check) => check.check(o, err));
    !c && (err == null ? void 0 : err.extend(null, "Intersectinon", typeof o));
    return c;
  }
};
var $$intersect = $constructedBy($Intersection, (o) => o.shape.length > 0);
var $Union = class extends Schema {
  /**
   * @param {Array<Schema<S>>} v
   */
  constructor(v) {
    super();
    this.shape = v;
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is S}
   */
  check(o, err) {
    const c = some(this.shape, (vv) => vv.check(o, err));
    err == null ? void 0 : err.extend(null, "Union", typeof o);
    return c;
  }
};
__publicField($Union, "_dilutes", true);
var $union = (...schemas) => schemas.findIndex(($s) => $$union.check($s)) >= 0 ? $union(...schemas.map(($s) => $($s)).map(($s) => $$union.check($s) ? $s.shape : [$s]).flat(1)) : schemas.length === 1 ? schemas[0] : new $Union(schemas);
var $$union = (
  /** @type {Schema<$Union<any>>} */
  $constructedBy($Union)
);
var _t = () => true;
var $any = $custom(_t);
var $$any = (
  /** @type {Schema<Schema<any>>} */
  $constructedBy($Custom, (o) => o.shape === _t)
);
var $bigint = $custom((o) => typeof o === "bigint");
var $$bigint = (
  /** @type {Schema<Schema<BigInt>>} */
  $custom((o) => o === $bigint)
);
var $symbol = $custom((o) => typeof o === "symbol");
var $$symbol = (
  /** @type {Schema<Schema<Symbol>>} */
  $custom((o) => o === $symbol)
);
var $number = $custom((o) => typeof o === "number");
var $$number = (
  /** @type {Schema<Schema<number>>} */
  $custom((o) => o === $number)
);
var $string = $custom((o) => typeof o === "string");
var $$string = (
  /** @type {Schema<Schema<string>>} */
  $custom((o) => o === $string)
);
var $boolean = $custom((o) => typeof o === "boolean");
var $$boolean = (
  /** @type {Schema<Schema<Boolean>>} */
  $custom((o) => o === $boolean)
);
var $undefined = $literal(void 0);
var $$undefined = (
  /** @type {Schema<Schema<undefined>>} */
  $constructedBy($Literal, (o) => o.shape.length === 1 && o.shape[0] === void 0)
);
var $void = $literal(void 0);
var $null = $literal(null);
var $$null = (
  /** @type {Schema<Schema<null>>} */
  $constructedBy($Literal, (o) => o.shape.length === 1 && o.shape[0] === null)
);
var $uint8Array = $constructedBy(Uint8Array);
var $$uint8Array = (
  /** @type {Schema<Schema<Uint8Array>>} */
  $constructedBy($ConstructedBy, (o) => o.shape === Uint8Array)
);
var $primitive = $union($number, $string, $null, $undefined, $bigint, $boolean, $symbol);
var $json = (() => {
  const $jsonArr = (
    /** @type {$Array<$any>} */
    $array($any)
  );
  const $jsonRecord = (
    /** @type {$Record<$string,$any>} */
    $record($string, $any)
  );
  const $json2 = $union($number, $string, $null, $boolean, $jsonArr, $jsonRecord);
  $jsonArr.shape = $json2;
  $jsonRecord.shape.values = $json2;
  return $json2;
})();
var $ = (o) => {
  if ($$schema.check(o)) {
    return (
      /** @type {any} */
      o
    );
  } else if ($objectAny.check(o)) {
    const o2 = {};
    for (const k in o) {
      o2[k] = $(o[k]);
    }
    return (
      /** @type {any} */
      $object(o2)
    );
  } else if ($arrayAny.check(o)) {
    return (
      /** @type {any} */
      $union(...o.map($))
    );
  } else if ($primitive.check(o)) {
    return (
      /** @type {any} */
      $literal(o)
    );
  } else if ($function.check(o)) {
    return (
      /** @type {any} */
      $constructedBy(
        /** @type {any} */
        o
      )
    );
  }
  unexpectedCase();
};
var assert = production ? () => {
} : (o, schema) => {
  const err = new ValidationError();
  if (!schema.check(o, err)) {
    throw create3(`Expected value to be of type ${schema.constructor.name}.
${err.toString()}`);
  }
};
var PatternMatcher = class {
  /**
   * @param {Schema<State>} [$state]
   */
  constructor($state) {
    this.patterns = [];
    this.$state = $state;
  }
  /**
   * @template P
   * @template R
   * @param {P} pattern
   * @param {(o:NoInfer<Unwrap<ReadSchema<P>>>,s:State)=>R} handler
   * @return {PatternMatcher<State,Patterns|Pattern<Unwrap<ReadSchema<P>>,R>>}
   */
  if(pattern, handler) {
    this.patterns.push({ if: $(pattern), h: handler });
    return this;
  }
  /**
   * @template R
   * @param {(o:any,s:State)=>R} h
   */
  else(h) {
    return this.if($any, h);
  }
  /**
   * @return {State extends undefined
   *   ? <In extends Unwrap<Patterns['if']>>(o:In,state?:undefined)=>PatternMatchResult<Patterns,In>
   *   : <In extends Unwrap<Patterns['if']>>(o:In,state:State)=>PatternMatchResult<Patterns,In>}
   */
  done() {
    return (
      /** @type {any} */
      (o, s) => {
        for (let i = 0; i < this.patterns.length; i++) {
          const p = this.patterns[i];
          if (p.if.check(o)) {
            return p.h(o, s);
          }
        }
        throw create3("Unhandled pattern");
      }
    );
  }
};
var match = (state) => new PatternMatcher(
  /** @type {any} */
  state
);
var _random = (
  /** @type {any} */
  match(
    /** @type {Schema<prng.PRNG>} */
    $any
  ).if($$number, (_o, gen) => int53(gen, MIN_SAFE_INTEGER, MAX_SAFE_INTEGER)).if($$string, (_o, gen) => word(gen)).if($$boolean, (_o, gen) => bool(gen)).if($$bigint, (_o, gen) => BigInt(int53(gen, MIN_SAFE_INTEGER, MAX_SAFE_INTEGER))).if($$union, (o, gen) => random(gen, oneOf(gen, o.shape))).if($$object, (o, gen) => {
    const res = {};
    for (const k in o.shape) {
      let prop = o.shape[k];
      if ($$optional.check(prop)) {
        if (bool(gen)) {
          continue;
        }
        prop = prop.shape;
      }
      res[k] = _random(prop, gen);
    }
    return res;
  }).if($$array, (o, gen) => {
    const arr = [];
    const n = int32(gen, 0, 42);
    for (let i = 0; i < n; i++) {
      arr.push(random(gen, o.shape));
    }
    return arr;
  }).if($$literal, (o, gen) => {
    return oneOf(gen, o.shape);
  }).if($$null, (o, gen) => {
    return null;
  }).if($$lambda, (o, gen) => {
    const res = random(gen, o.res);
    return () => res;
  }).if($$any, (o, gen) => random(gen, oneOf(gen, [
    $number,
    $string,
    $null,
    $undefined,
    $bigint,
    $boolean,
    $array($number),
    $record($union("a", "b", "c"), $number)
  ]))).if($$record, (o, gen) => {
    const res = {};
    const keysN = int53(gen, 0, 3);
    for (let i = 0; i < keysN; i++) {
      const key = random(gen, o.shape.keys);
      const val = random(gen, o.shape.values);
      res[key] = val;
    }
    return res;
  }).done()
);
var random = (gen, schema) => (
  /** @type {any} */
  _random($(schema), gen)
);

// node_modules/lib0/dom.js
var doc = (
  /** @type {Document} */
  typeof document !== "undefined" ? document : {}
);
var createElement = (name) => doc.createElement(name);
var createDocumentFragment = () => doc.createDocumentFragment();
var $fragment = $custom((el) => el.nodeType === DOCUMENT_FRAGMENT_NODE);
var createTextNode = (text2) => doc.createTextNode(text2);
var domParser = (
  /** @type {DOMParser} */
  typeof DOMParser !== "undefined" ? new DOMParser() : null
);
var setAttributes = (el, attrs) => {
  forEach2(attrs, (key, value) => {
    if (value === false) {
      el.removeAttribute(key);
    } else if (value === true) {
      el.setAttribute(key, "");
    } else {
      el.setAttribute(key, value);
    }
  });
  return el;
};
var fragment = (children) => {
  const fragment2 = createDocumentFragment();
  for (let i = 0; i < children.length; i++) {
    appendChild(fragment2, children[i]);
  }
  return fragment2;
};
var append = (parent, nodes) => {
  appendChild(parent, fragment(nodes));
  return parent;
};
var element = (name, attrs = [], children = []) => append(setAttributes(createElement(name), attrs), children);
var $element = $custom((el) => el.nodeType === ELEMENT_NODE);
var text = createTextNode;
var $text = $custom((el) => el.nodeType === TEXT_NODE);
var mapToStyleString = (m) => map(m, (value, key) => `${key}:${value};`).join("");
var appendChild = (parent, child) => parent.appendChild(child);
var ELEMENT_NODE = doc.ELEMENT_NODE;
var TEXT_NODE = doc.TEXT_NODE;
var CDATA_SECTION_NODE = doc.CDATA_SECTION_NODE;
var COMMENT_NODE = doc.COMMENT_NODE;
var DOCUMENT_NODE = doc.DOCUMENT_NODE;
var DOCUMENT_TYPE_NODE = doc.DOCUMENT_TYPE_NODE;
var DOCUMENT_FRAGMENT_NODE = doc.DOCUMENT_FRAGMENT_NODE;
var $node = $custom((el) => el.nodeType === DOCUMENT_NODE);

// node_modules/lib0/symbol.js
var create6 = Symbol;

// node_modules/lib0/logging.common.js
var BOLD = create6();
var UNBOLD = create6();
var BLUE = create6();
var GREY = create6();
var GREEN = create6();
var RED = create6();
var PURPLE = create6();
var ORANGE = create6();
var UNCOLOR = create6();
var computeNoColorLoggingArgs = (args2) => {
  var _a;
  if (args2.length === 1 && ((_a = args2[0]) == null ? void 0 : _a.constructor) === Function) {
    args2 = /** @type {Array<string|Symbol|Object|number>} */
    /** @type {[function]} */
    args2[0]();
  }
  const strBuilder = [];
  const logArgs = [];
  let i = 0;
  for (; i < args2.length; i++) {
    const arg = args2[i];
    if (arg === void 0) {
      break;
    } else if (arg.constructor === String || arg.constructor === Number) {
      strBuilder.push(arg);
    } else if (arg.constructor === Object) {
      break;
    }
  }
  if (i > 0) {
    logArgs.push(strBuilder.join(""));
  }
  for (; i < args2.length; i++) {
    const arg = args2[i];
    if (!(arg instanceof Symbol)) {
      logArgs.push(arg);
    }
  }
  return logArgs;
};
var lastLoggingTime = getUnixTime();

// node_modules/lib0/logging.js
var _browserStyleMap = {
  [BOLD]: create5("font-weight", "bold"),
  [UNBOLD]: create5("font-weight", "normal"),
  [BLUE]: create5("color", "blue"),
  [GREEN]: create5("color", "green"),
  [GREY]: create5("color", "grey"),
  [RED]: create5("color", "red"),
  [PURPLE]: create5("color", "purple"),
  [ORANGE]: create5("color", "orange"),
  // not well supported in chrome when debugging node with inspector - TODO: deprecate
  [UNCOLOR]: create5("color", "black")
};
var computeBrowserLoggingArgs = (args2) => {
  var _a;
  if (args2.length === 1 && ((_a = args2[0]) == null ? void 0 : _a.constructor) === Function) {
    args2 = /** @type {Array<string|Symbol|Object|number>} */
    /** @type {[function]} */
    args2[0]();
  }
  const strBuilder = [];
  const styles = [];
  const currentStyle = create();
  let logArgs = [];
  let i = 0;
  for (; i < args2.length; i++) {
    const arg = args2[i];
    const style = _browserStyleMap[arg];
    if (style !== void 0) {
      currentStyle.set(style.left, style.right);
    } else {
      if (arg === void 0) {
        break;
      }
      if (arg.constructor === String || arg.constructor === Number) {
        const style2 = mapToStyleString(currentStyle);
        if (i > 0 || style2.length > 0) {
          strBuilder.push("%c" + arg);
          styles.push(style2);
        } else {
          strBuilder.push(arg);
        }
      } else {
        break;
      }
    }
  }
  if (i > 0) {
    logArgs = styles;
    logArgs.unshift(strBuilder.join(""));
  }
  for (; i < args2.length; i++) {
    const arg = args2[i];
    if (!(arg instanceof Symbol)) {
      logArgs.push(arg);
    }
  }
  return logArgs;
};
var computeLoggingArgs = supportsColor ? computeBrowserLoggingArgs : computeNoColorLoggingArgs;
var print = (...args2) => {
  console.log(...computeLoggingArgs(args2));
  vconsoles.forEach((vc) => vc.print(args2));
};
var warn = (...args2) => {
  console.warn(...computeLoggingArgs(args2));
  args2.unshift(ORANGE);
  vconsoles.forEach((vc) => vc.print(args2));
};
var vconsoles = create2();

// node_modules/lib0/iterator.js
var createIterator = (next) => ({
  /**
   * @return {IterableIterator<T>}
   */
  [Symbol.iterator]() {
    return this;
  },
  // @ts-ignore
  next
});
var iteratorFilter = (iterator, filter) => createIterator(() => {
  let res;
  do {
    res = iterator.next();
  } while (!res.done && !filter(res.value));
  return res;
});
var iteratorMap = (iterator, fmap) => createIterator(() => {
  const { done, value } = iterator.next();
  return { done, value: done ? void 0 : fmap(value) };
});

// node_modules/yjs/dist/yjs.mjs
var DeleteItem = class {
  /**
   * @param {number} clock
   * @param {number} len
   */
  constructor(clock, len) {
    this.clock = clock;
    this.len = len;
  }
};
var DeleteSet = class {
  constructor() {
    this.clients = /* @__PURE__ */ new Map();
  }
};
var iterateDeletedStructs = (transaction, ds, f) => ds.clients.forEach((deletes, clientid) => {
  const structs = (
    /** @type {Array<GC|Item>} */
    transaction.doc.store.clients.get(clientid)
  );
  if (structs != null) {
    const lastStruct = structs[structs.length - 1];
    const clockState = lastStruct.id.clock + lastStruct.length;
    for (let i = 0, del = deletes[i]; i < deletes.length && del.clock < clockState; del = deletes[++i]) {
      iterateStructs(transaction, structs, del.clock, del.len, f);
    }
  }
});
var findIndexDS = (dis, clock) => {
  let left = 0;
  let right = dis.length - 1;
  while (left <= right) {
    const midindex = floor((left + right) / 2);
    const mid = dis[midindex];
    const midclock = mid.clock;
    if (midclock <= clock) {
      if (clock < midclock + mid.len) {
        return midindex;
      }
      left = midindex + 1;
    } else {
      right = midindex - 1;
    }
  }
  return null;
};
var isDeleted = (ds, id2) => {
  const dis = ds.clients.get(id2.client);
  return dis !== void 0 && findIndexDS(dis, id2.clock) !== null;
};
var sortAndMergeDeleteSet = (ds) => {
  ds.clients.forEach((dels) => {
    dels.sort((a, b) => a.clock - b.clock);
    let i, j;
    for (i = 1, j = 1; i < dels.length; i++) {
      const left = dels[j - 1];
      const right = dels[i];
      if (left.clock + left.len >= right.clock) {
        dels[j - 1] = new DeleteItem(left.clock, max(left.len, right.clock + right.len - left.clock));
      } else {
        if (j < i) {
          dels[j] = right;
        }
        j++;
      }
    }
    dels.length = j;
  });
};
var mergeDeleteSets = (dss) => {
  const merged = new DeleteSet();
  for (let dssI = 0; dssI < dss.length; dssI++) {
    dss[dssI].clients.forEach((delsLeft, client) => {
      if (!merged.clients.has(client)) {
        const dels = delsLeft.slice();
        for (let i = dssI + 1; i < dss.length; i++) {
          appendTo(dels, dss[i].clients.get(client) || []);
        }
        merged.clients.set(client, dels);
      }
    });
  }
  sortAndMergeDeleteSet(merged);
  return merged;
};
var addToDeleteSet = (ds, client, clock, length2) => {
  setIfUndefined(ds.clients, client, () => (
    /** @type {Array<DeleteItem>} */
    []
  )).push(new DeleteItem(clock, length2));
};
var createDeleteSet = () => new DeleteSet();
var createDeleteSetFromStructStore = (ss) => {
  const ds = createDeleteSet();
  ss.clients.forEach((structs, client) => {
    const dsitems = [];
    for (let i = 0; i < structs.length; i++) {
      const struct = structs[i];
      if (struct.deleted) {
        const clock = struct.id.clock;
        let len = struct.length;
        if (i + 1 < structs.length) {
          for (let next = structs[i + 1]; i + 1 < structs.length && next.deleted; next = structs[++i + 1]) {
            len += next.length;
          }
        }
        dsitems.push(new DeleteItem(clock, len));
      }
    }
    if (dsitems.length > 0) {
      ds.clients.set(client, dsitems);
    }
  });
  return ds;
};
var writeDeleteSet = (encoder, ds) => {
  writeVarUint(encoder.restEncoder, ds.clients.size);
  from(ds.clients.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, dsitems]) => {
    encoder.resetDsCurVal();
    writeVarUint(encoder.restEncoder, client);
    const len = dsitems.length;
    writeVarUint(encoder.restEncoder, len);
    for (let i = 0; i < len; i++) {
      const item = dsitems[i];
      encoder.writeDsClock(item.clock);
      encoder.writeDsLen(item.len);
    }
  });
};
var readDeleteSet = (decoder) => {
  const ds = new DeleteSet();
  const numClients = readVarUint(decoder.restDecoder);
  for (let i = 0; i < numClients; i++) {
    decoder.resetDsCurVal();
    const client = readVarUint(decoder.restDecoder);
    const numberOfDeletes = readVarUint(decoder.restDecoder);
    if (numberOfDeletes > 0) {
      const dsField = setIfUndefined(ds.clients, client, () => (
        /** @type {Array<DeleteItem>} */
        []
      ));
      for (let i2 = 0; i2 < numberOfDeletes; i2++) {
        dsField.push(new DeleteItem(decoder.readDsClock(), decoder.readDsLen()));
      }
    }
  }
  return ds;
};
var readAndApplyDeleteSet = (decoder, transaction, store) => {
  const unappliedDS = new DeleteSet();
  const numClients = readVarUint(decoder.restDecoder);
  for (let i = 0; i < numClients; i++) {
    decoder.resetDsCurVal();
    const client = readVarUint(decoder.restDecoder);
    const numberOfDeletes = readVarUint(decoder.restDecoder);
    const structs = store.clients.get(client) || [];
    const state = getState(store, client);
    for (let i2 = 0; i2 < numberOfDeletes; i2++) {
      const clock = decoder.readDsClock();
      const clockEnd = clock + decoder.readDsLen();
      if (clock < state) {
        if (state < clockEnd) {
          addToDeleteSet(unappliedDS, client, state, clockEnd - state);
        }
        let index = findIndexSS(structs, clock);
        let struct = structs[index];
        if (!struct.deleted && struct.id.clock < clock) {
          structs.splice(index + 1, 0, splitItem(transaction, struct, clock - struct.id.clock));
          index++;
        }
        while (index < structs.length) {
          struct = structs[index++];
          if (struct.id.clock < clockEnd) {
            if (!struct.deleted) {
              if (clockEnd < struct.id.clock + struct.length) {
                structs.splice(index, 0, splitItem(transaction, struct, clockEnd - struct.id.clock));
              }
              struct.delete(transaction);
            }
          } else {
            break;
          }
        }
      } else {
        addToDeleteSet(unappliedDS, client, clock, clockEnd - clock);
      }
    }
  }
  if (unappliedDS.clients.size > 0) {
    const ds = new UpdateEncoderV2();
    writeVarUint(ds.restEncoder, 0);
    writeDeleteSet(ds, unappliedDS);
    return ds.toUint8Array();
  }
  return null;
};
var generateNewClientId = uint32;
var Doc = class _Doc extends ObservableV2 {
  /**
   * @param {DocOpts} opts configuration
   */
  constructor({ guid = uuidv4(), collectionid = null, gc = true, gcFilter = () => true, meta = null, autoLoad = false, shouldLoad = true } = {}) {
    super();
    this.gc = gc;
    this.gcFilter = gcFilter;
    this.clientID = generateNewClientId();
    this.guid = guid;
    this.collectionid = collectionid;
    this.share = /* @__PURE__ */ new Map();
    this.store = new StructStore();
    this._transaction = null;
    this._transactionCleanups = [];
    this.subdocs = /* @__PURE__ */ new Set();
    this._item = null;
    this.shouldLoad = shouldLoad;
    this.autoLoad = autoLoad;
    this.meta = meta;
    this.isLoaded = false;
    this.isSynced = false;
    this.isDestroyed = false;
    this.whenLoaded = create4((resolve) => {
      this.on("load", () => {
        this.isLoaded = true;
        resolve(this);
      });
    });
    const provideSyncedPromise = () => create4((resolve) => {
      const eventHandler = (isSynced) => {
        if (isSynced === void 0 || isSynced === true) {
          this.off("sync", eventHandler);
          resolve();
        }
      };
      this.on("sync", eventHandler);
    });
    this.on("sync", (isSynced) => {
      if (isSynced === false && this.isSynced) {
        this.whenSynced = provideSyncedPromise();
      }
      this.isSynced = isSynced === void 0 || isSynced === true;
      if (this.isSynced && !this.isLoaded) {
        this.emit("load", [this]);
      }
    });
    this.whenSynced = provideSyncedPromise();
  }
  /**
   * Notify the parent document that you request to load data into this subdocument (if it is a subdocument).
   *
   * `load()` might be used in the future to request any provider to load the most current data.
   *
   * It is safe to call `load()` multiple times.
   */
  load() {
    const item = this._item;
    if (item !== null && !this.shouldLoad) {
      transact(
        /** @type {any} */
        item.parent.doc,
        (transaction) => {
          transaction.subdocsLoaded.add(this);
        },
        null,
        true
      );
    }
    this.shouldLoad = true;
  }
  getSubdocs() {
    return this.subdocs;
  }
  getSubdocGuids() {
    return new Set(from(this.subdocs).map((doc2) => doc2.guid));
  }
  /**
   * Changes that happen inside of a transaction are bundled. This means that
   * the observer fires _after_ the transaction is finished and that all changes
   * that happened inside of the transaction are sent as one message to the
   * other peers.
   *
   * @template T
   * @param {function(Transaction):T} f The function that should be executed as a transaction
   * @param {any} [origin] Origin of who started the transaction. Will be stored on transaction.origin
   * @return T
   *
   * @public
   */
  transact(f, origin = null) {
    return transact(this, f, origin);
  }
  /**
   * Define a shared data type.
   *
   * Multiple calls of `ydoc.get(name, TypeConstructor)` yield the same result
   * and do not overwrite each other. I.e.
   * `ydoc.get(name, Y.Array) === ydoc.get(name, Y.Array)`
   *
   * After this method is called, the type is also available on `ydoc.share.get(name)`.
   *
   * *Best Practices:*
   * Define all types right after the Y.Doc instance is created and store them in a separate object.
   * Also use the typed methods `getText(name)`, `getArray(name)`, ..
   *
   * @template {typeof AbstractType<any>} Type
   * @example
   *   const ydoc = new Y.Doc(..)
   *   const appState = {
   *     document: ydoc.getText('document')
   *     comments: ydoc.getArray('comments')
   *   }
   *
   * @param {string} name
   * @param {Type} TypeConstructor The constructor of the type definition. E.g. Y.Text, Y.Array, Y.Map, ...
   * @return {InstanceType<Type>} The created type. Constructed with TypeConstructor
   *
   * @public
   */
  get(name, TypeConstructor = (
    /** @type {any} */
    AbstractType
  )) {
    const type = setIfUndefined(this.share, name, () => {
      const t = new TypeConstructor();
      t._integrate(this, null);
      return t;
    });
    const Constr = type.constructor;
    if (TypeConstructor !== AbstractType && Constr !== TypeConstructor) {
      if (Constr === AbstractType) {
        const t = new TypeConstructor();
        t._map = type._map;
        type._map.forEach(
          /** @param {Item?} n */
          (n) => {
            for (; n !== null; n = n.left) {
              n.parent = t;
            }
          }
        );
        t._start = type._start;
        for (let n = t._start; n !== null; n = n.right) {
          n.parent = t;
        }
        t._length = type._length;
        this.share.set(name, t);
        t._integrate(this, null);
        return (
          /** @type {InstanceType<Type>} */
          t
        );
      } else {
        throw new Error(`Type with the name ${name} has already been defined with a different constructor`);
      }
    }
    return (
      /** @type {InstanceType<Type>} */
      type
    );
  }
  /**
   * @template T
   * @param {string} [name]
   * @return {YArray<T>}
   *
   * @public
   */
  getArray(name = "") {
    return (
      /** @type {YArray<T>} */
      this.get(name, YArray)
    );
  }
  /**
   * @param {string} [name]
   * @return {YText}
   *
   * @public
   */
  getText(name = "") {
    return this.get(name, YText);
  }
  /**
   * @template T
   * @param {string} [name]
   * @return {YMap<T>}
   *
   * @public
   */
  getMap(name = "") {
    return (
      /** @type {YMap<T>} */
      this.get(name, YMap)
    );
  }
  /**
   * @param {string} [name]
   * @return {YXmlElement}
   *
   * @public
   */
  getXmlElement(name = "") {
    return (
      /** @type {YXmlElement<{[key:string]:string}>} */
      this.get(name, YXmlElement)
    );
  }
  /**
   * @param {string} [name]
   * @return {YXmlFragment}
   *
   * @public
   */
  getXmlFragment(name = "") {
    return this.get(name, YXmlFragment);
  }
  /**
   * Converts the entire document into a js object, recursively traversing each yjs type
   * Doesn't log types that have not been defined (using ydoc.getType(..)).
   *
   * @deprecated Do not use this method and rather call toJSON directly on the shared types.
   *
   * @return {Object<string, any>}
   */
  toJSON() {
    const doc2 = {};
    this.share.forEach((value, key) => {
      doc2[key] = value.toJSON();
    });
    return doc2;
  }
  /**
   * Emit `destroy` event and unregister all event handlers.
   */
  destroy() {
    this.isDestroyed = true;
    from(this.subdocs).forEach((subdoc) => subdoc.destroy());
    const item = this._item;
    if (item !== null) {
      this._item = null;
      const content = (
        /** @type {ContentDoc} */
        item.content
      );
      content.doc = new _Doc({ guid: this.guid, ...content.opts, shouldLoad: false });
      content.doc._item = item;
      transact(
        /** @type {any} */
        item.parent.doc,
        (transaction) => {
          const doc2 = content.doc;
          if (!item.deleted) {
            transaction.subdocsAdded.add(doc2);
          }
          transaction.subdocsRemoved.add(this);
        },
        null,
        true
      );
    }
    this.emit("destroyed", [true]);
    this.emit("destroy", [this]);
    super.destroy();
  }
};
var DSDecoderV1 = class {
  /**
   * @param {decoding.Decoder} decoder
   */
  constructor(decoder) {
    this.restDecoder = decoder;
  }
  resetDsCurVal() {
  }
  /**
   * @return {number}
   */
  readDsClock() {
    return readVarUint(this.restDecoder);
  }
  /**
   * @return {number}
   */
  readDsLen() {
    return readVarUint(this.restDecoder);
  }
};
var UpdateDecoderV1 = class extends DSDecoderV1 {
  /**
   * @return {ID}
   */
  readLeftID() {
    return createID(readVarUint(this.restDecoder), readVarUint(this.restDecoder));
  }
  /**
   * @return {ID}
   */
  readRightID() {
    return createID(readVarUint(this.restDecoder), readVarUint(this.restDecoder));
  }
  /**
   * Read the next client id.
   * Use this in favor of readID whenever possible to reduce the number of objects created.
   */
  readClient() {
    return readVarUint(this.restDecoder);
  }
  /**
   * @return {number} info An unsigned 8-bit integer
   */
  readInfo() {
    return readUint8(this.restDecoder);
  }
  /**
   * @return {string}
   */
  readString() {
    return readVarString(this.restDecoder);
  }
  /**
   * @return {boolean} isKey
   */
  readParentInfo() {
    return readVarUint(this.restDecoder) === 1;
  }
  /**
   * @return {number} info An unsigned 8-bit integer
   */
  readTypeRef() {
    return readVarUint(this.restDecoder);
  }
  /**
   * Write len of a struct - well suited for Opt RLE encoder.
   *
   * @return {number} len
   */
  readLen() {
    return readVarUint(this.restDecoder);
  }
  /**
   * @return {any}
   */
  readAny() {
    return readAny(this.restDecoder);
  }
  /**
   * @return {Uint8Array}
   */
  readBuf() {
    return copyUint8Array(readVarUint8Array(this.restDecoder));
  }
  /**
   * Legacy implementation uses JSON parse. We use any-decoding in v2.
   *
   * @return {any}
   */
  readJSON() {
    return JSON.parse(readVarString(this.restDecoder));
  }
  /**
   * @return {string}
   */
  readKey() {
    return readVarString(this.restDecoder);
  }
};
var DSDecoderV2 = class {
  /**
   * @param {decoding.Decoder} decoder
   */
  constructor(decoder) {
    this.dsCurrVal = 0;
    this.restDecoder = decoder;
  }
  resetDsCurVal() {
    this.dsCurrVal = 0;
  }
  /**
   * @return {number}
   */
  readDsClock() {
    this.dsCurrVal += readVarUint(this.restDecoder);
    return this.dsCurrVal;
  }
  /**
   * @return {number}
   */
  readDsLen() {
    const diff = readVarUint(this.restDecoder) + 1;
    this.dsCurrVal += diff;
    return diff;
  }
};
var UpdateDecoderV2 = class extends DSDecoderV2 {
  /**
   * @param {decoding.Decoder} decoder
   */
  constructor(decoder) {
    super(decoder);
    this.keys = [];
    readVarUint(decoder);
    this.keyClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
    this.clientDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
    this.leftClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
    this.rightClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
    this.infoDecoder = new RleDecoder(readVarUint8Array(decoder), readUint8);
    this.stringDecoder = new StringDecoder(readVarUint8Array(decoder));
    this.parentInfoDecoder = new RleDecoder(readVarUint8Array(decoder), readUint8);
    this.typeRefDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
    this.lenDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
  }
  /**
   * @return {ID}
   */
  readLeftID() {
    return new ID(this.clientDecoder.read(), this.leftClockDecoder.read());
  }
  /**
   * @return {ID}
   */
  readRightID() {
    return new ID(this.clientDecoder.read(), this.rightClockDecoder.read());
  }
  /**
   * Read the next client id.
   * Use this in favor of readID whenever possible to reduce the number of objects created.
   */
  readClient() {
    return this.clientDecoder.read();
  }
  /**
   * @return {number} info An unsigned 8-bit integer
   */
  readInfo() {
    return (
      /** @type {number} */
      this.infoDecoder.read()
    );
  }
  /**
   * @return {string}
   */
  readString() {
    return this.stringDecoder.read();
  }
  /**
   * @return {boolean}
   */
  readParentInfo() {
    return this.parentInfoDecoder.read() === 1;
  }
  /**
   * @return {number} An unsigned 8-bit integer
   */
  readTypeRef() {
    return this.typeRefDecoder.read();
  }
  /**
   * Write len of a struct - well suited for Opt RLE encoder.
   *
   * @return {number}
   */
  readLen() {
    return this.lenDecoder.read();
  }
  /**
   * @return {any}
   */
  readAny() {
    return readAny(this.restDecoder);
  }
  /**
   * @return {Uint8Array}
   */
  readBuf() {
    return readVarUint8Array(this.restDecoder);
  }
  /**
   * This is mainly here for legacy purposes.
   *
   * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
   *
   * @return {any}
   */
  readJSON() {
    return readAny(this.restDecoder);
  }
  /**
   * @return {string}
   */
  readKey() {
    const keyClock = this.keyClockDecoder.read();
    if (keyClock < this.keys.length) {
      return this.keys[keyClock];
    } else {
      const key = this.stringDecoder.read();
      this.keys.push(key);
      return key;
    }
  }
};
var DSEncoderV1 = class {
  constructor() {
    this.restEncoder = createEncoder();
  }
  toUint8Array() {
    return toUint8Array(this.restEncoder);
  }
  resetDsCurVal() {
  }
  /**
   * @param {number} clock
   */
  writeDsClock(clock) {
    writeVarUint(this.restEncoder, clock);
  }
  /**
   * @param {number} len
   */
  writeDsLen(len) {
    writeVarUint(this.restEncoder, len);
  }
};
var UpdateEncoderV1 = class extends DSEncoderV1 {
  /**
   * @param {ID} id
   */
  writeLeftID(id2) {
    writeVarUint(this.restEncoder, id2.client);
    writeVarUint(this.restEncoder, id2.clock);
  }
  /**
   * @param {ID} id
   */
  writeRightID(id2) {
    writeVarUint(this.restEncoder, id2.client);
    writeVarUint(this.restEncoder, id2.clock);
  }
  /**
   * Use writeClient and writeClock instead of writeID if possible.
   * @param {number} client
   */
  writeClient(client) {
    writeVarUint(this.restEncoder, client);
  }
  /**
   * @param {number} info An unsigned 8-bit integer
   */
  writeInfo(info) {
    writeUint8(this.restEncoder, info);
  }
  /**
   * @param {string} s
   */
  writeString(s) {
    writeVarString(this.restEncoder, s);
  }
  /**
   * @param {boolean} isYKey
   */
  writeParentInfo(isYKey) {
    writeVarUint(this.restEncoder, isYKey ? 1 : 0);
  }
  /**
   * @param {number} info An unsigned 8-bit integer
   */
  writeTypeRef(info) {
    writeVarUint(this.restEncoder, info);
  }
  /**
   * Write len of a struct - well suited for Opt RLE encoder.
   *
   * @param {number} len
   */
  writeLen(len) {
    writeVarUint(this.restEncoder, len);
  }
  /**
   * @param {any} any
   */
  writeAny(any2) {
    writeAny(this.restEncoder, any2);
  }
  /**
   * @param {Uint8Array} buf
   */
  writeBuf(buf) {
    writeVarUint8Array(this.restEncoder, buf);
  }
  /**
   * @param {any} embed
   */
  writeJSON(embed) {
    writeVarString(this.restEncoder, JSON.stringify(embed));
  }
  /**
   * @param {string} key
   */
  writeKey(key) {
    writeVarString(this.restEncoder, key);
  }
};
var DSEncoderV2 = class {
  constructor() {
    this.restEncoder = createEncoder();
    this.dsCurrVal = 0;
  }
  toUint8Array() {
    return toUint8Array(this.restEncoder);
  }
  resetDsCurVal() {
    this.dsCurrVal = 0;
  }
  /**
   * @param {number} clock
   */
  writeDsClock(clock) {
    const diff = clock - this.dsCurrVal;
    this.dsCurrVal = clock;
    writeVarUint(this.restEncoder, diff);
  }
  /**
   * @param {number} len
   */
  writeDsLen(len) {
    if (len === 0) {
      unexpectedCase();
    }
    writeVarUint(this.restEncoder, len - 1);
    this.dsCurrVal += len;
  }
};
var UpdateEncoderV2 = class extends DSEncoderV2 {
  constructor() {
    super();
    this.keyMap = /* @__PURE__ */ new Map();
    this.keyClock = 0;
    this.keyClockEncoder = new IntDiffOptRleEncoder();
    this.clientEncoder = new UintOptRleEncoder();
    this.leftClockEncoder = new IntDiffOptRleEncoder();
    this.rightClockEncoder = new IntDiffOptRleEncoder();
    this.infoEncoder = new RleEncoder(writeUint8);
    this.stringEncoder = new StringEncoder();
    this.parentInfoEncoder = new RleEncoder(writeUint8);
    this.typeRefEncoder = new UintOptRleEncoder();
    this.lenEncoder = new UintOptRleEncoder();
  }
  toUint8Array() {
    const encoder = createEncoder();
    writeVarUint(encoder, 0);
    writeVarUint8Array(encoder, this.keyClockEncoder.toUint8Array());
    writeVarUint8Array(encoder, this.clientEncoder.toUint8Array());
    writeVarUint8Array(encoder, this.leftClockEncoder.toUint8Array());
    writeVarUint8Array(encoder, this.rightClockEncoder.toUint8Array());
    writeVarUint8Array(encoder, toUint8Array(this.infoEncoder));
    writeVarUint8Array(encoder, this.stringEncoder.toUint8Array());
    writeVarUint8Array(encoder, toUint8Array(this.parentInfoEncoder));
    writeVarUint8Array(encoder, this.typeRefEncoder.toUint8Array());
    writeVarUint8Array(encoder, this.lenEncoder.toUint8Array());
    writeUint8Array(encoder, toUint8Array(this.restEncoder));
    return toUint8Array(encoder);
  }
  /**
   * @param {ID} id
   */
  writeLeftID(id2) {
    this.clientEncoder.write(id2.client);
    this.leftClockEncoder.write(id2.clock);
  }
  /**
   * @param {ID} id
   */
  writeRightID(id2) {
    this.clientEncoder.write(id2.client);
    this.rightClockEncoder.write(id2.clock);
  }
  /**
   * @param {number} client
   */
  writeClient(client) {
    this.clientEncoder.write(client);
  }
  /**
   * @param {number} info An unsigned 8-bit integer
   */
  writeInfo(info) {
    this.infoEncoder.write(info);
  }
  /**
   * @param {string} s
   */
  writeString(s) {
    this.stringEncoder.write(s);
  }
  /**
   * @param {boolean} isYKey
   */
  writeParentInfo(isYKey) {
    this.parentInfoEncoder.write(isYKey ? 1 : 0);
  }
  /**
   * @param {number} info An unsigned 8-bit integer
   */
  writeTypeRef(info) {
    this.typeRefEncoder.write(info);
  }
  /**
   * Write len of a struct - well suited for Opt RLE encoder.
   *
   * @param {number} len
   */
  writeLen(len) {
    this.lenEncoder.write(len);
  }
  /**
   * @param {any} any
   */
  writeAny(any2) {
    writeAny(this.restEncoder, any2);
  }
  /**
   * @param {Uint8Array} buf
   */
  writeBuf(buf) {
    writeVarUint8Array(this.restEncoder, buf);
  }
  /**
   * This is mainly here for legacy purposes.
   *
   * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
   *
   * @param {any} embed
   */
  writeJSON(embed) {
    writeAny(this.restEncoder, embed);
  }
  /**
   * Property keys are often reused. For example, in y-prosemirror the key `bold` might
   * occur very often. For a 3d application, the key `position` might occur very often.
   *
   * We cache these keys in a Map and refer to them via a unique number.
   *
   * @param {string} key
   */
  writeKey(key) {
    const clock = this.keyMap.get(key);
    if (clock === void 0) {
      this.keyClockEncoder.write(this.keyClock++);
      this.stringEncoder.write(key);
    } else {
      this.keyClockEncoder.write(clock);
    }
  }
};
var writeStructs = (encoder, structs, client, clock) => {
  clock = max(clock, structs[0].id.clock);
  const startNewStructs = findIndexSS(structs, clock);
  writeVarUint(encoder.restEncoder, structs.length - startNewStructs);
  encoder.writeClient(client);
  writeVarUint(encoder.restEncoder, clock);
  const firstStruct = structs[startNewStructs];
  firstStruct.write(encoder, clock - firstStruct.id.clock);
  for (let i = startNewStructs + 1; i < structs.length; i++) {
    structs[i].write(encoder, 0);
  }
};
var writeClientsStructs = (encoder, store, _sm) => {
  const sm = /* @__PURE__ */ new Map();
  _sm.forEach((clock, client) => {
    if (getState(store, client) > clock) {
      sm.set(client, clock);
    }
  });
  getStateVector(store).forEach((_clock, client) => {
    if (!_sm.has(client)) {
      sm.set(client, 0);
    }
  });
  writeVarUint(encoder.restEncoder, sm.size);
  from(sm.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, clock]) => {
    writeStructs(
      encoder,
      /** @type {Array<GC|Item>} */
      store.clients.get(client),
      client,
      clock
    );
  });
};
var readClientsStructRefs = (decoder, doc2) => {
  const clientRefs = create();
  const numOfStateUpdates = readVarUint(decoder.restDecoder);
  for (let i = 0; i < numOfStateUpdates; i++) {
    const numberOfStructs = readVarUint(decoder.restDecoder);
    const refs = new Array(numberOfStructs);
    const client = decoder.readClient();
    let clock = readVarUint(decoder.restDecoder);
    clientRefs.set(client, { i: 0, refs });
    for (let i2 = 0; i2 < numberOfStructs; i2++) {
      const info = decoder.readInfo();
      switch (BITS5 & info) {
        case 0: {
          const len = decoder.readLen();
          refs[i2] = new GC(createID(client, clock), len);
          clock += len;
          break;
        }
        case 10: {
          const len = readVarUint(decoder.restDecoder);
          refs[i2] = new Skip(createID(client, clock), len);
          clock += len;
          break;
        }
        default: {
          const cantCopyParentInfo = (info & (BIT7 | BIT8)) === 0;
          const struct = new Item(
            createID(client, clock),
            null,
            // left
            (info & BIT8) === BIT8 ? decoder.readLeftID() : null,
            // origin
            null,
            // right
            (info & BIT7) === BIT7 ? decoder.readRightID() : null,
            // right origin
            cantCopyParentInfo ? decoder.readParentInfo() ? doc2.get(decoder.readString()) : decoder.readLeftID() : null,
            // parent
            cantCopyParentInfo && (info & BIT6) === BIT6 ? decoder.readString() : null,
            // parentSub
            readItemContent(decoder, info)
            // item content
          );
          refs[i2] = struct;
          clock += struct.length;
        }
      }
    }
  }
  return clientRefs;
};
var integrateStructs = (transaction, store, clientsStructRefs) => {
  const stack = [];
  let clientsStructRefsIds = from(clientsStructRefs.keys()).sort((a, b) => a - b);
  if (clientsStructRefsIds.length === 0) {
    return null;
  }
  const getNextStructTarget = () => {
    if (clientsStructRefsIds.length === 0) {
      return null;
    }
    let nextStructsTarget = (
      /** @type {{i:number,refs:Array<GC|Item>}} */
      clientsStructRefs.get(clientsStructRefsIds[clientsStructRefsIds.length - 1])
    );
    while (nextStructsTarget.refs.length === nextStructsTarget.i) {
      clientsStructRefsIds.pop();
      if (clientsStructRefsIds.length > 0) {
        nextStructsTarget = /** @type {{i:number,refs:Array<GC|Item>}} */
        clientsStructRefs.get(clientsStructRefsIds[clientsStructRefsIds.length - 1]);
      } else {
        return null;
      }
    }
    return nextStructsTarget;
  };
  let curStructsTarget = getNextStructTarget();
  if (curStructsTarget === null) {
    return null;
  }
  const restStructs = new StructStore();
  const missingSV = /* @__PURE__ */ new Map();
  const updateMissingSv = (client, clock) => {
    const mclock = missingSV.get(client);
    if (mclock == null || mclock > clock) {
      missingSV.set(client, clock);
    }
  };
  let stackHead = (
    /** @type {any} */
    curStructsTarget.refs[
      /** @type {any} */
      curStructsTarget.i++
    ]
  );
  const state = /* @__PURE__ */ new Map();
  const addStackToRestSS = () => {
    for (const item of stack) {
      const client = item.id.client;
      const inapplicableItems = clientsStructRefs.get(client);
      if (inapplicableItems) {
        inapplicableItems.i--;
        restStructs.clients.set(client, inapplicableItems.refs.slice(inapplicableItems.i));
        clientsStructRefs.delete(client);
        inapplicableItems.i = 0;
        inapplicableItems.refs = [];
      } else {
        restStructs.clients.set(client, [item]);
      }
      clientsStructRefsIds = clientsStructRefsIds.filter((c) => c !== client);
    }
    stack.length = 0;
  };
  while (true) {
    if (stackHead.constructor !== Skip) {
      const localClock = setIfUndefined(state, stackHead.id.client, () => getState(store, stackHead.id.client));
      const offset = localClock - stackHead.id.clock;
      if (offset < 0) {
        stack.push(stackHead);
        updateMissingSv(stackHead.id.client, stackHead.id.clock - 1);
        addStackToRestSS();
      } else {
        const missing = stackHead.getMissing(transaction, store);
        if (missing !== null) {
          stack.push(stackHead);
          const structRefs = clientsStructRefs.get(
            /** @type {number} */
            missing
          ) || { refs: [], i: 0 };
          if (structRefs.refs.length === structRefs.i) {
            updateMissingSv(
              /** @type {number} */
              missing,
              getState(store, missing)
            );
            addStackToRestSS();
          } else {
            stackHead = structRefs.refs[structRefs.i++];
            continue;
          }
        } else if (offset === 0 || offset < stackHead.length) {
          stackHead.integrate(transaction, offset);
          state.set(stackHead.id.client, stackHead.id.clock + stackHead.length);
        }
      }
    }
    if (stack.length > 0) {
      stackHead = /** @type {GC|Item} */
      stack.pop();
    } else if (curStructsTarget !== null && curStructsTarget.i < curStructsTarget.refs.length) {
      stackHead = /** @type {GC|Item} */
      curStructsTarget.refs[curStructsTarget.i++];
    } else {
      curStructsTarget = getNextStructTarget();
      if (curStructsTarget === null) {
        break;
      } else {
        stackHead = /** @type {GC|Item} */
        curStructsTarget.refs[curStructsTarget.i++];
      }
    }
  }
  if (restStructs.clients.size > 0) {
    const encoder = new UpdateEncoderV2();
    writeClientsStructs(encoder, restStructs, /* @__PURE__ */ new Map());
    writeVarUint(encoder.restEncoder, 0);
    return { missing: missingSV, update: encoder.toUint8Array() };
  }
  return null;
};
var writeStructsFromTransaction = (encoder, transaction) => writeClientsStructs(encoder, transaction.doc.store, transaction.beforeState);
var readUpdateV2 = (decoder, ydoc, transactionOrigin, structDecoder = new UpdateDecoderV2(decoder)) => transact(ydoc, (transaction) => {
  transaction.local = false;
  let retry = false;
  const doc2 = transaction.doc;
  const store = doc2.store;
  const ss = readClientsStructRefs(structDecoder, doc2);
  const restStructs = integrateStructs(transaction, store, ss);
  const pending = store.pendingStructs;
  if (pending) {
    for (const [client, clock] of pending.missing) {
      if (clock < getState(store, client)) {
        retry = true;
        break;
      }
    }
    if (restStructs) {
      for (const [client, clock] of restStructs.missing) {
        const mclock = pending.missing.get(client);
        if (mclock == null || mclock > clock) {
          pending.missing.set(client, clock);
        }
      }
      pending.update = mergeUpdatesV2([pending.update, restStructs.update]);
    }
  } else {
    store.pendingStructs = restStructs;
  }
  const dsRest = readAndApplyDeleteSet(structDecoder, transaction, store);
  if (store.pendingDs) {
    const pendingDSUpdate = new UpdateDecoderV2(createDecoder(store.pendingDs));
    readVarUint(pendingDSUpdate.restDecoder);
    const dsRest2 = readAndApplyDeleteSet(pendingDSUpdate, transaction, store);
    if (dsRest && dsRest2) {
      store.pendingDs = mergeUpdatesV2([dsRest, dsRest2]);
    } else {
      store.pendingDs = dsRest || dsRest2;
    }
  } else {
    store.pendingDs = dsRest;
  }
  if (retry) {
    const update = (
      /** @type {{update: Uint8Array}} */
      store.pendingStructs.update
    );
    store.pendingStructs = null;
    applyUpdateV2(transaction.doc, update);
  }
}, transactionOrigin, false);
var applyUpdateV2 = (ydoc, update, transactionOrigin, YDecoder = UpdateDecoderV2) => {
  const decoder = createDecoder(update);
  readUpdateV2(decoder, ydoc, transactionOrigin, new YDecoder(decoder));
};
var applyUpdate = (ydoc, update, transactionOrigin) => applyUpdateV2(ydoc, update, transactionOrigin, UpdateDecoderV1);
var writeStateAsUpdate = (encoder, doc2, targetStateVector = /* @__PURE__ */ new Map()) => {
  writeClientsStructs(encoder, doc2.store, targetStateVector);
  writeDeleteSet(encoder, createDeleteSetFromStructStore(doc2.store));
};
var encodeStateAsUpdateV2 = (doc2, encodedTargetStateVector = new Uint8Array([0]), encoder = new UpdateEncoderV2()) => {
  const targetStateVector = decodeStateVector(encodedTargetStateVector);
  writeStateAsUpdate(encoder, doc2, targetStateVector);
  const updates = [encoder.toUint8Array()];
  if (doc2.store.pendingDs) {
    updates.push(doc2.store.pendingDs);
  }
  if (doc2.store.pendingStructs) {
    updates.push(diffUpdateV2(doc2.store.pendingStructs.update, encodedTargetStateVector));
  }
  if (updates.length > 1) {
    if (encoder.constructor === UpdateEncoderV1) {
      return mergeUpdates(updates.map((update, i) => i === 0 ? update : convertUpdateFormatV2ToV1(update)));
    } else if (encoder.constructor === UpdateEncoderV2) {
      return mergeUpdatesV2(updates);
    }
  }
  return updates[0];
};
var encodeStateAsUpdate = (doc2, encodedTargetStateVector) => encodeStateAsUpdateV2(doc2, encodedTargetStateVector, new UpdateEncoderV1());
var readStateVector = (decoder) => {
  const ss = /* @__PURE__ */ new Map();
  const ssLength = readVarUint(decoder.restDecoder);
  for (let i = 0; i < ssLength; i++) {
    const client = readVarUint(decoder.restDecoder);
    const clock = readVarUint(decoder.restDecoder);
    ss.set(client, clock);
  }
  return ss;
};
var decodeStateVector = (decodedState) => readStateVector(new DSDecoderV1(createDecoder(decodedState)));
var writeStateVector = (encoder, sv) => {
  writeVarUint(encoder.restEncoder, sv.size);
  from(sv.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, clock]) => {
    writeVarUint(encoder.restEncoder, client);
    writeVarUint(encoder.restEncoder, clock);
  });
  return encoder;
};
var writeDocumentStateVector = (encoder, doc2) => writeStateVector(encoder, getStateVector(doc2.store));
var encodeStateVectorV2 = (doc2, encoder = new DSEncoderV2()) => {
  if (doc2 instanceof Map) {
    writeStateVector(encoder, doc2);
  } else {
    writeDocumentStateVector(encoder, doc2);
  }
  return encoder.toUint8Array();
};
var encodeStateVector = (doc2) => encodeStateVectorV2(doc2, new DSEncoderV1());
var EventHandler = class {
  constructor() {
    this.l = [];
  }
};
var createEventHandler = () => new EventHandler();
var addEventHandlerListener = (eventHandler, f) => eventHandler.l.push(f);
var removeEventHandlerListener = (eventHandler, f) => {
  const l = eventHandler.l;
  const len = l.length;
  eventHandler.l = l.filter((g) => f !== g);
  if (len === eventHandler.l.length) {
    console.error("[yjs] Tried to remove event handler that doesn't exist.");
  }
};
var callEventHandlerListeners = (eventHandler, arg0, arg1) => callAll(eventHandler.l, [arg0, arg1]);
var ID = class {
  /**
   * @param {number} client client id
   * @param {number} clock unique per client id, continuous number
   */
  constructor(client, clock) {
    this.client = client;
    this.clock = clock;
  }
};
var compareIDs = (a, b) => a === b || a !== null && b !== null && a.client === b.client && a.clock === b.clock;
var createID = (client, clock) => new ID(client, clock);
var findRootTypeKey = (type) => {
  for (const [key, value] of type.doc.share.entries()) {
    if (value === type) {
      return key;
    }
  }
  throw unexpectedCase();
};
var isParentOf = (parent, child) => {
  while (child !== null) {
    if (child.parent === parent) {
      return true;
    }
    child = /** @type {AbstractType<any>} */
    child.parent._item;
  }
  return false;
};
var RelativePosition = class {
  /**
   * @param {ID|null} type
   * @param {string|null} tname
   * @param {ID|null} item
   * @param {number} assoc
   */
  constructor(type, tname, item, assoc = 0) {
    this.type = type;
    this.tname = tname;
    this.item = item;
    this.assoc = assoc;
  }
};
var relativePositionToJSON = (rpos) => {
  const json = {};
  if (rpos.type) {
    json.type = rpos.type;
  }
  if (rpos.tname) {
    json.tname = rpos.tname;
  }
  if (rpos.item) {
    json.item = rpos.item;
  }
  if (rpos.assoc != null) {
    json.assoc = rpos.assoc;
  }
  return json;
};
var createRelativePositionFromJSON = (json) => {
  var _a;
  return new RelativePosition(json.type == null ? null : createID(json.type.client, json.type.clock), (_a = json.tname) != null ? _a : null, json.item == null ? null : createID(json.item.client, json.item.clock), json.assoc == null ? 0 : json.assoc);
};
var AbsolutePosition = class {
  /**
   * @param {AbstractType<any>} type
   * @param {number} index
   * @param {number} [assoc]
   */
  constructor(type, index, assoc = 0) {
    this.type = type;
    this.index = index;
    this.assoc = assoc;
  }
};
var createAbsolutePosition = (type, index, assoc = 0) => new AbsolutePosition(type, index, assoc);
var createRelativePosition = (type, item, assoc) => {
  let typeid = null;
  let tname = null;
  if (type._item === null) {
    tname = findRootTypeKey(type);
  } else {
    typeid = createID(type._item.id.client, type._item.id.clock);
  }
  return new RelativePosition(typeid, tname, item, assoc);
};
var createRelativePositionFromTypeIndex = (type, index, assoc = 0) => {
  let t = type._start;
  if (assoc < 0) {
    if (index === 0) {
      return createRelativePosition(type, null, assoc);
    }
    index--;
  }
  while (t !== null) {
    if (!t.deleted && t.countable) {
      if (t.length > index) {
        return createRelativePosition(type, createID(t.id.client, t.id.clock + index), assoc);
      }
      index -= t.length;
    }
    if (t.right === null && assoc < 0) {
      return createRelativePosition(type, t.lastId, assoc);
    }
    t = t.right;
  }
  return createRelativePosition(type, null, assoc);
};
var getItemWithOffset = (store, id2) => {
  const item = getItem(store, id2);
  const diff = id2.clock - item.id.clock;
  return {
    item,
    diff
  };
};
var createAbsolutePositionFromRelativePosition = (rpos, doc2, followUndoneDeletions = true) => {
  const store = doc2.store;
  const rightID = rpos.item;
  const typeID = rpos.type;
  const tname = rpos.tname;
  const assoc = rpos.assoc;
  let type = null;
  let index = 0;
  if (rightID !== null) {
    if (getState(store, rightID.client) <= rightID.clock) {
      return null;
    }
    const res = followUndoneDeletions ? followRedone(store, rightID) : getItemWithOffset(store, rightID);
    const right = res.item;
    if (!(right instanceof Item)) {
      return null;
    }
    type = /** @type {AbstractType<any>} */
    right.parent;
    if (type._item === null || !type._item.deleted) {
      index = right.deleted || !right.countable ? 0 : res.diff + (assoc >= 0 ? 0 : 1);
      let n = right.left;
      while (n !== null) {
        if (!n.deleted && n.countable) {
          index += n.length;
        }
        n = n.left;
      }
    }
  } else {
    if (tname !== null) {
      type = doc2.get(tname);
    } else if (typeID !== null) {
      if (getState(store, typeID.client) <= typeID.clock) {
        return null;
      }
      const { item } = followUndoneDeletions ? followRedone(store, typeID) : { item: getItem(store, typeID) };
      if (item instanceof Item && item.content instanceof ContentType) {
        type = item.content.type;
      } else {
        return null;
      }
    } else {
      throw unexpectedCase();
    }
    if (assoc >= 0) {
      index = type._length;
    } else {
      index = 0;
    }
  }
  return createAbsolutePosition(type, index, rpos.assoc);
};
var compareRelativePositions = (a, b) => a === b || a !== null && b !== null && a.tname === b.tname && compareIDs(a.item, b.item) && compareIDs(a.type, b.type) && a.assoc === b.assoc;
var Snapshot = class {
  /**
   * @param {DeleteSet} ds
   * @param {Map<number,number>} sv state map
   */
  constructor(ds, sv) {
    this.ds = ds;
    this.sv = sv;
  }
};
var createSnapshot = (ds, sm) => new Snapshot(ds, sm);
var emptySnapshot = createSnapshot(createDeleteSet(), /* @__PURE__ */ new Map());
var isVisible = (item, snapshot) => snapshot === void 0 ? !item.deleted : snapshot.sv.has(item.id.client) && (snapshot.sv.get(item.id.client) || 0) > item.id.clock && !isDeleted(snapshot.ds, item.id);
var splitSnapshotAffectedStructs = (transaction, snapshot) => {
  const meta = setIfUndefined(transaction.meta, splitSnapshotAffectedStructs, create2);
  const store = transaction.doc.store;
  if (!meta.has(snapshot)) {
    snapshot.sv.forEach((clock, client) => {
      if (clock < getState(store, client)) {
        getItemCleanStart(transaction, createID(client, clock));
      }
    });
    iterateDeletedStructs(transaction, snapshot.ds, (_item) => {
    });
    meta.add(snapshot);
  }
};
var StructStore = class {
  constructor() {
    this.clients = /* @__PURE__ */ new Map();
    this.pendingStructs = null;
    this.pendingDs = null;
  }
};
var getStateVector = (store) => {
  const sm = /* @__PURE__ */ new Map();
  store.clients.forEach((structs, client) => {
    const struct = structs[structs.length - 1];
    sm.set(client, struct.id.clock + struct.length);
  });
  return sm;
};
var getState = (store, client) => {
  const structs = store.clients.get(client);
  if (structs === void 0) {
    return 0;
  }
  const lastStruct = structs[structs.length - 1];
  return lastStruct.id.clock + lastStruct.length;
};
var addStruct = (store, struct) => {
  let structs = store.clients.get(struct.id.client);
  if (structs === void 0) {
    structs = [];
    store.clients.set(struct.id.client, structs);
  } else {
    const lastStruct = structs[structs.length - 1];
    if (lastStruct.id.clock + lastStruct.length !== struct.id.clock) {
      throw unexpectedCase();
    }
  }
  structs.push(struct);
};
var findIndexSS = (structs, clock) => {
  let left = 0;
  let right = structs.length - 1;
  let mid = structs[right];
  let midclock = mid.id.clock;
  if (midclock === clock) {
    return right;
  }
  let midindex = floor(clock / (midclock + mid.length - 1) * right);
  while (left <= right) {
    mid = structs[midindex];
    midclock = mid.id.clock;
    if (midclock <= clock) {
      if (clock < midclock + mid.length) {
        return midindex;
      }
      left = midindex + 1;
    } else {
      right = midindex - 1;
    }
    midindex = floor((left + right) / 2);
  }
  throw unexpectedCase();
};
var find = (store, id2) => {
  const structs = store.clients.get(id2.client);
  return structs[findIndexSS(structs, id2.clock)];
};
var getItem = (
  /** @type {function(StructStore,ID):Item} */
  find
);
var findIndexCleanStart = (transaction, structs, clock) => {
  const index = findIndexSS(structs, clock);
  const struct = structs[index];
  if (struct.id.clock < clock && struct instanceof Item) {
    structs.splice(index + 1, 0, splitItem(transaction, struct, clock - struct.id.clock));
    return index + 1;
  }
  return index;
};
var getItemCleanStart = (transaction, id2) => {
  const structs = (
    /** @type {Array<Item>} */
    transaction.doc.store.clients.get(id2.client)
  );
  return structs[findIndexCleanStart(transaction, structs, id2.clock)];
};
var getItemCleanEnd = (transaction, store, id2) => {
  const structs = store.clients.get(id2.client);
  const index = findIndexSS(structs, id2.clock);
  const struct = structs[index];
  if (id2.clock !== struct.id.clock + struct.length - 1 && struct.constructor !== GC) {
    structs.splice(index + 1, 0, splitItem(transaction, struct, id2.clock - struct.id.clock + 1));
  }
  return struct;
};
var replaceStruct = (store, struct, newStruct) => {
  const structs = (
    /** @type {Array<GC|Item>} */
    store.clients.get(struct.id.client)
  );
  structs[findIndexSS(structs, struct.id.clock)] = newStruct;
};
var iterateStructs = (transaction, structs, clockStart, len, f) => {
  if (len === 0) {
    return;
  }
  const clockEnd = clockStart + len;
  let index = findIndexCleanStart(transaction, structs, clockStart);
  let struct;
  do {
    struct = structs[index++];
    if (clockEnd < struct.id.clock + struct.length) {
      findIndexCleanStart(transaction, structs, clockEnd);
    }
    f(struct);
  } while (index < structs.length && structs[index].id.clock < clockEnd);
};
var Transaction = class {
  /**
   * @param {Doc} doc
   * @param {any} origin
   * @param {boolean} local
   */
  constructor(doc2, origin, local) {
    this.doc = doc2;
    this.deleteSet = new DeleteSet();
    this.beforeState = getStateVector(doc2.store);
    this.afterState = /* @__PURE__ */ new Map();
    this.changed = /* @__PURE__ */ new Map();
    this.changedParentTypes = /* @__PURE__ */ new Map();
    this._mergeStructs = [];
    this.origin = origin;
    this.meta = /* @__PURE__ */ new Map();
    this.local = local;
    this.subdocsAdded = /* @__PURE__ */ new Set();
    this.subdocsRemoved = /* @__PURE__ */ new Set();
    this.subdocsLoaded = /* @__PURE__ */ new Set();
    this._needFormattingCleanup = false;
  }
};
var writeUpdateMessageFromTransaction = (encoder, transaction) => {
  if (transaction.deleteSet.clients.size === 0 && !any(transaction.afterState, (clock, client) => transaction.beforeState.get(client) !== clock)) {
    return false;
  }
  sortAndMergeDeleteSet(transaction.deleteSet);
  writeStructsFromTransaction(encoder, transaction);
  writeDeleteSet(encoder, transaction.deleteSet);
  return true;
};
var addChangedTypeToTransaction = (transaction, type, parentSub) => {
  const item = type._item;
  if (item === null || item.id.clock < (transaction.beforeState.get(item.id.client) || 0) && !item.deleted) {
    setIfUndefined(transaction.changed, type, create2).add(parentSub);
  }
};
var tryToMergeWithLefts = (structs, pos) => {
  let right = structs[pos];
  let left = structs[pos - 1];
  let i = pos;
  for (; i > 0; right = left, left = structs[--i - 1]) {
    if (left.deleted === right.deleted && left.constructor === right.constructor) {
      if (left.mergeWith(right)) {
        if (right instanceof Item && right.parentSub !== null && /** @type {AbstractType<any>} */
        right.parent._map.get(right.parentSub) === right) {
          right.parent._map.set(
            right.parentSub,
            /** @type {Item} */
            left
          );
        }
        continue;
      }
    }
    break;
  }
  const merged = pos - i;
  if (merged) {
    structs.splice(pos + 1 - merged, merged);
  }
  return merged;
};
var tryGcDeleteSet = (ds, store, gcFilter) => {
  for (const [client, deleteItems] of ds.clients.entries()) {
    const structs = (
      /** @type {Array<GC|Item>} */
      store.clients.get(client)
    );
    for (let di = deleteItems.length - 1; di >= 0; di--) {
      const deleteItem = deleteItems[di];
      const endDeleteItemClock = deleteItem.clock + deleteItem.len;
      for (let si = findIndexSS(structs, deleteItem.clock), struct = structs[si]; si < structs.length && struct.id.clock < endDeleteItemClock; struct = structs[++si]) {
        const struct2 = structs[si];
        if (deleteItem.clock + deleteItem.len <= struct2.id.clock) {
          break;
        }
        if (struct2 instanceof Item && struct2.deleted && !struct2.keep && gcFilter(struct2)) {
          struct2.gc(store, false);
        }
      }
    }
  }
};
var tryMergeDeleteSet = (ds, store) => {
  ds.clients.forEach((deleteItems, client) => {
    const structs = (
      /** @type {Array<GC|Item>} */
      store.clients.get(client)
    );
    for (let di = deleteItems.length - 1; di >= 0; di--) {
      const deleteItem = deleteItems[di];
      const mostRightIndexToCheck = min(structs.length - 1, 1 + findIndexSS(structs, deleteItem.clock + deleteItem.len - 1));
      for (let si = mostRightIndexToCheck, struct = structs[si]; si > 0 && struct.id.clock >= deleteItem.clock; struct = structs[si]) {
        si -= 1 + tryToMergeWithLefts(structs, si);
      }
    }
  });
};
var cleanupTransactions = (transactionCleanups, i) => {
  if (i < transactionCleanups.length) {
    const transaction = transactionCleanups[i];
    const doc2 = transaction.doc;
    const store = doc2.store;
    const ds = transaction.deleteSet;
    const mergeStructs = transaction._mergeStructs;
    try {
      sortAndMergeDeleteSet(ds);
      transaction.afterState = getStateVector(transaction.doc.store);
      doc2.emit("beforeObserverCalls", [transaction, doc2]);
      const fs = [];
      transaction.changed.forEach(
        (subs, itemtype) => fs.push(() => {
          if (itemtype._item === null || !itemtype._item.deleted) {
            itemtype._callObserver(transaction, subs);
          }
        })
      );
      fs.push(() => {
        transaction.changedParentTypes.forEach((events, type) => {
          if (type._dEH.l.length > 0 && (type._item === null || !type._item.deleted)) {
            events = events.filter(
              (event) => event.target._item === null || !event.target._item.deleted
            );
            events.forEach((event) => {
              event.currentTarget = type;
              event._path = null;
            });
            events.sort((event1, event2) => event1.path.length - event2.path.length);
            fs.push(() => {
              callEventHandlerListeners(type._dEH, events, transaction);
            });
          }
        });
        fs.push(() => doc2.emit("afterTransaction", [transaction, doc2]));
        fs.push(() => {
          if (transaction._needFormattingCleanup) {
            cleanupYTextAfterTransaction(transaction);
          }
        });
      });
      callAll(fs, []);
    } finally {
      if (doc2.gc) {
        tryGcDeleteSet(ds, store, doc2.gcFilter);
      }
      tryMergeDeleteSet(ds, store);
      transaction.afterState.forEach((clock, client) => {
        const beforeClock = transaction.beforeState.get(client) || 0;
        if (beforeClock !== clock) {
          const structs = (
            /** @type {Array<GC|Item>} */
            store.clients.get(client)
          );
          const firstChangePos = max(findIndexSS(structs, beforeClock), 1);
          for (let i2 = structs.length - 1; i2 >= firstChangePos; ) {
            i2 -= 1 + tryToMergeWithLefts(structs, i2);
          }
        }
      });
      for (let i2 = mergeStructs.length - 1; i2 >= 0; i2--) {
        const { client, clock } = mergeStructs[i2].id;
        const structs = (
          /** @type {Array<GC|Item>} */
          store.clients.get(client)
        );
        const replacedStructPos = findIndexSS(structs, clock);
        if (replacedStructPos + 1 < structs.length) {
          if (tryToMergeWithLefts(structs, replacedStructPos + 1) > 1) {
            continue;
          }
        }
        if (replacedStructPos > 0) {
          tryToMergeWithLefts(structs, replacedStructPos);
        }
      }
      if (!transaction.local && transaction.afterState.get(doc2.clientID) !== transaction.beforeState.get(doc2.clientID)) {
        print(ORANGE, BOLD, "[yjs] ", UNBOLD, RED, "Changed the client-id because another client seems to be using it.");
        doc2.clientID = generateNewClientId();
      }
      doc2.emit("afterTransactionCleanup", [transaction, doc2]);
      if (doc2._observers.has("update")) {
        const encoder = new UpdateEncoderV1();
        const hasContent2 = writeUpdateMessageFromTransaction(encoder, transaction);
        if (hasContent2) {
          doc2.emit("update", [encoder.toUint8Array(), transaction.origin, doc2, transaction]);
        }
      }
      if (doc2._observers.has("updateV2")) {
        const encoder = new UpdateEncoderV2();
        const hasContent2 = writeUpdateMessageFromTransaction(encoder, transaction);
        if (hasContent2) {
          doc2.emit("updateV2", [encoder.toUint8Array(), transaction.origin, doc2, transaction]);
        }
      }
      const { subdocsAdded, subdocsLoaded, subdocsRemoved } = transaction;
      if (subdocsAdded.size > 0 || subdocsRemoved.size > 0 || subdocsLoaded.size > 0) {
        subdocsAdded.forEach((subdoc) => {
          subdoc.clientID = doc2.clientID;
          if (subdoc.collectionid == null) {
            subdoc.collectionid = doc2.collectionid;
          }
          doc2.subdocs.add(subdoc);
        });
        subdocsRemoved.forEach((subdoc) => doc2.subdocs.delete(subdoc));
        doc2.emit("subdocs", [{ loaded: subdocsLoaded, added: subdocsAdded, removed: subdocsRemoved }, doc2, transaction]);
        subdocsRemoved.forEach((subdoc) => subdoc.destroy());
      }
      if (transactionCleanups.length <= i + 1) {
        doc2._transactionCleanups = [];
        doc2.emit("afterAllTransactions", [doc2, transactionCleanups]);
      } else {
        cleanupTransactions(transactionCleanups, i + 1);
      }
    }
  }
};
var transact = (doc2, f, origin = null, local = true) => {
  const transactionCleanups = doc2._transactionCleanups;
  let initialCall = false;
  let result = null;
  if (doc2._transaction === null) {
    initialCall = true;
    doc2._transaction = new Transaction(doc2, origin, local);
    transactionCleanups.push(doc2._transaction);
    if (transactionCleanups.length === 1) {
      doc2.emit("beforeAllTransactions", [doc2]);
    }
    doc2.emit("beforeTransaction", [doc2._transaction, doc2]);
  }
  try {
    result = f(doc2._transaction);
  } finally {
    if (initialCall) {
      const finishCleanup = doc2._transaction === transactionCleanups[0];
      doc2._transaction = null;
      if (finishCleanup) {
        cleanupTransactions(transactionCleanups, 0);
      }
    }
  }
  return result;
};
var StackItem = class {
  /**
   * @param {DeleteSet} deletions
   * @param {DeleteSet} insertions
   */
  constructor(deletions, insertions) {
    this.insertions = insertions;
    this.deletions = deletions;
    this.meta = /* @__PURE__ */ new Map();
  }
};
var clearUndoManagerStackItem = (tr, um, stackItem) => {
  iterateDeletedStructs(tr, stackItem.deletions, (item) => {
    if (item instanceof Item && um.scope.some((type) => type === tr.doc || isParentOf(
      /** @type {AbstractType<any>} */
      type,
      item
    ))) {
      keepItem(item, false);
    }
  });
};
var popStackItem = (undoManager, stack, eventType) => {
  let _tr = null;
  const doc2 = undoManager.doc;
  const scope = undoManager.scope;
  transact(doc2, (transaction) => {
    while (stack.length > 0 && undoManager.currStackItem === null) {
      const store = doc2.store;
      const stackItem = (
        /** @type {StackItem} */
        stack.pop()
      );
      const itemsToRedo = /* @__PURE__ */ new Set();
      const itemsToDelete = [];
      let performedChange = false;
      iterateDeletedStructs(transaction, stackItem.insertions, (struct) => {
        if (struct instanceof Item) {
          if (struct.redone !== null) {
            let { item, diff } = followRedone(store, struct.id);
            if (diff > 0) {
              item = getItemCleanStart(transaction, createID(item.id.client, item.id.clock + diff));
            }
            struct = item;
          }
          if (!struct.deleted && scope.some((type) => type === transaction.doc || isParentOf(
            /** @type {AbstractType<any>} */
            type,
            /** @type {Item} */
            struct
          ))) {
            itemsToDelete.push(struct);
          }
        }
      });
      iterateDeletedStructs(transaction, stackItem.deletions, (struct) => {
        if (struct instanceof Item && scope.some((type) => type === transaction.doc || isParentOf(
          /** @type {AbstractType<any>} */
          type,
          struct
        )) && // Never redo structs in stackItem.insertions because they were created and deleted in the same capture interval.
        !isDeleted(stackItem.insertions, struct.id)) {
          itemsToRedo.add(struct);
        }
      });
      itemsToRedo.forEach((struct) => {
        performedChange = redoItem(transaction, struct, itemsToRedo, stackItem.insertions, undoManager.ignoreRemoteMapChanges, undoManager) !== null || performedChange;
      });
      for (let i = itemsToDelete.length - 1; i >= 0; i--) {
        const item = itemsToDelete[i];
        if (undoManager.deleteFilter(item)) {
          item.delete(transaction);
          performedChange = true;
        }
      }
      undoManager.currStackItem = performedChange ? stackItem : null;
    }
    transaction.changed.forEach((subProps, type) => {
      if (subProps.has(null) && type._searchMarker) {
        type._searchMarker.length = 0;
      }
    });
    _tr = transaction;
  }, undoManager);
  const res = undoManager.currStackItem;
  if (res != null) {
    const changedParentTypes = _tr.changedParentTypes;
    undoManager.emit("stack-item-popped", [{ stackItem: res, type: eventType, changedParentTypes, origin: undoManager }, undoManager]);
    undoManager.currStackItem = null;
  }
  return res;
};
var UndoManager = class extends ObservableV2 {
  /**
   * @param {Doc|AbstractType<any>|Array<AbstractType<any>>} typeScope Limits the scope of the UndoManager. If this is set to a ydoc instance, all changes on that ydoc will be undone. If set to a specific type, only changes on that type or its children will be undone. Also accepts an array of types.
   * @param {UndoManagerOptions} options
   */
  constructor(typeScope, {
    captureTimeout = 500,
    captureTransaction = (_tr) => true,
    deleteFilter = () => true,
    trackedOrigins = /* @__PURE__ */ new Set([null]),
    ignoreRemoteMapChanges = false,
    doc: doc2 = (
      /** @type {Doc} */
      isArray(typeScope) ? typeScope[0].doc : typeScope instanceof Doc ? typeScope : typeScope.doc
    )
  } = {}) {
    super();
    this.scope = [];
    this.doc = doc2;
    this.addToScope(typeScope);
    this.deleteFilter = deleteFilter;
    trackedOrigins.add(this);
    this.trackedOrigins = trackedOrigins;
    this.captureTransaction = captureTransaction;
    this.undoStack = [];
    this.redoStack = [];
    this.undoing = false;
    this.redoing = false;
    this.currStackItem = null;
    this.lastChange = 0;
    this.ignoreRemoteMapChanges = ignoreRemoteMapChanges;
    this.captureTimeout = captureTimeout;
    this.afterTransactionHandler = (transaction) => {
      if (!this.captureTransaction(transaction) || !this.scope.some((type) => transaction.changedParentTypes.has(
        /** @type {AbstractType<any>} */
        type
      ) || type === this.doc) || !this.trackedOrigins.has(transaction.origin) && (!transaction.origin || !this.trackedOrigins.has(transaction.origin.constructor))) {
        return;
      }
      const undoing = this.undoing;
      const redoing = this.redoing;
      const stack = undoing ? this.redoStack : this.undoStack;
      if (undoing) {
        this.stopCapturing();
      } else if (!redoing) {
        this.clear(false, true);
      }
      const insertions = new DeleteSet();
      transaction.afterState.forEach((endClock, client) => {
        const startClock = transaction.beforeState.get(client) || 0;
        const len = endClock - startClock;
        if (len > 0) {
          addToDeleteSet(insertions, client, startClock, len);
        }
      });
      const now = getUnixTime();
      let didAdd = false;
      if (this.lastChange > 0 && now - this.lastChange < this.captureTimeout && stack.length > 0 && !undoing && !redoing) {
        const lastOp = stack[stack.length - 1];
        lastOp.deletions = mergeDeleteSets([lastOp.deletions, transaction.deleteSet]);
        lastOp.insertions = mergeDeleteSets([lastOp.insertions, insertions]);
      } else {
        stack.push(new StackItem(transaction.deleteSet, insertions));
        didAdd = true;
      }
      if (!undoing && !redoing) {
        this.lastChange = now;
      }
      iterateDeletedStructs(
        transaction,
        transaction.deleteSet,
        /** @param {Item|GC} item */
        (item) => {
          if (item instanceof Item && this.scope.some((type) => type === transaction.doc || isParentOf(
            /** @type {AbstractType<any>} */
            type,
            item
          ))) {
            keepItem(item, true);
          }
        }
      );
      const changeEvent = [{ stackItem: stack[stack.length - 1], origin: transaction.origin, type: undoing ? "redo" : "undo", changedParentTypes: transaction.changedParentTypes }, this];
      if (didAdd) {
        this.emit("stack-item-added", changeEvent);
      } else {
        this.emit("stack-item-updated", changeEvent);
      }
    };
    this.doc.on("afterTransaction", this.afterTransactionHandler);
    this.doc.on("destroy", () => {
      this.destroy();
    });
  }
  /**
   * Extend the scope.
   *
   * @param {Array<AbstractType<any> | Doc> | AbstractType<any> | Doc} ytypes
   */
  addToScope(ytypes) {
    const tmpSet = new Set(this.scope);
    ytypes = isArray(ytypes) ? ytypes : [ytypes];
    ytypes.forEach((ytype) => {
      if (!tmpSet.has(ytype)) {
        tmpSet.add(ytype);
        if (ytype instanceof AbstractType ? ytype.doc !== this.doc : ytype !== this.doc) warn("[yjs#509] Not same Y.Doc");
        this.scope.push(ytype);
      }
    });
  }
  /**
   * @param {any} origin
   */
  addTrackedOrigin(origin) {
    this.trackedOrigins.add(origin);
  }
  /**
   * @param {any} origin
   */
  removeTrackedOrigin(origin) {
    this.trackedOrigins.delete(origin);
  }
  clear(clearUndoStack = true, clearRedoStack = true) {
    if (clearUndoStack && this.canUndo() || clearRedoStack && this.canRedo()) {
      this.doc.transact((tr) => {
        if (clearUndoStack) {
          this.undoStack.forEach((item) => clearUndoManagerStackItem(tr, this, item));
          this.undoStack = [];
        }
        if (clearRedoStack) {
          this.redoStack.forEach((item) => clearUndoManagerStackItem(tr, this, item));
          this.redoStack = [];
        }
        this.emit("stack-cleared", [{ undoStackCleared: clearUndoStack, redoStackCleared: clearRedoStack }]);
      });
    }
  }
  /**
   * UndoManager merges Undo-StackItem if they are created within time-gap
   * smaller than `options.captureTimeout`. Call `um.stopCapturing()` so that the next
   * StackItem won't be merged.
   *
   *
   * @example
   *     // without stopCapturing
   *     ytext.insert(0, 'a')
   *     ytext.insert(1, 'b')
   *     um.undo()
   *     ytext.toString() // => '' (note that 'ab' was removed)
   *     // with stopCapturing
   *     ytext.insert(0, 'a')
   *     um.stopCapturing()
   *     ytext.insert(0, 'b')
   *     um.undo()
   *     ytext.toString() // => 'a' (note that only 'b' was removed)
   *
   */
  stopCapturing() {
    this.lastChange = 0;
  }
  /**
   * Undo last changes on type.
   *
   * @return {StackItem?} Returns StackItem if a change was applied
   */
  undo() {
    this.undoing = true;
    let res;
    try {
      res = popStackItem(this, this.undoStack, "undo");
    } finally {
      this.undoing = false;
    }
    return res;
  }
  /**
   * Redo last undo operation.
   *
   * @return {StackItem?} Returns StackItem if a change was applied
   */
  redo() {
    this.redoing = true;
    let res;
    try {
      res = popStackItem(this, this.redoStack, "redo");
    } finally {
      this.redoing = false;
    }
    return res;
  }
  /**
   * Are undo steps available?
   *
   * @return {boolean} `true` if undo is possible
   */
  canUndo() {
    return this.undoStack.length > 0;
  }
  /**
   * Are redo steps available?
   *
   * @return {boolean} `true` if redo is possible
   */
  canRedo() {
    return this.redoStack.length > 0;
  }
  destroy() {
    this.trackedOrigins.delete(this);
    this.doc.off("afterTransaction", this.afterTransactionHandler);
    super.destroy();
  }
};
function* lazyStructReaderGenerator(decoder) {
  const numOfStateUpdates = readVarUint(decoder.restDecoder);
  for (let i = 0; i < numOfStateUpdates; i++) {
    const numberOfStructs = readVarUint(decoder.restDecoder);
    const client = decoder.readClient();
    let clock = readVarUint(decoder.restDecoder);
    for (let i2 = 0; i2 < numberOfStructs; i2++) {
      const info = decoder.readInfo();
      if (info === 10) {
        const len = readVarUint(decoder.restDecoder);
        yield new Skip(createID(client, clock), len);
        clock += len;
      } else if ((BITS5 & info) !== 0) {
        const cantCopyParentInfo = (info & (BIT7 | BIT8)) === 0;
        const struct = new Item(
          createID(client, clock),
          null,
          // left
          (info & BIT8) === BIT8 ? decoder.readLeftID() : null,
          // origin
          null,
          // right
          (info & BIT7) === BIT7 ? decoder.readRightID() : null,
          // right origin
          // @ts-ignore Force writing a string here.
          cantCopyParentInfo ? decoder.readParentInfo() ? decoder.readString() : decoder.readLeftID() : null,
          // parent
          cantCopyParentInfo && (info & BIT6) === BIT6 ? decoder.readString() : null,
          // parentSub
          readItemContent(decoder, info)
          // item content
        );
        yield struct;
        clock += struct.length;
      } else {
        const len = decoder.readLen();
        yield new GC(createID(client, clock), len);
        clock += len;
      }
    }
  }
}
var LazyStructReader = class {
  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @param {boolean} filterSkips
   */
  constructor(decoder, filterSkips) {
    this.gen = lazyStructReaderGenerator(decoder);
    this.curr = null;
    this.done = false;
    this.filterSkips = filterSkips;
    this.next();
  }
  /**
   * @return {Item | GC | Skip |null}
   */
  next() {
    do {
      this.curr = this.gen.next().value || null;
    } while (this.filterSkips && this.curr !== null && this.curr.constructor === Skip);
    return this.curr;
  }
};
var LazyStructWriter = class {
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  constructor(encoder) {
    this.currClient = 0;
    this.startClock = 0;
    this.written = 0;
    this.encoder = encoder;
    this.clientStructs = [];
  }
};
var mergeUpdates = (updates) => mergeUpdatesV2(updates, UpdateDecoderV1, UpdateEncoderV1);
var sliceStruct = (left, diff) => {
  if (left.constructor === GC) {
    const { client, clock } = left.id;
    return new GC(createID(client, clock + diff), left.length - diff);
  } else if (left.constructor === Skip) {
    const { client, clock } = left.id;
    return new Skip(createID(client, clock + diff), left.length - diff);
  } else {
    const leftItem = (
      /** @type {Item} */
      left
    );
    const { client, clock } = leftItem.id;
    return new Item(
      createID(client, clock + diff),
      null,
      createID(client, clock + diff - 1),
      null,
      leftItem.rightOrigin,
      leftItem.parent,
      leftItem.parentSub,
      leftItem.content.splice(diff)
    );
  }
};
var mergeUpdatesV2 = (updates, YDecoder = UpdateDecoderV2, YEncoder = UpdateEncoderV2) => {
  if (updates.length === 1) {
    return updates[0];
  }
  const updateDecoders = updates.map((update) => new YDecoder(createDecoder(update)));
  let lazyStructDecoders = updateDecoders.map((decoder) => new LazyStructReader(decoder, true));
  let currWrite = null;
  const updateEncoder = new YEncoder();
  const lazyStructEncoder = new LazyStructWriter(updateEncoder);
  while (true) {
    lazyStructDecoders = lazyStructDecoders.filter((dec) => dec.curr !== null);
    lazyStructDecoders.sort(
      /** @type {function(any,any):number} */
      (dec1, dec2) => {
        if (dec1.curr.id.client === dec2.curr.id.client) {
          const clockDiff = dec1.curr.id.clock - dec2.curr.id.clock;
          if (clockDiff === 0) {
            return dec1.curr.constructor === dec2.curr.constructor ? 0 : dec1.curr.constructor === Skip ? 1 : -1;
          } else {
            return clockDiff;
          }
        } else {
          return dec2.curr.id.client - dec1.curr.id.client;
        }
      }
    );
    if (lazyStructDecoders.length === 0) {
      break;
    }
    const currDecoder = lazyStructDecoders[0];
    const firstClient = (
      /** @type {Item | GC} */
      currDecoder.curr.id.client
    );
    if (currWrite !== null) {
      let curr = (
        /** @type {Item | GC | null} */
        currDecoder.curr
      );
      let iterated = false;
      while (curr !== null && curr.id.clock + curr.length <= currWrite.struct.id.clock + currWrite.struct.length && curr.id.client >= currWrite.struct.id.client) {
        curr = currDecoder.next();
        iterated = true;
      }
      if (curr === null || // current decoder is empty
      curr.id.client !== firstClient || // check whether there is another decoder that has has updates from `firstClient`
      iterated && curr.id.clock > currWrite.struct.id.clock + currWrite.struct.length) {
        continue;
      }
      if (firstClient !== currWrite.struct.id.client) {
        writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
        currWrite = { struct: curr, offset: 0 };
        currDecoder.next();
      } else {
        if (currWrite.struct.id.clock + currWrite.struct.length < curr.id.clock) {
          if (currWrite.struct.constructor === Skip) {
            currWrite.struct.length = curr.id.clock + curr.length - currWrite.struct.id.clock;
          } else {
            writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
            const diff = curr.id.clock - currWrite.struct.id.clock - currWrite.struct.length;
            const struct = new Skip(createID(firstClient, currWrite.struct.id.clock + currWrite.struct.length), diff);
            currWrite = { struct, offset: 0 };
          }
        } else {
          const diff = currWrite.struct.id.clock + currWrite.struct.length - curr.id.clock;
          if (diff > 0) {
            if (currWrite.struct.constructor === Skip) {
              currWrite.struct.length -= diff;
            } else {
              curr = sliceStruct(curr, diff);
            }
          }
          if (!currWrite.struct.mergeWith(
            /** @type {any} */
            curr
          )) {
            writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
            currWrite = { struct: curr, offset: 0 };
            currDecoder.next();
          }
        }
      }
    } else {
      currWrite = { struct: (
        /** @type {Item | GC} */
        currDecoder.curr
      ), offset: 0 };
      currDecoder.next();
    }
    for (let next = currDecoder.curr; next !== null && next.id.client === firstClient && next.id.clock === currWrite.struct.id.clock + currWrite.struct.length && next.constructor !== Skip; next = currDecoder.next()) {
      writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
      currWrite = { struct: next, offset: 0 };
    }
  }
  if (currWrite !== null) {
    writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
    currWrite = null;
  }
  finishLazyStructWriting(lazyStructEncoder);
  const dss = updateDecoders.map((decoder) => readDeleteSet(decoder));
  const ds = mergeDeleteSets(dss);
  writeDeleteSet(updateEncoder, ds);
  return updateEncoder.toUint8Array();
};
var diffUpdateV2 = (update, sv, YDecoder = UpdateDecoderV2, YEncoder = UpdateEncoderV2) => {
  const state = decodeStateVector(sv);
  const encoder = new YEncoder();
  const lazyStructWriter = new LazyStructWriter(encoder);
  const decoder = new YDecoder(createDecoder(update));
  const reader = new LazyStructReader(decoder, false);
  while (reader.curr) {
    const curr = reader.curr;
    const currClient = curr.id.client;
    const svClock = state.get(currClient) || 0;
    if (reader.curr.constructor === Skip) {
      reader.next();
      continue;
    }
    if (curr.id.clock + curr.length > svClock) {
      writeStructToLazyStructWriter(lazyStructWriter, curr, max(svClock - curr.id.clock, 0));
      reader.next();
      while (reader.curr && reader.curr.id.client === currClient) {
        writeStructToLazyStructWriter(lazyStructWriter, reader.curr, 0);
        reader.next();
      }
    } else {
      while (reader.curr && reader.curr.id.client === currClient && reader.curr.id.clock + reader.curr.length <= svClock) {
        reader.next();
      }
    }
  }
  finishLazyStructWriting(lazyStructWriter);
  const ds = readDeleteSet(decoder);
  writeDeleteSet(encoder, ds);
  return encoder.toUint8Array();
};
var flushLazyStructWriter = (lazyWriter) => {
  if (lazyWriter.written > 0) {
    lazyWriter.clientStructs.push({ written: lazyWriter.written, restEncoder: toUint8Array(lazyWriter.encoder.restEncoder) });
    lazyWriter.encoder.restEncoder = createEncoder();
    lazyWriter.written = 0;
  }
};
var writeStructToLazyStructWriter = (lazyWriter, struct, offset) => {
  if (lazyWriter.written > 0 && lazyWriter.currClient !== struct.id.client) {
    flushLazyStructWriter(lazyWriter);
  }
  if (lazyWriter.written === 0) {
    lazyWriter.currClient = struct.id.client;
    lazyWriter.encoder.writeClient(struct.id.client);
    writeVarUint(lazyWriter.encoder.restEncoder, struct.id.clock + offset);
  }
  struct.write(lazyWriter.encoder, offset);
  lazyWriter.written++;
};
var finishLazyStructWriting = (lazyWriter) => {
  flushLazyStructWriter(lazyWriter);
  const restEncoder = lazyWriter.encoder.restEncoder;
  writeVarUint(restEncoder, lazyWriter.clientStructs.length);
  for (let i = 0; i < lazyWriter.clientStructs.length; i++) {
    const partStructs = lazyWriter.clientStructs[i];
    writeVarUint(restEncoder, partStructs.written);
    writeUint8Array(restEncoder, partStructs.restEncoder);
  }
};
var convertUpdateFormat = (update, blockTransformer, YDecoder, YEncoder) => {
  const updateDecoder = new YDecoder(createDecoder(update));
  const lazyDecoder = new LazyStructReader(updateDecoder, false);
  const updateEncoder = new YEncoder();
  const lazyWriter = new LazyStructWriter(updateEncoder);
  for (let curr = lazyDecoder.curr; curr !== null; curr = lazyDecoder.next()) {
    writeStructToLazyStructWriter(lazyWriter, blockTransformer(curr), 0);
  }
  finishLazyStructWriting(lazyWriter);
  const ds = readDeleteSet(updateDecoder);
  writeDeleteSet(updateEncoder, ds);
  return updateEncoder.toUint8Array();
};
var convertUpdateFormatV2ToV1 = (update) => convertUpdateFormat(update, id, UpdateDecoderV2, UpdateEncoderV1);
var errorComputeChanges = "You must not compute changes after the event-handler fired.";
var YEvent = class {
  /**
   * @param {T} target The changed type.
   * @param {Transaction} transaction
   */
  constructor(target, transaction) {
    this.target = target;
    this.currentTarget = target;
    this.transaction = transaction;
    this._changes = null;
    this._keys = null;
    this._delta = null;
    this._path = null;
  }
  /**
   * Computes the path from `y` to the changed type.
   *
   * @todo v14 should standardize on path: Array<{parent, index}> because that is easier to work with.
   *
   * The following property holds:
   * @example
   *   let type = y
   *   event.path.forEach(dir => {
   *     type = type.get(dir)
   *   })
   *   type === event.target // => true
   */
  get path() {
    return this._path || (this._path = getPathTo(this.currentTarget, this.target));
  }
  /**
   * Check if a struct is deleted by this event.
   *
   * In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
   *
   * @param {AbstractStruct} struct
   * @return {boolean}
   */
  deletes(struct) {
    return isDeleted(this.transaction.deleteSet, struct.id);
  }
  /**
   * @type {Map<string, { action: 'add' | 'update' | 'delete', oldValue: any }>}
   */
  get keys() {
    if (this._keys === null) {
      if (this.transaction.doc._transactionCleanups.length === 0) {
        throw create3(errorComputeChanges);
      }
      const keys2 = /* @__PURE__ */ new Map();
      const target = this.target;
      const changed = (
        /** @type Set<string|null> */
        this.transaction.changed.get(target)
      );
      changed.forEach((key) => {
        if (key !== null) {
          const item = (
            /** @type {Item} */
            target._map.get(key)
          );
          let action;
          let oldValue;
          if (this.adds(item)) {
            let prev = item.left;
            while (prev !== null && this.adds(prev)) {
              prev = prev.left;
            }
            if (this.deletes(item)) {
              if (prev !== null && this.deletes(prev)) {
                action = "delete";
                oldValue = last(prev.content.getContent());
              } else {
                return;
              }
            } else {
              if (prev !== null && this.deletes(prev)) {
                action = "update";
                oldValue = last(prev.content.getContent());
              } else {
                action = "add";
                oldValue = void 0;
              }
            }
          } else {
            if (this.deletes(item)) {
              action = "delete";
              oldValue = last(
                /** @type {Item} */
                item.content.getContent()
              );
            } else {
              return;
            }
          }
          keys2.set(key, { action, oldValue });
        }
      });
      this._keys = keys2;
    }
    return this._keys;
  }
  /**
   * This is a computed property. Note that this can only be safely computed during the
   * event call. Computing this property after other changes happened might result in
   * unexpected behavior (incorrect computation of deltas). A safe way to collect changes
   * is to store the `changes` or the `delta` object. Avoid storing the `transaction` object.
   *
   * @type {Array<{insert?: string | Array<any> | object | AbstractType<any>, retain?: number, delete?: number, attributes?: Object<string, any>}>}
   */
  get delta() {
    return this.changes.delta;
  }
  /**
   * Check if a struct is added by this event.
   *
   * In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
   *
   * @param {AbstractStruct} struct
   * @return {boolean}
   */
  adds(struct) {
    return struct.id.clock >= (this.transaction.beforeState.get(struct.id.client) || 0);
  }
  /**
   * This is a computed property. Note that this can only be safely computed during the
   * event call. Computing this property after other changes happened might result in
   * unexpected behavior (incorrect computation of deltas). A safe way to collect changes
   * is to store the `changes` or the `delta` object. Avoid storing the `transaction` object.
   *
   * @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string, delete?:number, retain?:number}>}}
   */
  get changes() {
    let changes = this._changes;
    if (changes === null) {
      if (this.transaction.doc._transactionCleanups.length === 0) {
        throw create3(errorComputeChanges);
      }
      const target = this.target;
      const added = create2();
      const deleted = create2();
      const delta = [];
      changes = {
        added,
        deleted,
        delta,
        keys: this.keys
      };
      const changed = (
        /** @type Set<string|null> */
        this.transaction.changed.get(target)
      );
      if (changed.has(null)) {
        let lastOp = null;
        const packOp = () => {
          if (lastOp) {
            delta.push(lastOp);
          }
        };
        for (let item = target._start; item !== null; item = item.right) {
          if (item.deleted) {
            if (this.deletes(item) && !this.adds(item)) {
              if (lastOp === null || lastOp.delete === void 0) {
                packOp();
                lastOp = { delete: 0 };
              }
              lastOp.delete += item.length;
              deleted.add(item);
            }
          } else {
            if (this.adds(item)) {
              if (lastOp === null || lastOp.insert === void 0) {
                packOp();
                lastOp = { insert: [] };
              }
              lastOp.insert = lastOp.insert.concat(item.content.getContent());
              added.add(item);
            } else {
              if (lastOp === null || lastOp.retain === void 0) {
                packOp();
                lastOp = { retain: 0 };
              }
              lastOp.retain += item.length;
            }
          }
        }
        if (lastOp !== null && lastOp.retain === void 0) {
          packOp();
        }
      }
      this._changes = changes;
    }
    return (
      /** @type {any} */
      changes
    );
  }
};
var getPathTo = (parent, child) => {
  const path = [];
  while (child._item !== null && child !== parent) {
    if (child._item.parentSub !== null) {
      path.unshift(child._item.parentSub);
    } else {
      let i = 0;
      let c = (
        /** @type {AbstractType<any>} */
        child._item.parent._start
      );
      while (c !== child._item && c !== null) {
        if (!c.deleted && c.countable) {
          i += c.length;
        }
        c = c.right;
      }
      path.unshift(i);
    }
    child = /** @type {AbstractType<any>} */
    child._item.parent;
  }
  return path;
};
var warnPrematureAccess = () => {
  warn("Invalid access: Add Yjs type to a document before reading data.");
};
var maxSearchMarker = 80;
var globalSearchMarkerTimestamp = 0;
var ArraySearchMarker = class {
  /**
   * @param {Item} p
   * @param {number} index
   */
  constructor(p, index) {
    p.marker = true;
    this.p = p;
    this.index = index;
    this.timestamp = globalSearchMarkerTimestamp++;
  }
};
var refreshMarkerTimestamp = (marker) => {
  marker.timestamp = globalSearchMarkerTimestamp++;
};
var overwriteMarker = (marker, p, index) => {
  marker.p.marker = false;
  marker.p = p;
  p.marker = true;
  marker.index = index;
  marker.timestamp = globalSearchMarkerTimestamp++;
};
var markPosition = (searchMarker, p, index) => {
  if (searchMarker.length >= maxSearchMarker) {
    const marker = searchMarker.reduce((a, b) => a.timestamp < b.timestamp ? a : b);
    overwriteMarker(marker, p, index);
    return marker;
  } else {
    const pm = new ArraySearchMarker(p, index);
    searchMarker.push(pm);
    return pm;
  }
};
var findMarker = (yarray, index) => {
  if (yarray._start === null || index === 0 || yarray._searchMarker === null) {
    return null;
  }
  const marker = yarray._searchMarker.length === 0 ? null : yarray._searchMarker.reduce((a, b) => abs(index - a.index) < abs(index - b.index) ? a : b);
  let p = yarray._start;
  let pindex = 0;
  if (marker !== null) {
    p = marker.p;
    pindex = marker.index;
    refreshMarkerTimestamp(marker);
  }
  while (p.right !== null && pindex < index) {
    if (!p.deleted && p.countable) {
      if (index < pindex + p.length) {
        break;
      }
      pindex += p.length;
    }
    p = p.right;
  }
  while (p.left !== null && pindex > index) {
    p = p.left;
    if (!p.deleted && p.countable) {
      pindex -= p.length;
    }
  }
  while (p.left !== null && p.left.id.client === p.id.client && p.left.id.clock + p.left.length === p.id.clock) {
    p = p.left;
    if (!p.deleted && p.countable) {
      pindex -= p.length;
    }
  }
  if (marker !== null && abs(marker.index - pindex) < /** @type {YText|YArray<any>} */
  p.parent.length / maxSearchMarker) {
    overwriteMarker(marker, p, pindex);
    return marker;
  } else {
    return markPosition(yarray._searchMarker, p, pindex);
  }
};
var updateMarkerChanges = (searchMarker, index, len) => {
  for (let i = searchMarker.length - 1; i >= 0; i--) {
    const m = searchMarker[i];
    if (len > 0) {
      let p = m.p;
      p.marker = false;
      while (p && (p.deleted || !p.countable)) {
        p = p.left;
        if (p && !p.deleted && p.countable) {
          m.index -= p.length;
        }
      }
      if (p === null || p.marker === true) {
        searchMarker.splice(i, 1);
        continue;
      }
      m.p = p;
      p.marker = true;
    }
    if (index < m.index || len > 0 && index === m.index) {
      m.index = max(index, m.index + len);
    }
  }
};
var callTypeObservers = (type, transaction, event) => {
  const changedType = type;
  const changedParentTypes = transaction.changedParentTypes;
  while (true) {
    setIfUndefined(changedParentTypes, type, () => []).push(event);
    if (type._item === null) {
      break;
    }
    type = /** @type {AbstractType<any>} */
    type._item.parent;
  }
  callEventHandlerListeners(changedType._eH, event, transaction);
};
var AbstractType = class {
  constructor() {
    this._item = null;
    this._map = /* @__PURE__ */ new Map();
    this._start = null;
    this.doc = null;
    this._length = 0;
    this._eH = createEventHandler();
    this._dEH = createEventHandler();
    this._searchMarker = null;
  }
  /**
   * @return {AbstractType<any>|null}
   */
  get parent() {
    return this._item ? (
      /** @type {AbstractType<any>} */
      this._item.parent
    ) : null;
  }
  /**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item|null} item
   */
  _integrate(y, item) {
    this.doc = y;
    this._item = item;
  }
  /**
   * @return {AbstractType<EventType>}
   */
  _copy() {
    throw methodUnimplemented();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {AbstractType<EventType>}
   */
  clone() {
    throw methodUnimplemented();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} _encoder
   */
  _write(_encoder) {
  }
  /**
   * The first non-deleted item
   */
  get _first() {
    let n = this._start;
    while (n !== null && n.deleted) {
      n = n.right;
    }
    return n;
  }
  /**
   * Creates YEvent and calls all type observers.
   * Must be implemented by each type.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} _parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(transaction, _parentSubs) {
    if (!transaction.local && this._searchMarker) {
      this._searchMarker.length = 0;
    }
  }
  /**
   * Observe all events that are created on this type.
   *
   * @param {function(EventType, Transaction):void} f Observer function
   */
  observe(f) {
    addEventHandlerListener(this._eH, f);
  }
  /**
   * Observe all events that are created by this type and its children.
   *
   * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
   */
  observeDeep(f) {
    addEventHandlerListener(this._dEH, f);
  }
  /**
   * Unregister an observer function.
   *
   * @param {function(EventType,Transaction):void} f Observer function
   */
  unobserve(f) {
    removeEventHandlerListener(this._eH, f);
  }
  /**
   * Unregister an observer function.
   *
   * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
   */
  unobserveDeep(f) {
    removeEventHandlerListener(this._dEH, f);
  }
  /**
   * @abstract
   * @return {any}
   */
  toJSON() {
  }
};
var typeListSlice = (type, start, end) => {
  var _a;
  (_a = type.doc) != null ? _a : warnPrematureAccess();
  if (start < 0) {
    start = type._length + start;
  }
  if (end < 0) {
    end = type._length + end;
  }
  let len = end - start;
  const cs = [];
  let n = type._start;
  while (n !== null && len > 0) {
    if (n.countable && !n.deleted) {
      const c = n.content.getContent();
      if (c.length <= start) {
        start -= c.length;
      } else {
        for (let i = start; i < c.length && len > 0; i++) {
          cs.push(c[i]);
          len--;
        }
        start = 0;
      }
    }
    n = n.right;
  }
  return cs;
};
var typeListToArray = (type) => {
  var _a;
  (_a = type.doc) != null ? _a : warnPrematureAccess();
  const cs = [];
  let n = type._start;
  while (n !== null) {
    if (n.countable && !n.deleted) {
      const c = n.content.getContent();
      for (let i = 0; i < c.length; i++) {
        cs.push(c[i]);
      }
    }
    n = n.right;
  }
  return cs;
};
var typeListForEach = (type, f) => {
  var _a;
  let index = 0;
  let n = type._start;
  (_a = type.doc) != null ? _a : warnPrematureAccess();
  while (n !== null) {
    if (n.countable && !n.deleted) {
      const c = n.content.getContent();
      for (let i = 0; i < c.length; i++) {
        f(c[i], index++, type);
      }
    }
    n = n.right;
  }
};
var typeListMap = (type, f) => {
  const result = [];
  typeListForEach(type, (c, i) => {
    result.push(f(c, i, type));
  });
  return result;
};
var typeListCreateIterator = (type) => {
  let n = type._start;
  let currentContent = null;
  let currentContentIndex = 0;
  return {
    [Symbol.iterator]() {
      return this;
    },
    next: () => {
      if (currentContent === null) {
        while (n !== null && n.deleted) {
          n = n.right;
        }
        if (n === null) {
          return {
            done: true,
            value: void 0
          };
        }
        currentContent = n.content.getContent();
        currentContentIndex = 0;
        n = n.right;
      }
      const value = currentContent[currentContentIndex++];
      if (currentContent.length <= currentContentIndex) {
        currentContent = null;
      }
      return {
        done: false,
        value
      };
    }
  };
};
var typeListGet = (type, index) => {
  var _a;
  (_a = type.doc) != null ? _a : warnPrematureAccess();
  const marker = findMarker(type, index);
  let n = type._start;
  if (marker !== null) {
    n = marker.p;
    index -= marker.index;
  }
  for (; n !== null; n = n.right) {
    if (!n.deleted && n.countable) {
      if (index < n.length) {
        return n.content.getContent()[index];
      }
      index -= n.length;
    }
  }
};
var typeListInsertGenericsAfter = (transaction, parent, referenceItem, content) => {
  let left = referenceItem;
  const doc2 = transaction.doc;
  const ownClientId = doc2.clientID;
  const store = doc2.store;
  const right = referenceItem === null ? parent._start : referenceItem.right;
  let jsonContent = [];
  const packJsonContent = () => {
    if (jsonContent.length > 0) {
      left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentAny(jsonContent));
      left.integrate(transaction, 0);
      jsonContent = [];
    }
  };
  content.forEach((c) => {
    if (c === null) {
      jsonContent.push(c);
    } else {
      switch (c.constructor) {
        case Number:
        case Object:
        case Boolean:
        case Array:
        case String:
          jsonContent.push(c);
          break;
        default:
          packJsonContent();
          switch (c.constructor) {
            case Uint8Array:
            case ArrayBuffer:
              left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentBinary(new Uint8Array(
                /** @type {Uint8Array} */
                c
              )));
              left.integrate(transaction, 0);
              break;
            case Doc:
              left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentDoc(
                /** @type {Doc} */
                c
              ));
              left.integrate(transaction, 0);
              break;
            default:
              if (c instanceof AbstractType) {
                left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentType(c));
                left.integrate(transaction, 0);
              } else {
                throw new Error("Unexpected content type in insert operation");
              }
          }
      }
    }
  });
  packJsonContent();
};
var lengthExceeded = () => create3("Length exceeded!");
var typeListInsertGenerics = (transaction, parent, index, content) => {
  if (index > parent._length) {
    throw lengthExceeded();
  }
  if (index === 0) {
    if (parent._searchMarker) {
      updateMarkerChanges(parent._searchMarker, index, content.length);
    }
    return typeListInsertGenericsAfter(transaction, parent, null, content);
  }
  const startIndex = index;
  const marker = findMarker(parent, index);
  let n = parent._start;
  if (marker !== null) {
    n = marker.p;
    index -= marker.index;
    if (index === 0) {
      n = n.prev;
      index += n && n.countable && !n.deleted ? n.length : 0;
    }
  }
  for (; n !== null; n = n.right) {
    if (!n.deleted && n.countable) {
      if (index <= n.length) {
        if (index < n.length) {
          getItemCleanStart(transaction, createID(n.id.client, n.id.clock + index));
        }
        break;
      }
      index -= n.length;
    }
  }
  if (parent._searchMarker) {
    updateMarkerChanges(parent._searchMarker, startIndex, content.length);
  }
  return typeListInsertGenericsAfter(transaction, parent, n, content);
};
var typeListPushGenerics = (transaction, parent, content) => {
  const marker = (parent._searchMarker || []).reduce((maxMarker, currMarker) => currMarker.index > maxMarker.index ? currMarker : maxMarker, { index: 0, p: parent._start });
  let n = marker.p;
  if (n) {
    while (n.right) {
      n = n.right;
    }
  }
  return typeListInsertGenericsAfter(transaction, parent, n, content);
};
var typeListDelete = (transaction, parent, index, length2) => {
  if (length2 === 0) {
    return;
  }
  const startIndex = index;
  const startLength = length2;
  const marker = findMarker(parent, index);
  let n = parent._start;
  if (marker !== null) {
    n = marker.p;
    index -= marker.index;
  }
  for (; n !== null && index > 0; n = n.right) {
    if (!n.deleted && n.countable) {
      if (index < n.length) {
        getItemCleanStart(transaction, createID(n.id.client, n.id.clock + index));
      }
      index -= n.length;
    }
  }
  while (length2 > 0 && n !== null) {
    if (!n.deleted) {
      if (length2 < n.length) {
        getItemCleanStart(transaction, createID(n.id.client, n.id.clock + length2));
      }
      n.delete(transaction);
      length2 -= n.length;
    }
    n = n.right;
  }
  if (length2 > 0) {
    throw lengthExceeded();
  }
  if (parent._searchMarker) {
    updateMarkerChanges(
      parent._searchMarker,
      startIndex,
      -startLength + length2
      /* in case we remove the above exception */
    );
  }
};
var typeMapDelete = (transaction, parent, key) => {
  const c = parent._map.get(key);
  if (c !== void 0) {
    c.delete(transaction);
  }
};
var typeMapSet = (transaction, parent, key, value) => {
  const left = parent._map.get(key) || null;
  const doc2 = transaction.doc;
  const ownClientId = doc2.clientID;
  let content;
  if (value == null) {
    content = new ContentAny([value]);
  } else {
    switch (value.constructor) {
      case Number:
      case Object:
      case Boolean:
      case Array:
      case String:
      case Date:
      case BigInt:
        content = new ContentAny([value]);
        break;
      case Uint8Array:
        content = new ContentBinary(
          /** @type {Uint8Array} */
          value
        );
        break;
      case Doc:
        content = new ContentDoc(
          /** @type {Doc} */
          value
        );
        break;
      default:
        if (value instanceof AbstractType) {
          content = new ContentType(value);
        } else {
          throw new Error("Unexpected content type");
        }
    }
  }
  new Item(createID(ownClientId, getState(doc2.store, ownClientId)), left, left && left.lastId, null, null, parent, key, content).integrate(transaction, 0);
};
var typeMapGet = (parent, key) => {
  var _a;
  (_a = parent.doc) != null ? _a : warnPrematureAccess();
  const val = parent._map.get(key);
  return val !== void 0 && !val.deleted ? val.content.getContent()[val.length - 1] : void 0;
};
var typeMapGetAll = (parent) => {
  var _a;
  const res = {};
  (_a = parent.doc) != null ? _a : warnPrematureAccess();
  parent._map.forEach((value, key) => {
    if (!value.deleted) {
      res[key] = value.content.getContent()[value.length - 1];
    }
  });
  return res;
};
var typeMapHas = (parent, key) => {
  var _a;
  (_a = parent.doc) != null ? _a : warnPrematureAccess();
  const val = parent._map.get(key);
  return val !== void 0 && !val.deleted;
};
var typeMapGetAllSnapshot = (parent, snapshot) => {
  const res = {};
  parent._map.forEach((value, key) => {
    let v = value;
    while (v !== null && (!snapshot.sv.has(v.id.client) || v.id.clock >= (snapshot.sv.get(v.id.client) || 0))) {
      v = v.left;
    }
    if (v !== null && isVisible(v, snapshot)) {
      res[key] = v.content.getContent()[v.length - 1];
    }
  });
  return res;
};
var createMapIterator = (type) => {
  var _a;
  (_a = type.doc) != null ? _a : warnPrematureAccess();
  return iteratorFilter(
    type._map.entries(),
    /** @param {any} entry */
    (entry) => !entry[1].deleted
  );
};
var YArrayEvent = class extends YEvent {
};
var YArray = class _YArray extends AbstractType {
  constructor() {
    super();
    this._prelimContent = [];
    this._searchMarker = [];
  }
  /**
   * Construct a new YArray containing the specified items.
   * @template {Object<string,any>|Array<any>|number|null|string|Uint8Array} T
   * @param {Array<T>} items
   * @return {YArray<T>}
   */
  static from(items) {
    const a = new _YArray();
    a.push(items);
    return a;
  }
  /**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item} item
   */
  _integrate(y, item) {
    super._integrate(y, item);
    this.insert(
      0,
      /** @type {Array<any>} */
      this._prelimContent
    );
    this._prelimContent = null;
  }
  /**
   * @return {YArray<T>}
   */
  _copy() {
    return new _YArray();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YArray<T>}
   */
  clone() {
    const arr = new _YArray();
    arr.insert(0, this.toArray().map(
      (el) => el instanceof AbstractType ? (
        /** @type {typeof el} */
        el.clone()
      ) : el
    ));
    return arr;
  }
  get length() {
    var _a;
    (_a = this.doc) != null ? _a : warnPrematureAccess();
    return this._length;
  }
  /**
   * Creates YArrayEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(transaction, parentSubs) {
    super._callObserver(transaction, parentSubs);
    callTypeObservers(this, transaction, new YArrayEvent(this, transaction));
  }
  /**
   * Inserts new content at an index.
   *
   * Important: This function expects an array of content. Not just a content
   * object. The reason for this "weirdness" is that inserting several elements
   * is very efficient when it is done as a single operation.
   *
   * @example
   *  // Insert character 'a' at position 0
   *  yarray.insert(0, ['a'])
   *  // Insert numbers 1, 2 at position 1
   *  yarray.insert(1, [1, 2])
   *
   * @param {number} index The index to insert content at.
   * @param {Array<T>} content The array of content
   */
  insert(index, content) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeListInsertGenerics(
          transaction,
          this,
          index,
          /** @type {any} */
          content
        );
      });
    } else {
      this._prelimContent.splice(index, 0, ...content);
    }
  }
  /**
   * Appends content to this YArray.
   *
   * @param {Array<T>} content Array of content to append.
   *
   * @todo Use the following implementation in all types.
   */
  push(content) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeListPushGenerics(
          transaction,
          this,
          /** @type {any} */
          content
        );
      });
    } else {
      this._prelimContent.push(...content);
    }
  }
  /**
   * Prepends content to this YArray.
   *
   * @param {Array<T>} content Array of content to prepend.
   */
  unshift(content) {
    this.insert(0, content);
  }
  /**
   * Deletes elements starting from an index.
   *
   * @param {number} index Index at which to start deleting elements
   * @param {number} length The number of elements to remove. Defaults to 1.
   */
  delete(index, length2 = 1) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeListDelete(transaction, this, index, length2);
      });
    } else {
      this._prelimContent.splice(index, length2);
    }
  }
  /**
   * Returns the i-th element from a YArray.
   *
   * @param {number} index The index of the element to return from the YArray
   * @return {T}
   */
  get(index) {
    return typeListGet(this, index);
  }
  /**
   * Transforms this YArray to a JavaScript Array.
   *
   * @return {Array<T>}
   */
  toArray() {
    return typeListToArray(this);
  }
  /**
   * Returns a portion of this YArray into a JavaScript Array selected
   * from start to end (end not included).
   *
   * @param {number} [start]
   * @param {number} [end]
   * @return {Array<T>}
   */
  slice(start = 0, end = this.length) {
    return typeListSlice(this, start, end);
  }
  /**
   * Transforms this Shared Type to a JSON object.
   *
   * @return {Array<any>}
   */
  toJSON() {
    return this.map((c) => c instanceof AbstractType ? c.toJSON() : c);
  }
  /**
   * Returns an Array with the result of calling a provided function on every
   * element of this YArray.
   *
   * @template M
   * @param {function(T,number,YArray<T>):M} f Function that produces an element of the new Array
   * @return {Array<M>} A new array with each element being the result of the
   *                 callback function
   */
  map(f) {
    return typeListMap(
      this,
      /** @type {any} */
      f
    );
  }
  /**
   * Executes a provided function once on every element of this YArray.
   *
   * @param {function(T,number,YArray<T>):void} f A function to execute on every element of this YArray.
   */
  forEach(f) {
    typeListForEach(this, f);
  }
  /**
   * @return {IterableIterator<T>}
   */
  [Symbol.iterator]() {
    return typeListCreateIterator(this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(encoder) {
    encoder.writeTypeRef(YArrayRefID);
  }
};
var readYArray = (_decoder) => new YArray();
var YMapEvent = class extends YEvent {
  /**
   * @param {YMap<T>} ymap The YArray that changed.
   * @param {Transaction} transaction
   * @param {Set<any>} subs The keys that changed.
   */
  constructor(ymap, transaction, subs) {
    super(ymap, transaction);
    this.keysChanged = subs;
  }
};
var YMap = class _YMap extends AbstractType {
  /**
   *
   * @param {Iterable<readonly [string, any]>=} entries - an optional iterable to initialize the YMap
   */
  constructor(entries) {
    super();
    this._prelimContent = null;
    if (entries === void 0) {
      this._prelimContent = /* @__PURE__ */ new Map();
    } else {
      this._prelimContent = new Map(entries);
    }
  }
  /**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item} item
   */
  _integrate(y, item) {
    super._integrate(y, item);
    this._prelimContent.forEach((value, key) => {
      this.set(key, value);
    });
    this._prelimContent = null;
  }
  /**
   * @return {YMap<MapType>}
   */
  _copy() {
    return new _YMap();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YMap<MapType>}
   */
  clone() {
    const map3 = new _YMap();
    this.forEach((value, key) => {
      map3.set(key, value instanceof AbstractType ? (
        /** @type {typeof value} */
        value.clone()
      ) : value);
    });
    return map3;
  }
  /**
   * Creates YMapEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(transaction, parentSubs) {
    callTypeObservers(this, transaction, new YMapEvent(this, transaction, parentSubs));
  }
  /**
   * Transforms this Shared Type to a JSON object.
   *
   * @return {Object<string,any>}
   */
  toJSON() {
    var _a;
    (_a = this.doc) != null ? _a : warnPrematureAccess();
    const map3 = {};
    this._map.forEach((item, key) => {
      if (!item.deleted) {
        const v = item.content.getContent()[item.length - 1];
        map3[key] = v instanceof AbstractType ? v.toJSON() : v;
      }
    });
    return map3;
  }
  /**
   * Returns the size of the YMap (count of key/value pairs)
   *
   * @return {number}
   */
  get size() {
    return [...createMapIterator(this)].length;
  }
  /**
   * Returns the keys for each element in the YMap Type.
   *
   * @return {IterableIterator<string>}
   */
  keys() {
    return iteratorMap(
      createMapIterator(this),
      /** @param {any} v */
      (v) => v[0]
    );
  }
  /**
   * Returns the values for each element in the YMap Type.
   *
   * @return {IterableIterator<MapType>}
   */
  values() {
    return iteratorMap(
      createMapIterator(this),
      /** @param {any} v */
      (v) => v[1].content.getContent()[v[1].length - 1]
    );
  }
  /**
   * Returns an Iterator of [key, value] pairs
   *
   * @return {IterableIterator<[string, MapType]>}
   */
  entries() {
    return iteratorMap(
      createMapIterator(this),
      /** @param {any} v */
      (v) => (
        /** @type {any} */
        [v[0], v[1].content.getContent()[v[1].length - 1]]
      )
    );
  }
  /**
   * Executes a provided function on once on every key-value pair.
   *
   * @param {function(MapType,string,YMap<MapType>):void} f A function to execute on every element of this YArray.
   */
  forEach(f) {
    var _a;
    (_a = this.doc) != null ? _a : warnPrematureAccess();
    this._map.forEach((item, key) => {
      if (!item.deleted) {
        f(item.content.getContent()[item.length - 1], key, this);
      }
    });
  }
  /**
   * Returns an Iterator of [key, value] pairs
   *
   * @return {IterableIterator<[string, MapType]>}
   */
  [Symbol.iterator]() {
    return this.entries();
  }
  /**
   * Remove a specified element from this YMap.
   *
   * @param {string} key The key of the element to remove.
   */
  delete(key) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeMapDelete(transaction, this, key);
      });
    } else {
      this._prelimContent.delete(key);
    }
  }
  /**
   * Adds or updates an element with a specified key and value.
   * @template {MapType} VAL
   *
   * @param {string} key The key of the element to add to this YMap
   * @param {VAL} value The value of the element to add
   * @return {VAL}
   */
  set(key, value) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeMapSet(
          transaction,
          this,
          key,
          /** @type {any} */
          value
        );
      });
    } else {
      this._prelimContent.set(key, value);
    }
    return value;
  }
  /**
   * Returns a specified element from this YMap.
   *
   * @param {string} key
   * @return {MapType|undefined}
   */
  get(key) {
    return (
      /** @type {any} */
      typeMapGet(this, key)
    );
  }
  /**
   * Returns a boolean indicating whether the specified key exists or not.
   *
   * @param {string} key The key to test.
   * @return {boolean}
   */
  has(key) {
    return typeMapHas(this, key);
  }
  /**
   * Removes all elements from this YMap.
   */
  clear() {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        this.forEach(function(_value, key, map3) {
          typeMapDelete(transaction, map3, key);
        });
      });
    } else {
      this._prelimContent.clear();
    }
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(encoder) {
    encoder.writeTypeRef(YMapRefID);
  }
};
var readYMap = (_decoder) => new YMap();
var equalAttrs = (a, b) => a === b || typeof a === "object" && typeof b === "object" && a && b && equalFlat(a, b);
var ItemTextListPosition = class {
  /**
   * @param {Item|null} left
   * @param {Item|null} right
   * @param {number} index
   * @param {Map<string,any>} currentAttributes
   */
  constructor(left, right, index, currentAttributes) {
    this.left = left;
    this.right = right;
    this.index = index;
    this.currentAttributes = currentAttributes;
  }
  /**
   * Only call this if you know that this.right is defined
   */
  forward() {
    if (this.right === null) {
      unexpectedCase();
    }
    switch (this.right.content.constructor) {
      case ContentFormat:
        if (!this.right.deleted) {
          updateCurrentAttributes(
            this.currentAttributes,
            /** @type {ContentFormat} */
            this.right.content
          );
        }
        break;
      default:
        if (!this.right.deleted) {
          this.index += this.right.length;
        }
        break;
    }
    this.left = this.right;
    this.right = this.right.right;
  }
};
var findNextPosition = (transaction, pos, count) => {
  while (pos.right !== null && count > 0) {
    switch (pos.right.content.constructor) {
      case ContentFormat:
        if (!pos.right.deleted) {
          updateCurrentAttributes(
            pos.currentAttributes,
            /** @type {ContentFormat} */
            pos.right.content
          );
        }
        break;
      default:
        if (!pos.right.deleted) {
          if (count < pos.right.length) {
            getItemCleanStart(transaction, createID(pos.right.id.client, pos.right.id.clock + count));
          }
          pos.index += pos.right.length;
          count -= pos.right.length;
        }
        break;
    }
    pos.left = pos.right;
    pos.right = pos.right.right;
  }
  return pos;
};
var findPosition = (transaction, parent, index, useSearchMarker) => {
  const currentAttributes = /* @__PURE__ */ new Map();
  const marker = useSearchMarker ? findMarker(parent, index) : null;
  if (marker) {
    const pos = new ItemTextListPosition(marker.p.left, marker.p, marker.index, currentAttributes);
    return findNextPosition(transaction, pos, index - marker.index);
  } else {
    const pos = new ItemTextListPosition(null, parent._start, 0, currentAttributes);
    return findNextPosition(transaction, pos, index);
  }
};
var insertNegatedAttributes = (transaction, parent, currPos, negatedAttributes) => {
  while (currPos.right !== null && (currPos.right.deleted === true || currPos.right.content.constructor === ContentFormat && equalAttrs(
    negatedAttributes.get(
      /** @type {ContentFormat} */
      currPos.right.content.key
    ),
    /** @type {ContentFormat} */
    currPos.right.content.value
  ))) {
    if (!currPos.right.deleted) {
      negatedAttributes.delete(
        /** @type {ContentFormat} */
        currPos.right.content.key
      );
    }
    currPos.forward();
  }
  const doc2 = transaction.doc;
  const ownClientId = doc2.clientID;
  negatedAttributes.forEach((val, key) => {
    const left = currPos.left;
    const right = currPos.right;
    const nextFormat = new Item(createID(ownClientId, getState(doc2.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentFormat(key, val));
    nextFormat.integrate(transaction, 0);
    currPos.right = nextFormat;
    currPos.forward();
  });
};
var updateCurrentAttributes = (currentAttributes, format) => {
  const { key, value } = format;
  if (value === null) {
    currentAttributes.delete(key);
  } else {
    currentAttributes.set(key, value);
  }
};
var minimizeAttributeChanges = (currPos, attributes) => {
  var _a;
  while (true) {
    if (currPos.right === null) {
      break;
    } else if (currPos.right.deleted || currPos.right.content.constructor === ContentFormat && equalAttrs(
      (_a = attributes[
        /** @type {ContentFormat} */
        currPos.right.content.key
      ]) != null ? _a : null,
      /** @type {ContentFormat} */
      currPos.right.content.value
    )) ;
    else {
      break;
    }
    currPos.forward();
  }
};
var insertAttributes = (transaction, parent, currPos, attributes) => {
  var _a;
  const doc2 = transaction.doc;
  const ownClientId = doc2.clientID;
  const negatedAttributes = /* @__PURE__ */ new Map();
  for (const key in attributes) {
    const val = attributes[key];
    const currentVal = (_a = currPos.currentAttributes.get(key)) != null ? _a : null;
    if (!equalAttrs(currentVal, val)) {
      negatedAttributes.set(key, currentVal);
      const { left, right } = currPos;
      currPos.right = new Item(createID(ownClientId, getState(doc2.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentFormat(key, val));
      currPos.right.integrate(transaction, 0);
      currPos.forward();
    }
  }
  return negatedAttributes;
};
var insertText = (transaction, parent, currPos, text2, attributes) => {
  currPos.currentAttributes.forEach((_val, key) => {
    if (attributes[key] === void 0) {
      attributes[key] = null;
    }
  });
  const doc2 = transaction.doc;
  const ownClientId = doc2.clientID;
  minimizeAttributeChanges(currPos, attributes);
  const negatedAttributes = insertAttributes(transaction, parent, currPos, attributes);
  const content = text2.constructor === String ? new ContentString(
    /** @type {string} */
    text2
  ) : text2 instanceof AbstractType ? new ContentType(text2) : new ContentEmbed(text2);
  let { left, right, index } = currPos;
  if (parent._searchMarker) {
    updateMarkerChanges(parent._searchMarker, currPos.index, content.getLength());
  }
  right = new Item(createID(ownClientId, getState(doc2.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, content);
  right.integrate(transaction, 0);
  currPos.right = right;
  currPos.index = index;
  currPos.forward();
  insertNegatedAttributes(transaction, parent, currPos, negatedAttributes);
};
var formatText = (transaction, parent, currPos, length2, attributes) => {
  const doc2 = transaction.doc;
  const ownClientId = doc2.clientID;
  minimizeAttributeChanges(currPos, attributes);
  const negatedAttributes = insertAttributes(transaction, parent, currPos, attributes);
  iterationLoop: while (currPos.right !== null && (length2 > 0 || negatedAttributes.size > 0 && (currPos.right.deleted || currPos.right.content.constructor === ContentFormat))) {
    if (!currPos.right.deleted) {
      switch (currPos.right.content.constructor) {
        case ContentFormat: {
          const { key, value } = (
            /** @type {ContentFormat} */
            currPos.right.content
          );
          const attr = attributes[key];
          if (attr !== void 0) {
            if (equalAttrs(attr, value)) {
              negatedAttributes.delete(key);
            } else {
              if (length2 === 0) {
                break iterationLoop;
              }
              negatedAttributes.set(key, value);
            }
            currPos.right.delete(transaction);
          } else {
            currPos.currentAttributes.set(key, value);
          }
          break;
        }
        default:
          if (length2 < currPos.right.length) {
            getItemCleanStart(transaction, createID(currPos.right.id.client, currPos.right.id.clock + length2));
          }
          length2 -= currPos.right.length;
          break;
      }
    }
    currPos.forward();
  }
  if (length2 > 0) {
    let newlines = "";
    for (; length2 > 0; length2--) {
      newlines += "\n";
    }
    currPos.right = new Item(createID(ownClientId, getState(doc2.store, ownClientId)), currPos.left, currPos.left && currPos.left.lastId, currPos.right, currPos.right && currPos.right.id, parent, null, new ContentString(newlines));
    currPos.right.integrate(transaction, 0);
    currPos.forward();
  }
  insertNegatedAttributes(transaction, parent, currPos, negatedAttributes);
};
var cleanupFormattingGap = (transaction, start, curr, startAttributes, currAttributes) => {
  var _a, _b;
  let end = start;
  const endFormats = create();
  while (end && (!end.countable || end.deleted)) {
    if (!end.deleted && end.content.constructor === ContentFormat) {
      const cf = (
        /** @type {ContentFormat} */
        end.content
      );
      endFormats.set(cf.key, cf);
    }
    end = end.right;
  }
  let cleanups = 0;
  let reachedCurr = false;
  while (start !== end) {
    if (curr === start) {
      reachedCurr = true;
    }
    if (!start.deleted) {
      const content = start.content;
      switch (content.constructor) {
        case ContentFormat: {
          const { key, value } = (
            /** @type {ContentFormat} */
            content
          );
          const startAttrValue = (_a = startAttributes.get(key)) != null ? _a : null;
          if (endFormats.get(key) !== content || startAttrValue === value) {
            start.delete(transaction);
            cleanups++;
            if (!reachedCurr && ((_b = currAttributes.get(key)) != null ? _b : null) === value && startAttrValue !== value) {
              if (startAttrValue === null) {
                currAttributes.delete(key);
              } else {
                currAttributes.set(key, startAttrValue);
              }
            }
          }
          if (!reachedCurr && !start.deleted) {
            updateCurrentAttributes(
              currAttributes,
              /** @type {ContentFormat} */
              content
            );
          }
          break;
        }
      }
    }
    start = /** @type {Item} */
    start.right;
  }
  return cleanups;
};
var cleanupContextlessFormattingGap = (transaction, item) => {
  while (item && item.right && (item.right.deleted || !item.right.countable)) {
    item = item.right;
  }
  const attrs = /* @__PURE__ */ new Set();
  while (item && (item.deleted || !item.countable)) {
    if (!item.deleted && item.content.constructor === ContentFormat) {
      const key = (
        /** @type {ContentFormat} */
        item.content.key
      );
      if (attrs.has(key)) {
        item.delete(transaction);
      } else {
        attrs.add(key);
      }
    }
    item = item.left;
  }
};
var cleanupYTextFormatting = (type) => {
  let res = 0;
  transact(
    /** @type {Doc} */
    type.doc,
    (transaction) => {
      let start = (
        /** @type {Item} */
        type._start
      );
      let end = type._start;
      let startAttributes = create();
      const currentAttributes = copy(startAttributes);
      while (end) {
        if (end.deleted === false) {
          switch (end.content.constructor) {
            case ContentFormat:
              updateCurrentAttributes(
                currentAttributes,
                /** @type {ContentFormat} */
                end.content
              );
              break;
            default:
              res += cleanupFormattingGap(transaction, start, end, startAttributes, currentAttributes);
              startAttributes = copy(currentAttributes);
              start = end;
              break;
          }
        }
        end = end.right;
      }
    }
  );
  return res;
};
var cleanupYTextAfterTransaction = (transaction) => {
  const needFullCleanup = /* @__PURE__ */ new Set();
  const doc2 = transaction.doc;
  for (const [client, afterClock] of transaction.afterState.entries()) {
    const clock = transaction.beforeState.get(client) || 0;
    if (afterClock === clock) {
      continue;
    }
    iterateStructs(
      transaction,
      /** @type {Array<Item|GC>} */
      doc2.store.clients.get(client),
      clock,
      afterClock,
      (item) => {
        if (!item.deleted && /** @type {Item} */
        item.content.constructor === ContentFormat && item.constructor !== GC) {
          needFullCleanup.add(
            /** @type {any} */
            item.parent
          );
        }
      }
    );
  }
  transact(doc2, (t) => {
    iterateDeletedStructs(transaction, transaction.deleteSet, (item) => {
      if (item instanceof GC || !/** @type {YText} */
      item.parent._hasFormatting || needFullCleanup.has(
        /** @type {YText} */
        item.parent
      )) {
        return;
      }
      const parent = (
        /** @type {YText} */
        item.parent
      );
      if (item.content.constructor === ContentFormat) {
        needFullCleanup.add(parent);
      } else {
        cleanupContextlessFormattingGap(t, item);
      }
    });
    for (const yText of needFullCleanup) {
      cleanupYTextFormatting(yText);
    }
  });
};
var deleteText = (transaction, currPos, length2) => {
  const startLength = length2;
  const startAttrs = copy(currPos.currentAttributes);
  const start = currPos.right;
  while (length2 > 0 && currPos.right !== null) {
    if (currPos.right.deleted === false) {
      switch (currPos.right.content.constructor) {
        case ContentType:
        case ContentEmbed:
        case ContentString:
          if (length2 < currPos.right.length) {
            getItemCleanStart(transaction, createID(currPos.right.id.client, currPos.right.id.clock + length2));
          }
          length2 -= currPos.right.length;
          currPos.right.delete(transaction);
          break;
      }
    }
    currPos.forward();
  }
  if (start) {
    cleanupFormattingGap(transaction, start, currPos.right, startAttrs, currPos.currentAttributes);
  }
  const parent = (
    /** @type {AbstractType<any>} */
    /** @type {Item} */
    (currPos.left || currPos.right).parent
  );
  if (parent._searchMarker) {
    updateMarkerChanges(parent._searchMarker, currPos.index, -startLength + length2);
  }
  return currPos;
};
var YTextEvent = class extends YEvent {
  /**
   * @param {YText} ytext
   * @param {Transaction} transaction
   * @param {Set<any>} subs The keys that changed
   */
  constructor(ytext, transaction, subs) {
    super(ytext, transaction);
    this.childListChanged = false;
    this.keysChanged = /* @__PURE__ */ new Set();
    subs.forEach((sub) => {
      if (sub === null) {
        this.childListChanged = true;
      } else {
        this.keysChanged.add(sub);
      }
    });
  }
  /**
   * @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string, delete?:number, retain?:number}>}}
   */
  get changes() {
    if (this._changes === null) {
      const changes = {
        keys: this.keys,
        delta: this.delta,
        added: /* @__PURE__ */ new Set(),
        deleted: /* @__PURE__ */ new Set()
      };
      this._changes = changes;
    }
    return (
      /** @type {any} */
      this._changes
    );
  }
  /**
   * Compute the changes in the delta format.
   * A {@link https://quilljs.com/docs/delta/|Quill Delta}) that represents the changes on the document.
   *
   * @type {Array<{insert?:string|object|AbstractType<any>, delete?:number, retain?:number, attributes?: Object<string,any>}>}
   *
   * @public
   */
  get delta() {
    if (this._delta === null) {
      const y = (
        /** @type {Doc} */
        this.target.doc
      );
      const delta = [];
      transact(y, (transaction) => {
        var _a, _b, _c;
        const currentAttributes = /* @__PURE__ */ new Map();
        const oldAttributes = /* @__PURE__ */ new Map();
        let item = this.target._start;
        let action = null;
        const attributes = {};
        let insert = "";
        let retain = 0;
        let deleteLen = 0;
        const addOp = () => {
          if (action !== null) {
            let op = null;
            switch (action) {
              case "delete":
                if (deleteLen > 0) {
                  op = { delete: deleteLen };
                }
                deleteLen = 0;
                break;
              case "insert":
                if (typeof insert === "object" || insert.length > 0) {
                  op = { insert };
                  if (currentAttributes.size > 0) {
                    op.attributes = {};
                    currentAttributes.forEach((value, key) => {
                      if (value !== null) {
                        op.attributes[key] = value;
                      }
                    });
                  }
                }
                insert = "";
                break;
              case "retain":
                if (retain > 0) {
                  op = { retain };
                  if (!isEmpty(attributes)) {
                    op.attributes = assign({}, attributes);
                  }
                }
                retain = 0;
                break;
            }
            if (op) delta.push(op);
            action = null;
          }
        };
        while (item !== null) {
          switch (item.content.constructor) {
            case ContentType:
            case ContentEmbed:
              if (this.adds(item)) {
                if (!this.deletes(item)) {
                  addOp();
                  action = "insert";
                  insert = item.content.getContent()[0];
                  addOp();
                }
              } else if (this.deletes(item)) {
                if (action !== "delete") {
                  addOp();
                  action = "delete";
                }
                deleteLen += 1;
              } else if (!item.deleted) {
                if (action !== "retain") {
                  addOp();
                  action = "retain";
                }
                retain += 1;
              }
              break;
            case ContentString:
              if (this.adds(item)) {
                if (!this.deletes(item)) {
                  if (action !== "insert") {
                    addOp();
                    action = "insert";
                  }
                  insert += /** @type {ContentString} */
                  item.content.str;
                }
              } else if (this.deletes(item)) {
                if (action !== "delete") {
                  addOp();
                  action = "delete";
                }
                deleteLen += item.length;
              } else if (!item.deleted) {
                if (action !== "retain") {
                  addOp();
                  action = "retain";
                }
                retain += item.length;
              }
              break;
            case ContentFormat: {
              const { key, value } = (
                /** @type {ContentFormat} */
                item.content
              );
              if (this.adds(item)) {
                if (!this.deletes(item)) {
                  const curVal = (_a = currentAttributes.get(key)) != null ? _a : null;
                  if (!equalAttrs(curVal, value)) {
                    if (action === "retain") {
                      addOp();
                    }
                    if (equalAttrs(value, (_b = oldAttributes.get(key)) != null ? _b : null)) {
                      delete attributes[key];
                    } else {
                      attributes[key] = value;
                    }
                  } else if (value !== null) {
                    item.delete(transaction);
                  }
                }
              } else if (this.deletes(item)) {
                oldAttributes.set(key, value);
                const curVal = (_c = currentAttributes.get(key)) != null ? _c : null;
                if (!equalAttrs(curVal, value)) {
                  if (action === "retain") {
                    addOp();
                  }
                  attributes[key] = curVal;
                }
              } else if (!item.deleted) {
                oldAttributes.set(key, value);
                const attr = attributes[key];
                if (attr !== void 0) {
                  if (!equalAttrs(attr, value)) {
                    if (action === "retain") {
                      addOp();
                    }
                    if (value === null) {
                      delete attributes[key];
                    } else {
                      attributes[key] = value;
                    }
                  } else if (attr !== null) {
                    item.delete(transaction);
                  }
                }
              }
              if (!item.deleted) {
                if (action === "insert") {
                  addOp();
                }
                updateCurrentAttributes(
                  currentAttributes,
                  /** @type {ContentFormat} */
                  item.content
                );
              }
              break;
            }
          }
          item = item.right;
        }
        addOp();
        while (delta.length > 0) {
          const lastOp = delta[delta.length - 1];
          if (lastOp.retain !== void 0 && lastOp.attributes === void 0) {
            delta.pop();
          } else {
            break;
          }
        }
      });
      this._delta = delta;
    }
    return (
      /** @type {any} */
      this._delta
    );
  }
};
var YText = class _YText extends AbstractType {
  /**
   * @param {String} [string] The initial value of the YText.
   */
  constructor(string) {
    super();
    this._pending = string !== void 0 ? [() => this.insert(0, string)] : [];
    this._searchMarker = [];
    this._hasFormatting = false;
  }
  /**
   * Number of characters of this text type.
   *
   * @type {number}
   */
  get length() {
    var _a;
    (_a = this.doc) != null ? _a : warnPrematureAccess();
    return this._length;
  }
  /**
   * @param {Doc} y
   * @param {Item} item
   */
  _integrate(y, item) {
    super._integrate(y, item);
    try {
      this._pending.forEach((f) => f());
    } catch (e) {
      console.error(e);
    }
    this._pending = null;
  }
  _copy() {
    return new _YText();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YText}
   */
  clone() {
    const text2 = new _YText();
    text2.applyDelta(this.toDelta());
    return text2;
  }
  /**
   * Creates YTextEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(transaction, parentSubs) {
    super._callObserver(transaction, parentSubs);
    const event = new YTextEvent(this, transaction, parentSubs);
    callTypeObservers(this, transaction, event);
    if (!transaction.local && this._hasFormatting) {
      transaction._needFormattingCleanup = true;
    }
  }
  /**
   * Returns the unformatted string representation of this YText type.
   *
   * @public
   */
  toString() {
    var _a;
    (_a = this.doc) != null ? _a : warnPrematureAccess();
    let str = "";
    let n = this._start;
    while (n !== null) {
      if (!n.deleted && n.countable && n.content.constructor === ContentString) {
        str += /** @type {ContentString} */
        n.content.str;
      }
      n = n.right;
    }
    return str;
  }
  /**
   * Returns the unformatted string representation of this YText type.
   *
   * @return {string}
   * @public
   */
  toJSON() {
    return this.toString();
  }
  /**
   * Apply a {@link Delta} on this shared YText type.
   *
   * @param {Array<any>} delta The changes to apply on this element.
   * @param {object}  opts
   * @param {boolean} [opts.sanitize] Sanitize input delta. Removes ending newlines if set to true.
   *
   *
   * @public
   */
  applyDelta(delta, { sanitize = true } = {}) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        const currPos = new ItemTextListPosition(null, this._start, 0, /* @__PURE__ */ new Map());
        for (let i = 0; i < delta.length; i++) {
          const op = delta[i];
          if (op.insert !== void 0) {
            const ins = !sanitize && typeof op.insert === "string" && i === delta.length - 1 && currPos.right === null && op.insert.slice(-1) === "\n" ? op.insert.slice(0, -1) : op.insert;
            if (typeof ins !== "string" || ins.length > 0) {
              insertText(transaction, this, currPos, ins, op.attributes || {});
            }
          } else if (op.retain !== void 0) {
            formatText(transaction, this, currPos, op.retain, op.attributes || {});
          } else if (op.delete !== void 0) {
            deleteText(transaction, currPos, op.delete);
          }
        }
      });
    } else {
      this._pending.push(() => this.applyDelta(delta));
    }
  }
  /**
   * Returns the Delta representation of this YText type.
   *
   * @param {Snapshot} [snapshot]
   * @param {Snapshot} [prevSnapshot]
   * @param {function('removed' | 'added', ID):any} [computeYChange]
   * @return {any} The Delta representation of this type.
   *
   * @public
   */
  toDelta(snapshot, prevSnapshot, computeYChange) {
    var _a;
    (_a = this.doc) != null ? _a : warnPrematureAccess();
    const ops = [];
    const currentAttributes = /* @__PURE__ */ new Map();
    const doc2 = (
      /** @type {Doc} */
      this.doc
    );
    let str = "";
    let n = this._start;
    function packStr() {
      if (str.length > 0) {
        const attributes = {};
        let addAttributes = false;
        currentAttributes.forEach((value, key) => {
          addAttributes = true;
          attributes[key] = value;
        });
        const op = { insert: str };
        if (addAttributes) {
          op.attributes = attributes;
        }
        ops.push(op);
        str = "";
      }
    }
    const computeDelta = () => {
      while (n !== null) {
        if (isVisible(n, snapshot) || prevSnapshot !== void 0 && isVisible(n, prevSnapshot)) {
          switch (n.content.constructor) {
            case ContentString: {
              const cur = currentAttributes.get("ychange");
              if (snapshot !== void 0 && !isVisible(n, snapshot)) {
                if (cur === void 0 || cur.user !== n.id.client || cur.type !== "removed") {
                  packStr();
                  currentAttributes.set("ychange", computeYChange ? computeYChange("removed", n.id) : { type: "removed" });
                }
              } else if (prevSnapshot !== void 0 && !isVisible(n, prevSnapshot)) {
                if (cur === void 0 || cur.user !== n.id.client || cur.type !== "added") {
                  packStr();
                  currentAttributes.set("ychange", computeYChange ? computeYChange("added", n.id) : { type: "added" });
                }
              } else if (cur !== void 0) {
                packStr();
                currentAttributes.delete("ychange");
              }
              str += /** @type {ContentString} */
              n.content.str;
              break;
            }
            case ContentType:
            case ContentEmbed: {
              packStr();
              const op = {
                insert: n.content.getContent()[0]
              };
              if (currentAttributes.size > 0) {
                const attrs = (
                  /** @type {Object<string,any>} */
                  {}
                );
                op.attributes = attrs;
                currentAttributes.forEach((value, key) => {
                  attrs[key] = value;
                });
              }
              ops.push(op);
              break;
            }
            case ContentFormat:
              if (isVisible(n, snapshot)) {
                packStr();
                updateCurrentAttributes(
                  currentAttributes,
                  /** @type {ContentFormat} */
                  n.content
                );
              }
              break;
          }
        }
        n = n.right;
      }
      packStr();
    };
    if (snapshot || prevSnapshot) {
      transact(doc2, (transaction) => {
        if (snapshot) {
          splitSnapshotAffectedStructs(transaction, snapshot);
        }
        if (prevSnapshot) {
          splitSnapshotAffectedStructs(transaction, prevSnapshot);
        }
        computeDelta();
      }, "cleanup");
    } else {
      computeDelta();
    }
    return ops;
  }
  /**
   * Insert text at a given index.
   *
   * @param {number} index The index at which to start inserting.
   * @param {String} text The text to insert at the specified position.
   * @param {TextAttributes} [attributes] Optionally define some formatting
   *                                    information to apply on the inserted
   *                                    Text.
   * @public
   */
  insert(index, text2, attributes) {
    if (text2.length <= 0) {
      return;
    }
    const y = this.doc;
    if (y !== null) {
      transact(y, (transaction) => {
        const pos = findPosition(transaction, this, index, !attributes);
        if (!attributes) {
          attributes = {};
          pos.currentAttributes.forEach((v, k) => {
            attributes[k] = v;
          });
        }
        insertText(transaction, this, pos, text2, attributes);
      });
    } else {
      this._pending.push(() => this.insert(index, text2, attributes));
    }
  }
  /**
   * Inserts an embed at a index.
   *
   * @param {number} index The index to insert the embed at.
   * @param {Object | AbstractType<any>} embed The Object that represents the embed.
   * @param {TextAttributes} [attributes] Attribute information to apply on the
   *                                    embed
   *
   * @public
   */
  insertEmbed(index, embed, attributes) {
    const y = this.doc;
    if (y !== null) {
      transact(y, (transaction) => {
        const pos = findPosition(transaction, this, index, !attributes);
        insertText(transaction, this, pos, embed, attributes || {});
      });
    } else {
      this._pending.push(() => this.insertEmbed(index, embed, attributes || {}));
    }
  }
  /**
   * Deletes text starting from an index.
   *
   * @param {number} index Index at which to start deleting.
   * @param {number} length The number of characters to remove. Defaults to 1.
   *
   * @public
   */
  delete(index, length2) {
    if (length2 === 0) {
      return;
    }
    const y = this.doc;
    if (y !== null) {
      transact(y, (transaction) => {
        deleteText(transaction, findPosition(transaction, this, index, true), length2);
      });
    } else {
      this._pending.push(() => this.delete(index, length2));
    }
  }
  /**
   * Assigns properties to a range of text.
   *
   * @param {number} index The position where to start formatting.
   * @param {number} length The amount of characters to assign properties to.
   * @param {TextAttributes} attributes Attribute information to apply on the
   *                                    text.
   *
   * @public
   */
  format(index, length2, attributes) {
    if (length2 === 0) {
      return;
    }
    const y = this.doc;
    if (y !== null) {
      transact(y, (transaction) => {
        const pos = findPosition(transaction, this, index, false);
        if (pos.right === null) {
          return;
        }
        formatText(transaction, this, pos, length2, attributes);
      });
    } else {
      this._pending.push(() => this.format(index, length2, attributes));
    }
  }
  /**
   * Removes an attribute.
   *
   * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
   *
   * @param {String} attributeName The attribute name that is to be removed.
   *
   * @public
   */
  removeAttribute(attributeName) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeMapDelete(transaction, this, attributeName);
      });
    } else {
      this._pending.push(() => this.removeAttribute(attributeName));
    }
  }
  /**
   * Sets or updates an attribute.
   *
   * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
   *
   * @param {String} attributeName The attribute name that is to be set.
   * @param {any} attributeValue The attribute value that is to be set.
   *
   * @public
   */
  setAttribute(attributeName, attributeValue) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeMapSet(transaction, this, attributeName, attributeValue);
      });
    } else {
      this._pending.push(() => this.setAttribute(attributeName, attributeValue));
    }
  }
  /**
   * Returns an attribute value that belongs to the attribute name.
   *
   * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
   *
   * @param {String} attributeName The attribute name that identifies the
   *                               queried value.
   * @return {any} The queried attribute value.
   *
   * @public
   */
  getAttribute(attributeName) {
    return (
      /** @type {any} */
      typeMapGet(this, attributeName)
    );
  }
  /**
   * Returns all attribute name/value pairs in a JSON Object.
   *
   * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
   *
   * @return {Object<string, any>} A JSON Object that describes the attributes.
   *
   * @public
   */
  getAttributes() {
    return typeMapGetAll(this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(encoder) {
    encoder.writeTypeRef(YTextRefID);
  }
};
var readYText = (_decoder) => new YText();
var YXmlTreeWalker = class {
  /**
   * @param {YXmlFragment | YXmlElement} root
   * @param {function(AbstractType<any>):boolean} [f]
   */
  constructor(root, f = () => true) {
    var _a;
    this._filter = f;
    this._root = root;
    this._currentNode = /** @type {Item} */
    root._start;
    this._firstCall = true;
    (_a = root.doc) != null ? _a : warnPrematureAccess();
  }
  [Symbol.iterator]() {
    return this;
  }
  /**
   * Get the next node.
   *
   * @return {IteratorResult<YXmlElement|YXmlText|YXmlHook>} The next node.
   *
   * @public
   */
  next() {
    let n = this._currentNode;
    let type = n && n.content && /** @type {any} */
    n.content.type;
    if (n !== null && (!this._firstCall || n.deleted || !this._filter(type))) {
      do {
        type = /** @type {any} */
        n.content.type;
        if (!n.deleted && (type.constructor === YXmlElement || type.constructor === YXmlFragment) && type._start !== null) {
          n = type._start;
        } else {
          while (n !== null) {
            const nxt = n.next;
            if (nxt !== null) {
              n = nxt;
              break;
            } else if (n.parent === this._root) {
              n = null;
            } else {
              n = /** @type {AbstractType<any>} */
              n.parent._item;
            }
          }
        }
      } while (n !== null && (n.deleted || !this._filter(
        /** @type {ContentType} */
        n.content.type
      )));
    }
    this._firstCall = false;
    if (n === null) {
      return { value: void 0, done: true };
    }
    this._currentNode = n;
    return { value: (
      /** @type {any} */
      n.content.type
    ), done: false };
  }
};
var YXmlFragment = class _YXmlFragment extends AbstractType {
  constructor() {
    super();
    this._prelimContent = [];
  }
  /**
   * @type {YXmlElement|YXmlText|null}
   */
  get firstChild() {
    const first = this._first;
    return first ? first.content.getContent()[0] : null;
  }
  /**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item} item
   */
  _integrate(y, item) {
    super._integrate(y, item);
    this.insert(
      0,
      /** @type {Array<any>} */
      this._prelimContent
    );
    this._prelimContent = null;
  }
  _copy() {
    return new _YXmlFragment();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlFragment}
   */
  clone() {
    const el = new _YXmlFragment();
    el.insert(0, this.toArray().map((item) => item instanceof AbstractType ? item.clone() : item));
    return el;
  }
  get length() {
    var _a;
    (_a = this.doc) != null ? _a : warnPrematureAccess();
    return this._prelimContent === null ? this._length : this._prelimContent.length;
  }
  /**
   * Create a subtree of childNodes.
   *
   * @example
   * const walker = elem.createTreeWalker(dom => dom.nodeName === 'div')
   * for (let node in walker) {
   *   // `node` is a div node
   *   nop(node)
   * }
   *
   * @param {function(AbstractType<any>):boolean} filter Function that is called on each child element and
   *                          returns a Boolean indicating whether the child
   *                          is to be included in the subtree.
   * @return {YXmlTreeWalker} A subtree and a position within it.
   *
   * @public
   */
  createTreeWalker(filter) {
    return new YXmlTreeWalker(this, filter);
  }
  /**
   * Returns the first YXmlElement that matches the query.
   * Similar to DOM's {@link querySelector}.
   *
   * Query support:
   *   - tagname
   * TODO:
   *   - id
   *   - attribute
   *
   * @param {CSS_Selector} query The query on the children.
   * @return {YXmlElement|YXmlText|YXmlHook|null} The first element that matches the query or null.
   *
   * @public
   */
  querySelector(query) {
    query = query.toUpperCase();
    const iterator = new YXmlTreeWalker(this, (element2) => element2.nodeName && element2.nodeName.toUpperCase() === query);
    const next = iterator.next();
    if (next.done) {
      return null;
    } else {
      return next.value;
    }
  }
  /**
   * Returns all YXmlElements that match the query.
   * Similar to Dom's {@link querySelectorAll}.
   *
   * @todo Does not yet support all queries. Currently only query by tagName.
   *
   * @param {CSS_Selector} query The query on the children
   * @return {Array<YXmlElement|YXmlText|YXmlHook|null>} The elements that match this query.
   *
   * @public
   */
  querySelectorAll(query) {
    query = query.toUpperCase();
    return from(new YXmlTreeWalker(this, (element2) => element2.nodeName && element2.nodeName.toUpperCase() === query));
  }
  /**
   * Creates YXmlEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(transaction, parentSubs) {
    callTypeObservers(this, transaction, new YXmlEvent(this, parentSubs, transaction));
  }
  /**
   * Get the string representation of all the children of this YXmlFragment.
   *
   * @return {string} The string representation of all children.
   */
  toString() {
    return typeListMap(this, (xml) => xml.toString()).join("");
  }
  /**
   * @return {string}
   */
  toJSON() {
    return this.toString();
  }
  /**
   * Creates a Dom Element that mirrors this YXmlElement.
   *
   * @param {Document} [_document=document] The document object (you must define
   *                                        this when calling this method in
   *                                        nodejs)
   * @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
   *                                             are presented in the DOM
   * @param {any} [binding] You should not set this property. This is
   *                               used if DomBinding wants to create a
   *                               association to the created DOM type.
   * @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
   *
   * @public
   */
  toDOM(_document = document, hooks = {}, binding) {
    const fragment2 = _document.createDocumentFragment();
    if (binding !== void 0) {
      binding._createAssociation(fragment2, this);
    }
    typeListForEach(this, (xmlType) => {
      fragment2.insertBefore(xmlType.toDOM(_document, hooks, binding), null);
    });
    return fragment2;
  }
  /**
   * Inserts new content at an index.
   *
   * @example
   *  // Insert character 'a' at position 0
   *  xml.insert(0, [new Y.XmlText('text')])
   *
   * @param {number} index The index to insert content at
   * @param {Array<YXmlElement|YXmlText>} content The array of content
   */
  insert(index, content) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeListInsertGenerics(transaction, this, index, content);
      });
    } else {
      this._prelimContent.splice(index, 0, ...content);
    }
  }
  /**
   * Inserts new content at an index.
   *
   * @example
   *  // Insert character 'a' at position 0
   *  xml.insert(0, [new Y.XmlText('text')])
   *
   * @param {null|Item|YXmlElement|YXmlText} ref The index to insert content at
   * @param {Array<YXmlElement|YXmlText>} content The array of content
   */
  insertAfter(ref, content) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        const refItem = ref && ref instanceof AbstractType ? ref._item : ref;
        typeListInsertGenericsAfter(transaction, this, refItem, content);
      });
    } else {
      const pc = (
        /** @type {Array<any>} */
        this._prelimContent
      );
      const index = ref === null ? 0 : pc.findIndex((el) => el === ref) + 1;
      if (index === 0 && ref !== null) {
        throw create3("Reference item not found");
      }
      pc.splice(index, 0, ...content);
    }
  }
  /**
   * Deletes elements starting from an index.
   *
   * @param {number} index Index at which to start deleting elements
   * @param {number} [length=1] The number of elements to remove. Defaults to 1.
   */
  delete(index, length2 = 1) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeListDelete(transaction, this, index, length2);
      });
    } else {
      this._prelimContent.splice(index, length2);
    }
  }
  /**
   * Transforms this YArray to a JavaScript Array.
   *
   * @return {Array<YXmlElement|YXmlText|YXmlHook>}
   */
  toArray() {
    return typeListToArray(this);
  }
  /**
   * Appends content to this YArray.
   *
   * @param {Array<YXmlElement|YXmlText>} content Array of content to append.
   */
  push(content) {
    this.insert(this.length, content);
  }
  /**
   * Prepends content to this YArray.
   *
   * @param {Array<YXmlElement|YXmlText>} content Array of content to prepend.
   */
  unshift(content) {
    this.insert(0, content);
  }
  /**
   * Returns the i-th element from a YArray.
   *
   * @param {number} index The index of the element to return from the YArray
   * @return {YXmlElement|YXmlText}
   */
  get(index) {
    return typeListGet(this, index);
  }
  /**
   * Returns a portion of this YXmlFragment into a JavaScript Array selected
   * from start to end (end not included).
   *
   * @param {number} [start]
   * @param {number} [end]
   * @return {Array<YXmlElement|YXmlText>}
   */
  slice(start = 0, end = this.length) {
    return typeListSlice(this, start, end);
  }
  /**
   * Executes a provided function on once on every child element.
   *
   * @param {function(YXmlElement|YXmlText,number, typeof self):void} f A function to execute on every element of this YArray.
   */
  forEach(f) {
    typeListForEach(this, f);
  }
  /**
   * Transform the properties of this type to binary and write it to an
   * BinaryEncoder.
   *
   * This is called when this Item is sent to a remote peer.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   */
  _write(encoder) {
    encoder.writeTypeRef(YXmlFragmentRefID);
  }
};
var readYXmlFragment = (_decoder) => new YXmlFragment();
var YXmlElement = class _YXmlElement extends YXmlFragment {
  constructor(nodeName = "UNDEFINED") {
    super();
    this.nodeName = nodeName;
    this._prelimAttrs = /* @__PURE__ */ new Map();
  }
  /**
   * @type {YXmlElement|YXmlText|null}
   */
  get nextSibling() {
    const n = this._item ? this._item.next : null;
    return n ? (
      /** @type {YXmlElement|YXmlText} */
      /** @type {ContentType} */
      n.content.type
    ) : null;
  }
  /**
   * @type {YXmlElement|YXmlText|null}
   */
  get prevSibling() {
    const n = this._item ? this._item.prev : null;
    return n ? (
      /** @type {YXmlElement|YXmlText} */
      /** @type {ContentType} */
      n.content.type
    ) : null;
  }
  /**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item} item
   */
  _integrate(y, item) {
    super._integrate(y, item);
    /** @type {Map<string, any>} */
    this._prelimAttrs.forEach((value, key) => {
      this.setAttribute(key, value);
    });
    this._prelimAttrs = null;
  }
  /**
   * Creates an Item with the same effect as this Item (without position effect)
   *
   * @return {YXmlElement}
   */
  _copy() {
    return new _YXmlElement(this.nodeName);
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlElement<KV>}
   */
  clone() {
    const el = new _YXmlElement(this.nodeName);
    const attrs = this.getAttributes();
    forEach(attrs, (value, key) => {
      el.setAttribute(
        key,
        /** @type {any} */
        value
      );
    });
    el.insert(0, this.toArray().map((v) => v instanceof AbstractType ? v.clone() : v));
    return el;
  }
  /**
   * Returns the XML serialization of this YXmlElement.
   * The attributes are ordered by attribute-name, so you can easily use this
   * method to compare YXmlElements
   *
   * @return {string} The string representation of this type.
   *
   * @public
   */
  toString() {
    const attrs = this.getAttributes();
    const stringBuilder = [];
    const keys2 = [];
    for (const key in attrs) {
      keys2.push(key);
    }
    keys2.sort();
    const keysLen = keys2.length;
    for (let i = 0; i < keysLen; i++) {
      const key = keys2[i];
      stringBuilder.push(key + '="' + attrs[key] + '"');
    }
    const nodeName = this.nodeName.toLocaleLowerCase();
    const attrsString = stringBuilder.length > 0 ? " " + stringBuilder.join(" ") : "";
    return `<${nodeName}${attrsString}>${super.toString()}</${nodeName}>`;
  }
  /**
   * Removes an attribute from this YXmlElement.
   *
   * @param {string} attributeName The attribute name that is to be removed.
   *
   * @public
   */
  removeAttribute(attributeName) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeMapDelete(transaction, this, attributeName);
      });
    } else {
      this._prelimAttrs.delete(attributeName);
    }
  }
  /**
   * Sets or updates an attribute.
   *
   * @template {keyof KV & string} KEY
   *
   * @param {KEY} attributeName The attribute name that is to be set.
   * @param {KV[KEY]} attributeValue The attribute value that is to be set.
   *
   * @public
   */
  setAttribute(attributeName, attributeValue) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeMapSet(transaction, this, attributeName, attributeValue);
      });
    } else {
      this._prelimAttrs.set(attributeName, attributeValue);
    }
  }
  /**
   * Returns an attribute value that belongs to the attribute name.
   *
   * @template {keyof KV & string} KEY
   *
   * @param {KEY} attributeName The attribute name that identifies the
   *                               queried value.
   * @return {KV[KEY]|undefined} The queried attribute value.
   *
   * @public
   */
  getAttribute(attributeName) {
    return (
      /** @type {any} */
      typeMapGet(this, attributeName)
    );
  }
  /**
   * Returns whether an attribute exists
   *
   * @param {string} attributeName The attribute name to check for existence.
   * @return {boolean} whether the attribute exists.
   *
   * @public
   */
  hasAttribute(attributeName) {
    return (
      /** @type {any} */
      typeMapHas(this, attributeName)
    );
  }
  /**
   * Returns all attribute name/value pairs in a JSON Object.
   *
   * @param {Snapshot} [snapshot]
   * @return {{ [Key in Extract<keyof KV,string>]?: KV[Key]}} A JSON Object that describes the attributes.
   *
   * @public
   */
  getAttributes(snapshot) {
    return (
      /** @type {any} */
      snapshot ? typeMapGetAllSnapshot(this, snapshot) : typeMapGetAll(this)
    );
  }
  /**
   * Creates a Dom Element that mirrors this YXmlElement.
   *
   * @param {Document} [_document=document] The document object (you must define
   *                                        this when calling this method in
   *                                        nodejs)
   * @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
   *                                             are presented in the DOM
   * @param {any} [binding] You should not set this property. This is
   *                               used if DomBinding wants to create a
   *                               association to the created DOM type.
   * @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
   *
   * @public
   */
  toDOM(_document = document, hooks = {}, binding) {
    const dom = _document.createElement(this.nodeName);
    const attrs = this.getAttributes();
    for (const key in attrs) {
      const value = attrs[key];
      if (typeof value === "string") {
        dom.setAttribute(key, value);
      }
    }
    typeListForEach(this, (yxml) => {
      dom.appendChild(yxml.toDOM(_document, hooks, binding));
    });
    if (binding !== void 0) {
      binding._createAssociation(dom, this);
    }
    return dom;
  }
  /**
   * Transform the properties of this type to binary and write it to an
   * BinaryEncoder.
   *
   * This is called when this Item is sent to a remote peer.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   */
  _write(encoder) {
    encoder.writeTypeRef(YXmlElementRefID);
    encoder.writeKey(this.nodeName);
  }
};
var readYXmlElement = (decoder) => new YXmlElement(decoder.readKey());
var YXmlEvent = class extends YEvent {
  /**
   * @param {YXmlElement|YXmlText|YXmlFragment} target The target on which the event is created.
   * @param {Set<string|null>} subs The set of changed attributes. `null` is included if the
   *                   child list changed.
   * @param {Transaction} transaction The transaction instance with which the
   *                                  change was created.
   */
  constructor(target, subs, transaction) {
    super(target, transaction);
    this.childListChanged = false;
    this.attributesChanged = /* @__PURE__ */ new Set();
    subs.forEach((sub) => {
      if (sub === null) {
        this.childListChanged = true;
      } else {
        this.attributesChanged.add(sub);
      }
    });
  }
};
var YXmlHook = class _YXmlHook extends YMap {
  /**
   * @param {string} hookName nodeName of the Dom Node.
   */
  constructor(hookName) {
    super();
    this.hookName = hookName;
  }
  /**
   * Creates an Item with the same effect as this Item (without position effect)
   */
  _copy() {
    return new _YXmlHook(this.hookName);
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlHook}
   */
  clone() {
    const el = new _YXmlHook(this.hookName);
    this.forEach((value, key) => {
      el.set(key, value);
    });
    return el;
  }
  /**
   * Creates a Dom Element that mirrors this YXmlElement.
   *
   * @param {Document} [_document=document] The document object (you must define
   *                                        this when calling this method in
   *                                        nodejs)
   * @param {Object.<string, any>} [hooks] Optional property to customize how hooks
   *                                             are presented in the DOM
   * @param {any} [binding] You should not set this property. This is
   *                               used if DomBinding wants to create a
   *                               association to the created DOM type
   * @return {Element} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
   *
   * @public
   */
  toDOM(_document = document, hooks = {}, binding) {
    const hook = hooks[this.hookName];
    let dom;
    if (hook !== void 0) {
      dom = hook.createDom(this);
    } else {
      dom = document.createElement(this.hookName);
    }
    dom.setAttribute("data-yjs-hook", this.hookName);
    if (binding !== void 0) {
      binding._createAssociation(dom, this);
    }
    return dom;
  }
  /**
   * Transform the properties of this type to binary and write it to an
   * BinaryEncoder.
   *
   * This is called when this Item is sent to a remote peer.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   */
  _write(encoder) {
    encoder.writeTypeRef(YXmlHookRefID);
    encoder.writeKey(this.hookName);
  }
};
var readYXmlHook = (decoder) => new YXmlHook(decoder.readKey());
var YXmlText = class _YXmlText extends YText {
  /**
   * @type {YXmlElement|YXmlText|null}
   */
  get nextSibling() {
    const n = this._item ? this._item.next : null;
    return n ? (
      /** @type {YXmlElement|YXmlText} */
      /** @type {ContentType} */
      n.content.type
    ) : null;
  }
  /**
   * @type {YXmlElement|YXmlText|null}
   */
  get prevSibling() {
    const n = this._item ? this._item.prev : null;
    return n ? (
      /** @type {YXmlElement|YXmlText} */
      /** @type {ContentType} */
      n.content.type
    ) : null;
  }
  _copy() {
    return new _YXmlText();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlText}
   */
  clone() {
    const text2 = new _YXmlText();
    text2.applyDelta(this.toDelta());
    return text2;
  }
  /**
   * Creates a Dom Element that mirrors this YXmlText.
   *
   * @param {Document} [_document=document] The document object (you must define
   *                                        this when calling this method in
   *                                        nodejs)
   * @param {Object<string, any>} [hooks] Optional property to customize how hooks
   *                                             are presented in the DOM
   * @param {any} [binding] You should not set this property. This is
   *                               used if DomBinding wants to create a
   *                               association to the created DOM type.
   * @return {Text} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
   *
   * @public
   */
  toDOM(_document = document, hooks, binding) {
    const dom = _document.createTextNode(this.toString());
    if (binding !== void 0) {
      binding._createAssociation(dom, this);
    }
    return dom;
  }
  toString() {
    return this.toDelta().map((delta) => {
      const nestedNodes = [];
      for (const nodeName in delta.attributes) {
        const attrs = [];
        for (const key in delta.attributes[nodeName]) {
          attrs.push({ key, value: delta.attributes[nodeName][key] });
        }
        attrs.sort((a, b) => a.key < b.key ? -1 : 1);
        nestedNodes.push({ nodeName, attrs });
      }
      nestedNodes.sort((a, b) => a.nodeName < b.nodeName ? -1 : 1);
      let str = "";
      for (let i = 0; i < nestedNodes.length; i++) {
        const node = nestedNodes[i];
        str += `<${node.nodeName}`;
        for (let j = 0; j < node.attrs.length; j++) {
          const attr = node.attrs[j];
          str += ` ${attr.key}="${attr.value}"`;
        }
        str += ">";
      }
      str += delta.insert;
      for (let i = nestedNodes.length - 1; i >= 0; i--) {
        str += `</${nestedNodes[i].nodeName}>`;
      }
      return str;
    }).join("");
  }
  /**
   * @return {string}
   */
  toJSON() {
    return this.toString();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(encoder) {
    encoder.writeTypeRef(YXmlTextRefID);
  }
};
var readYXmlText = (decoder) => new YXmlText();
var AbstractStruct = class {
  /**
   * @param {ID} id
   * @param {number} length
   */
  constructor(id2, length2) {
    this.id = id2;
    this.length = length2;
  }
  /**
   * @type {boolean}
   */
  get deleted() {
    throw methodUnimplemented();
  }
  /**
   * Merge this struct with the item to the right.
   * This method is already assuming that `this.id.clock + this.length === this.id.clock`.
   * Also this method does *not* remove right from StructStore!
   * @param {AbstractStruct} right
   * @return {boolean} whether this merged with right
   */
  mergeWith(right) {
    return false;
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   * @param {number} offset
   * @param {number} encodingRef
   */
  write(encoder, offset, encodingRef) {
    throw methodUnimplemented();
  }
  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(transaction, offset) {
    throw methodUnimplemented();
  }
};
var structGCRefNumber = 0;
var GC = class extends AbstractStruct {
  get deleted() {
    return true;
  }
  delete() {
  }
  /**
   * @param {GC} right
   * @return {boolean}
   */
  mergeWith(right) {
    if (this.constructor !== right.constructor) {
      return false;
    }
    this.length += right.length;
    return true;
  }
  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(transaction, offset) {
    if (offset > 0) {
      this.id.clock += offset;
      this.length -= offset;
    }
    addStruct(transaction.doc.store, this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    encoder.writeInfo(structGCRefNumber);
    encoder.writeLen(this.length - offset);
  }
  /**
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @return {null | number}
   */
  getMissing(transaction, store) {
    return null;
  }
};
var ContentBinary = class _ContentBinary {
  /**
   * @param {Uint8Array} content
   */
  constructor(content) {
    this.content = content;
  }
  /**
   * @return {number}
   */
  getLength() {
    return 1;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [this.content];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return true;
  }
  /**
   * @return {ContentBinary}
   */
  copy() {
    return new _ContentBinary(this.content);
  }
  /**
   * @param {number} offset
   * @return {ContentBinary}
   */
  splice(offset) {
    throw methodUnimplemented();
  }
  /**
   * @param {ContentBinary} right
   * @return {boolean}
   */
  mergeWith(right) {
    return false;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(transaction, item) {
  }
  /**
   * @param {Transaction} transaction
   */
  delete(transaction) {
  }
  /**
   * @param {StructStore} store
   */
  gc(store) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    encoder.writeBuf(this.content);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 3;
  }
};
var readContentBinary = (decoder) => new ContentBinary(decoder.readBuf());
var ContentDeleted = class _ContentDeleted {
  /**
   * @param {number} len
   */
  constructor(len) {
    this.len = len;
  }
  /**
   * @return {number}
   */
  getLength() {
    return this.len;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return false;
  }
  /**
   * @return {ContentDeleted}
   */
  copy() {
    return new _ContentDeleted(this.len);
  }
  /**
   * @param {number} offset
   * @return {ContentDeleted}
   */
  splice(offset) {
    const right = new _ContentDeleted(this.len - offset);
    this.len = offset;
    return right;
  }
  /**
   * @param {ContentDeleted} right
   * @return {boolean}
   */
  mergeWith(right) {
    this.len += right.len;
    return true;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(transaction, item) {
    addToDeleteSet(transaction.deleteSet, item.id.client, item.id.clock, this.len);
    item.markDeleted();
  }
  /**
   * @param {Transaction} transaction
   */
  delete(transaction) {
  }
  /**
   * @param {StructStore} store
   */
  gc(store) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    encoder.writeLen(this.len - offset);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 1;
  }
};
var readContentDeleted = (decoder) => new ContentDeleted(decoder.readLen());
var createDocFromOpts = (guid, opts) => new Doc({ guid, ...opts, shouldLoad: opts.shouldLoad || opts.autoLoad || false });
var ContentDoc = class _ContentDoc {
  /**
   * @param {Doc} doc
   */
  constructor(doc2) {
    if (doc2._item) {
      console.error("This document was already integrated as a sub-document. You should create a second instance instead with the same guid.");
    }
    this.doc = doc2;
    const opts = {};
    this.opts = opts;
    if (!doc2.gc) {
      opts.gc = false;
    }
    if (doc2.autoLoad) {
      opts.autoLoad = true;
    }
    if (doc2.meta !== null) {
      opts.meta = doc2.meta;
    }
  }
  /**
   * @return {number}
   */
  getLength() {
    return 1;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [this.doc];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return true;
  }
  /**
   * @return {ContentDoc}
   */
  copy() {
    return new _ContentDoc(createDocFromOpts(this.doc.guid, this.opts));
  }
  /**
   * @param {number} offset
   * @return {ContentDoc}
   */
  splice(offset) {
    throw methodUnimplemented();
  }
  /**
   * @param {ContentDoc} right
   * @return {boolean}
   */
  mergeWith(right) {
    return false;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(transaction, item) {
    this.doc._item = item;
    transaction.subdocsAdded.add(this.doc);
    if (this.doc.shouldLoad) {
      transaction.subdocsLoaded.add(this.doc);
    }
  }
  /**
   * @param {Transaction} transaction
   */
  delete(transaction) {
    if (transaction.subdocsAdded.has(this.doc)) {
      transaction.subdocsAdded.delete(this.doc);
    } else {
      transaction.subdocsRemoved.add(this.doc);
    }
  }
  /**
   * @param {StructStore} store
   */
  gc(store) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    encoder.writeString(this.doc.guid);
    encoder.writeAny(this.opts);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 9;
  }
};
var readContentDoc = (decoder) => new ContentDoc(createDocFromOpts(decoder.readString(), decoder.readAny()));
var ContentEmbed = class _ContentEmbed {
  /**
   * @param {Object} embed
   */
  constructor(embed) {
    this.embed = embed;
  }
  /**
   * @return {number}
   */
  getLength() {
    return 1;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [this.embed];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return true;
  }
  /**
   * @return {ContentEmbed}
   */
  copy() {
    return new _ContentEmbed(this.embed);
  }
  /**
   * @param {number} offset
   * @return {ContentEmbed}
   */
  splice(offset) {
    throw methodUnimplemented();
  }
  /**
   * @param {ContentEmbed} right
   * @return {boolean}
   */
  mergeWith(right) {
    return false;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(transaction, item) {
  }
  /**
   * @param {Transaction} transaction
   */
  delete(transaction) {
  }
  /**
   * @param {StructStore} store
   */
  gc(store) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    encoder.writeJSON(this.embed);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 5;
  }
};
var readContentEmbed = (decoder) => new ContentEmbed(decoder.readJSON());
var ContentFormat = class _ContentFormat {
  /**
   * @param {string} key
   * @param {Object} value
   */
  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
  /**
   * @return {number}
   */
  getLength() {
    return 1;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return false;
  }
  /**
   * @return {ContentFormat}
   */
  copy() {
    return new _ContentFormat(this.key, this.value);
  }
  /**
   * @param {number} _offset
   * @return {ContentFormat}
   */
  splice(_offset) {
    throw methodUnimplemented();
  }
  /**
   * @param {ContentFormat} _right
   * @return {boolean}
   */
  mergeWith(_right) {
    return false;
  }
  /**
   * @param {Transaction} _transaction
   * @param {Item} item
   */
  integrate(_transaction, item) {
    const p = (
      /** @type {YText} */
      item.parent
    );
    p._searchMarker = null;
    p._hasFormatting = true;
  }
  /**
   * @param {Transaction} transaction
   */
  delete(transaction) {
  }
  /**
   * @param {StructStore} store
   */
  gc(store) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    encoder.writeKey(this.key);
    encoder.writeJSON(this.value);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 6;
  }
};
var readContentFormat = (decoder) => new ContentFormat(decoder.readKey(), decoder.readJSON());
var ContentJSON = class _ContentJSON {
  /**
   * @param {Array<any>} arr
   */
  constructor(arr) {
    this.arr = arr;
  }
  /**
   * @return {number}
   */
  getLength() {
    return this.arr.length;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return this.arr;
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return true;
  }
  /**
   * @return {ContentJSON}
   */
  copy() {
    return new _ContentJSON(this.arr);
  }
  /**
   * @param {number} offset
   * @return {ContentJSON}
   */
  splice(offset) {
    const right = new _ContentJSON(this.arr.slice(offset));
    this.arr = this.arr.slice(0, offset);
    return right;
  }
  /**
   * @param {ContentJSON} right
   * @return {boolean}
   */
  mergeWith(right) {
    this.arr = this.arr.concat(right.arr);
    return true;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(transaction, item) {
  }
  /**
   * @param {Transaction} transaction
   */
  delete(transaction) {
  }
  /**
   * @param {StructStore} store
   */
  gc(store) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    const len = this.arr.length;
    encoder.writeLen(len - offset);
    for (let i = offset; i < len; i++) {
      const c = this.arr[i];
      encoder.writeString(c === void 0 ? "undefined" : JSON.stringify(c));
    }
  }
  /**
   * @return {number}
   */
  getRef() {
    return 2;
  }
};
var readContentJSON = (decoder) => {
  const len = decoder.readLen();
  const cs = [];
  for (let i = 0; i < len; i++) {
    const c = decoder.readString();
    if (c === "undefined") {
      cs.push(void 0);
    } else {
      cs.push(JSON.parse(c));
    }
  }
  return new ContentJSON(cs);
};
var isDevMode = getVariable("node_env") === "development";
var ContentAny = class _ContentAny {
  /**
   * @param {Array<any>} arr
   */
  constructor(arr) {
    this.arr = arr;
    isDevMode && deepFreeze(arr);
  }
  /**
   * @return {number}
   */
  getLength() {
    return this.arr.length;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return this.arr;
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return true;
  }
  /**
   * @return {ContentAny}
   */
  copy() {
    return new _ContentAny(this.arr);
  }
  /**
   * @param {number} offset
   * @return {ContentAny}
   */
  splice(offset) {
    const right = new _ContentAny(this.arr.slice(offset));
    this.arr = this.arr.slice(0, offset);
    return right;
  }
  /**
   * @param {ContentAny} right
   * @return {boolean}
   */
  mergeWith(right) {
    this.arr = this.arr.concat(right.arr);
    return true;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(transaction, item) {
  }
  /**
   * @param {Transaction} transaction
   */
  delete(transaction) {
  }
  /**
   * @param {StructStore} store
   */
  gc(store) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    const len = this.arr.length;
    encoder.writeLen(len - offset);
    for (let i = offset; i < len; i++) {
      const c = this.arr[i];
      encoder.writeAny(c);
    }
  }
  /**
   * @return {number}
   */
  getRef() {
    return 8;
  }
};
var readContentAny = (decoder) => {
  const len = decoder.readLen();
  const cs = [];
  for (let i = 0; i < len; i++) {
    cs.push(decoder.readAny());
  }
  return new ContentAny(cs);
};
var ContentString = class _ContentString {
  /**
   * @param {string} str
   */
  constructor(str) {
    this.str = str;
  }
  /**
   * @return {number}
   */
  getLength() {
    return this.str.length;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return this.str.split("");
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return true;
  }
  /**
   * @return {ContentString}
   */
  copy() {
    return new _ContentString(this.str);
  }
  /**
   * @param {number} offset
   * @return {ContentString}
   */
  splice(offset) {
    const right = new _ContentString(this.str.slice(offset));
    this.str = this.str.slice(0, offset);
    const firstCharCode = this.str.charCodeAt(offset - 1);
    if (firstCharCode >= 55296 && firstCharCode <= 56319) {
      this.str = this.str.slice(0, offset - 1) + "\uFFFD";
      right.str = "\uFFFD" + right.str.slice(1);
    }
    return right;
  }
  /**
   * @param {ContentString} right
   * @return {boolean}
   */
  mergeWith(right) {
    this.str += right.str;
    return true;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(transaction, item) {
  }
  /**
   * @param {Transaction} transaction
   */
  delete(transaction) {
  }
  /**
   * @param {StructStore} store
   */
  gc(store) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    encoder.writeString(offset === 0 ? this.str : this.str.slice(offset));
  }
  /**
   * @return {number}
   */
  getRef() {
    return 4;
  }
};
var readContentString = (decoder) => new ContentString(decoder.readString());
var typeRefs = [
  readYArray,
  readYMap,
  readYText,
  readYXmlElement,
  readYXmlFragment,
  readYXmlHook,
  readYXmlText
];
var YArrayRefID = 0;
var YMapRefID = 1;
var YTextRefID = 2;
var YXmlElementRefID = 3;
var YXmlFragmentRefID = 4;
var YXmlHookRefID = 5;
var YXmlTextRefID = 6;
var ContentType = class _ContentType {
  /**
   * @param {AbstractType<any>} type
   */
  constructor(type) {
    this.type = type;
  }
  /**
   * @return {number}
   */
  getLength() {
    return 1;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [this.type];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return true;
  }
  /**
   * @return {ContentType}
   */
  copy() {
    return new _ContentType(this.type._copy());
  }
  /**
   * @param {number} offset
   * @return {ContentType}
   */
  splice(offset) {
    throw methodUnimplemented();
  }
  /**
   * @param {ContentType} right
   * @return {boolean}
   */
  mergeWith(right) {
    return false;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(transaction, item) {
    this.type._integrate(transaction.doc, item);
  }
  /**
   * @param {Transaction} transaction
   */
  delete(transaction) {
    let item = this.type._start;
    while (item !== null) {
      if (!item.deleted) {
        item.delete(transaction);
      } else if (item.id.clock < (transaction.beforeState.get(item.id.client) || 0)) {
        transaction._mergeStructs.push(item);
      }
      item = item.right;
    }
    this.type._map.forEach((item2) => {
      if (!item2.deleted) {
        item2.delete(transaction);
      } else if (item2.id.clock < (transaction.beforeState.get(item2.id.client) || 0)) {
        transaction._mergeStructs.push(item2);
      }
    });
    transaction.changed.delete(this.type);
  }
  /**
   * @param {StructStore} store
   */
  gc(store) {
    let item = this.type._start;
    while (item !== null) {
      item.gc(store, true);
      item = item.right;
    }
    this.type._start = null;
    this.type._map.forEach(
      /** @param {Item | null} item */
      (item2) => {
        while (item2 !== null) {
          item2.gc(store, true);
          item2 = item2.left;
        }
      }
    );
    this.type._map = /* @__PURE__ */ new Map();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    this.type._write(encoder);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 7;
  }
};
var readContentType = (decoder) => new ContentType(typeRefs[decoder.readTypeRef()](decoder));
var followRedone = (store, id2) => {
  let nextID = id2;
  let diff = 0;
  let item;
  do {
    if (diff > 0) {
      nextID = createID(nextID.client, nextID.clock + diff);
    }
    item = getItem(store, nextID);
    diff = nextID.clock - item.id.clock;
    nextID = item.redone;
  } while (nextID !== null && item instanceof Item);
  return {
    item,
    diff
  };
};
var keepItem = (item, keep) => {
  while (item !== null && item.keep !== keep) {
    item.keep = keep;
    item = /** @type {AbstractType<any>} */
    item.parent._item;
  }
};
var splitItem = (transaction, leftItem, diff) => {
  const { client, clock } = leftItem.id;
  const rightItem = new Item(
    createID(client, clock + diff),
    leftItem,
    createID(client, clock + diff - 1),
    leftItem.right,
    leftItem.rightOrigin,
    leftItem.parent,
    leftItem.parentSub,
    leftItem.content.splice(diff)
  );
  if (leftItem.deleted) {
    rightItem.markDeleted();
  }
  if (leftItem.keep) {
    rightItem.keep = true;
  }
  if (leftItem.redone !== null) {
    rightItem.redone = createID(leftItem.redone.client, leftItem.redone.clock + diff);
  }
  leftItem.right = rightItem;
  if (rightItem.right !== null) {
    rightItem.right.left = rightItem;
  }
  transaction._mergeStructs.push(rightItem);
  if (rightItem.parentSub !== null && rightItem.right === null) {
    rightItem.parent._map.set(rightItem.parentSub, rightItem);
  }
  leftItem.length = diff;
  return rightItem;
};
var isDeletedByUndoStack = (stack, id2) => some(
  stack,
  /** @param {StackItem} s */
  (s) => isDeleted(s.deletions, id2)
);
var redoItem = (transaction, item, redoitems, itemsToDelete, ignoreRemoteMapChanges, um) => {
  const doc2 = transaction.doc;
  const store = doc2.store;
  const ownClientID = doc2.clientID;
  const redone = item.redone;
  if (redone !== null) {
    return getItemCleanStart(transaction, redone);
  }
  let parentItem = (
    /** @type {AbstractType<any>} */
    item.parent._item
  );
  let left = null;
  let right;
  if (parentItem !== null && parentItem.deleted === true) {
    if (parentItem.redone === null && (!redoitems.has(parentItem) || redoItem(transaction, parentItem, redoitems, itemsToDelete, ignoreRemoteMapChanges, um) === null)) {
      return null;
    }
    while (parentItem.redone !== null) {
      parentItem = getItemCleanStart(transaction, parentItem.redone);
    }
  }
  const parentType = parentItem === null ? (
    /** @type {AbstractType<any>} */
    item.parent
  ) : (
    /** @type {ContentType} */
    parentItem.content.type
  );
  if (item.parentSub === null) {
    left = item.left;
    right = item;
    while (left !== null) {
      let leftTrace = left;
      while (leftTrace !== null && /** @type {AbstractType<any>} */
      leftTrace.parent._item !== parentItem) {
        leftTrace = leftTrace.redone === null ? null : getItemCleanStart(transaction, leftTrace.redone);
      }
      if (leftTrace !== null && /** @type {AbstractType<any>} */
      leftTrace.parent._item === parentItem) {
        left = leftTrace;
        break;
      }
      left = left.left;
    }
    while (right !== null) {
      let rightTrace = right;
      while (rightTrace !== null && /** @type {AbstractType<any>} */
      rightTrace.parent._item !== parentItem) {
        rightTrace = rightTrace.redone === null ? null : getItemCleanStart(transaction, rightTrace.redone);
      }
      if (rightTrace !== null && /** @type {AbstractType<any>} */
      rightTrace.parent._item === parentItem) {
        right = rightTrace;
        break;
      }
      right = right.right;
    }
  } else {
    right = null;
    if (item.right && !ignoreRemoteMapChanges) {
      left = item;
      while (left !== null && left.right !== null && (left.right.redone || isDeleted(itemsToDelete, left.right.id) || isDeletedByUndoStack(um.undoStack, left.right.id) || isDeletedByUndoStack(um.redoStack, left.right.id))) {
        left = left.right;
        while (left.redone) left = getItemCleanStart(transaction, left.redone);
      }
      if (left && left.right !== null) {
        return null;
      }
    } else {
      left = parentType._map.get(item.parentSub) || null;
    }
    if (left !== null && /** @type {AbstractType<any>} */
    left.parent._item !== parentItem) {
      left = parentType._map.get(item.parentSub) || null;
    }
  }
  const nextClock = getState(store, ownClientID);
  const nextId = createID(ownClientID, nextClock);
  const redoneItem = new Item(
    nextId,
    left,
    left && left.lastId,
    right,
    right && right.id,
    parentType,
    item.parentSub,
    item.content.copy()
  );
  item.redone = nextId;
  keepItem(redoneItem, true);
  redoneItem.integrate(transaction, 0);
  return redoneItem;
};
var Item = class _Item extends AbstractStruct {
  /**
   * @param {ID} id
   * @param {Item | null} left
   * @param {ID | null} origin
   * @param {Item | null} right
   * @param {ID | null} rightOrigin
   * @param {AbstractType<any>|ID|null} parent Is a type if integrated, is null if it is possible to copy parent from left or right, is ID before integration to search for it.
   * @param {string | null} parentSub
   * @param {AbstractContent} content
   */
  constructor(id2, left, origin, right, rightOrigin, parent, parentSub, content) {
    super(id2, content.getLength());
    this.origin = origin;
    this.left = left;
    this.right = right;
    this.rightOrigin = rightOrigin;
    this.parent = parent;
    this.parentSub = parentSub;
    this.redone = null;
    this.content = content;
    this.info = this.content.isCountable() ? BIT2 : 0;
  }
  /**
   * This is used to mark the item as an indexed fast-search marker
   *
   * @type {boolean}
   */
  set marker(isMarked) {
    if ((this.info & BIT4) > 0 !== isMarked) {
      this.info ^= BIT4;
    }
  }
  get marker() {
    return (this.info & BIT4) > 0;
  }
  /**
   * If true, do not garbage collect this Item.
   */
  get keep() {
    return (this.info & BIT1) > 0;
  }
  set keep(doKeep) {
    if (this.keep !== doKeep) {
      this.info ^= BIT1;
    }
  }
  get countable() {
    return (this.info & BIT2) > 0;
  }
  /**
   * Whether this item was deleted or not.
   * @type {Boolean}
   */
  get deleted() {
    return (this.info & BIT3) > 0;
  }
  set deleted(doDelete) {
    if (this.deleted !== doDelete) {
      this.info ^= BIT3;
    }
  }
  markDeleted() {
    this.info |= BIT3;
  }
  /**
   * Return the creator clientID of the missing op or define missing items and return null.
   *
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @return {null | number}
   */
  getMissing(transaction, store) {
    if (this.origin && this.origin.client !== this.id.client && this.origin.clock >= getState(store, this.origin.client)) {
      return this.origin.client;
    }
    if (this.rightOrigin && this.rightOrigin.client !== this.id.client && this.rightOrigin.clock >= getState(store, this.rightOrigin.client)) {
      return this.rightOrigin.client;
    }
    if (this.parent && this.parent.constructor === ID && this.id.client !== this.parent.client && this.parent.clock >= getState(store, this.parent.client)) {
      return this.parent.client;
    }
    if (this.origin) {
      this.left = getItemCleanEnd(transaction, store, this.origin);
      this.origin = this.left.lastId;
    }
    if (this.rightOrigin) {
      this.right = getItemCleanStart(transaction, this.rightOrigin);
      this.rightOrigin = this.right.id;
    }
    if (this.left && this.left.constructor === GC || this.right && this.right.constructor === GC) {
      this.parent = null;
    } else if (!this.parent) {
      if (this.left && this.left.constructor === _Item) {
        this.parent = this.left.parent;
        this.parentSub = this.left.parentSub;
      } else if (this.right && this.right.constructor === _Item) {
        this.parent = this.right.parent;
        this.parentSub = this.right.parentSub;
      }
    } else if (this.parent.constructor === ID) {
      const parentItem = getItem(store, this.parent);
      if (parentItem.constructor === GC) {
        this.parent = null;
      } else {
        this.parent = /** @type {ContentType} */
        parentItem.content.type;
      }
    }
    return null;
  }
  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(transaction, offset) {
    if (offset > 0) {
      this.id.clock += offset;
      this.left = getItemCleanEnd(transaction, transaction.doc.store, createID(this.id.client, this.id.clock - 1));
      this.origin = this.left.lastId;
      this.content = this.content.splice(offset);
      this.length -= offset;
    }
    if (this.parent) {
      if (!this.left && (!this.right || this.right.left !== null) || this.left && this.left.right !== this.right) {
        let left = this.left;
        let o;
        if (left !== null) {
          o = left.right;
        } else if (this.parentSub !== null) {
          o = /** @type {AbstractType<any>} */
          this.parent._map.get(this.parentSub) || null;
          while (o !== null && o.left !== null) {
            o = o.left;
          }
        } else {
          o = /** @type {AbstractType<any>} */
          this.parent._start;
        }
        const conflictingItems = /* @__PURE__ */ new Set();
        const itemsBeforeOrigin = /* @__PURE__ */ new Set();
        while (o !== null && o !== this.right) {
          itemsBeforeOrigin.add(o);
          conflictingItems.add(o);
          if (compareIDs(this.origin, o.origin)) {
            if (o.id.client < this.id.client) {
              left = o;
              conflictingItems.clear();
            } else if (compareIDs(this.rightOrigin, o.rightOrigin)) {
              break;
            }
          } else if (o.origin !== null && itemsBeforeOrigin.has(getItem(transaction.doc.store, o.origin))) {
            if (!conflictingItems.has(getItem(transaction.doc.store, o.origin))) {
              left = o;
              conflictingItems.clear();
            }
          } else {
            break;
          }
          o = o.right;
        }
        this.left = left;
      }
      if (this.left !== null) {
        const right = this.left.right;
        this.right = right;
        this.left.right = this;
      } else {
        let r;
        if (this.parentSub !== null) {
          r = /** @type {AbstractType<any>} */
          this.parent._map.get(this.parentSub) || null;
          while (r !== null && r.left !== null) {
            r = r.left;
          }
        } else {
          r = /** @type {AbstractType<any>} */
          this.parent._start;
          this.parent._start = this;
        }
        this.right = r;
      }
      if (this.right !== null) {
        this.right.left = this;
      } else if (this.parentSub !== null) {
        this.parent._map.set(this.parentSub, this);
        if (this.left !== null) {
          this.left.delete(transaction);
        }
      }
      if (this.parentSub === null && this.countable && !this.deleted) {
        this.parent._length += this.length;
      }
      addStruct(transaction.doc.store, this);
      this.content.integrate(transaction, this);
      addChangedTypeToTransaction(
        transaction,
        /** @type {AbstractType<any>} */
        this.parent,
        this.parentSub
      );
      if (
        /** @type {AbstractType<any>} */
        this.parent._item !== null && /** @type {AbstractType<any>} */
        this.parent._item.deleted || this.parentSub !== null && this.right !== null
      ) {
        this.delete(transaction);
      }
    } else {
      new GC(this.id, this.length).integrate(transaction, 0);
    }
  }
  /**
   * Returns the next non-deleted item
   */
  get next() {
    let n = this.right;
    while (n !== null && n.deleted) {
      n = n.right;
    }
    return n;
  }
  /**
   * Returns the previous non-deleted item
   */
  get prev() {
    let n = this.left;
    while (n !== null && n.deleted) {
      n = n.left;
    }
    return n;
  }
  /**
   * Computes the last content address of this Item.
   */
  get lastId() {
    return this.length === 1 ? this.id : createID(this.id.client, this.id.clock + this.length - 1);
  }
  /**
   * Try to merge two items
   *
   * @param {Item} right
   * @return {boolean}
   */
  mergeWith(right) {
    if (this.constructor === right.constructor && compareIDs(right.origin, this.lastId) && this.right === right && compareIDs(this.rightOrigin, right.rightOrigin) && this.id.client === right.id.client && this.id.clock + this.length === right.id.clock && this.deleted === right.deleted && this.redone === null && right.redone === null && this.content.constructor === right.content.constructor && this.content.mergeWith(right.content)) {
      const searchMarker = (
        /** @type {AbstractType<any>} */
        this.parent._searchMarker
      );
      if (searchMarker) {
        searchMarker.forEach((marker) => {
          if (marker.p === right) {
            marker.p = this;
            if (!this.deleted && this.countable) {
              marker.index -= this.length;
            }
          }
        });
      }
      if (right.keep) {
        this.keep = true;
      }
      this.right = right.right;
      if (this.right !== null) {
        this.right.left = this;
      }
      this.length += right.length;
      return true;
    }
    return false;
  }
  /**
   * Mark this Item as deleted.
   *
   * @param {Transaction} transaction
   */
  delete(transaction) {
    if (!this.deleted) {
      const parent = (
        /** @type {AbstractType<any>} */
        this.parent
      );
      if (this.countable && this.parentSub === null) {
        parent._length -= this.length;
      }
      this.markDeleted();
      addToDeleteSet(transaction.deleteSet, this.id.client, this.id.clock, this.length);
      addChangedTypeToTransaction(transaction, parent, this.parentSub);
      this.content.delete(transaction);
    }
  }
  /**
   * @param {StructStore} store
   * @param {boolean} parentGCd
   */
  gc(store, parentGCd) {
    if (!this.deleted) {
      throw unexpectedCase();
    }
    this.content.gc(store);
    if (parentGCd) {
      replaceStruct(store, this, new GC(this.id, this.length));
    } else {
      this.content = new ContentDeleted(this.length);
    }
  }
  /**
   * Transform the properties of this type to binary and write it to an
   * BinaryEncoder.
   *
   * This is called when this Item is sent to a remote peer.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   * @param {number} offset
   */
  write(encoder, offset) {
    const origin = offset > 0 ? createID(this.id.client, this.id.clock + offset - 1) : this.origin;
    const rightOrigin = this.rightOrigin;
    const parentSub = this.parentSub;
    const info = this.content.getRef() & BITS5 | (origin === null ? 0 : BIT8) | // origin is defined
    (rightOrigin === null ? 0 : BIT7) | // right origin is defined
    (parentSub === null ? 0 : BIT6);
    encoder.writeInfo(info);
    if (origin !== null) {
      encoder.writeLeftID(origin);
    }
    if (rightOrigin !== null) {
      encoder.writeRightID(rightOrigin);
    }
    if (origin === null && rightOrigin === null) {
      const parent = (
        /** @type {AbstractType<any>} */
        this.parent
      );
      if (parent._item !== void 0) {
        const parentItem = parent._item;
        if (parentItem === null) {
          const ykey = findRootTypeKey(parent);
          encoder.writeParentInfo(true);
          encoder.writeString(ykey);
        } else {
          encoder.writeParentInfo(false);
          encoder.writeLeftID(parentItem.id);
        }
      } else if (parent.constructor === String) {
        encoder.writeParentInfo(true);
        encoder.writeString(parent);
      } else if (parent.constructor === ID) {
        encoder.writeParentInfo(false);
        encoder.writeLeftID(parent);
      } else {
        unexpectedCase();
      }
      if (parentSub !== null) {
        encoder.writeString(parentSub);
      }
    }
    this.content.write(encoder, offset);
  }
};
var readItemContent = (decoder, info) => contentRefs[info & BITS5](decoder);
var contentRefs = [
  () => {
    unexpectedCase();
  },
  // GC is not ItemContent
  readContentDeleted,
  // 1
  readContentJSON,
  // 2
  readContentBinary,
  // 3
  readContentString,
  // 4
  readContentEmbed,
  // 5
  readContentFormat,
  // 6
  readContentType,
  // 7
  readContentAny,
  // 8
  readContentDoc,
  // 9
  () => {
    unexpectedCase();
  }
  // 10 - Skip is not ItemContent
];
var structSkipRefNumber = 10;
var Skip = class extends AbstractStruct {
  get deleted() {
    return true;
  }
  delete() {
  }
  /**
   * @param {Skip} right
   * @return {boolean}
   */
  mergeWith(right) {
    if (this.constructor !== right.constructor) {
      return false;
    }
    this.length += right.length;
    return true;
  }
  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(transaction, offset) {
    unexpectedCase();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    encoder.writeInfo(structSkipRefNumber);
    writeVarUint(encoder.restEncoder, this.length - offset);
  }
  /**
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @return {null | number}
   */
  getMissing(transaction, store) {
    return null;
  }
};
var glo = (
  /** @type {any} */
  typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {}
);
var importIdentifier = "__ $YJS$ __";
if (glo[importIdentifier] === true) {
  console.error("Yjs was already imported. This breaks constructor checks and will lead to issues! - https://github.com/yjs/yjs/issues/438");
}
glo[importIdentifier] = true;

// node_modules/lib0/broadcastchannel.js
var channels = /* @__PURE__ */ new Map();
var LocalStoragePolyfill = class {
  /**
   * @param {string} room
   */
  constructor(room) {
    this.room = room;
    this.onmessage = null;
    this._onChange = (e) => e.key === room && this.onmessage !== null && this.onmessage({ data: fromBase64(e.newValue || "") });
    onChange(this._onChange);
  }
  /**
   * @param {ArrayBuffer} buf
   */
  postMessage(buf) {
    varStorage.setItem(this.room, toBase64(createUint8ArrayFromArrayBuffer(buf)));
  }
  close() {
    offChange(this._onChange);
  }
};
var BC = typeof BroadcastChannel === "undefined" ? LocalStoragePolyfill : BroadcastChannel;
var getChannel = (room) => setIfUndefined(channels, room, () => {
  const subs = create2();
  const bc = new BC(room);
  bc.onmessage = (e) => subs.forEach((sub) => sub(e.data, "broadcastchannel"));
  return {
    bc,
    subs
  };
});
var subscribe = (room, f) => {
  getChannel(room).subs.add(f);
  return f;
};
var unsubscribe = (room, f) => {
  const channel = getChannel(room);
  const unsubscribed = channel.subs.delete(f);
  if (unsubscribed && channel.subs.size === 0) {
    channel.bc.close();
    channels.delete(room);
  }
  return unsubscribed;
};
var publish = (room, data, origin = null) => {
  const c = getChannel(room);
  c.bc.postMessage(data);
  c.subs.forEach((sub) => sub(data, origin));
};

// node_modules/y-protocols/sync.js
var messageYjsSyncStep1 = 0;
var messageYjsSyncStep2 = 1;
var messageYjsUpdate = 2;
var writeSyncStep1 = (encoder, doc2) => {
  writeVarUint(encoder, messageYjsSyncStep1);
  const sv = encodeStateVector(doc2);
  writeVarUint8Array(encoder, sv);
};
var writeSyncStep2 = (encoder, doc2, encodedStateVector) => {
  writeVarUint(encoder, messageYjsSyncStep2);
  writeVarUint8Array(encoder, encodeStateAsUpdate(doc2, encodedStateVector));
};
var readSyncStep1 = (decoder, encoder, doc2) => writeSyncStep2(encoder, doc2, readVarUint8Array(decoder));
var readSyncStep2 = (decoder, doc2, transactionOrigin, errorHandler) => {
  try {
    applyUpdate(doc2, readVarUint8Array(decoder), transactionOrigin);
  } catch (error) {
    if (errorHandler != null) errorHandler(
      /** @type {Error} */
      error
    );
    console.error("Caught error while handling a Yjs update", error);
  }
};
var writeUpdate = (encoder, update) => {
  writeVarUint(encoder, messageYjsUpdate);
  writeVarUint8Array(encoder, update);
};
var readUpdate = readSyncStep2;
var readSyncMessage = (decoder, encoder, doc2, transactionOrigin, errorHandler) => {
  const messageType = readVarUint(decoder);
  switch (messageType) {
    case messageYjsSyncStep1:
      readSyncStep1(decoder, encoder, doc2);
      break;
    case messageYjsSyncStep2:
      readSyncStep2(decoder, doc2, transactionOrigin, errorHandler);
      break;
    case messageYjsUpdate:
      readUpdate(decoder, doc2, transactionOrigin, errorHandler);
      break;
    default:
      throw new Error("Unknown message type");
  }
  return messageType;
};

// node_modules/y-protocols/auth.js
var messagePermissionDenied = 0;
var readAuthMessage = (decoder, y, permissionDeniedHandler2) => {
  switch (readVarUint(decoder)) {
    case messagePermissionDenied:
      permissionDeniedHandler2(y, readVarString(decoder));
  }
};

// node_modules/y-protocols/awareness.js
var outdatedTimeout = 3e4;
var Awareness = class extends Observable {
  /**
   * @param {Y.Doc} doc
   */
  constructor(doc2) {
    super();
    this.doc = doc2;
    this.clientID = doc2.clientID;
    this.states = /* @__PURE__ */ new Map();
    this.meta = /* @__PURE__ */ new Map();
    this._checkInterval = /** @type {any} */
    setInterval(() => {
      const now = getUnixTime();
      if (this.getLocalState() !== null && outdatedTimeout / 2 <= now - /** @type {{lastUpdated:number}} */
      this.meta.get(this.clientID).lastUpdated) {
        this.setLocalState(this.getLocalState());
      }
      const remove = [];
      this.meta.forEach((meta, clientid) => {
        if (clientid !== this.clientID && outdatedTimeout <= now - meta.lastUpdated && this.states.has(clientid)) {
          remove.push(clientid);
        }
      });
      if (remove.length > 0) {
        removeAwarenessStates(this, remove, "timeout");
      }
    }, floor(outdatedTimeout / 10));
    doc2.on("destroy", () => {
      this.destroy();
    });
    this.setLocalState({});
  }
  destroy() {
    this.emit("destroy", [this]);
    this.setLocalState(null);
    super.destroy();
    clearInterval(this._checkInterval);
  }
  /**
   * @return {Object<string,any>|null}
   */
  getLocalState() {
    return this.states.get(this.clientID) || null;
  }
  /**
   * @param {Object<string,any>|null} state
   */
  setLocalState(state) {
    const clientID = this.clientID;
    const currLocalMeta = this.meta.get(clientID);
    const clock = currLocalMeta === void 0 ? 0 : currLocalMeta.clock + 1;
    const prevState = this.states.get(clientID);
    if (state === null) {
      this.states.delete(clientID);
    } else {
      this.states.set(clientID, state);
    }
    this.meta.set(clientID, {
      clock,
      lastUpdated: getUnixTime()
    });
    const added = [];
    const updated = [];
    const filteredUpdated = [];
    const removed = [];
    if (state === null) {
      removed.push(clientID);
    } else if (prevState == null) {
      if (state != null) {
        added.push(clientID);
      }
    } else {
      updated.push(clientID);
      if (!equalityDeep(prevState, state)) {
        filteredUpdated.push(clientID);
      }
    }
    if (added.length > 0 || filteredUpdated.length > 0 || removed.length > 0) {
      this.emit("change", [{ added, updated: filteredUpdated, removed }, "local"]);
    }
    this.emit("update", [{ added, updated, removed }, "local"]);
  }
  /**
   * @param {string} field
   * @param {any} value
   */
  setLocalStateField(field, value) {
    const state = this.getLocalState();
    if (state !== null) {
      this.setLocalState({
        ...state,
        [field]: value
      });
    }
  }
  /**
   * @return {Map<number,Object<string,any>>}
   */
  getStates() {
    return this.states;
  }
};
var removeAwarenessStates = (awareness, clients, origin) => {
  const removed = [];
  for (let i = 0; i < clients.length; i++) {
    const clientID = clients[i];
    if (awareness.states.has(clientID)) {
      awareness.states.delete(clientID);
      if (clientID === awareness.clientID) {
        const curMeta = (
          /** @type {MetaClientState} */
          awareness.meta.get(clientID)
        );
        awareness.meta.set(clientID, {
          clock: curMeta.clock + 1,
          lastUpdated: getUnixTime()
        });
      }
      removed.push(clientID);
    }
  }
  if (removed.length > 0) {
    awareness.emit("change", [{ added: [], updated: [], removed }, origin]);
    awareness.emit("update", [{ added: [], updated: [], removed }, origin]);
  }
};
var encodeAwarenessUpdate = (awareness, clients, states = awareness.states) => {
  const len = clients.length;
  const encoder = createEncoder();
  writeVarUint(encoder, len);
  for (let i = 0; i < len; i++) {
    const clientID = clients[i];
    const state = states.get(clientID) || null;
    const clock = (
      /** @type {MetaClientState} */
      awareness.meta.get(clientID).clock
    );
    writeVarUint(encoder, clientID);
    writeVarUint(encoder, clock);
    writeVarString(encoder, JSON.stringify(state));
  }
  return toUint8Array(encoder);
};
var applyAwarenessUpdate = (awareness, update, origin) => {
  const decoder = createDecoder(update);
  const timestamp = getUnixTime();
  const added = [];
  const updated = [];
  const filteredUpdated = [];
  const removed = [];
  const len = readVarUint(decoder);
  for (let i = 0; i < len; i++) {
    const clientID = readVarUint(decoder);
    let clock = readVarUint(decoder);
    const state = JSON.parse(readVarString(decoder));
    const clientMeta = awareness.meta.get(clientID);
    const prevState = awareness.states.get(clientID);
    const currClock = clientMeta === void 0 ? 0 : clientMeta.clock;
    if (currClock < clock || currClock === clock && state === null && awareness.states.has(clientID)) {
      if (state === null) {
        if (clientID === awareness.clientID && awareness.getLocalState() != null) {
          clock++;
        } else {
          awareness.states.delete(clientID);
        }
      } else {
        awareness.states.set(clientID, state);
      }
      awareness.meta.set(clientID, {
        clock,
        lastUpdated: timestamp
      });
      if (clientMeta === void 0 && state !== null) {
        added.push(clientID);
      } else if (clientMeta !== void 0 && state === null) {
        removed.push(clientID);
      } else if (state !== null) {
        if (!equalityDeep(state, prevState)) {
          filteredUpdated.push(clientID);
        }
        updated.push(clientID);
      }
    }
  }
  if (added.length > 0 || filteredUpdated.length > 0 || removed.length > 0) {
    awareness.emit("change", [{
      added,
      updated: filteredUpdated,
      removed
    }, origin]);
  }
  if (added.length > 0 || updated.length > 0 || removed.length > 0) {
    awareness.emit("update", [{
      added,
      updated,
      removed
    }, origin]);
  }
};

// node_modules/lib0/url.js
var encodeQueryParams = (params2) => map2(params2, (val, key) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`).join("&");

// node_modules/y-websocket/src/y-websocket.js
var messageSync = 0;
var messageQueryAwareness = 3;
var messageAwareness = 1;
var messageAuth = 2;
var messageHandlers = [];
messageHandlers[messageSync] = (encoder, decoder, provider, emitSynced, _messageType) => {
  writeVarUint(encoder, messageSync);
  const syncMessageType = readSyncMessage(
    decoder,
    encoder,
    provider.doc,
    provider
  );
  if (emitSynced && syncMessageType === messageYjsSyncStep2 && !provider.synced) {
    provider.synced = true;
  }
};
messageHandlers[messageQueryAwareness] = (encoder, _decoder, provider, _emitSynced, _messageType) => {
  writeVarUint(encoder, messageAwareness);
  writeVarUint8Array(
    encoder,
    encodeAwarenessUpdate(
      provider.awareness,
      Array.from(provider.awareness.getStates().keys())
    )
  );
};
messageHandlers[messageAwareness] = (_encoder, decoder, provider, _emitSynced, _messageType) => {
  applyAwarenessUpdate(
    provider.awareness,
    readVarUint8Array(decoder),
    provider
  );
};
messageHandlers[messageAuth] = (_encoder, decoder, provider, _emitSynced, _messageType) => {
  readAuthMessage(
    decoder,
    provider.doc,
    (_ydoc, reason) => permissionDeniedHandler(provider, reason)
  );
};
var messageReconnectTimeout = 3e4;
var permissionDeniedHandler = (provider, reason) => console.warn(`Permission denied to access ${provider.url}.
${reason}`);
var readMessage = (provider, buf, emitSynced) => {
  const decoder = createDecoder(buf);
  const encoder = createEncoder();
  const messageType = readVarUint(decoder);
  const messageHandler = provider.messageHandlers[messageType];
  if (
    /** @type {any} */
    messageHandler
  ) {
    messageHandler(encoder, decoder, provider, emitSynced, messageType);
  } else {
    console.error("Unable to compute message");
  }
  return encoder;
};
var setupWS = (provider) => {
  if (provider.shouldConnect && provider.ws === null) {
    const websocket = new provider._WS(provider.url);
    websocket.binaryType = "arraybuffer";
    provider.ws = websocket;
    provider.wsconnecting = true;
    provider.wsconnected = false;
    provider.synced = false;
    websocket.onmessage = (event) => {
      provider.wsLastMessageReceived = getUnixTime();
      const encoder = readMessage(provider, new Uint8Array(event.data), true);
      if (length(encoder) > 1) {
        websocket.send(toUint8Array(encoder));
      }
    };
    websocket.onerror = (event) => {
      provider.emit("connection-error", [event, provider]);
    };
    websocket.onclose = (event) => {
      provider.emit("connection-close", [event, provider]);
      provider.ws = null;
      provider.wsconnecting = false;
      if (provider.wsconnected) {
        provider.wsconnected = false;
        provider.synced = false;
        removeAwarenessStates(
          provider.awareness,
          Array.from(provider.awareness.getStates().keys()).filter(
            (client) => client !== provider.doc.clientID
          ),
          provider
        );
        provider.emit("status", [{
          status: "disconnected"
        }]);
      } else {
        provider.wsUnsuccessfulReconnects++;
      }
      setTimeout(
        setupWS,
        min(
          pow(2, provider.wsUnsuccessfulReconnects) * 100,
          provider.maxBackoffTime
        ),
        provider
      );
    };
    websocket.onopen = () => {
      provider.wsLastMessageReceived = getUnixTime();
      provider.wsconnecting = false;
      provider.wsconnected = true;
      provider.wsUnsuccessfulReconnects = 0;
      provider.emit("status", [{
        status: "connected"
      }]);
      const encoder = createEncoder();
      writeVarUint(encoder, messageSync);
      writeSyncStep1(encoder, provider.doc);
      websocket.send(toUint8Array(encoder));
      if (provider.awareness.getLocalState() !== null) {
        const encoderAwarenessState = createEncoder();
        writeVarUint(encoderAwarenessState, messageAwareness);
        writeVarUint8Array(
          encoderAwarenessState,
          encodeAwarenessUpdate(provider.awareness, [
            provider.doc.clientID
          ])
        );
        websocket.send(toUint8Array(encoderAwarenessState));
      }
    };
    provider.emit("status", [{
      status: "connecting"
    }]);
  }
};
var broadcastMessage = (provider, buf) => {
  const ws = provider.ws;
  if (provider.wsconnected && ws && ws.readyState === ws.OPEN) {
    ws.send(buf);
  }
  if (provider.bcconnected) {
    publish(provider.bcChannel, buf, provider);
  }
};
var WebsocketProvider = class extends Observable {
  /**
   * @param {string} serverUrl
   * @param {string} roomname
   * @param {Y.Doc} doc
   * @param {object} opts
   * @param {boolean} [opts.connect]
   * @param {awarenessProtocol.Awareness} [opts.awareness]
   * @param {Object<string,string>} [opts.params]
   * @param {typeof WebSocket} [opts.WebSocketPolyfill] Optionall provide a WebSocket polyfill
   * @param {number} [opts.resyncInterval] Request server state every `resyncInterval` milliseconds
   * @param {number} [opts.maxBackoffTime] Maximum amount of time to wait before trying to reconnect (we try to reconnect using exponential backoff)
   * @param {boolean} [opts.disableBc] Disable cross-tab BroadcastChannel communication
   */
  constructor(serverUrl, roomname, doc2, {
    connect = true,
    awareness = new Awareness(doc2),
    params: params2 = {},
    WebSocketPolyfill = WebSocket,
    resyncInterval = -1,
    maxBackoffTime = 2500,
    disableBc = false
  } = {}) {
    super();
    while (serverUrl[serverUrl.length - 1] === "/") {
      serverUrl = serverUrl.slice(0, serverUrl.length - 1);
    }
    const encodedParams = encodeQueryParams(params2);
    this.maxBackoffTime = maxBackoffTime;
    this.bcChannel = serverUrl + "/" + roomname;
    this.url = serverUrl + "/" + roomname + (encodedParams.length === 0 ? "" : "?" + encodedParams);
    this.roomname = roomname;
    this.doc = doc2;
    this._WS = WebSocketPolyfill;
    this.awareness = awareness;
    this.wsconnected = false;
    this.wsconnecting = false;
    this.bcconnected = false;
    this.disableBc = disableBc;
    this.wsUnsuccessfulReconnects = 0;
    this.messageHandlers = messageHandlers.slice();
    this._synced = false;
    this.ws = null;
    this.wsLastMessageReceived = 0;
    this.shouldConnect = connect;
    this._resyncInterval = 0;
    if (resyncInterval > 0) {
      this._resyncInterval = /** @type {any} */
      setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          const encoder = createEncoder();
          writeVarUint(encoder, messageSync);
          writeSyncStep1(encoder, doc2);
          this.ws.send(toUint8Array(encoder));
        }
      }, resyncInterval);
    }
    this._bcSubscriber = (data, origin) => {
      if (origin !== this) {
        const encoder = readMessage(this, new Uint8Array(data), false);
        if (length(encoder) > 1) {
          publish(this.bcChannel, toUint8Array(encoder), this);
        }
      }
    };
    this._updateHandler = (update, origin) => {
      if (origin !== this) {
        const encoder = createEncoder();
        writeVarUint(encoder, messageSync);
        writeUpdate(encoder, update);
        broadcastMessage(this, toUint8Array(encoder));
      }
    };
    this.doc.on("update", this._updateHandler);
    this._awarenessUpdateHandler = ({ added, updated, removed }, _origin) => {
      const changedClients = added.concat(updated).concat(removed);
      const encoder = createEncoder();
      writeVarUint(encoder, messageAwareness);
      writeVarUint8Array(
        encoder,
        encodeAwarenessUpdate(awareness, changedClients)
      );
      broadcastMessage(this, toUint8Array(encoder));
    };
    this._exitHandler = () => {
      removeAwarenessStates(
        this.awareness,
        [doc2.clientID],
        "app closed"
      );
    };
    if (isNode && typeof process !== "undefined") {
      process.on("exit", this._exitHandler);
    }
    awareness.on("update", this._awarenessUpdateHandler);
    this._checkInterval = /** @type {any} */
    setInterval(() => {
      if (this.wsconnected && messageReconnectTimeout < getUnixTime() - this.wsLastMessageReceived) {
        this.ws.close();
      }
    }, messageReconnectTimeout / 10);
    if (connect) {
      this.connect();
    }
  }
  /**
   * @type {boolean}
   */
  get synced() {
    return this._synced;
  }
  set synced(state) {
    if (this._synced !== state) {
      this._synced = state;
      this.emit("synced", [state]);
      this.emit("sync", [state]);
    }
  }
  destroy() {
    if (this._resyncInterval !== 0) {
      clearInterval(this._resyncInterval);
    }
    clearInterval(this._checkInterval);
    this.disconnect();
    if (isNode && typeof process !== "undefined") {
      process.off("exit", this._exitHandler);
    }
    this.awareness.off("update", this._awarenessUpdateHandler);
    this.doc.off("update", this._updateHandler);
    super.destroy();
  }
  connectBc() {
    if (this.disableBc) {
      return;
    }
    if (!this.bcconnected) {
      subscribe(this.bcChannel, this._bcSubscriber);
      this.bcconnected = true;
    }
    const encoderSync = createEncoder();
    writeVarUint(encoderSync, messageSync);
    writeSyncStep1(encoderSync, this.doc);
    publish(this.bcChannel, toUint8Array(encoderSync), this);
    const encoderState = createEncoder();
    writeVarUint(encoderState, messageSync);
    writeSyncStep2(encoderState, this.doc);
    publish(this.bcChannel, toUint8Array(encoderState), this);
    const encoderAwarenessQuery = createEncoder();
    writeVarUint(encoderAwarenessQuery, messageQueryAwareness);
    publish(
      this.bcChannel,
      toUint8Array(encoderAwarenessQuery),
      this
    );
    const encoderAwarenessState = createEncoder();
    writeVarUint(encoderAwarenessState, messageAwareness);
    writeVarUint8Array(
      encoderAwarenessState,
      encodeAwarenessUpdate(this.awareness, [
        this.doc.clientID
      ])
    );
    publish(
      this.bcChannel,
      toUint8Array(encoderAwarenessState),
      this
    );
  }
  disconnectBc() {
    const encoder = createEncoder();
    writeVarUint(encoder, messageAwareness);
    writeVarUint8Array(
      encoder,
      encodeAwarenessUpdate(this.awareness, [
        this.doc.clientID
      ], /* @__PURE__ */ new Map())
    );
    broadcastMessage(this, toUint8Array(encoder));
    if (this.bcconnected) {
      unsubscribe(this.bcChannel, this._bcSubscriber);
      this.bcconnected = false;
    }
  }
  disconnect() {
    this.shouldConnect = false;
    this.disconnectBc();
    if (this.ws !== null) {
      this.ws.close();
    }
  }
  connect() {
    this.shouldConnect = true;
    if (!this.wsconnected && this.ws === null) {
      setupWS(this);
      this.connectBc();
    }
  }
};

// node_modules/y-codemirror.next/src/index.js
var cmView4 = __toESM(require("@codemirror/view"), 1);
var cmState4 = __toESM(require("@codemirror/state"), 1);

// node_modules/y-codemirror.next/src/y-range.js
var YRange = class _YRange {
  /**
   * @param {Y.RelativePosition} yanchor
   * @param {Y.RelativePosition} yhead
   */
  constructor(yanchor, yhead) {
    this.yanchor = yanchor;
    this.yhead = yhead;
  }
  /**
   * @returns {any}
   */
  toJSON() {
    return {
      yanchor: relativePositionToJSON(this.yanchor),
      yhead: relativePositionToJSON(this.yhead)
    };
  }
  /**
   * @param {any} json
   * @return {YRange}
   */
  static fromJSON(json) {
    return new _YRange(createRelativePositionFromJSON(json.yanchor), createRelativePositionFromJSON(json.yhead));
  }
};

// node_modules/y-codemirror.next/src/y-sync.js
var cmState = __toESM(require("@codemirror/state"), 1);
var cmView = __toESM(require("@codemirror/view"), 1);
var YSyncConfig = class {
  constructor(ytext, awareness) {
    this.ytext = ytext;
    this.awareness = awareness;
    this.undoManager = new UndoManager(ytext);
  }
  /**
   * Helper function to transform an absolute index position to a Yjs-based relative position
   * (https://docs.yjs.dev/api/relative-positions).
   *
   * A relative position can be transformed back to an absolute position even after the document has changed. The position is
   * automatically adapted. This does not require any position transformations. Relative positions are computed based on
   * the internal Yjs document model. Peers that share content through Yjs are guaranteed that their positions will always
   * synced up when using relatve positions.
   *
   * ```js
   * import { ySyncFacet } from 'y-codemirror'
   *
   * ..
   * const ysync = view.state.facet(ySyncFacet)
   * // transform an absolute index position to a ypos
   * const ypos = ysync.getYPos(3)
   * // transform the ypos back to an absolute position
   * ysync.fromYPos(ypos) // => 3
   * ```
   *
   * It cannot be guaranteed that absolute index positions can be synced up between peers.
   * This might lead to undesired behavior when implementing features that require that all peers see the
   * same marked range (e.g. a comment plugin).
   *
   * @param {number} pos
   * @param {number} [assoc]
   */
  toYPos(pos, assoc = 0) {
    return createRelativePositionFromTypeIndex(this.ytext, pos, assoc);
  }
  /**
   * @param {Y.RelativePosition | Object} rpos
   */
  fromYPos(rpos) {
    const pos = createAbsolutePositionFromRelativePosition(createRelativePositionFromJSON(rpos), this.ytext.doc);
    if (pos == null || pos.type !== this.ytext) {
      throw new Error("[y-codemirror] The position you want to retrieve was created by a different document");
    }
    return {
      pos: pos.index,
      assoc: pos.assoc
    };
  }
  /**
   * @param {cmState.SelectionRange} range
   * @return {YRange}
   */
  toYRange(range) {
    const assoc = range.assoc;
    const yanchor = this.toYPos(range.anchor, assoc);
    const yhead = this.toYPos(range.head, assoc);
    return new YRange(yanchor, yhead);
  }
  /**
   * @param {YRange} yrange
   */
  fromYRange(yrange) {
    const anchor = this.fromYPos(yrange.yanchor);
    const head = this.fromYPos(yrange.yhead);
    if (anchor.pos === head.pos) {
      return cmState.EditorSelection.cursor(head.pos, head.assoc);
    }
    return cmState.EditorSelection.range(anchor.pos, head.pos);
  }
};
var ySyncFacet = cmState.Facet.define({
  combine(inputs) {
    return inputs[inputs.length - 1];
  }
});
var ySyncAnnotation = cmState.Annotation.define();
var YSyncPluginValue = class {
  /**
   * @param {cmView.EditorView} view
   */
  constructor(view) {
    this.view = view;
    this.conf = view.state.facet(ySyncFacet);
    this._observer = (event, tr) => {
      if (tr.origin !== this.conf) {
        const delta = event.delta;
        const changes = [];
        let pos = 0;
        for (let i = 0; i < delta.length; i++) {
          const d = delta[i];
          if (d.insert != null) {
            changes.push({ from: pos, to: pos, insert: d.insert });
          } else if (d.delete != null) {
            changes.push({ from: pos, to: pos + d.delete, insert: "" });
            pos += d.delete;
          } else {
            pos += d.retain;
          }
        }
        view.dispatch({ changes, annotations: [ySyncAnnotation.of(this.conf)] });
      }
    };
    this._ytext = this.conf.ytext;
    this._ytext.observe(this._observer);
  }
  /**
   * @param {cmView.ViewUpdate} update
   */
  update(update) {
    if (!update.docChanged || update.transactions.length > 0 && update.transactions[0].annotation(ySyncAnnotation) === this.conf) {
      return;
    }
    const ytext = this.conf.ytext;
    ytext.doc.transact(() => {
      let adj = 0;
      update.changes.iterChanges((fromA, toA, fromB, toB, insert) => {
        const insertText2 = insert.sliceString(0, insert.length, "\n");
        if (fromA !== toA) {
          ytext.delete(fromA + adj, toA - fromA);
        }
        if (insertText2.length > 0) {
          ytext.insert(fromA + adj, insertText2);
        }
        adj += insertText2.length - (toA - fromA);
      });
    }, this.conf);
  }
  destroy() {
    this._ytext.unobserve(this._observer);
  }
};
var ySync = cmView.ViewPlugin.fromClass(YSyncPluginValue);

// node_modules/y-codemirror.next/src/y-remote-selections.js
var cmView2 = __toESM(require("@codemirror/view"), 1);
var cmState2 = __toESM(require("@codemirror/state"), 1);
var yRemoteSelectionsTheme = cmView2.EditorView.baseTheme({
  ".cm-ySelection": {},
  ".cm-yLineSelection": {
    padding: 0,
    margin: "0px 2px 0px 4px"
  },
  ".cm-ySelectionCaret": {
    position: "relative",
    borderLeft: "1px solid black",
    borderRight: "1px solid black",
    marginLeft: "-1px",
    marginRight: "-1px",
    boxSizing: "border-box",
    display: "inline"
  },
  ".cm-ySelectionCaretDot": {
    borderRadius: "50%",
    position: "absolute",
    width: ".4em",
    height: ".4em",
    top: "-.2em",
    left: "-.2em",
    backgroundColor: "inherit",
    transition: "transform .3s ease-in-out",
    boxSizing: "border-box"
  },
  ".cm-ySelectionCaret:hover > .cm-ySelectionCaretDot": {
    transformOrigin: "bottom center",
    transform: "scale(0)"
  },
  ".cm-ySelectionInfo": {
    position: "absolute",
    top: "-1.05em",
    left: "-1px",
    fontSize: ".75em",
    fontFamily: "serif",
    fontStyle: "normal",
    fontWeight: "normal",
    lineHeight: "normal",
    userSelect: "none",
    color: "white",
    paddingLeft: "2px",
    paddingRight: "2px",
    zIndex: 101,
    transition: "opacity .3s ease-in-out",
    backgroundColor: "inherit",
    // these should be separate
    opacity: 0,
    transitionDelay: "0s",
    whiteSpace: "nowrap"
  },
  ".cm-ySelectionCaret:hover > .cm-ySelectionInfo": {
    opacity: 1,
    transitionDelay: "0s"
  }
});
var yRemoteSelectionsAnnotation = cmState2.Annotation.define();
var YRemoteCaretWidget = class extends cmView2.WidgetType {
  /**
   * @param {string} color
   * @param {string} name
   */
  constructor(color, name) {
    super();
    this.color = color;
    this.name = name;
  }
  toDOM() {
    return (
      /** @type {HTMLElement} */
      element("span", [create5("class", "cm-ySelectionCaret"), create5("style", `background-color: ${this.color}; border-color: ${this.color}`)], [
        text("\u2060"),
        element("div", [
          create5("class", "cm-ySelectionCaretDot")
        ]),
        text("\u2060"),
        element("div", [
          create5("class", "cm-ySelectionInfo")
        ], [
          text(this.name)
        ]),
        text("\u2060")
      ])
    );
  }
  eq(widget) {
    return widget.color === this.color;
  }
  compare(widget) {
    return widget.color === this.color;
  }
  updateDOM() {
    return false;
  }
  get estimatedHeight() {
    return -1;
  }
  ignoreEvent() {
    return true;
  }
};
var YRemoteSelectionsPluginValue = class {
  /**
   * @param {cmView.EditorView} view
   */
  constructor(view) {
    this.conf = view.state.facet(ySyncFacet);
    this._listener = ({ added, updated, removed }, s, t) => {
      const clients = added.concat(updated).concat(removed);
      if (clients.findIndex((id2) => id2 !== this.conf.awareness.doc.clientID) >= 0) {
        view.dispatch({ annotations: [yRemoteSelectionsAnnotation.of([])] });
      }
    };
    this._awareness = this.conf.awareness;
    this._awareness.on("change", this._listener);
    this.decorations = cmState2.RangeSet.of([]);
  }
  destroy() {
    this._awareness.off("change", this._listener);
  }
  /**
   * @param {cmView.ViewUpdate} update
   */
  update(update) {
    const ytext = this.conf.ytext;
    const ydoc = (
      /** @type {Y.Doc} */
      ytext.doc
    );
    const awareness = this.conf.awareness;
    const decorations = [];
    const localAwarenessState = this.conf.awareness.getLocalState();
    if (localAwarenessState != null) {
      const hasFocus = update.view.hasFocus && update.view.dom.ownerDocument.hasFocus();
      const sel = hasFocus ? update.state.selection.main : null;
      const currentAnchor = localAwarenessState.cursor == null ? null : createRelativePositionFromJSON(localAwarenessState.cursor.anchor);
      const currentHead = localAwarenessState.cursor == null ? null : createRelativePositionFromJSON(localAwarenessState.cursor.head);
      if (sel != null) {
        const anchor = createRelativePositionFromTypeIndex(ytext, sel.anchor);
        const head = createRelativePositionFromTypeIndex(ytext, sel.head);
        if (localAwarenessState.cursor == null || !compareRelativePositions(currentAnchor, anchor) || !compareRelativePositions(currentHead, head)) {
          awareness.setLocalStateField("cursor", {
            anchor,
            head
          });
        }
      } else if (localAwarenessState.cursor != null && hasFocus) {
        awareness.setLocalStateField("cursor", null);
      }
    }
    awareness.getStates().forEach((state, clientid) => {
      if (clientid === awareness.doc.clientID) {
        return;
      }
      const cursor = state.cursor;
      if (cursor == null || cursor.anchor == null || cursor.head == null) {
        return;
      }
      const anchor = createAbsolutePositionFromRelativePosition(cursor.anchor, ydoc);
      const head = createAbsolutePositionFromRelativePosition(cursor.head, ydoc);
      if (anchor == null || head == null || anchor.type !== ytext || head.type !== ytext) {
        return;
      }
      const { color = "#30bced", name = "Anonymous" } = state.user || {};
      const colorLight = state.user && state.user.colorLight || color + "33";
      const start = min(anchor.index, head.index);
      const end = max(anchor.index, head.index);
      const startLine = update.view.state.doc.lineAt(start);
      const endLine = update.view.state.doc.lineAt(end);
      if (startLine.number === endLine.number) {
        decorations.push({
          from: start,
          to: end,
          value: cmView2.Decoration.mark({
            attributes: { style: `background-color: ${colorLight}` },
            class: "cm-ySelection"
          })
        });
      } else {
        decorations.push({
          from: start,
          to: startLine.from + startLine.length,
          value: cmView2.Decoration.mark({
            attributes: { style: `background-color: ${colorLight}` },
            class: "cm-ySelection"
          })
        });
        decorations.push({
          from: endLine.from,
          to: end,
          value: cmView2.Decoration.mark({
            attributes: { style: `background-color: ${colorLight}` },
            class: "cm-ySelection"
          })
        });
        for (let i = startLine.number + 1; i < endLine.number; i++) {
          const linePos = update.view.state.doc.line(i).from;
          decorations.push({
            from: linePos,
            to: linePos,
            value: cmView2.Decoration.line({
              attributes: { style: `background-color: ${colorLight}`, class: "cm-yLineSelection" }
            })
          });
        }
      }
      decorations.push({
        from: head.index,
        to: head.index,
        value: cmView2.Decoration.widget({
          side: head.index - anchor.index > 0 ? -1 : 1,
          // the local cursor should be rendered outside the remote selection
          block: false,
          widget: new YRemoteCaretWidget(color, name)
        })
      });
    });
    this.decorations = cmView2.Decoration.set(decorations, true);
  }
};
var yRemoteSelections = cmView2.ViewPlugin.fromClass(YRemoteSelectionsPluginValue, {
  decorations: (v) => v.decorations
});

// node_modules/y-codemirror.next/src/y-undomanager.js
var cmState3 = __toESM(require("@codemirror/state"), 1);
var cmView3 = __toESM(require("@codemirror/view"), 1);

// node_modules/lib0/mutex.js
var createMutex = () => {
  let token = true;
  return (f, g) => {
    if (token) {
      token = false;
      try {
        f();
      } finally {
        token = true;
      }
    } else if (g !== void 0) {
      g();
    }
  };
};

// node_modules/y-codemirror.next/src/y-undomanager.js
var YUndoManagerConfig = class {
  /**
   * @param {Y.UndoManager} undoManager
   */
  constructor(undoManager) {
    this.undoManager = undoManager;
  }
  /**
   * @param {any} origin
   */
  addTrackedOrigin(origin) {
    this.undoManager.addTrackedOrigin(origin);
  }
  /**
   * @param {any} origin
   */
  removeTrackedOrigin(origin) {
    this.undoManager.removeTrackedOrigin(origin);
  }
  /**
   * @return {boolean} Whether a change was undone.
   */
  undo() {
    return this.undoManager.undo() != null;
  }
  /**
   * @return {boolean} Whether a change was redone.
   */
  redo() {
    return this.undoManager.redo() != null;
  }
};
var yUndoManagerFacet = cmState3.Facet.define({
  combine(inputs) {
    return inputs[inputs.length - 1];
  }
});
var yUndoManagerAnnotation = cmState3.Annotation.define();
var YUndoManagerPluginValue = class {
  /**
   * @param {cmView.EditorView} view
   */
  constructor(view) {
    this.view = view;
    this.conf = view.state.facet(yUndoManagerFacet);
    this._undoManager = this.conf.undoManager;
    this.syncConf = view.state.facet(ySyncFacet);
    this._beforeChangeSelection = null;
    this._mux = createMutex();
    this._onStackItemAdded = ({ stackItem, changedParentTypes }) => {
      if (changedParentTypes.has(this.syncConf.ytext) && this._beforeChangeSelection && !stackItem.meta.has(this)) {
        stackItem.meta.set(this, this._beforeChangeSelection);
      }
    };
    this._onStackItemPopped = ({ stackItem }) => {
      const sel = stackItem.meta.get(this);
      if (sel) {
        const selection = this.syncConf.fromYRange(sel);
        view.dispatch(view.state.update({
          selection,
          effects: [cmView3.EditorView.scrollIntoView(selection)]
        }));
        this._storeSelection();
      }
    };
    this._storeSelection = () => {
      this._beforeChangeSelection = this.syncConf.toYRange(this.view.state.selection.main);
    };
    this._undoManager.on("stack-item-added", this._onStackItemAdded);
    this._undoManager.on("stack-item-popped", this._onStackItemPopped);
    this._undoManager.addTrackedOrigin(this.syncConf);
  }
  /**
   * @param {cmView.ViewUpdate} update
   */
  update(update) {
    if (update.selectionSet && (update.transactions.length === 0 || update.transactions[0].annotation(ySyncAnnotation) !== this.syncConf)) {
      this._storeSelection();
    }
  }
  destroy() {
    this._undoManager.off("stack-item-added", this._onStackItemAdded);
    this._undoManager.off("stack-item-popped", this._onStackItemPopped);
    this._undoManager.removeTrackedOrigin(this.syncConf);
  }
};
var yUndoManager = cmView3.ViewPlugin.fromClass(YUndoManagerPluginValue);
var undo = ({ state, dispatch }) => state.facet(yUndoManagerFacet).undo() || true;
var redo = ({ state, dispatch }) => state.facet(yUndoManagerFacet).redo() || true;

// node_modules/y-codemirror.next/src/index.js
var yCollab = (ytext, awareness, { undoManager = new UndoManager(ytext) } = {}) => {
  const ySyncConfig = new YSyncConfig(ytext, awareness);
  const plugins = [
    ySyncFacet.of(ySyncConfig),
    ySync
  ];
  if (awareness) {
    plugins.push(
      yRemoteSelectionsTheme,
      yRemoteSelections
    );
  }
  if (undoManager !== false) {
    plugins.push(
      yUndoManagerFacet.of(new YUndoManagerConfig(undoManager)),
      yUndoManager,
      cmView4.EditorView.domEventHandlers({
        beforeinput(e, view) {
          if (e.inputType === "historyUndo") return undo(view);
          if (e.inputType === "historyRedo") return redo(view);
          return false;
        }
      })
    );
  }
  return plugins;
};

// src/main.js
var import_state = require("@codemirror/state");
var import_view = require("@codemirror/view");
var DEFAULTS = {
  couchUrl: "https://obsidian.enfycius.com",
  // CouchDB (파일 동기화). ⚠️ 이 repo 는 공개다 — 비밀값을 기본값으로 넣지 마라
  wsUrl: "wss://collab.smallws.com",
  // relay (실시간 협업)
  dbName: "main-db",
  docPrefix: "cvs:",
  username: "",
  password: "",
  deviceLabel: "",
  // 커서 꼬리표 (Mac/iPad)
  lockOffline: true,
  // 기본 ON — 오프라인이면 편집 잠금(모바일=읽기모드 강제)
  enabled: true,
  lastSeq: "0",
  deviceId: "",
  lastRunVersion: ""
  // 마지막으로 정상 기동한 플러그인 버전 — 이것과 다르면 서버본으로 재기준(resetOnUpgrade)
};
var UPDATE_REPO = "rablove/obsidian-collab-relay";
var DIAG_DIR = "60_System/_sync-diag";
var ASK_DIR = "60_System/_canvas-ask";
var ASK_MAX_PER_HOUR = 6;
var BIN_EXT = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", svg: "image/svg+xml" };
var BIN_MAX = 2 * 1024 * 1024;
var nfc = (s) => s.normalize("NFC");
function md5b64(u8) {
  const S = [
    7,
    12,
    17,
    22,
    7,
    12,
    17,
    22,
    7,
    12,
    17,
    22,
    7,
    12,
    17,
    22,
    5,
    9,
    14,
    20,
    5,
    9,
    14,
    20,
    5,
    9,
    14,
    20,
    5,
    9,
    14,
    20,
    4,
    11,
    16,
    23,
    4,
    11,
    16,
    23,
    4,
    11,
    16,
    23,
    4,
    11,
    16,
    23,
    6,
    10,
    15,
    21,
    6,
    10,
    15,
    21,
    6,
    10,
    15,
    21,
    6,
    10,
    15,
    21
  ];
  const K = new Int32Array(64);
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) | 0;
  const len = u8.length, nb = (len + 8 >> 6) + 1 << 6;
  const M = new Uint8Array(nb);
  M.set(u8);
  M[len] = 128;
  const bl = len * 8;
  M[nb - 8] = bl & 255;
  M[nb - 7] = bl >>> 8 & 255;
  M[nb - 6] = bl >>> 16 & 255;
  M[nb - 5] = bl >>> 24 & 255;
  let a0 = 1732584193, b0 = 4023233417, c0 = 2562383102, d0 = 271733878;
  const w = new Int32Array(16);
  for (let off = 0; off < nb; off += 64) {
    for (let i = 0; i < 16; i++) {
      const j = off + i * 4;
      w[i] = M[j] | M[j + 1] << 8 | M[j + 2] << 16 | M[j + 3] << 24;
    }
    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      let F, g;
      if (i < 16) {
        F = B & C | ~B & D;
        g = i;
      } else if (i < 32) {
        F = D & B | ~D & C;
        g = 5 * i + 1 & 15;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = 3 * i + 5 & 15;
      } else {
        F = C ^ (B | ~D);
        g = 7 * i & 15;
      }
      F = F + A + K[i] + w[g] | 0;
      A = D;
      D = C;
      C = B;
      B = B + (F << S[i] | F >>> 32 - S[i]) | 0;
    }
    a0 = a0 + A | 0;
    b0 = b0 + B | 0;
    c0 = c0 + C | 0;
    d0 = d0 + D | 0;
  }
  const o = new Uint8Array(16);
  [a0, b0, c0, d0].forEach((v, i) => {
    o[i * 4] = v & 255;
    o[i * 4 + 1] = v >>> 8 & 255;
    o[i * 4 + 2] = v >>> 16 & 255;
    o[i * 4 + 3] = v >>> 24 & 255;
  });
  let s = "";
  for (const b of o) s += String.fromCharCode(b);
  return btoa(s);
}
function merge3(baseS, aS, bS) {
  const L = (s) => s.split("\n");
  const lcs = (x, y) => {
    const n = x.length, m = y.length;
    const c = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
    for (let i2 = n - 1; i2 >= 0; i2--) for (let j2 = m - 1; j2 >= 0; j2--) c[i2][j2] = x[i2] === y[j2] ? c[i2 + 1][j2 + 1] + 1 : Math.max(c[i2 + 1][j2], c[i2][j2 + 1]);
    const o = [];
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (x[i] === y[j]) {
        o.push([i, j]);
        i++;
        j++;
      } else if (c[i + 1][j] >= c[i][j + 1]) i++;
      else j++;
    }
    return o;
  };
  const hunks = (O2, X) => {
    const m = lcs(O2, X).concat([[O2.length, X.length]]);
    const h = [];
    let oi2 = 0, xi = 0;
    for (const [oc, xc] of m) {
      if (oi2 < oc || xi < xc) h.push([oi2, oc, X.slice(xi, xc)]);
      oi2 = oc + 1;
      xi = xc + 1;
    }
    return h;
  };
  const O = L(baseS), A = L(aS), B = L(bS);
  const ha = hunks(O, A), hb = hunks(O, B);
  const res = [];
  let oi = 0, ia = 0, ib = 0;
  while (true) {
    const na = ia < ha.length ? ha[ia] : null, nb = ib < hb.length ? hb[ib] : null;
    const as = na ? na[0] : Infinity, bs = nb ? nb[0] : Infinity;
    if (as === Infinity && bs === Infinity) {
      for (let k = oi; k < O.length; k++) res.push(O[k]);
      break;
    }
    const nx = Math.min(as, bs);
    for (let k = oi; k < nx; k++) res.push(O[k]);
    oi = nx;
    const aH = na && na[0] === oi ? na : null, bH = nb && nb[0] === oi ? nb : null;
    if (aH && bH) {
      if (aH[1] === bH[1] && JSON.stringify(aH[2]) === JSON.stringify(bH[2])) {
        res.push(...aH[2]);
        oi = aH[1];
        ia++;
        ib++;
      } else if (aH[0] === aH[1] && bH[0] === bH[1]) {
        const x = aH[2], y = bH[2];
        if (x.join("\n") <= y.join("\n")) res.push(...x, ...y);
        else res.push(...y, ...x);
        ia++;
        ib++;
      } else return null;
    } else if (aH) {
      if (nb === null || nb[0] >= aH[1]) {
        res.push(...aH[2]);
        oi = aH[1];
        ia++;
      } else return null;
    } else if (bH) {
      if (na === null || na[0] >= bH[1]) {
        res.push(...bH[2]);
        oi = bH[1];
        ib++;
      } else return null;
    } else break;
  }
  const merged = res.join("\n");
  const sO = new Set(O), sM = new Set(L(merged));
  for (const l of A) if (!sO.has(l) && !sM.has(l)) return null;
  for (const l of B) if (!sO.has(l) && !sM.has(l)) return null;
  const al = /* @__PURE__ */ new Set([...O, ...A, ...B]);
  for (const l of L(merged)) if (!al.has(l)) return null;
  return merged;
}
var b64 = (s) => btoa(unescape(encodeURIComponent(s)));
var b64url = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
var COLORS = ["#e11d48", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#0891b2", "#65a30d"];
var COLLAB_CSS = `
.cm-ySelectionCaret { border-left-width: 2px !important; border-right-width: 0 !important; margin-right: 0 !important; }
.cm-ySelectionCaretDot { width: .5em !important; height: .5em !important; top: -.28em !important; left: -.25em !important; box-shadow: 0 0 0 1.5px var(--background-primary) !important; }
.cm-ySelectionInfo {
  opacity: 1 !important; top: -1.5em !important; left: -2px !important;
  padding: 1px 6px !important; border-radius: 5px 5px 5px 1px !important;
  font-family: var(--font-interface, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif) !important;
  font-size: 11px !important; font-style: normal !important; font-weight: 600 !important; line-height: 1.5 !important;
  letter-spacing: .2px !important; color: #fff !important; white-space: nowrap !important;
  box-shadow: 0 1px 4px rgba(0,0,0,.28) !important; transition: opacity .15s ease !important; pointer-events: none !important;
}
.cm-ySelection { border-radius: 2px; }
body.collab-syncgate-open .modal-close-button, body.collab-harnesslock-open .modal-close-button { display: none !important; }
/* \uCE94\uBC84\uC2A4 \uCE74\uB4DC\uC758 \xAB\uC9C4\uC9DC \uBC84\uD2BC\xBB. \uD14C\uB9C8 \uBCC0\uC218\uB97C \uC4F0\uBBC0\uB85C \uB77C\uC774\uD2B8/\uB2E4\uD06C \uB458 \uB2E4 \uB530\uB77C\uAC04\uB2E4. */
.lpms-ask { display: flex; flex-direction: column; gap: 6px; margin: 2px 0; }
.lpms-ask-text { white-space: pre-wrap; line-height: 1.45; }
.lpms-ask-btn {
  align-self: flex-start; cursor: pointer; padding: 5px 14px; border-radius: 6px;
  font-weight: 600; border: 1px solid var(--interactive-accent);
  background: var(--interactive-accent); color: var(--text-on-accent);
}
.lpms-ask-btn:hover:not(:disabled) { background: var(--interactive-accent-hover); }
.lpms-ask-btn:disabled { opacity: .5; cursor: default; }
.lpms-ask-run .lpms-ask-btn { background: var(--color-red, #d64545); border-color: var(--color-red, #d64545); }
.lpms-ask-note { font-size: 12px; color: var(--text-muted); }
`;
var VaultSyncCollab = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    if (!this.settings.deviceId) {
      this.settings.deviceId = "dev-" + Math.random().toString(36).slice(2, 7);
      await this.saveSettings();
    }
    if (!this.settings.deviceLabel) {
      this.settings.deviceLabel = "dev-" + Math.random().toString(36).slice(2, 5);
      await this.saveSettings();
    }
    this.userColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    this._collabStyle = document.head.createEl("style", { text: COLLAB_CSS });
    this.shadow = /* @__PURE__ */ new Map();
    this.applying = false;
    this.syncing = false;
    this._rtRunning = false;
    this.netOk = true;
    this.compartment = new import_state.Compartment();
    this.editLock = new import_state.Compartment();
    this.session = null;
    this._token = null;
    this._tokenExp = 0;
    this.collabPath = null;
    this.following = null;
    this._modAdmin = false;
    this._modReadonly = false;
    this._modAll = null;
    this._kickUntil = 0;
    this._kickScope = null;
    this._kickPath = null;
    this.hiddenPeers = /* @__PURE__ */ new Set();
    this.registerEditorExtension([this.compartment.of([]), this.editLock.of([])]);
    this.registerMarkdownCodeBlockProcessor("lpms-ask", (src, el, ctx) => this.renderAskBlock(src, el, ctx, "ask"));
    this.registerMarkdownCodeBlockProcessor("lpms-run", (src, el, ctx) => this.renderAskBlock(src, el, ctx, "run"));
    this.addSettingTab(new SettingTab(this.app, this));
    this.syncEl = this.addStatusBarItem();
    this.setSync("\uC2DC\uC791\u2026");
    this.collabEl = this.addStatusBarItem();
    this.setCollab("\uC5F0\uACB0 \uC548\uB428");
    this.collabEl.style.cursor = "pointer";
    this.collabEl.addEventListener("click", () => new ParticipantModal(this.app, this).open());
    this.addRibbonIcon("users", "\uACF5\uB3D9\uD3B8\uC9D1 \uCC38\uC5EC\uC790\xB7\uC5F0\uACB0 \uC0C1\uD0DC", () => new ParticipantModal(this.app, this).open());
    this.addCommand({ id: "sync-now", name: "\uC9C0\uAE08 \uB3D9\uAE30\uD654", callback: () => this.syncCycle(true) });
    this.addCommand({ id: "resync-deletions", name: "\uC0AD\uC81C\uAE4C\uC9C0 \uB2E4\uC2DC \uB3D9\uAE30\uD654(\uBC00\uB9B0 \uC0AD\uC81C \uBC18\uC601, \uBE44\uD30C\uAD34)", callback: async () => {
      new import_obsidian.Notice("\uC0AD\uC81C \uD3EC\uD568 \uC804\uCCB4 \uBCC0\uACBD \uB2E4\uC2DC \uD6D1\uB294 \uC911\u2026");
      this.settings.lastSeq = "0";
      await this.saveSettings();
      await this.syncCycle(true);
    } });
    this.addCommand({ id: "hard-reset", name: "\uCC98\uC74C\uBD80\uD130 \uB2E4\uC2DC \uBC1B\uAE30(\uB85C\uCEEC \uC0AD\uC81C \uD6C4 \uC11C\uBC84\uBCF8\uC73C\uB85C)", callback: () => new ConfirmModal(this.app, "\uCC98\uC74C\uBD80\uD130 \uB2E4\uC2DC \uBC1B\uAE30", "\uC774 \uAE30\uAE30\uC758 \uB85C\uCEEC .md \uB178\uD2B8\uB97C \uC804\uBD80 \uC0AD\uC81C\uD558\uACE0 \uC11C\uBC84 \uCD5C\uC2E0\uBCF8\uC73C\uB85C \uB36E\uC5B4\uC501\uB2C8\uB2E4. \uB418\uB3CC\uB9B4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uACC4\uC18D\uD560\uAE4C\uC694?", () => this.hardReset()).open() });
    this.addCommand({ id: "collab-status", name: "\uACF5\uB3D9\uD3B8\uC9D1 \uCC38\uC5EC\uC790", callback: () => new ParticipantModal(this.app, this).open() });
    this.addCommand({ id: "net-check", name: "\uC5F0\uACB0 \uC0C1\uD0DC \uD655\uC778(\uC628\uB77C\uC778/\uC624\uD504\uB77C\uC778)", callback: async () => {
      const ok = await this.probeNet();
      this.setNet(ok);
      new import_obsidian.Notice(ok ? "\u{1F310} \uC11C\uBC84 \uC5F0\uACB0\uB428 (\uC628\uB77C\uC778)" : "\u{1F512} \uC11C\uBC84 \uC5F0\uACB0 \uC548\uB428 (\uC624\uD504\uB77C\uC778 \u2014 \uD3B8\uC9D1\uC7A0\uAE08 \uB300\uC0C1)", 5e3);
    } });
    this.addCommand({ id: "update-info", name: "\uC5C5\uB370\uC774\uD2B8 \uC548\uB0B4 \uB2E4\uC2DC \uBCF4\uAE30(\uD3B8\uC9D1\uC774 \uC7A0\uACBC\uC744 \uB54C)", callback: () => {
      this._verChk = 0;
      this.checkVersion();
    } });
    this.addCommand({ id: "conflict-log", name: "\uCDA9\uB3CC \uB85C\uADF8 \uBCF4\uAE30", callback: async () => new ConflictLogModal(this.app, await this.readConflictLog()).open() });
    this.app.workspace.onLayoutReady(async () => {
      this.registerEvent(this.app.vault.on("modify", (f) => this.onLocal(f)));
      this.registerEvent(this.app.vault.on("create", (f) => this.onLocal(f)));
      this.registerEvent(this.app.vault.on("delete", (f) => this.onLocalDelete(f.path)));
      this.registerEvent(this.app.vault.on("rename", (f, oldPath) => this.onLocalRename(f, oldPath)));
      await this.gatedSync();
      this.checkVersion();
      this._rtRunning = true;
      this.longPollLoop();
      this.registerInterval(window.setInterval(() => this.syncCycle(), 6e4));
      this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.onActiveChange()));
      this.registerEvent(this.app.workspace.on("file-open", () => this.onActiveChange()));
      this.registerEvent(this.app.workspace.on("layout-change", () => this.canvasReconcile()));
      this.registerDomEvent(window, "offline", () => this.setNet(false));
      this.registerDomEvent(window, "online", () => this.setNet(true));
      this.registerInterval(window.setInterval(() => this.refreshLock(), 3e3));
      this.registerInterval(window.setInterval(() => this.lockWatch(), 5e3));
      this.registerInterval(window.setInterval(() => this.fetchMod(), 6e4));
      this.registerInterval(window.setInterval(() => this.checkVersion(), 5 * 60 * 1e3));
      this.onActiveChange();
      this.ensurePresence();
      this.fetchMod();
    });
  }
  onunload() {
    this._rtRunning = false;
    try {
      this.applyViewLock(false);
    } catch (e) {
    }
    try {
      if (this._discModal) {
        this._discModal._auto = true;
        this._discModal.close();
      }
    } catch (e) {
    }
    try {
      if (this._collabStyle) this._collabStyle.remove();
    } catch (e) {
    }
    this.endSession();
    this.stopPresence();
  }
  setSync(s) {
    if (this.syncEl) this.syncEl.setText("\u21C4 " + s);
  }
  setCollab(s) {
    if (this.collabEl) this.collabEl.setText("\u{1F465} " + s);
  }
  configured() {
    return this.settings.enabled && this.settings.couchUrl && this.settings.dbName && this.settings.username;
  }
  isMd(f) {
    return f && f.extension === "md";
  }
  // ⛔ 아래 «그림·캔버스» 관련은 main-db(이 플러그인) 전용이다 — ai-study-sync 에는 «일부러» 넣지 않았다
  //    (형 지시 2026-08-13: 「ai-study-db는 해당 없으니 main-db에 한해서」). 그래서 두 소스의 차이가
  //    18줄에서 크게 벌어져 있다. 다음에 두 파일을 맞출 때 여기를 통째로 옮기면 그림·캔버스가
  //    스터디 공용 볼트(멤버 24명)로 딸려 간다. 옮기기 전에 형에게 확인부터 받아라.
  binExt(p) {
    const d = String(p || "").lastIndexOf(".");
    return d < 0 ? "" : String(p).slice(d + 1).toLowerCase();
  }
  isBinPath(p) {
    return Object.prototype.hasOwnProperty.call(BIN_EXT, this.binExt(p));
  }
  isCanvasPath(p) {
    return String(p || "").endsWith(".canvas");
  }
  isTextPath(p) {
    return String(p || "").endsWith(".md") || this.isCanvasPath(p);
  }
  // 본문(content)을 인라인으로 두는 것들
  isSyncPath(p) {
    return this.isTextPath(p) || this.isBinPath(p);
  }
  // ⭐ 줄 단위 3-way 병합은 .md 에만 쓴다. 캔버스는 JSON 이라 «겹치지 않는 줄»을 합쳐도 구조가 깨질 수 있다.
  canMerge(p) {
    return String(p || "").endsWith(".md");
  }
  // ⭐ 열어 둔 캔버스는 서버본으로 «덮지 않는다».
  //  .md 는 열면 relay 가 주인이 되어(collabPath) 파일동기화가 손을 떼는데, 그 자리는
  //  getActiveViewOfType(MarkdownView) 로 정해져 **캔버스는 collabPath 가 될 수 없다**.
  //  캔버스뷰는 판 상태를 메모리에 들고 있다가 저장하므로, 카드를 끌고 있는 중에 밑에서
  //  파일이 갈리면 그 판본이 되돌아와 **방금 받은 것을 덮는다**(= 서버가 쓴 것을 잃는다).
  //  → 열려 있는 동안은 미뤄 두고, 닫히면 canvasReconcile 이 그때 받아 맞춘다.
  //  활성 탭만 보면(getActiveFile) 뒤 탭에 열어 둔 판을 놓친다 — 열린 캔버스 뷰를 다 센다.
  canvasOpenPaths() {
    const out = /* @__PURE__ */ new Set();
    const ws = this.app && this.app.workspace;
    if (!ws || typeof ws.getLeavesOfType !== "function") return out;
    try {
      for (const leaf of ws.getLeavesOfType("canvas") || []) {
        const f = leaf && leaf.view && leaf.view.file;
        if (f && f.path) out.add(nfc(f.path));
      }
    } catch (e) {
      console.error("[sync] canvasOpenPaths", e);
    }
    return out;
  }
  canvasOpen(p) {
    return this.canvasOpenPaths().has(nfc(p));
  }
  /* ── 캔버스 카드의 «진짜 버튼» ───────────────────────────────────────────
       ⭐ **글은 카드에 적는다. 블록은 버튼만 놓는 자리다.** (형 지시 2026-08-14 —
          「그 카드 안에 있는 내용이 다 채널로 가게」.) 카드가 이러면:
  
           세 도메인 단위가 다 m/s² 인가?
  
           ```lpms-ask
           ```
  
          누를 때 **그 카드 글 전체**를 읽어 보낸다(코드블록 줄은 빼고).
          블록 «안»에 글을 적으면 그게 이긴다 — 노트에서 여러 버튼을 따로 쓸 때를 위한 길이다.
          `unit: 2.4` 를 블록 안에 적으면 어느 단위인지도 함께 간다(없으면 판 전체).
  
       누르면 **서버에만** 요청 문서를 남긴다(ASK_DIR). 캔버스 파일은 안 건드린다 —
       판을 고쳐서 알리면 위 «열어 둔 캔버스» 문제를 그대로 지나기 때문이다.
       마크다운 체크상자 버튼은 그대로 둔다(이게 안 그려지는 곳에서도 눌리게). */
  // 버튼이 놓인 «그 카드»에 적힌 글을 읽는다. 두 길을 차례로 본다.
  askCardText(el, ctx) {
    let raw = "";
    try {
      const info = ctx && typeof ctx.getSectionInfo === "function" ? ctx.getSectionInfo(el) : null;
      if (info && typeof info.text === "string") {
        const L = info.text.split("\n");
        L.splice(info.lineStart, Math.max(1, info.lineEnd - info.lineStart + 1));
        raw = L.join("\n");
      }
    } catch (e) {
      console.error("[sync] askCardText(source)", e);
    }
    if (!raw.trim()) {
      try {
        const host = el.closest && el.closest(".markdown-rendered, .markdown-preview-view, .canvas-node-content") || el.parentElement || el;
        if (!host || typeof host.cloneNode !== "function") return "";
        const clone = host.cloneNode(true);
        for (const n of Array.from(clone.querySelectorAll(".lpms-ask"))) n.remove();
        raw = clone.textContent || "";
      } catch (e) {
        console.error("[sync] askCardText(dom)", e);
      }
    }
    return this.cleanAskText(raw);
  }
  // 카드에는 물음 말고도 것이 있다 — 안내·누르는 줄·제목. 그것들을 걷어낸다.
  // (판 카드의 규약을 그대로 따른다: `---` 아래는 안내, 체크상자 줄은 버튼.)
  cleanAskText(raw) {
    let t = String(raw || "").split("\n---")[0];
    t = t.replace(/^\s*[-*]\s*\[[ xX]\].*$/gm, "");
    const L = t.split("\n");
    while (L.length && (/^\s*$/.test(L[0]) || /^\s*#+\s*$/.test(L[0]) || /^\s*#+\s*[▶⟹]/.test(L[0]))) L.shift();
    t = L.join("\n").trim();
    return t.replace(/^⟹\s*/, "").trim();
  }
  renderAskBlock(src, el, ctx, kind) {
    const lines = String(src || "").split("\n");
    let unit = null;
    if (lines.length && /^\s*unit\s*:/i.test(lines[0])) {
      unit = lines.shift().replace(/^\s*unit\s*:/i, "").trim() || null;
    }
    const inner = lines.join("\n").trim();
    const box = el.createDiv({ cls: "lpms-ask" + (kind === "run" ? " lpms-ask-run" : "") });
    if (kind === "ask" && inner) box.createDiv({ cls: "lpms-ask-text", text: inner });
    const btn = box.createEl("button", { cls: "lpms-ask-btn", text: kind === "run" ? "\u25B6 \uB3CC\uB9AC\uAE30" : "\u27F9 \uBCF4\uB0B4\uAE30" });
    const note = box.createDiv({ cls: "lpms-ask-note", text: unit ? `${unit} \uC5D0 \uB300\uD55C \uAC83` : kind === "run" ? "\uC774 \uD310 \uADF8\uB300\uB85C \uB3CC\uB9BD\uB2C8\uB2E4" : "\uD310 \uC804\uCCB4\uC5D0 \uB300\uD55C \uBB3C\uC74C" });
    btn.onclick = async () => {
      if (btn.disabled) return;
      btn.disabled = true;
      note.setText("\uC62C\uB9AC\uB294 \uC911\u2026");
      const af = this.app.workspace.getActiveFile();
      const board = ctx && ctx.sourcePath || (af ? af.path : "");
      const text2 = inner || this.askCardText(el, ctx);
      const r = await this.sendCanvasAsk({ board, kind, text: text2, unit });
      note.setText(r.msg);
      if (!r.ok) {
        btn.disabled = false;
        return;
      }
      window.setTimeout(() => {
        try {
          btn.disabled = false;
          btn.setText("\uB2E4\uC2DC \uBCF4\uB0B4\uAE30");
        } catch (e) {
        }
      }, 1e4);
    };
  }
  async sendCanvasAsk({ board, kind, text: text2, unit }) {
    if (!this.configured()) return { ok: false, msg: "\u26D4 \uB85C\uADF8\uC778\uBD80\uD130 \uD558\uC2ED\uC2DC\uC624" };
    if (kind === "ask" && !text2) return { ok: false, msg: "\u26D4 \uC774 \uCE74\uB4DC\uC5D0 \uBB3C\uC74C\uC744 \uC801\uACE0 \uB204\uB974\uC2ED\uC2DC\uC624" };
    const now = Date.now();
    this._askSent = (this._askSent || []).filter((t) => now - t < 36e5);
    if (this._askSent.length >= ASK_MAX_PER_HOUR) return { ok: false, msg: `\u26D4 \uD55C \uC2DC\uAC04 \uC0C1\uD55C(${ASK_MAX_PER_HOUR}\uAC74)\uC5D0 \uAC78\uB838\uC2B5\uB2C8\uB2E4` };
    const at = new Date(now).toISOString();
    const dev = this.settings.deviceId || "unknown";
    const p = `${ASK_DIR}/${at.replace(/[:.]/g, "-")}_${dev}`;
    const rec = { board: board || null, kind, text: text2 || "", unit: unit || null, at, device: dev };
    try {
      const id2 = this.idFor(p);
      const res = await this.req("PUT", this.docUrl(id2), {
        _id: id2,
        path: p,
        kind: "canvas-ask",
        mtime: now,
        deleted: false,
        clientVersion: this.manifest.version,
        content: JSON.stringify(rec),
        rec
      });
      if (res.status === 200 || res.status === 201) {
        this._askSent.push(now);
        new import_obsidian.Notice(kind === "run" ? "\u25B6 \uB3CC\uB9AC\uAE30 \uC694\uCCAD\uC744 \uC62C\uB838\uC2B5\uB2C8\uB2E4" : "\u27F9 \uBB3C\uC74C\uC744 \uC62C\uB838\uC2B5\uB2C8\uB2E4");
        const d = new Date(now), z = (n) => String(n).padStart(2, "0");
        return { ok: true, msg: `\u2705 \uC62C\uB838\uC2B5\uB2C8\uB2E4 ${z(d.getHours())}:${z(d.getMinutes())}` };
      }
      console.error("[sync] canvasAsk", res.status, p);
      return { ok: false, msg: `\u26D4 \uBABB \uC62C\uB838\uC2B5\uB2C8\uB2E4 (${res.status})` };
    } catch (e) {
      console.error("[sync] canvasAsk", e);
      return { ok: false, msg: "\u26D4 \uBABB \uC62C\uB838\uC2B5\uB2C8\uB2E4 (\uC5F0\uACB0)" };
    }
  }
  // 미룬 것을 기억해 둔다(닫힐 때 받으려고). 처음 미룰 때만 알린다 — 왜 판이 안 바뀌는지 보이게.
  deferCanvas(p) {
    const k = nfc(p);
    if (!this._canvasDefer) this._canvasDefer = /* @__PURE__ */ new Set();
    if (!this._canvasDefer.has(k)) {
      this._canvasDefer.add(k);
      new import_obsidian.Notice(`\u{1F5C2} \xAB${k.split("/").pop()}\xBB \uC774 \uC5F4\uB824 \uC788\uC5B4 \uC11C\uBC84\uBCF8\uC744 \uC548 \uB36E\uC5C8\uC2B5\uB2C8\uB2E4 \u2014 \uB2EB\uC73C\uBA74 \uBC18\uC601\uB429\uB2C8\uB2E4`, 8e3);
    }
    return false;
  }
  // 미뤄 둔 캔버스가 닫혔으면 그 문서를 받아 applyRemote 로 정상 경로를 태운다.
  // (닫힌 뒤엔 여느 파일과 같다 — 기준선이 그대로면 서버본이 조용히 들어오고, 그 사이 형이 판을
  //  고쳤으면 여느 때처럼 최신 승 + 사본이다. 잃는 것은 없다.)
  async canvasReconcile() {
    if (!this._canvasDefer || !this._canvasDefer.size || !this.configured()) return;
    const open = this.canvasOpenPaths();
    for (const p of Array.from(this._canvasDefer)) {
      if (open.has(p)) continue;
      this._canvasDefer.delete(p);
      try {
        const cur = await this.req("GET", this.docUrl(this.idFor(p)));
        if (cur.status === 200 && cur.json) {
          if (await this.applyRemote(cur.json)) this.setSync("\u2193 1");
        }
      } catch (e) {
        console.error("[sync] canvasReconcile", p, e);
      }
    }
  }
  // 그림의 «마지막으로 맞춘 내용»을 해시로 기억한다(.md 의 shadow 와 같은 자리, 값만 해시).
  //  shadow 와 나눠 둔 이유: shadow 는 3-way 병합의 기준선이라 본문 전체가 필요한데, 그림은 견주기만 하면 된다.
  _binShadow() {
    if (!this.__binShadow) this.__binShadow = /* @__PURE__ */ new Map();
    return this.__binShadow;
  }
  attDigest(doc2) {
    const a = doc2 && doc2._attachments && doc2._attachments.bin;
    return a && a.digest ? String(a.digest).replace(/^md5-/, "") : null;
  }
  _ignored(p) {
    return /(^|\/)\./.test(String(p || ""));
  }
  // .trash/·.obsidian/ 등 숨김폴더 경로는 동기화 제외 — 삭제본이 되살아나거나 cvs:.trash/… 엉뚱한 문서 생기는 것 방지
  // 두 내용 중 하나가 다른 하나를 «온전히 포함»(가운데 삽입만 차이)하면 그 상위집합을 알려준다. 진짜 분기면 null → 사본 유지.
  _relate(a, b) {
    if (a === b) return "equal";
    let p = 0;
    const mn = Math.min(a.length, b.length);
    while (p < mn && a[p] === b[p]) p++;
    let s = 0;
    while (s < mn - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
    if (a.slice(p, a.length - s) === "") return "b";
    if (b.slice(p, b.length - s) === "") return "a";
    return null;
  }
  // 다른 «가운데 토막»만 Y.Text 에 반영한다. 통짜로 갈아끼우면 남의 커서·편집이 다 밀리므로 최소 차이만 넣는다.
  //  (relay 의 applyMinDiff 와 같은 방식 — 앞뒤 공통 부분을 뺀 나머지만 지우고 넣는다.)
  _minDiff(ytext, next) {
    const cur = ytext.toString();
    if (cur === next) return false;
    let p = 0;
    const mn = Math.min(cur.length, next.length);
    while (p < mn && cur[p] === next[p]) p++;
    let s = 0;
    while (s < mn - p && cur[cur.length - 1 - s] === next[next.length - 1 - s]) s++;
    const del = cur.length - p - s;
    const ins = next.slice(p, next.length - s);
    const run = () => {
      if (del > 0) ytext.delete(p, del);
      if (ins) ytext.insert(p, ins);
    };
    if (ytext.doc && ytext.doc.transact) ytext.doc.transact(run);
    else run();
    return true;
  }
  // ⭐ 붙기 «전에» 에디터 문서와 Y.Text 를 맞춘다 (2026-08-13 사고).
  //  왜: y-codemirror 는 붙을 때 둘을 맞추지 않는다(YSyncPluginValue 생성자는 observe 만 건다). 그래서
  //  다른 채로 붙으면 두 쪽의 «글자 위치»가 어긋난 채로 굳고, 그 뒤 친 글자가 엉뚱한 자리에 들어간다.
  //  (실제 사고: 새로 친 줄이 `---` 의 첫 `-` 와 둘째 `-` 사이에 박히고 `##` 이 `#` 이 됐다.)
  //  어느 쪽으로 맞추나: 한쪽이 다른 쪽을 온전히 품으면 그 상위집합으로 — 아무것도 안 잃는다.
  //  진짜 갈렸으면 서버(Y.Text)를 따르되(RULES §0.4 서버가 정본) 에디터 것을 사본으로 남긴다.
  async _reconcileAttach(cm, ytext, pNfc) {
    let cur = null;
    try {
      cur = cm.state.doc.toString();
    } catch (e) {
      return false;
    }
    const yt = ytext.toString();
    if (cur === yt) return false;
    const rel = this._relate(cur, yt);
    if (rel === "a") this._minDiff(ytext, cur);
    else {
      if (rel === null) {
        try {
          await this.saveConflictCopy(pNfc, cur, Date.now(), this.settings.deviceId || "local");
        } catch (e) {
        }
      }
      try {
        cm.dispatch({ changes: { from: 0, to: cm.state.doc.length, insert: yt } });
      } catch (e) {
      }
    }
    try {
      await this.logConflict(pNfc, "attach-mismatch", yt, cur, yt, Date.now(), 0, null, null);
    } catch (e) {
    }
    return true;
  }
  // ⭐ 협업 중인 노트의 «파일»이 에디터를 안 거치고 바뀌면 Y.Doc 은 그것을 모른다 (2026-08-13 사고).
  //  읽기 모드에서 체크박스를 누르면 옵시디언이 파일을 직접 고친다 — 편집기를 안 거치니 y-codemirror 도 모르고,
  //  파일동기화도 collabPath 라 건너뛴다. 그 편집은 노트를 닫을 때까지 아무 데도 못 가고, 닫는 순간 서버본과
  //  갈려 충돌본이 된다(실제 사고: 체크박스 두 개). → 그 차이를 Y.Doc 에 넣어 준다.
  async collabAbsorb(pNfc) {
    const s = this.session;
    if (!s || !s.attached || nfc(s.path) !== pNfc) return false;
    let content;
    try {
      content = await this.app.vault.adapter.read(s.path);
    } catch (e) {
      return false;
    }
    if (content === s.lastWritten) return false;
    const yt = s.ytext.toString();
    if (content === yt) return false;
    let cur = null;
    try {
      cur = s.cm.state.doc.toString();
    } catch (e) {
    }
    if (cur !== null) {
      if (cur === content) return false;
      if (cur !== yt) return false;
    }
    return this._minDiff(s.ytext, content);
  }
  /* ============ 파일 동기화 (CouchDB) ============ */
  //  binMime 이 있으면 «그림(첨부)» — 본문을 JSON 으로 감싸지 않고 날바이트 그대로 주고받는다.
  //  인증 헤더를 여기 한 자리에서만 만들려고 갈래를 나눴다(같은 줄을 두 벌 두지 않는다).
  async req(method, path, body, binMime) {
    const base = (this.settings.couchUrl || "").replace(/\/$/, "");
    const headers = { "Authorization": "Basic " + b64(`${this.settings.username}:${this.settings.password}`) };
    if (binMime) {
      if (body !== void 0) headers["Content-Type"] = binMime;
      return (0, import_obsidian.requestUrl)({ url: `${base}/${path}`, method, headers, body, throw: false });
    }
    if (body !== void 0) headers["Content-Type"] = "application/json";
    return (0, import_obsidian.requestUrl)({ url: `${base}/${path}`, method, headers, body: body !== void 0 ? JSON.stringify(body) : void 0, throw: false });
  }
  dbPath(p) {
    return `${encodeURIComponent(this.settings.dbName)}/${p}`;
  }
  docUrl(id2) {
    return this.dbPath(encodeURIComponent(id2));
  }
  idFor(pNfc) {
    return (this.settings.docPrefix || "") + pNfc;
  }
  _ab(u8) {
    return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
  }
  // req 의 바이트판 — 첨부는 JSON 이 아니라 날바이트로 오간다.
  async reqBin(method, path, u8, mime) {
    return this.req(method, path, u8 ? this._ab(u8) : void 0, mime || "application/octet-stream");
  }
  async getBin(path) {
    try {
      const r = await this.reqBin("GET", path, null, null);
      if (r.status !== 200 || !r.arrayBuffer) {
        console.warn("[sync] \uCCA8\uBD80 \uBC1B\uAE30 \uC2E4\uD328", path, r && r.status);
        return null;
      }
      return new Uint8Array(r.arrayBuffer);
    } catch (e) {
      console.error("[sync] getBin", path, e);
      return null;
    }
  }
  async testConnection() {
    if (!this.settings.couchUrl) return { ok: false, msg: "CouchDB URL \uC744 \uC785\uB825\uD558\uC138\uC694" };
    if (!this.settings.username) return { ok: false, msg: "\uC0AC\uC6A9\uC790\uB97C \uC785\uB825\uD558\uC138\uC694" };
    try {
      const res = await this.req("GET", encodeURIComponent(this.settings.dbName));
      if (res.status === 200 && res.json) return { ok: true, msg: `\uC5F0\uACB0 \uC131\uACF5 \xB7 DB "${this.settings.dbName}" \uB3C4\uB2EC` };
      if (res.status === 401) return { ok: false, msg: "\uC778\uC99D \uC2E4\uD328 \u2014 \uC544\uC774\uB514/\uBE44\uBC00\uBC88\uD638 \uD655\uC778" };
      if (res.status === 404) return { ok: false, msg: `DB "${this.settings.dbName}" \uC5C6\uC74C` };
      return { ok: false, msg: `\uC11C\uBC84 \uC624\uB958 (${res.status})` };
    } catch (e) {
      return { ok: false, msg: "\uC811\uC18D \uBD88\uAC00 \u2014 URL/\uB124\uD2B8\uC6CC\uD06C \uD655\uC778" };
    }
  }
  async onLocal(file) {
    if (this.applying || this._dupName || Date.now() < (this._suppressUntil || 0) || !this.configured() || !file || this._ignored(file.path)) return;
    const p = nfc(file.path);
    if (this.isBinPath(p)) {
      await this.onLocalBin(p, file.stat && file.stat.mtime || Date.now());
      return;
    }
    if (!this.isMd(file) && !this.isCanvasPath(p)) return;
    if (p === this.collabPath) {
      await this.collabAbsorb(p);
      return;
    }
    let content;
    try {
      content = await this.app.vault.adapter.read(file.path);
    } catch (e) {
      return;
    }
    if (this.shadow.get(p) === content) return;
    await this.upsert(p, content, file.stat && file.stat.mtime || Date.now());
  }
  async onLocalDelete(rawPath) {
    if (this.applying || this._dupName || Date.now() < (this._suppressUntil || 0) || !this.configured() || !this.isSyncPath(rawPath) || this._ignored(rawPath)) return;
    const p = nfc(rawPath);
    if (p === this.collabPath) return;
    this.shadow.delete(p);
    this._binShadow().delete(p);
    await this.markDeleted(p);
  }
  async onLocalRename(file, oldPath) {
    if (this.applying || this._dupName || Date.now() < (this._suppressUntil || 0) || !this.configured()) return;
    if (this.isSyncPath(oldPath) && !this._ignored(oldPath)) {
      this._binShadow().delete(nfc(oldPath));
      await this.markDeleted(nfc(oldPath));
    }
    if (file && this.isSyncPath(file.path)) await this.onLocal(file);
  }
  async putDoc(pNfc, content, mtime) {
    if (this._outdated) return false;
    const id2 = this.idFor(pNfc);
    const cur = await this.req("GET", this.docUrl(id2));
    const doc2 = { _id: id2, path: pNfc, content, mtime, deleted: false, lastEditor: this.settings.username, clientVersion: this.manifest.version };
    if (cur.status === 200 && cur.json && cur.json._rev) doc2._rev = cur.json._rev;
    const put = await this.req("PUT", this.docUrl(id2), doc2);
    if (put.status === 200 || put.status === 201) {
      this.shadow.set(pNfc, content);
      return true;
    }
    return false;
  }
  async upsert(pNfc, content, mtime) {
    try {
      const cur = await this.req("GET", this.docUrl(this.idFor(pNfc)));
      const server = cur.status === 200 && cur.json ? cur.json : null;
      const base = this.shadow.get(pNfc);
      if (server && !server.deleted && server.content !== void 0 && server.content !== content && base === void 0) {
        const rel = this._relate(content, server.content);
        if (rel === "b") {
          await this.writeLocal(pNfc, server.content);
          this.shadow.set(pNfc, server.content);
          return;
        }
        if (rel !== "a") {
          await this.logConflict(pNfc, "upsert-nobase", base, content, server.content, mtime, server.mtime || 0, server.lastEditor, server.clientVersion);
          await this.saveConflictCopy(pNfc, server.content, server.mtime || Date.now(), "server");
        }
      } else if (server && !server.deleted && server.content !== void 0 && server.content !== content && base !== void 0 && server.content !== base) {
        const merged = this.canMerge(pNfc) ? merge3(base, content, server.content) : null;
        if (merged !== null) {
          await this.writeLocal(pNfc, merged);
          this.shadow.set(pNfc, merged);
          await this.putDoc(pNfc, merged, Math.max(mtime, server.mtime || 0));
          return;
        }
        const rel = this._relate(content, server.content);
        if (rel === "b") {
          await this.writeLocal(pNfc, server.content);
          this.shadow.set(pNfc, server.content);
          return;
        }
        if (rel !== "a") {
          await this.logConflict(pNfc, "upsert", base, content, server.content, mtime, server.mtime || 0, server.lastEditor, server.clientVersion);
          if (mtime >= (server.mtime || 0)) {
            await this.saveConflictCopy(pNfc, server.content, server.mtime || Date.now(), "server");
          } else {
            await this.saveConflictCopy(pNfc, content, mtime, this.settings.deviceId || "local");
            await this.writeLocal(pNfc, server.content);
            this.shadow.set(pNfc, server.content);
            return;
          }
        }
      }
      await this.putDoc(pNfc, content, mtime);
    } catch (e) {
      console.error("[sync] upsert", e);
    }
  }
  async markDeleted(pNfc) {
    try {
      if (this._outdated) return;
      const id2 = this.idFor(pNfc);
      const cur = await this.req("GET", this.docUrl(id2));
      if (cur.status !== 200 || !cur.json) return;
      const doc2 = cur.json;
      doc2.deleted = true;
      doc2.content = "";
      doc2.mtime = Date.now();
      doc2.clientVersion = this.manifest.version;
      await this.req("PUT", this.docUrl(id2), doc2);
    } catch (e) {
      console.error("[sync] markDeleted", e);
    }
  }
  changesUrl(feed) {
    const prefix = this.settings.docPrefix || "";
    let url = `${this.dbPath("_changes")}?include_docs=true&since=${encodeURIComponent(this.settings.lastSeq)}`;
    if (feed) url += "&feed=longpoll&timeout=25000";
    return { url, prefix };
  }
  selectorBody() {
    const prefix = this.settings.docPrefix || "";
    const hi = prefix.slice(0, -1) + String.fromCharCode(prefix.charCodeAt(prefix.length - 1) + 1);
    return { selector: { _id: { "$gte": prefix, "$lt": hi } } };
  }
  async fetchChanges(feed) {
    const { url, prefix } = this.changesUrl(feed);
    if (prefix) return this.req("POST", url + "&filter=_selector", this.selectorBody());
    return this.req("GET", url);
  }
  async syncCycle(manual) {
    if (this.syncing || !this.configured()) return;
    this.syncing = true;
    this.setSync("\uB3D9\uAE30\uD654\u2026");
    try {
      const res = await this.fetchChanges(false);
      if (res.status !== 200) {
        this.setSync("\uC624\uB958 " + res.status);
        if (manual) new import_obsidian.Notice("\uB3D9\uAE30\uD654 \uC624\uB958 " + res.status);
        return;
      }
      let n = 0;
      for (const row of res.json.results || []) {
        const doc2 = row.doc;
        if (!doc2 || doc2._id && doc2._id.startsWith("_")) continue;
        if (await this.applyRemote(doc2)) n++;
      }
      this.settings.lastSeq = res.json.last_seq;
      await this.saveSettings();
      this.setSync(n ? `\uBC1B\uC74C ${n}` : "ok");
      if (manual) new import_obsidian.Notice(n ? `${n}\uAC1C \uBC18\uC601` : "\uBCC0\uACBD \uC5C6\uC74C");
    } catch (e) {
      this.setSync("\uC624\uB958");
      console.error("[sync] cycle", e);
      if (manual) new import_obsidian.Notice("\uB3D9\uAE30\uD654 \uC2E4\uD328");
    } finally {
      this.syncing = false;
    }
  }
  // 연결 시 전체 당겨받기: 서버의 모든 cvs: 문서를 받아 로컬에 없거나 다른 것만 기록(비파괴).
  // lastSeq 상태·longpoll 진행 여부와 무관하게 "누르면 파일이 온다"를 보장한다.
  async pullAllFromServer(onProgress) {
    if (!this.configured()) return 0;
    while (this.syncing) await sleep(50);
    this.syncing = true;
    this.setSync("\uD30C\uC77C \uBC1B\uB294 \uC911\u2026");
    try {
      const prefix = this.settings.docPrefix || "";
      const hi = prefix.slice(0, -1) + String.fromCharCode(prefix.charCodeAt(prefix.length - 1) + 1);
      const idsRes = await this.req("GET", `${this.dbPath("_all_docs")}?startkey=${encodeURIComponent(JSON.stringify(prefix))}&endkey=${encodeURIComponent(JSON.stringify(hi))}`);
      if (idsRes.status !== 200 || !idsRes.json || !Array.isArray(idsRes.json.rows)) {
        this.setSync("\uC624\uB958 " + idsRes.status);
        return 0;
      }
      const ids = idsRes.json.rows.map((r) => r.id);
      const total = ids.length;
      if (onProgress) onProgress(0, total);
      let n = 0, done = 0;
      const B = 50;
      for (let i = 0; i < ids.length; i += B) {
        const batch = ids.slice(i, i + B);
        const res = await this.req("POST", this.dbPath("_all_docs?include_docs=true"), { keys: batch });
        if (res.status === 200 && res.json && Array.isArray(res.json.rows)) {
          for (const row of res.json.rows) {
            const d = row.doc;
            if (d && await this.applyRemote(d)) n++;
            done++;
            if (onProgress) onProgress(done, total);
          }
        } else {
          done += batch.length;
          if (onProgress) onProgress(done, total);
        }
      }
      try {
        const info = await this.req("GET", encodeURIComponent(this.settings.dbName));
        if (info.status === 200 && info.json && info.json.update_seq !== void 0) {
          this.settings.lastSeq = info.json.update_seq;
          await this.saveSettings();
        }
      } catch (e) {
      }
      this.setSync(n ? `\uBC1B\uC74C ${n}` : "ok");
      return n;
    } catch (e) {
      this.setSync("\uC624\uB958");
      console.error("[sync] pullAll", e);
      return 0;
    } finally {
      this.syncing = false;
    }
  }
  // 동기화 게이트: 처음/재접속 시 «지금 연 노트 하나»만 맞출 때까지 편집을 잠근다(모달+readonly).
  //  나머지 노트는 같은 방식(pullAllFromServer)으로 뒤에서 돈다 — 편집을 막지 않는다.
  //  왜 열린 노트만 먼저인가: 지금 고칠 수 있는 노트가 그것뿐이고(딴 노트는 열어야 고친다),
  //  그 노트의 기준선(shadow)이 서면 upsert 의 3-way 병합이 선다. 나머지를 기다려 편집을 막을 이유가 없다.
  async gatedSync() {
    if (this._gating || !this.configured() || this.isOffline()) return;
    await this.resetOnUpgrade();
    this._gating = true;
    this.refreshLock();
    let modal = null;
    const t = setTimeout(() => {
      try {
        modal = new SyncGateModal(this.app);
        modal.open();
        modal.setProgress(0, 1);
      } catch (e) {
      }
    }, 500);
    try {
      await this.syncActiveNote();
    } catch (e) {
    }
    clearTimeout(t);
    if (modal) {
      modal.allowClose = true;
      try {
        modal.close();
      } catch (e) {
      }
    }
    this._gating = false;
    this.refreshLock();
    this.backgroundPull();
  }
  // 지금 연 노트 하나만 서버와 맞춘다. Yjs 세션이 붙기 전에 해야 한다 — 붙은 뒤엔 relay 가 그 노트의 주인이다.
  //  (onload 는 gatedSync → onActiveChange 순서라 처음 기동 때는 아직 안 붙어 있다. 재접속 때는 붙어 있어 건너뛴다.)
  async syncActiveNote() {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    const file = view && view.file;
    if (!file || !this.isMd(file) || this._ignored(file.path)) return;
    const p = nfc(file.path);
    if (p === this.collabPath) return;
    this.setSync("\uC5F0 \uB178\uD2B8 \uD655\uC778\u2026");
    const cur = await this.req("GET", this.docUrl(this.idFor(p)));
    if (cur.status === 200 && cur.json) await this.applyRemote(cur.json);
  }
  // 나머지 노트 전체 — 지금까지와 같은 방식(pullAllFromServer), 다만 편집을 막지 않고 뒤에서 돈다.
  async backgroundPull() {
    if (this._bgPull) return;
    if (Date.now() - (this._bgPullAt || 0) < 6e4) return;
    this._bgPull = true;
    let shown = -1;
    try {
      await this.pullAllFromServer((done, total) => {
        if (done - shown >= 25 || done >= total) {
          shown = done;
          this.setSync(`\uC804\uCCB4 \uD655\uC778 ${done}/${total}`);
        }
      });
    } catch (e) {
      console.error("[sync] backgroundPull", e);
    } finally {
      this._bgPull = false;
      this._bgPullAt = Date.now();
    }
  }
  async longPollLoop() {
    while (this._rtRunning) {
      if (!this.configured()) {
        await sleep(3e3);
        continue;
      }
      let res;
      try {
        res = await this.fetchChanges(true);
      } catch (e) {
        this.setSync("\uC7AC\uC5F0\uACB0\u2026");
        this.setNet(false);
        await sleep(4e3);
        continue;
      }
      if (!res || res.status !== 200) {
        this.setSync("\uC624\uB958 " + (res && res.status));
        this.setNet(false);
        await sleep(4e3);
        continue;
      }
      this.setNet(true);
      while (this.syncing) await sleep(50);
      this.syncing = true;
      try {
        let n = 0;
        for (const row of res.json && res.json.results || []) {
          const doc2 = row.doc;
          if (!doc2 || doc2._id && doc2._id.startsWith("_")) continue;
          if (await this.applyRemote(doc2)) n++;
        }
        if (res.json && res.json.last_seq !== void 0) {
          this.settings.lastSeq = res.json.last_seq;
          await this.saveSettings();
        }
        this.setSync(n ? `\u2193 ${n}` : "\uC2E4\uC2DC\uAC04 \u2713");
      } catch (e) {
        console.error("[sync] longpoll", e);
      } finally {
        this.syncing = false;
      }
    }
  }
  async applyRemote(doc2) {
    const _pfx = this.settings.docPrefix || "";
    const p = doc2.path || (doc2._id && doc2._id.indexOf(_pfx) === 0 ? doc2._id.slice(_pfx.length) : doc2._id);
    if (this._ignored(p)) return false;
    if (this.isBinPath(p)) return this.applyRemoteBin(doc2, p);
    if (!this.isTextPath(p)) return false;
    if (nfc(p) === this.collabPath) return false;
    if (this.isCanvasPath(p) && this.canvasOpen(p)) return this.deferCanvas(p);
    const R = doc2.content || "";
    try {
      const exists = await this.app.vault.adapter.exists(p);
      if (nfc(p) === this.collabPath) return false;
      if (this.isCanvasPath(p) && this.canvasOpen(p)) return this.deferCanvas(p);
      if (doc2.deleted || doc2._deleted) {
        if (exists) {
          this.applying = true;
          try {
            const af = this.app.vault.getAbstractFileByPath(p);
            if (af) await this.app.vault.trash(af, false);
            else await this.app.vault.adapter.remove(p);
          } finally {
            this.applying = false;
          }
          await this.pruneEmptyParents(p);
        }
        this.shadow.delete(p);
        return exists;
      }
      if (!exists) {
        await this.writeLocal(p, R);
        this.shadow.set(p, R);
        return true;
      }
      const local = await this.app.vault.adapter.read(p);
      if (nfc(p) === this.collabPath) return false;
      if (this.isCanvasPath(p) && this.canvasOpen(p)) return this.deferCanvas(p);
      if (local === R) {
        this.shadow.set(p, R);
        return false;
      }
      const base = this.shadow.get(p);
      if (base === void 0) {
        const st2 = await this.app.vault.adapter.stat(p);
        const lm2 = st2 ? st2.mtime : 0;
        if ((doc2.mtime || 0) >= lm2) {
          await this.writeLocal(p, R);
          this.shadow.set(p, R);
        } else {
          await this.putDoc(p, local, lm2);
          this.shadow.set(p, local);
        }
        return true;
      }
      if (local === base) {
        await this.writeLocal(p, R);
        this.shadow.set(p, R);
        return true;
      }
      const st = await this.app.vault.adapter.stat(p);
      const lm = st ? st.mtime : 0;
      const merged = this.canMerge(p) ? merge3(base, local, R) : null;
      if (merged !== null) {
        await this.writeLocal(p, merged);
        this.shadow.set(p, merged);
        if (merged !== R) await this.putDoc(p, merged, Math.max(lm, doc2.mtime || 0));
        return true;
      }
      const rel = this._relate(local, R);
      if (rel === "equal" || rel === "b") {
        await this.writeLocal(p, R);
        this.shadow.set(p, R);
        return true;
      }
      if (rel === "a") {
        await this.putDoc(p, local, lm);
        this.shadow.set(p, local);
        return true;
      }
      await this.logConflict(p, "applyRemote", base, local, R, lm, doc2.mtime || 0, doc2.lastEditor, doc2.clientVersion);
      if ((doc2.mtime || 0) >= lm) {
        await this.saveConflictCopy(p, local, lm, this.settings.deviceId || "local");
        await this.writeLocal(p, R);
        this.shadow.set(p, R);
      } else {
        await this.saveConflictCopy(p, R, doc2.mtime || 0, "server");
        await this.putDoc(p, local, lm);
      }
      return true;
    } catch (e) {
      console.error("[sync] applyRemote", p, e);
      return false;
    }
  }
  /* ⛔ main-db 전용 — ai-study-sync 에는 일부러 안 넣었다(형 지시 2026-08-13). 위 머리말 참고.
     ── 그림(첨부) 동기화 ────────────────────────────────────────────────
     .md 와 다른 점 셋:
      ① 합칠 수 없다 → 3-way 병합·부분집합 판정을 안 쓴다. «같으면 그대로, 다르면 최신(mtime) 승».
      ② 견주기는 «해시»로 한다(수정시각 아님). 받아 쓴 파일은 로컬 mtime 이 «지금»이 되므로
         수정시각만 보면 늘 로컬이 새 것 → 받은 그림을 되올리고 그걸 받은 기기가 또 되올린다.
      ③ 마지막으로 맞춘 해시(_binShadow) 대비 양쪽 다 바뀌었을 때만 사본을 남긴다 — 첫 대면엔 안 남긴다
         (.md 의 «첫 대면은 충돌 아님» 규칙과 같다). */
  // 서버 첨부를 받아 로컬에 쓴다. 상한 초과·해시 불일치면 조용히 넘기지 않고 콘솔에 남긴다.
  async pullBinTo(p, doc2) {
    const a = (doc2._attachments || {}).bin;
    if (!a) return false;
    if ((a.length || 0) > BIN_MAX) {
      console.warn(`[sync] \uC11C\uBC84 \uADF8\uB9BC\uC774 \uC0C1\uD55C \uCD08\uACFC \u2014 \uC548 \uBC1B\uC74C: ${p} (${a.length} > ${BIN_MAX} \uBC14\uC774\uD2B8)`);
      return false;
    }
    const dig = this.attDigest(doc2);
    const got = await this.getBin(this.docUrl(this.idFor(nfc(p))) + "/bin");
    if (!got) {
      console.warn("[sync] \uADF8\uB9BC \uBC1B\uAE30 \uC2E4\uD328 \u2014 \uC548 \uC500:", p);
      return false;
    }
    if (dig && md5b64(got) !== dig) {
      console.warn("[sync] \uBC1B\uC740 \uADF8\uB9BC \uD574\uC2DC \uBD88\uC77C\uCE58 \u2014 \uC548 \uC500:", p);
      return false;
    }
    await this.writeLocalBin(p, got);
    this._binShadow().set(nfc(p), dig || md5b64(got));
    return true;
  }
  async putBin(pNfc, u8, mtime) {
    if (this._outdated) return false;
    if (u8.length > BIN_MAX) {
      console.warn(`[sync] \uADF8\uB9BC\uC774 \uC0C1\uD55C \uCD08\uACFC \u2014 \uC548 \uC62C\uB9BC: ${pNfc} (${u8.length} > ${BIN_MAX} \uBC14\uC774\uD2B8)`);
      new import_obsidian.Notice(`\u26A0\uFE0F \uADF8\uB9BC\uC774 \uCEE4\uC11C \uB3D9\uAE30\uD654 \uC548 \uD568 (${(u8.length / 1048576).toFixed(1)}MB > 2MB): ${pNfc.split("/").pop()}`, 8e3);
      return false;
    }
    const id2 = this.idFor(pNfc);
    const mime = BIN_EXT[this.binExt(pNfc)] || "application/octet-stream";
    const cur = await this.req("GET", this.docUrl(id2));
    const doc2 = { _id: id2, path: pNfc, binary: true, size: u8.length, mime, mtime, deleted: false, lastEditor: this.settings.username, clientVersion: this.manifest.version };
    if (cur.status === 200 && cur.json && cur.json._rev) doc2._rev = cur.json._rev;
    const put = await this.req("PUT", this.docUrl(id2), doc2);
    if (put.status !== 200 && put.status !== 201) {
      console.warn("[sync] \uADF8\uB9BC \uBB38\uC11C \uC62C\uB9AC\uAE30 \uC2E4\uD328", pNfc, put.status);
      return false;
    }
    const rev = put.json && (put.json.rev || put.json._rev);
    const att = await this.reqBin("PUT", `${this.docUrl(id2)}/bin?rev=${encodeURIComponent(rev)}`, u8, mime);
    if (att.status !== 200 && att.status !== 201) {
      console.error("[sync] \uADF8\uB9BC \uCCA8\uBD80 \uC62C\uB9AC\uAE30 \uC2E4\uD328", pNfc, att.status);
      return false;
    }
    this._binShadow().set(pNfc, md5b64(u8));
    return true;
  }
  async onLocalBin(pNfc, mtime) {
    try {
      let u8;
      try {
        u8 = await this.readBin(pNfc);
      } catch (e) {
        return;
      }
      const dig = md5b64(u8);
      if (this._binShadow().get(pNfc) === dig) return;
      const cur = await this.req("GET", this.docUrl(this.idFor(pNfc)));
      const server = cur.status === 200 && cur.json ? cur.json : null;
      if (server && !server.deleted) {
        const sDig = this.attDigest(server);
        if (sDig === dig) {
          this._binShadow().set(pNfc, dig);
          return;
        }
        const base = this._binShadow().get(pNfc);
        if (sDig && base !== void 0 && base !== sDig) {
          const srv = await this.getBin(this.docUrl(this.idFor(pNfc)) + "/bin");
          if (srv) await this.saveBinConflictCopy(pNfc, srv, server.mtime || Date.now(), "server");
        }
      }
      await this.putBin(pNfc, u8, mtime);
    } catch (e) {
      console.error("[sync] onLocalBin", pNfc, e);
    }
  }
  async applyRemoteBin(doc2, p) {
    const pNfc = nfc(p);
    try {
      const exists = await this.app.vault.adapter.exists(p);
      if (doc2.deleted || doc2._deleted) {
        if (exists) {
          this.applying = true;
          try {
            const af = this.app.vault.getAbstractFileByPath(p);
            if (af) await this.app.vault.trash(af, false);
            else await this.app.vault.adapter.remove(p);
          } finally {
            this.applying = false;
          }
          await this.pruneEmptyParents(p);
        }
        this._binShadow().delete(pNfc);
        return exists;
      }
      const dig = this.attDigest(doc2);
      if (!dig) return false;
      if (!exists) return await this.pullBinTo(p, doc2);
      let local;
      try {
        local = await this.readBin(p);
      } catch (e) {
        return false;
      }
      const lDig = md5b64(local);
      if (lDig === dig) {
        this._binShadow().set(pNfc, dig);
        return false;
      }
      const base = this._binShadow().get(pNfc);
      if (base === lDig) return await this.pullBinTo(p, doc2);
      const st = await this.app.vault.adapter.stat(p);
      const lm = st && st.mtime || 0;
      if (base === dig) {
        await this.putBin(pNfc, local, lm);
        return true;
      }
      if (base !== void 0) {
        if ((doc2.mtime || 0) >= lm) await this.saveBinConflictCopy(pNfc, local, lm, this.settings.deviceId || "local");
        else {
          const srv = await this.getBin(this.docUrl(this.idFor(pNfc)) + "/bin");
          if (srv) await this.saveBinConflictCopy(pNfc, srv, doc2.mtime || 0, "server");
        }
      }
      if ((doc2.mtime || 0) >= lm) return await this.pullBinTo(p, doc2);
      await this.putBin(pNfc, local, lm);
      return true;
    } catch (e) {
      console.error("[sync] applyRemoteBin", p, e);
      return false;
    }
  }
  async saveBinConflictCopy(pNfc, u8, mtime, tag) {
    const dot = pNfc.lastIndexOf(".");
    const ext = dot > 0 ? pNfc.slice(dot) : "";
    const bare = dot > 0 ? pNfc.slice(0, dot) : pNfc;
    const cp = `${bare} (\uCDA9\uB3CC ${tag} ${this.tstamp()})${ext}`;
    await this.writeLocalBin(cp, u8);
    this._binShadow().set(cp, md5b64(u8));
    await this.putBin(cp, u8, mtime);
    new import_obsidian.Notice(`\u26A0\uFE0F \uADF8\uB9BC \uCDA9\uB3CC \u2014 \uC0AC\uBCF8 \uBCF4\uAD00: ${cp.split("/").pop()}`);
  }
  async pruneEmptyParents(filePath) {
    let dir = filePath.split("/").slice(0, -1).join("/");
    while (dir) {
      try {
        const l = await this.app.vault.adapter.list(dir);
        if ((l.files || []).length + (l.folders || []).length > 0) break;
        this.applying = true;
        try {
          const af = this.app.vault.getAbstractFileByPath(dir);
          if (af) await this.app.vault.trash(af, false);
          else await this.app.vault.adapter.rmdir(dir, false);
        } finally {
          this.applying = false;
        }
      } catch (e) {
        break;
      }
      dir = dir.split("/").slice(0, -1).join("/");
    }
  }
  async ensureParent(path) {
    const parts = path.split("/");
    parts.pop();
    let cur = "";
    for (const seg of parts) {
      cur = cur ? `${cur}/${seg}` : seg;
      if (!await this.app.vault.adapter.exists(cur)) {
        try {
          await this.app.vault.adapter.mkdir(cur);
        } catch (e) {
        }
      }
    }
  }
  async writeLocal(p, content) {
    await this.ensureParent(p);
    this.applying = true;
    try {
      await this.app.vault.adapter.write(p, content);
    } finally {
      this.applying = false;
    }
  }
  async readBin(p) {
    return new Uint8Array(await this.app.vault.adapter.readBinary(p));
  }
  // applying 을 «되돌려» 놓는다(false 로 못박지 않는다) — hardReset 처럼 이미 applying 인 채로 부르는 자리가 있다.
  async writeLocalBin(p, u8) {
    await this.ensureParent(p);
    const was = this.applying;
    this.applying = true;
    try {
      await this.app.vault.adapter.writeBinary(p, this._ab(u8));
    } finally {
      this.applying = was;
    }
  }
  tstamp() {
    const d = /* @__PURE__ */ new Date(), z = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}${z(d.getMinutes())}`;
  }
  _diffAt(a, b) {
    a = a || "";
    b = b || "";
    let i = 0;
    const m = Math.min(a.length, b.length);
    while (i < m && a[i] === b[i]) i++;
    return { i, local: a.slice(Math.max(0, i - 14), i + 14), server: b.slice(Math.max(0, i - 14), i + 14) };
  }
  async logConflict(p, where, base, local, server, localMtime, serverMtime, serverLastEditor, serverClientVersion) {
    try {
      const d = this._diffAt(local, server);
      const rec = {
        t: (/* @__PURE__ */ new Date()).toISOString(),
        where,
        path: p,
        baseLen: (base || "").length,
        localLen: (local || "").length,
        serverLen: (server || "").length,
        localChanged: (base || "") !== (local || ""),
        serverChanged: (base || "") !== (server || ""),
        localMtime,
        serverMtime,
        serverLastEditor: serverLastEditor || null,
        firstDiff: d.i,
        aroundLocal: d.local,
        aroundServer: d.server,
        collabOpen: nfc(p) === this.collabPath,
        deviceId: this.settings.deviceId,
        device: this.settings.deviceLabel,
        user: this.settings.username,
        // 어느 버전끼리 갈렸나 — «옛 기기가 밀어넣었나」를 판별하는 핵심 신호.
        clientVersion: this.manifest.version,
        serverClientVersion: serverClientVersion || null
      };
      console.warn("[collab] \uCDA9\uB3CC \uB85C\uADF8", rec);
      const f = `${this.app.vault.configDir}/plugins/${this.manifest.id}/conflict-log.jsonl`;
      const line = JSON.stringify(rec) + "\n";
      try {
        await this.app.vault.adapter.append(f, line);
      } catch (e) {
        let prev = "";
        try {
          if (await this.app.vault.adapter.exists(f)) prev = await this.app.vault.adapter.read(f);
        } catch (e2) {
        }
        await this.app.vault.adapter.write(f, prev + line);
      }
      await this.reportConflict(rec);
    } catch (e) {
      console.error("[collab] logConflict", e);
    }
  }
  // 같은 레코드를 서버에도 남긴다 — 기기 로컬 jsonl 은 그 기기에서만 보여, 어느 기기·어떤 상황에서 충돌이
  // 나는지 «모아서» 볼 수가 없다. 레코드마다 _id 가 달라 리비전 경합이 없다.
  // 구버전 pull-only(_outdated)여도 보낸다 — 옛 기기의 충돌이야말로 봐야 할 것이다.
  async reportConflict(rec) {
    try {
      if (!this.configured()) return;
      const stamp = rec.t.replace(/[:.]/g, "-");
      const rnd = Math.random().toString(36).slice(2, 7);
      const p = `${DIAG_DIR}/${stamp}-${rec.deviceId || "unknown"}-${rnd}.json`;
      const id2 = this.idFor(p);
      await this.req("PUT", this.docUrl(id2), { _id: id2, path: p, kind: "conflict", mtime: Date.now(), deleted: false, clientVersion: this.manifest.version, rec });
    } catch (e) {
      console.error("[collab] reportConflict", e);
    }
  }
  async readConflictLog() {
    try {
      const f = `${this.app.vault.configDir}/plugins/${this.manifest.id}/conflict-log.jsonl`;
      if (await this.app.vault.adapter.exists(f)) return await this.app.vault.adapter.read(f);
    } catch (e) {
    }
    return "";
  }
  async saveConflictCopy(pNfc, content, mtime, tag) {
    const dot = pNfc.lastIndexOf(".");
    const ext = dot > 0 ? pNfc.slice(dot) : ".md";
    const bare = dot > 0 ? pNfc.slice(0, dot) : pNfc;
    const cp = `${bare} (\uCDA9\uB3CC ${tag} ${this.tstamp()})${ext}`;
    await this.writeLocal(cp, content);
    this.shadow.set(cp, content);
    await this.putDoc(cp, content, mtime);
    new import_obsidian.Notice(`\u26A0\uFE0F \uB3D9\uC2DC\uD3B8\uC9D1 \uCDA9\uB3CC \u2014 \uC0AC\uBCF8 \uBCF4\uAD00: ${cp.split("/").pop()}`);
  }
  async pushAll() {
    if (!this.configured()) {
      new import_obsidian.Notice("\uBA3C\uC800 \uC124\uC815\uC744 \uCC44\uC6B0\uC138\uC694");
      return;
    }
    const all2 = this.app.vault.getFiles ? this.app.vault.getFiles() : [];
    const files = this.app.vault.getMarkdownFiles().concat(all2.filter((f) => this.isCanvasPath(f.path) && !this._ignored(f.path)));
    const bins = all2.filter((f) => this.isBinPath(f.path) && !this._ignored(f.path));
    new import_obsidian.Notice(`\uC5C5\uB85C\uB4DC \uC2DC\uC791 \u2014 \uB178\uD2B8\xB7\uCE94\uBC84\uC2A4 ${files.length}\uAC1C \xB7 \uADF8\uB9BC ${bins.length}\uAC1C\u2026`);
    let ok = 0, bok = 0;
    for (const f of files) {
      try {
        const content = await this.app.vault.adapter.read(f.path);
        await this.upsert(nfc(f.path), content, f.stat.mtime);
        ok++;
      } catch (e) {
      }
    }
    for (const f of bins) {
      try {
        await this.onLocalBin(nfc(f.path), f.stat && f.stat.mtime || Date.now());
        bok++;
      } catch (e) {
      }
    }
    new import_obsidian.Notice(`\uC5C5\uB85C\uB4DC \uC644\uB8CC \u2014 \uB178\uD2B8 ${ok}/${files.length} \xB7 \uADF8\uB9BC ${bok}/${bins.length}`);
  }
  // 처음부터 다시 받기(하드 리셋): 로컬 .md 를 전부 지우고 서버본으로 통째 갈아엎는다.
  // 안전 순서 — ①서버 전체를 먼저 받아온다(실패하면 로컬은 손대지 않음) → ②로컬 .md 삭제 → ③서버본 기록.
  // 업데이트 직후 «서버본으로 재기준» — 이 기기의 로컬 .md 를 전부 버리고 서버본만 남긴다.
  //  왜: 기준선(shadow)은 메모리에만 있어 재시작하면 빈다. 그러면 applyRemote 의 «첫 대면» 규칙이
  //  수정시각이 새 쪽을 택하는데, 옛 버전에서 업로드 게이트에 막힌 채 로컬에만 쌓인 편집분이 바로 그
  //  «새 쪽»이라 업데이트하는 순간 서버(정본)를 덮는다. 서버가 정본이라는 방침에 맞추려면 올라온 직후
  //  로컬을 버리고 서버본으로 다시 깔아야 한다.
  //  로컬에만 있고 서버엔 없는 노트도 같이 사라진다 — 오프라인 편집이 잠겨 있어 그런 노트는 정상 경로로
  //  안 생긴다는 판단(형 결정, 2026-08-06).
  //  갓 설치(_freshInstall)는 대상이 아니다 — 남의 볼트에 처음 깔면서 그 볼트를 지우면 안 된다.
  async resetOnUpgrade() {
    if (this._freshInstall) {
      this.settings.lastRunVersion = this.manifest.version;
      await this.saveSettings();
      return;
    }
    if (this.settings.lastRunVersion === this.manifest.version) return;
    if (!this.configured() || this.isOffline()) return;
    this._resetting = true;
    this.refreshLock();
    this.endSession();
    let modal = null;
    try {
      modal = new UpgradeResetModal(this.app, this.settings.lastRunVersion, this.manifest.version);
      modal.open();
    } catch (e) {
    }
    let ok = false;
    try {
      ok = await this.hardReset();
    } catch (e) {
      console.error("[sync] resetOnUpgrade", e);
    }
    if (ok) {
      this.settings.lastRunVersion = this.manifest.version;
      await this.saveSettings();
    }
    if (modal) {
      modal.allowClose = true;
      try {
        modal.close();
      } catch (e) {
      }
    }
    this._resetting = false;
    this.refreshLock();
  }
  async hardReset() {
    if (!this.configured()) {
      new import_obsidian.Notice("\uBA3C\uC800 \uC124\uC815\uC744 \uCC44\uC6B0\uC138\uC694");
      return false;
    }
    new import_obsidian.Notice("\uC11C\uBC84\uC5D0\uC11C \uC804\uCCB4 \uBC1B\uB294 \uC911\u2026");
    const prefix = this.settings.docPrefix || "";
    const hi = prefix.slice(0, -1) + String.fromCharCode(prefix.charCodeAt(prefix.length - 1) + 1);
    const q = `${this.dbPath("_all_docs")}?include_docs=true&startkey=${encodeURIComponent(JSON.stringify(prefix))}&endkey=${encodeURIComponent(JSON.stringify(hi))}`;
    let res;
    try {
      res = await this.req("GET", q);
    } catch (e) {
      res = null;
    }
    if (!res || res.status !== 200 || !res.json || !Array.isArray(res.json.rows)) {
      new import_obsidian.Notice("\u274C \uC11C\uBC84\uC5D0\uC11C \uBC1B\uAE30 \uC2E4\uD328 \u2014 \uB85C\uCEEC\uC740 \uADF8\uB300\uB85C \uB461\uB2C8\uB2E4");
      return false;
    }
    const docs = res.json.rows.map((r) => r.doc).filter((d) => d && (d.path || d._id));
    this.applying = true;
    let del = 0, wr = 0;
    try {
      for (const f of this.app.vault.getMarkdownFiles()) {
        try {
          await this.app.vault.adapter.remove(f.path);
          del++;
        } catch (e) {
        }
      }
      this.shadow.clear();
      this._binShadow().clear();
      const bins = [];
      for (const d of docs) {
        if (d.deleted || d._deleted) continue;
        const p = d.path || d._id.slice(prefix.length);
        if (this.isBinPath(p)) {
          bins.push([p, d]);
          continue;
        }
        if (!this.isTextPath(p)) continue;
        try {
          await this.ensureParent(p);
          await this.app.vault.adapter.write(p, d.content || "");
          this.shadow.set(p, d.content || "");
          wr++;
        } catch (e) {
        }
      }
      for (const [p, d] of bins) {
        try {
          if (await this.pullBinTo(p, d)) wr++;
        } catch (e) {
        }
      }
    } finally {
      this.applying = false;
      this._suppressUntil = Date.now() + 12e3;
    }
    try {
      const info = await this.req("GET", encodeURIComponent(this.settings.dbName));
      if (info.status === 200 && info.json && info.json.update_seq !== void 0) {
        this.settings.lastSeq = info.json.update_seq;
        await this.saveSettings();
      }
    } catch (e) {
    }
    new import_obsidian.Notice(`\u267B\uFE0F \uB2E4\uC2DC \uBC1B\uAE30 \uC644\uB8CC \u2014 \uB85C\uCEEC ${del}\uAC1C \uC0AD\uC81C \xB7 \uC11C\uBC84\uBCF8 ${wr}\uAC1C \uAE30\uB85D`);
    return true;
  }
  /* ============ 실시간 협업 (relay) ============ */
  httpBase() {
    return (this.settings.wsUrl || "").replace(/^ws/, "http").replace(/\/$/, "");
  }
  async getToken() {
    if (this._token && this._tokenExp > Date.now() + 6e4) return this._token;
    if (!this.settings.wsUrl || !this.settings.username || !this.settings.password) return null;
    try {
      const res = await (0, import_obsidian.requestUrl)({ url: this.httpBase() + "/auth", method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: this.settings.username, password: this.settings.password }), throw: false });
      if (res.status === 200 && res.json && res.json.ok && res.json.token) {
        this._token = res.json.token;
        this._tokenExp = Date.now() + 6 * 24 * 3600 * 1e3;
        return this._token;
      }
      if (res.status === 401) new import_obsidian.Notice("\uACF5\uB3D9\uD3B8\uC9D1 \uB85C\uADF8\uC778 \uC2E4\uD328 \u2014 \uC544\uC774\uB514/\uBE44\uBC00\uBC88\uD638 \uD655\uC778");
    } catch (e) {
      console.error("[collab] auth", e);
    }
    return null;
  }
  /* ── 관리(읽기모드·추방) ─────────────────────────────────────────────
     관리자 계정만 남을 읽기모드로 바꾸거나 추방할 수 있다(누가 관리자인지는 relay 가 정한다 — /app/.admins).
     읽기모드: 이 기기가 스스로 편집을 잠근다. 관리자가 풀 때까지 유지되고 재시작해도 유지된다(서버에 남는다).
     추방:    relay 가 ws 를 끊고 일정 시간 재접속을 거부한다. 'room' 이면 그 노트만, 'all' 이면 협업 전체.
     ⚠️ 둘 다 «실시간 협업 + 이 플러그인의 편집잠금」 범위다. 파일동기화(CouchDB 직접)까지 막지는 못한다. */
  modKey(login, deviceId) {
    return `${login || "?"}|${deviceId || "?"}`;
  }
  myModKey() {
    return this.modKey(this.settings.username, this.settings.deviceId);
  }
  async modPost(path, body) {
    const token = await this.getToken();
    if (!token) return null;
    try {
      const res = await (0, import_obsidian.requestUrl)({ url: this.httpBase() + path, method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.assign({ token }, body || {})), throw: false });
      return res.status === 200 && res.json ? res.json : null;
    } catch (e) {
      return null;
    }
  }
  async fetchMod() {
    if (!this.settings.enabled || !this.settings.wsUrl || this.isOffline()) return null;
    const r = await this.modPost("/admin/state", {});
    if (!r || !r.ok) return null;
    this._modAdmin = !!r.admin;
    this.applyMod({ readonly: r.readonly || [], bans: r.bans || {} });
    return r;
  }
  applyMod(m) {
    if (!m) return;
    this._modAll = m;
    const ro = (m.readonly || []).indexOf(this.myModKey()) >= 0;
    if (ro !== !!this._modReadonly) {
      this._modReadonly = ro;
      this.refreshLock();
      if (ro) {
        new import_obsidian.Notice("\u{1F4D6} \uAD00\uB9AC\uC790\uAC00 \uC774 \uAE30\uAE30\uB97C \uC77D\uAE30\uBAA8\uB4DC\uB85C \uBC14\uAFE8\uC2B5\uB2C8\uB2E4", 6e3);
        try {
          new AlertModal(this.app, "\u{1F4D6} \uC77D\uAE30\uBAA8\uB4DC", "\uAD00\uB9AC\uC790\uAC00 \uC774 \uAE30\uAE30\uB97C \uC77D\uAE30\uBAA8\uB4DC\uB85C \uBC14\uAFE8\uC2B5\uB2C8\uB2E4. \uAD00\uB9AC\uC790\uAC00 \uD480\uAE30 \uC804\uAE4C\uC9C0 \uD3B8\uC9D1\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC77D\uAE30\uC640 \uB3D9\uAE30\uD654\uB294 \uADF8\uB300\uB85C \uB429\uB2C8\uB2E4.").open();
        } catch (e) {
        }
      } else new import_obsidian.Notice("\u270F\uFE0F \uC77D\uAE30\uBAA8\uB4DC\uAC00 \uD480\uB838\uC2B5\uB2C8\uB2E4 \u2014 \uD3B8\uC9D1\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4", 5e3);
    }
    if (!(m.bans || {})[this.myModKey()] && this._kickUntil) this.clearKick();
  }
  // ── 관리자가 누르는 것 (relay 가 관리자인지 다시 확인한다 — 여기 통과해도 서버에서 막힌다)
  async adminReadonly(u, on) {
    const r = await this.modPost("/admin/readonly", { login: u.login, deviceId: u.deviceId, label: u.name, on: !!on });
    if (!r || !r.ok) {
      new import_obsidian.Notice("\u274C \uC77D\uAE30\uBAA8\uB4DC \uC124\uC815 \uC2E4\uD328 (\uAD8C\uD55C\xB7\uC5F0\uACB0 \uD655\uC778)", 5e3);
      return false;
    }
    new import_obsidian.Notice(on ? `\u{1F4D6} ${u.name} \uC77D\uAE30\uBAA8\uB4DC` : `\u270F\uFE0F ${u.name} \uC77D\uAE30\uBAA8\uB4DC \uD574\uC81C`, 4e3);
    await this.fetchMod();
    return true;
  }
  async adminKick(u, scope, path) {
    const r = await this.modPost("/admin/kick", { login: u.login, deviceId: u.deviceId, label: u.name, scope, path });
    if (!r || !r.ok) {
      new import_obsidian.Notice("\u274C \uCD94\uBC29 \uC2E4\uD328 (\uAD8C\uD55C\xB7\uC5F0\uACB0 \uD655\uC778)", 5e3);
      return false;
    }
    new import_obsidian.Notice(scope === "room" ? `\u{1F6AA} ${u.name} \u2014 \uC774 \uB178\uD2B8\uC5D0\uC11C \uB0B4\uBCF4\uB0C4` : `\u{1F6AB} ${u.name} \u2014 \uD611\uC5C5 \uC5F0\uACB0 \uCC28\uB2E8`, 5e3);
    await this.fetchMod();
    return true;
  }
  async adminUnkick(u) {
    const r = await this.modPost("/admin/unkick", { login: u.login, deviceId: u.deviceId, label: u.name });
    if (!r || !r.ok) {
      new import_obsidian.Notice("\u274C \uCD94\uBC29 \uD574\uC81C \uC2E4\uD328", 5e3);
      return false;
    }
    new import_obsidian.Notice(`\u2705 ${u.name} \uCD94\uBC29 \uD574\uC81C`, 4e3);
    await this.fetchMod();
    return true;
  }
  onKicked(reason, path) {
    const p = String(reason || "").split(" ");
    const left = Math.min(3600, Math.max(5, parseInt(p[1], 10) || 600));
    const scope = p[2] === "room" ? "room" : "all";
    this._kickUntil = Date.now() + left * 1e3;
    this._kickScope = scope;
    this._kickPath = path ? nfc(path) : null;
    this.endSession();
    if (scope === "all") this.stopPresence();
    try {
      clearTimeout(this._kickTimer);
    } catch (e) {
    }
    this._kickTimer = setTimeout(() => this.clearKick(), left * 1e3 + 500);
    const mins = Math.ceil(left / 60);
    if (!this._kickShown) {
      this._kickShown = true;
      try {
        new AlertModal(this.app, "\u{1F6AB} \uACF5\uB3D9\uD3B8\uC9D1\uC5D0\uC11C \uB0B4\uBCF4\uB0B4\uC84C\uC2B5\uB2C8\uB2E4", scope === "room" ? `\uAD00\uB9AC\uC790\uAC00 \uC774 \uB178\uD2B8\uC758 \uACF5\uB3D9\uD3B8\uC9D1\uC5D0\uC11C \uB0B4\uBCF4\uB0C8\uC2B5\uB2C8\uB2E4. \uC57D ${mins}\uBD84 \uB4A4 \uC790\uB3D9\uC73C\uB85C \uB2E4\uC2DC \uC5F0\uACB0\uB418\uACE0, \uADF8\uB3D9\uC548 \uC774 \uB178\uD2B8\uB294 \uD3B8\uC9D1\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uB178\uD2B8\uB294 \uADF8\uB300\uB85C \uC501\uB2C8\uB2E4.` : `\uAD00\uB9AC\uC790\uAC00 \uACF5\uB3D9\uD3B8\uC9D1 \uC5F0\uACB0\uC744 \uB04A\uC5C8\uC2B5\uB2C8\uB2E4. \uC57D ${mins}\uBD84 \uB4A4 \uC790\uB3D9\uC73C\uB85C \uB2E4\uC2DC \uC5F0\uACB0\uB418\uACE0, \uADF8\uB3D9\uC548 \uD3B8\uC9D1\uC774 \uC7A0\uAE41\uB2C8\uB2E4.`).open();
      } catch (e) {
      }
    }
    this.refreshLock();
  }
  clearKick() {
    if (!this._kickUntil) return;
    this._kickUntil = 0;
    this._kickScope = null;
    this._kickPath = null;
    this._kickShown = false;
    try {
      clearTimeout(this._kickTimer);
    } catch (e) {
    }
    new import_obsidian.Notice("\u2705 \uACF5\uB3D9\uD3B8\uC9D1\uC5D0 \uB2E4\uC2DC \uC5F0\uACB0\uD569\uB2C8\uB2E4", 4e3);
    this.refreshLock();
    this.ensurePresence();
    this.onActiveChange();
  }
  kickActive() {
    if (!this._kickUntil || Date.now() >= this._kickUntil) return false;
    if (this._kickScope === "all") return true;
    const v = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    return !!(v && v.file && nfc(v.file.path) === this._kickPath);
  }
  // ── 커서 안 보이기 — 이 기기 화면에서만 숨긴다(상대 편집은 그대로 되고, 다른 사람 화면에도 그대로 보인다).
  //    y-codemirror 는 awareness.getStates() 로 남의 커서를 그린다 → 그 목록에서만 빼면 된다.
  awarenessFilter(aw) {
    const plugin = this;
    try {
      return new Proxy(aw, { get(t, prop) {
        if (prop === "getStates") return () => {
          const m = t.getStates();
          if (!plugin.hiddenPeers || !plugin.hiddenPeers.size) return m;
          const out = /* @__PURE__ */ new Map();
          for (const [id2, st] of m) {
            const n = st && st.user && st.user.name;
            if (n && plugin.hiddenPeers.has(n)) continue;
            out.set(id2, st);
          }
          return out;
        };
        const v = Reflect.get(t, prop, t);
        return typeof v === "function" ? v.bind(t) : v;
      } });
    } catch (e) {
      return aw;
    }
  }
  toggleHidePeer(name) {
    if (!this.hiddenPeers) this.hiddenPeers = /* @__PURE__ */ new Set();
    if (this.hiddenPeers.has(name)) this.hiddenPeers.delete(name);
    else this.hiddenPeers.add(name);
    this.redrawPeer(name);
    return this.hiddenPeers.has(name);
  }
  redrawPeer(name) {
    try {
      const aw = this.session && this.session.provider && this.session.provider.awareness;
      if (!aw) return;
      const ids = [];
      for (const [id2, st] of aw.getStates()) if (st && st.user && st.user.name === name) ids.push(id2);
      if (ids.length) aw.emit("change", [{ added: [], updated: ids, removed: [] }, "local"]);
    } catch (e) {
    }
  }
  // 연결 인원 = presence(전체 접속자, 모달 목록과 같은 소스). 노트방 awareness 는 유령/재접속 중복이 껴서 부풀려짐.
  peerCount() {
    try {
      return [...this.presence.awareness.getStates().values()].filter((s) => s && s.user && s.user.name).length;
    } catch (e) {
      return 0;
    }
  }
  peerNames() {
    try {
      return [...this.presence.awareness.getStates().values()].map((s) => s.user && s.user.name || "?");
    } catch (e) {
      return [];
    }
  }
  isOffline() {
    const nav = typeof navigator !== "undefined" && "onLine" in navigator ? navigator.onLine : true;
    if (nav === false) return true;
    return this.netOk === false;
  }
  async probeNet() {
    try {
      const p = this.req("GET", encodeURIComponent(this.settings.dbName));
      const r = await Promise.race([p, sleep(5e3).then(() => ({ status: 0 }))]);
      return !!(r && r.status >= 200 && r.status < 500);
    } catch (e) {
      return false;
    }
  }
  async lockWatch() {
    if (this._lockBusy || !this.settings.enabled) return;
    this._lockBusy = true;
    try {
      this.setNet(await this.probeNet());
    } finally {
      this._lockBusy = false;
    }
  }
  // 온라인/오프라인 상태 전환을 한 곳에서 처리한다(cm 유무와 무관하게 알림·잠금 갱신).
  setNet(ok) {
    ok = !!ok;
    const changed = this.netOk !== ok;
    this.netOk = ok;
    if (changed && this.settings.enabled) {
      new import_obsidian.Notice(ok ? "\u{1F310} \uC628\uB77C\uC778 \u2014 \uD3B8\uC9D1 \uAC00\uB2A5" : "\u{1F512} \uC624\uD504\uB77C\uC778 \u2014 \uD3B8\uC9D1\uC774 \uC7A0\uACBC\uC2B5\uB2C8\uB2E4", 4e3);
    }
    this.refreshLock();
    if (changed && ok) {
      this.gatedSync();
      this.checkVersion();
    }
  }
  _isNewer(a, b) {
    const pa = String(a).replace(/^v/, "").split(".").map((n) => parseInt(n) || 0);
    const pb = String(b).replace(/^v/, "").split(".").map((n) => parseInt(n) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const x = pa[i] || 0, y = pb[i] || 0;
      if (x !== y) return x > y;
    }
    return false;
  }
  async checkVersion() {
    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) return;
      const now = Date.now();
      if (this._verChk && now - this._verChk < 10 * 60 * 1e3) return;
      this._verChk = now;
      const rel = await (0, import_obsidian.requestUrl)({ url: `https://api.github.com/repos/${UPDATE_REPO}/releases/latest`, headers: { "Accept": "application/vnd.github+json" }, throw: false });
      if (rel.status !== 200 || !rel.json) return;
      const latest = String(rel.json.tag_name || "").replace(/^v/, "");
      const outdated = !!latest && this._isNewer(latest, this.manifest.version);
      this._latestVer = latest;
      if (outdated !== this._outdated) {
        this._outdated = outdated;
        this.refreshLock();
      }
      if (outdated) {
        if (!this._updModal) this.showUpdateModal();
      } else if (this._updModal) {
        try {
          this._updModal.close();
        } catch (e) {
        }
        this._updModal = null;
      }
    } catch (e) {
    }
  }
  showUpdateModal() {
    try {
      const m = new UpdateModal(this.app, this.manifest.version, this._latestVer || "");
      m.onDismiss = () => {
        this._updModal = null;
      };
      this._updModal = m;
      m.open();
    } catch (e) {
      this._updModal = null;
    }
  }
  refreshLock() {
    const kicked = this.kickActive();
    const lock = this.settings.enabled && (this.isOffline() || this._resetting || this._gating || this._collabConnecting || this._outdated || this._dupName || this._harnessLock || this._modReadonly || kicked);
    if (import_obsidian.Platform.isMobile) this.applyViewLock(lock);
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    const cm = view && view.editor && view.editor.cm;
    if (cm) {
      let cur;
      try {
        cur = !!cm.state.readOnly;
      } catch (e) {
        cur = void 0;
      }
      if (cur !== lock) {
        try {
          cm.dispatch({ effects: this.editLock.reconfigure(lock ? [import_state.EditorState.readOnly.of(true), import_view.EditorView.editable.of(false)] : []) });
        } catch (e) {
        }
      }
    }
    if (lock) this.setCollab(this._resetting ? "\u267B\uFE0F \uC11C\uBC84\uBCF8\uC73C\uB85C \uB2E4\uC2DC \uBC1B\uB294 \uC911\u2026 \uD3B8\uC9D1 \uC7A0\uAE08" : this._modReadonly ? "\u{1F4D6} \uAD00\uB9AC\uC790\uAC00 \uC77D\uAE30\uBAA8\uB4DC\uB85C \uC124\uC815 \u2014 \uD3B8\uC9D1 \uC7A0\uAE08" : kicked ? "\u{1F6AB} \uAD00\uB9AC\uC790\uAC00 \uB0B4\uBCF4\uB0C4 \u2014 " + Math.max(1, Math.ceil((this._kickUntil - Date.now()) / 6e4)) + "\uBD84 \uB0A8\uC74C" : this._dupName ? "\u{1F534} \uAE30\uAE30 \uC774\uB984 \xAB" + this.settings.deviceLabel + "\xBB \uC911\uBCF5 \u2014 \uC774\uB984 \uBC14\uAFD4\uC57C \uD3B8\uC9D1\xB7\uB3D9\uAE30\uD654" : this._outdated ? "\u{1F53A} \uC5C5\uB370\uC774\uD2B8 \uD544\uC694 \u2192 " + (this._latestVer || "") + " \xB7 \uD3B8\uC9D1\uC7A0\uAE08" : this._harnessLock ? "\u{1F916} \uD558\uB124\uC2A4\uAC00 \uC815\uB9AC\uD558\uB294 \uC911\u2026 \uC7A0\uC2DC \uD3B8\uC9D1 \uC7A0\uAE08" : this._collabConnecting && !this.isOffline() && !this._gating ? "\u{1F504} \uB178\uD2B8 \uB3D9\uAE30\uD654 \uC911\u2026 \uD3B8\uC9D1 \uC7A0\uAE08" : "\u{1F512} \uC624\uD504\uB77C\uC778\xB7\uD3B8\uC9D1\uC7A0\uAE08");
    else if (this._lastLock) this.setCollab(this.session && this.session.provider && this.session.provider.wsconnected ? "\uC5F0\uACB0\uB428\xB7" + this.peerCount() : "\uC5F0\uACB0 \uC548\uB428");
    this._lastLock = lock;
    this.updateDisconnectModal();
  }
  // 연결 안됨(오프라인/서버 도달 불가)일 때 «닫을 수 있는» 모달로 시각 표시. 편집 잠금 자체는 refreshLock 이 함(이 모달은 표시용).
  //  _outdated 는 UpdateModal(«BRAT 업데이트»)이 따로 담당, _gating/_harnessLock/_dupName 도 각자 모달이 있어 여기선 제외.
  updateDisconnectModal() {
    const off = this.settings.enabled && this.isOffline() && !this._resetting && !this._gating && !this._harnessLock && !this._dupName && !this._outdated;
    if (off) {
      if (!this._discDismissed && !this._discModal) {
        const m = new DisconnectModal(this.app);
        m.onDismiss = () => {
          this._discModal = null;
          this._discDismissed = true;
        };
        this._discModal = m;
        m.open();
      }
    } else {
      this._discDismissed = false;
      if (this._discModal) {
        const m = this._discModal;
        this._discModal = null;
        m._auto = true;
        try {
          m.close();
        } catch (e) {
        }
      }
    }
  }
  // 열린 마크다운 노트를 읽기 모드(preview)로 강제/복구. 원래 모드는 기억해뒀다가 온라인 되면 되돌린다.
  applyViewLock(lock) {
    try {
      if (!this._savedModes) this._savedModes = /* @__PURE__ */ new Map();
      for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
        const vs = leaf.getViewState();
        if (!vs || vs.type !== "markdown") continue;
        const st = vs.state || {};
        const mode = st.mode;
        if (lock) {
          if (mode !== "preview") {
            this._savedModes.set(leaf, mode || "source");
            leaf.setViewState({ ...vs, state: { ...st, mode: "preview" } });
          }
        } else {
          const saved = this._savedModes.get(leaf);
          if (saved !== void 0 && mode === "preview") {
            leaf.setViewState({ ...vs, state: { ...st, mode: saved } });
            this._savedModes.delete(leaf);
          }
        }
      }
    } catch (e) {
      console.error("[lock] applyViewLock", e);
    }
  }
  // ⭐ 한 기기가 둘로 보이던 것 막기(2026-08-12): 토큰을 기다리는 사이에 또 불리면
  // provider 가 둘 생기고 앞의 것을 아무도 안 닫았다. 그 것은 15초마다 자기 상태를 갱신해 안 사라진다.
  // → 붙는 중이면 그게 끝나길 기다리고(둘 만들지 않는다), 기다리는 사이 stopPresence 가 오면 이번 것은 버린다.
  async ensurePresence() {
    if (!this.settings.enabled || !this.settings.wsUrl) return;
    while (this._presStarting) {
      try {
        await this._presStarting;
      } catch (e) {
      }
    }
    if (this.presence) return;
    const gen = this._presGen | 0;
    const p = (async () => {
      const token = await this.getToken();
      if (!token) return;
      if (this.presence || gen !== (this._presGen | 0)) return;
      if (this._kickUntil && this._kickScope === "all" && Date.now() < this._kickUntil) return;
      const doc2 = new Doc();
      const prov = new WebsocketProvider(this.settings.wsUrl, "__presence__", doc2, { params: { token, v: this.manifest.version, d: this.settings.deviceId } });
      this._presenceDoc = doc2;
      this.presence = prov;
      prov.awareness.setLocalStateField("user", { name: `${this.settings.username}\xB7${this.settings.deviceLabel}`, color: this.userColor, login: this.settings.username, device: this.settings.deviceLabel, deviceId: this.settings.deviceId });
      this.updatePresencePath();
      prov.awareness.on("change", () => this.onPresenceChange());
      const pmeta = doc2.getMap("meta");
      pmeta.observe(() => {
        try {
          this.applyMod(pmeta.get("mod"));
        } catch (e) {
        }
      });
      prov.on("connection-close", (e) => {
        if (e && e.code === 4403) this.onKicked(e.reason, null);
      });
    })();
    this._presStarting = p;
    try {
      await p;
    } finally {
      if (this._presStarting === p) this._presStarting = null;
    }
  }
  myLabel() {
    return `${this.settings.username}\xB7${this.settings.deviceLabel}`;
  }
  updatePresencePath() {
    try {
      if (!this.presence) return;
      const v = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
      this.presence.awareness.setLocalStateField("path", v && v.file ? v.file.path : null);
    } catch (e) {
    }
  }
  peerPath(name) {
    try {
      for (const st of this.presence.awareness.getStates().values()) {
        if (st && st.user && st.user.name === name) return st.path || null;
      }
    } catch (e) {
    }
    return null;
  }
  async followUser(name) {
    this.following = name;
    new import_obsidian.Notice(`\u{1F463} \uB530\uB77C\uAC00\uB294 \uC911: ${name}`);
    await this.jumpToFollowed();
  }
  unfollow() {
    this.following = null;
    new import_obsidian.Notice("\u{1F6B6} \uB530\uB77C\uAC00\uAE30 \uD574\uC81C");
  }
  async jumpToFollowed() {
    if (!this.following) return;
    const p = this.peerPath(this.following);
    if (!p) return;
    const cur = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (cur && cur.file && cur.file.path === p) return;
    const f = this.app.vault.getAbstractFileByPath(p);
    if (f) {
      try {
        await this.app.workspace.getLeaf(false).openFile(f);
      } catch (e) {
      }
    }
  }
  onPresenceChange() {
    if (this.following) this.jumpToFollowed();
    this.checkDupName();
    if (!this._lastLock && !this._dupName) this.setCollab(this.presence && this.presence.wsconnected ? "\uC5F0\uACB0\uB428\xB7" + this.peerCount() : "\uC5F0\uACB0 \uC548\uB428");
  }
  checkDupName() {
    try {
      if (!this.presence) return;
      let dup = false;
      for (const st of this.presence.awareness.getStates().values()) {
        const u = st && st.user;
        if (!u || !u.deviceId) continue;
        if ((u.login || "") === this.settings.username && (u.device || "") === this.settings.deviceLabel && u.deviceId !== this.settings.deviceId && String(this.settings.deviceId || "") > String(u.deviceId)) dup = true;
      }
      if (dup !== this._dupName) {
        this._dupName = dup;
        if (dup) {
          try {
            this.endSession();
          } catch (e) {
          }
          if (!this._dupShown) {
            this._dupShown = true;
            try {
              new DupNameModal(this.app, this.settings.deviceLabel).open();
            } catch (e) {
            }
          }
        } else this._dupShown = false;
        this.refreshLock();
      }
    } catch (e) {
    }
  }
  followScroll(session) {
    try {
      if (!this.following || !session || this.session !== session || !session.cm) return;
      let cur = null;
      for (const st of session.provider.awareness.getStates().values()) {
        if (st && st.user && st.user.name === this.following && st.cursor) {
          cur = st.cursor;
          break;
        }
      }
      if (!cur || !cur.head) return;
      const abs2 = createAbsolutePositionFromRelativePosition(createRelativePositionFromJSON(cur.head), session.ydoc);
      if (!abs2) return;
      const pos = Math.max(0, Math.min(abs2.index, session.cm.state.doc.length));
      session.cm.dispatch({ effects: import_view.EditorView.scrollIntoView(pos, { y: "center" }) });
    } catch (e) {
    }
  }
  stopPresence() {
    this._presGen = (this._presGen | 0) + 1;
    try {
      if (this.presence) this.presence.destroy();
    } catch (e) {
    }
    try {
      if (this._presenceDoc) this._presenceDoc.destroy();
    } catch (e) {
    }
    this.presence = null;
    this._presenceDoc = null;
  }
  dupDeviceName() {
    if (!this.presence) return false;
    const my = `${this.settings.username}\xB7${this.settings.deviceLabel}`;
    return [...this.presence.awareness.getStates().values()].map((s) => s && s.user && s.user.name).filter((n) => n === my).length > 1;
  }
  // 기기 이름 중복 확인: 내 계정(login)은 전부 제외하고, "다른 사용자"가 같은 기기 이름을 쓰는지만 본다.
  // 없으면 사용 가능 → 그 이름으로 재연결(적용).
  deviceOf(u) {
    if (!u) return "";
    if (u.device !== void 0) return u.device;
    const i = (u.name || "").indexOf("\xB7");
    return i >= 0 ? u.name.slice(i + 1) : "";
  }
  async checkAndApplyDevice() {
    if (!this.settings.username || !this.settings.wsUrl) return { ok: false, msg: "\uC544\uC774\uB514\xB7Relay \uC8FC\uC18C\uB97C \uBA3C\uC800 \uC785\uB825\uD558\uC138\uC694" };
    if (!this.settings.deviceLabel) return { ok: false, msg: "\uAE30\uAE30 \uC774\uB984\uC744 \uC785\uB825\uD558\uC138\uC694" };
    await this.ensurePresence();
    if (!this.presence) return { ok: false, msg: "\uC5F0\uACB0 \uC2E4\uD328 \u2014 \uACC4\uC815/\uC8FC\uC18C \uD655\uC778" };
    await sleep(1e3);
    const myDevice = this.settings.deviceLabel, myId = this.settings.deviceId;
    let who = "";
    for (const st of this.presence.awareness.getStates().values()) {
      const u = st && st.user;
      if (!u) continue;
      if ((u.deviceId || "") === myId) continue;
      if (this.deviceOf(u) === myDevice) {
        who = u.name || u.login || "\uB2E4\uB978 \uAE30\uAE30";
        break;
      }
    }
    if (who) return { ok: false, msg: `\u274C \uAE30\uAE30 \uC774\uB984 '${myDevice}' \uB294 \uB2E4\uB978 \uAE30\uAE30(${who})\uAC00 \uC0AC\uC6A9 \uC911\uC785\uB2C8\uB2E4 \u2014 \uB2E4\uB978 \uC774\uB984\uC744 \uC4F0\uC138\uC694` };
    this.stopPresence();
    await this.ensurePresence();
    this.endSession();
    await this.onActiveChange();
    return { ok: true, msg: `\u2705 \uAE30\uAE30 \uC774\uB984 '${myDevice}' \uC0AC\uC6A9 \uAC00\uB2A5 \xB7 \uC801\uC6A9\uB428` };
  }
  // 계정(아이디/비번) 바꾼 뒤 재인증 + 재연결.
  async relogin() {
    if (!this.settings.username || !this.settings.password) return { ok: false, msg: "\uC544\uC774\uB514\xB7\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD558\uC138\uC694" };
    this._token = null;
    this._tokenExp = 0;
    const conn = await this.testConnection();
    const tok = await this.getToken();
    this.stopPresence();
    await this.ensurePresence();
    this.endSession();
    await this.onActiveChange();
    if (!conn.ok) return { ok: false, msg: "\u274C \uC778\uC99D \uC2E4\uD328 \u2014 \uC544\uC774\uB514/\uBE44\uBC00\uBC88\uD638 \uD655\uC778" };
    this.syncCycle(true);
    return { ok: !!tok, msg: tok ? `\u2705 '${this.settings.username}' \uB85C \uB85C\uADF8\uC778\xB7\uC7AC\uC5F0\uACB0\uB428` : "\uD30C\uC77C\uB3D9\uAE30\uD654 OK \xB7 \uD611\uC5C5 \uC2E4\uD328(relay/\uACC4\uC815 \uD655\uC778)" };
  }
  async onActiveChange() {
    if (!this.settings.enabled) return;
    if (this._resetting) {
      this.endSession();
      this._startingPath = null;
      this.refreshLock();
      return;
    }
    if (this._dupName) {
      this.endSession();
      this._startingPath = null;
      this.refreshLock();
      return;
    }
    this.updatePresencePath();
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    const file = view && view.file;
    const path = file ? file.path : null;
    if (this._kickUntil && Date.now() < this._kickUntil && (this._kickScope === "all" || path && nfc(path) === this._kickPath)) {
      this.endSession();
      this._startingPath = null;
      this.refreshLock();
      return;
    }
    if (this.session && this.session.path === path) return;
    if (this._startingPath === path) return;
    this._startingPath = path;
    this.endSession();
    if (!view || !file || !this.settings.wsUrl) {
      this._startingPath = null;
      this.refreshLock();
      return;
    }
    const cm = view.editor && view.editor.cm;
    if (!cm) {
      this._startingPath = null;
      return;
    }
    this.collabPath = nfc(path);
    this._collabConnecting = true;
    this.refreshLock();
    clearTimeout(this._connectTimer);
    this._connectTimer = setTimeout(() => {
      this._collabConnecting = false;
      this.refreshLock();
    }, 6e3);
    try {
      await this.startSession(file, cm);
    } finally {
      this._startingPath = null;
    }
    this.refreshLock();
  }
  async startSession(file, cm) {
    const gen = this._sessGen = (this._sessGen | 0) + 1;
    const token = await this.getToken();
    if (!token) {
      this.setCollab("\uB85C\uADF8\uC778 \uD544\uC694");
      this._collabConnecting = false;
      try {
        clearTimeout(this._connectTimer);
      } catch (e) {
      }
      this.refreshLock();
      return;
    }
    if (gen !== (this._sessGen | 0)) return;
    const path = file.path;
    const ydoc = new Doc();
    const room = "note:" + b64url(path.normalize("NFC"));
    const provider = new WebsocketProvider(this.settings.wsUrl, room, ydoc, { params: { token, v: this.manifest.version, d: this.settings.deviceId } });
    const ytext = ydoc.getText("content");
    const meta = ydoc.getMap("meta");
    const label = `${this.settings.username}\xB7${this.settings.deviceLabel}`;
    provider.awareness.setLocalStateField("user", { name: label, color: this.userColor, colorLight: this.userColor + "40", login: this.settings.username });
    const session = { path, ydoc, provider, ytext, cm, attached: false, saveTimer: null, onSync: null, persist: null };
    this.session = session;
    this.collabPath = nfc(path);
    provider.on("status", (e) => {
      if (this.session === session) {
        this.setCollab(e.status === "connected" ? "\uC5F0\uACB0\uB428" : "\uC5F0\uACB0 \uC911\u2026");
        this.refreshLock();
      }
    });
    provider.awareness.on("change", () => {
      if (this.session === session) {
        this.setCollab("\uC5F0\uACB0\uB428\xB7" + this.peerCount());
        this.followScroll(session);
      }
    });
    provider.on("connection-close", async (e) => {
      if (e && e.code === 4403) return this.onKicked(e.reason, path);
      this._token = null;
      if (this.session === session) this.refreshLock();
    });
    const onSync = async (isSynced) => {
      if (!isSynced || session.attached || this.session !== session) return;
      if (ytext.length === 0) {
        try {
          const content = await this.app.vault.read(file);
          if (this.session !== session) return;
          if (content && ytext.length === 0) ydoc.transact(() => ytext.insert(0, content));
        } catch (e) {
        }
      }
      if (this.session !== session) return;
      session.attached = true;
      this._collabConnecting = false;
      try {
        clearTimeout(this._connectTimer);
      } catch (e) {
      }
      const persist = () => {
        clearTimeout(session.saveTimer);
        session.saveTimer = setTimeout(async () => {
          try {
            if (this.session !== session) return;
            const text2 = ytext.toString();
            let cur = null;
            try {
              cur = session.cm.state.doc.toString();
            } catch (e) {
            }
            if (cur !== null && cur !== text2) return;
            if (text2 === session.lastWritten) return;
            const f = this.app.vault.getAbstractFileByPath(path);
            if (f) {
              this.applying = true;
              try {
                await this.app.vault.modify(f, text2);
                session.lastWritten = text2;
                this.shadow.set(nfc(path), text2);
              } finally {
                this.applying = false;
              }
            }
          } catch (e) {
          }
        }, 700);
      };
      session.persist = persist;
      ytext.observe(persist);
      await this._reconcileAttach(cm, ytext, nfc(path));
      if (this.session !== session) return;
      try {
        cm.dispatch({ effects: this.compartment.reconfigure(yCollab(ytext, this.awarenessFilter(provider.awareness))) });
      } catch (e) {
        console.error("[collab] attach", e);
      }
      this.setCollab("\uC5F0\uACB0\uB428\xB7" + this.peerCount());
      this.refreshLock();
      setTimeout(() => this.followScroll(session), 400);
    };
    session.onSync = onSync;
    provider.on("sync", onSync);
    const onMeta = () => {
      if (this.session !== session) return;
      const locked = !!meta.get("lock");
      if (locked === !!this._harnessLock) return;
      this._harnessLock = locked;
      this.refreshLock();
      if (locked) {
        if (!this._hlModal) {
          try {
            this._hlModal = new HarnessLockModal(this.app);
            this._hlModal.open();
          } catch (e) {
          }
        }
      } else if (this._hlModal) {
        try {
          this._hlModal.allowClose = true;
          this._hlModal.close();
        } catch (e) {
        }
        this._hlModal = null;
      }
    };
    session.meta = meta;
    session.onMeta = onMeta;
    meta.observe(onMeta);
    onMeta();
  }
  endSession() {
    this._sessGen = (this._sessGen | 0) + 1;
    const s = this.session;
    if (!s) return;
    this.session = null;
    this.collabPath = null;
    this._collabConnecting = false;
    try {
      clearTimeout(this._connectTimer);
    } catch (e) {
    }
    try {
      s.cm.dispatch({ effects: this.compartment.reconfigure([]) });
    } catch (e) {
    }
    try {
      clearTimeout(s.saveTimer);
    } catch (e) {
    }
    try {
      if (s.persist) s.ytext.unobserve(s.persist);
    } catch (e) {
    }
    try {
      if (s.onSync) s.provider.off("sync", s.onSync);
    } catch (e) {
    }
    try {
      if (s.onMeta && s.meta) s.meta.unobserve(s.onMeta);
    } catch (e) {
    }
    if (this._harnessLock) this._harnessLock = false;
    if (this._hlModal) {
      try {
        this._hlModal.allowClose = true;
        this._hlModal.close();
      } catch (e) {
      }
      this._hlModal = null;
    }
    try {
      s.provider.destroy();
    } catch (e) {
    }
    try {
      s.ydoc.destroy();
    } catch (e) {
    }
    this.setCollab("\uC5F0\uACB0 \uC548\uB428");
    this.refreshLock();
  }
  async loadSettings() {
    const raw = await this.loadData();
    this._freshInstall = !raw;
    this.settings = Object.assign({}, DEFAULTS, raw);
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var SettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    const s = this.plugin.settings;
    containerEl.createEl("h3", { text: "Vault Sync + Collab" });
    new import_obsidian.Setting(containerEl).setName("\uCF2C").addToggle((t) => t.setValue(!!s.enabled).onChange(async (v) => {
      s.enabled = v;
      await this.plugin.saveSettings();
    }));
    const text2 = (name, desc, key, pw) => new import_obsidian.Setting(containerEl).setName(name).setDesc(desc || "").addText((t) => {
      var _a;
      if (pw) t.inputEl.type = "password";
      t.setValue(String((_a = s[key]) != null ? _a : "")).onChange(async (v) => {
        s[key] = v.trim();
        await this.plugin.saveSettings();
      });
    });
    containerEl.createEl("h4", { text: "\u2460 \uD30C\uC77C \uB3D9\uAE30\uD654 (CouchDB)" });
    text2("CouchDB URL", "\uC608: https://obsidian.enfycius.com", "couchUrl");
    text2("DB \uC774\uB984", "", "dbName");
    text2("\uBB38\uC11C \uC811\uB450\uC5B4", "", "docPrefix");
    containerEl.createEl("h4", { text: "\u2461 \uC2E4\uC2DC\uAC04 \uD611\uC5C5 (relay)" });
    text2("Relay \uC8FC\uC18C", "\uC608: wss://collab.smallws.com", "wsUrl");
    new import_obsidian.Setting(containerEl).setName("\uC624\uD504\uB77C\uC778 \uD3B8\uC9D1 \uC7A0\uAE08").setDesc("\uD56D\uC0C1 \uCF1C\uC9D0 \u2014 \uC11C\uBC84 \uC5F0\uACB0\uC774 \uB04A\uAE30\uBA74 \uD3B8\uC9D1\uC774 \uC790\uB3D9\uC73C\uB85C \uC7A0\uAE41\uB2C8\uB2E4(\uBAA8\uBC14\uC77C=\uC77D\uAE30 \uBAA8\uB4DC). \uC5F0\uACB0\uB418\uBA74 \uC790\uB3D9 \uD574\uC81C.");
    containerEl.createEl("h4", { text: "\uACC4\uC815 (\uB458 \uB2E4 \uACF5\uC6A9)" });
    const loggedIn = !!(this.plugin.session || this.plugin._token && this.plugin._tokenExp > Date.now());
    this._cred = { username: s.username || "", password: s.password || "" };
    new import_obsidian.Setting(containerEl).setName("\uC544\uC774\uB514").setDesc("CouchDB \uACC4\uC815 \u2014 \uC785\uB825 \uD6C4 \uC544\uB798 \u300C\uB85C\uADF8\uC778\u300D\uC744 \uB20C\uB7EC\uC57C \uB85C\uADF8\uC778\uB429\uB2C8\uB2E4").addText((t) => t.setValue(this._cred.username).onChange((v) => {
      this._cred.username = v.trim();
    }));
    new import_obsidian.Setting(containerEl).setName("\uBE44\uBC00\uBC88\uD638").addText((t) => {
      t.inputEl.type = "password";
      t.setValue(this._cred.password).onChange((v) => {
        this._cred.password = v.trim();
      });
    });
    new import_obsidian.Setting(containerEl).setName("\uB85C\uADF8\uC778").setDesc("\uC544\uC774\uB514\xB7\uBE44\uBC00\uBC88\uD638\uB97C \uB123\uC740 \uB4A4 \uC774 \uBC84\uD2BC\uC744 \uB20C\uB7EC\uC57C \uB85C\uADF8\uC778\uB429\uB2C8\uB2E4.").addButton((b) => b.setButtonText("\uB85C\uADF8\uC778").setCta().onClick(async () => {
      if (!this._cred.username || !this._cred.password) {
        new AlertModal(this.app, "\uB85C\uADF8\uC778 \uC815\uBCF4 \uD544\uC694", "\uC544\uC774\uB514\uC640 \uBE44\uBC00\uBC88\uD638\uB97C \uBAA8\uB450 \uC785\uB825\uD55C \uB4A4 \u300C\uB85C\uADF8\uC778\u300D\uC744 \uB204\uB974\uC138\uC694.").open();
        return;
      }
      s.username = this._cred.username;
      s.password = this._cred.password;
      await this.plugin.saveSettings();
      set("\uB85C\uADF8\uC778 \uC911\u2026");
      new import_obsidian.Notice("\uB85C\uADF8\uC778 \uC911\u2026");
      try {
        const r = await this.plugin.relogin();
        set(r.msg, r.ok);
        new import_obsidian.Notice(r.msg);
        if (r.ok) this.display();
      } catch (e) {
        set("\uC624\uB958: " + (e && e.message), false);
        new import_obsidian.Notice("\uB85C\uADF8\uC778 \uC624\uB958: " + (e && e.message));
      }
    }));
    const devSet = new import_obsidian.Setting(containerEl).setName("\uAE30\uAE30 \uC774\uB984").setDesc(loggedIn ? "\uCEE4\uC11C \uAF2C\uB9AC\uD45C (Mac/iPad) \u2014 \uBC14\uAFBC \uB4A4 \u300C\uC911\uBCF5\uD655\uC778\u300D" : "\u{1F512} \uB85C\uADF8\uC778 \uD6C4 \uBCC0\uACBD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4");
    devSet.addText((t) => {
      t.setValue(s.deviceLabel || "");
      t.setDisabled(!loggedIn);
      if (loggedIn) t.onChange(async (v) => {
        s.deviceLabel = v.trim();
        await this.plugin.saveSettings();
      });
    });
    devSet.addButton((b) => {
      b.setButtonText("\uC911\uBCF5\uD655\uC778").setDisabled(!loggedIn).onClick(async () => {
        set("\uAE30\uAE30 \uC774\uB984 \uD655\uC778 \uC911\u2026");
        new import_obsidian.Notice("\uAE30\uAE30 \uC774\uB984 \uD655\uC778 \uC911\u2026");
        try {
          const r = await this.plugin.checkAndApplyDevice();
          set(r.msg, r.ok);
          new import_obsidian.Notice(r.msg);
        } catch (e) {
          set("\uC624\uB958: " + (e && e.message), false);
          new import_obsidian.Notice("\uC911\uBCF5\uD655\uC778 \uC624\uB958: " + (e && e.message));
        }
      });
    });
    new import_obsidian.Setting(containerEl).setName("\uC5C5\uB370\uC774\uD2B8").setDesc("\uC5C5\uB370\uC774\uD2B8\uB294 BRAT \uC73C\uB85C \uD569\uB2C8\uB2E4 \u2014 BRAT \u2192 \xABCheck for updates to all beta plugins\xBB.");
    const line = containerEl.createEl("div", { text: "\uC0C1\uD0DC: \uBBF8\uD655\uC778" });
    line.style.margin = "8px 2px 12px";
    line.style.fontWeight = "600";
    line.style.color = "var(--text-muted)";
    const set = (m, ok) => {
      line.setText(m);
      line.style.color = ok === true ? "var(--text-success)" : ok === false ? "var(--text-error)" : "var(--text-muted)";
    };
    new import_obsidian.Setting(containerEl).setName("\uC5F0\uACB0 \uD655\uC778 & \uB3D9\uAE30\uD654").addButton((b) => b.setButtonText("\uC5F0\uACB0 \uD655\uC778").setCta().onClick(async () => {
      set("\uD655\uC778 \uC911\u2026");
      const r = await this.plugin.testConnection();
      if (!r.ok) return set("\u274C \uD30C\uC77C\uB3D9\uAE30\uD654: " + r.msg, false);
      const tok = await this.plugin.getToken();
      set("\uD30C\uC77C \uBC1B\uB294 \uC911\u2026");
      this.plugin.stopPresence();
      this.plugin.ensurePresence();
      const n = await this.plugin.pullAllFromServer();
      set(`\u2705 \uD30C\uC77C ${n}\uAC1C \uBC18\uC601 \xB7 \uD611\uC5C5 ${tok ? "OK" : "(relay \uC8FC\uC18C/\uACC4\uC815 \uD655\uC778)"}`, !!tok);
    }));
    new import_obsidian.Setting(containerEl).setName("\uCC98\uC74C\uBD80\uD130 \uB2E4\uC2DC \uBC1B\uAE30").setDesc("\u26A0\uFE0F \uC774 \uAE30\uAE30\uC758 \uB85C\uCEEC \uB178\uD2B8(.md)\uB97C \uC804\uBD80 \uC9C0\uC6B0\uACE0 \uC11C\uBC84 \uCD5C\uC2E0\uBCF8\uC73C\uB85C \uD1B5\uC9F8\uB85C \uAC08\uC544\uC5CE\uC2B5\uB2C8\uB2E4.").addButton((b) => b.setButtonText("\uB9AC\uC14B").setWarning().onClick(() => {
      new ConfirmModal(
        this.app,
        "\uCC98\uC74C\uBD80\uD130 \uB2E4\uC2DC \uBC1B\uAE30",
        "\uC774 \uAE30\uAE30\uC758 \uB85C\uCEEC .md \uB178\uD2B8\uB97C \uC804\uBD80 \uC0AD\uC81C\uD558\uACE0 \uC11C\uBC84 \uCD5C\uC2E0\uBCF8\uC73C\uB85C \uB36E\uC5B4\uC501\uB2C8\uB2E4. \uB418\uB3CC\uB9B4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uACC4\uC18D\uD560\uAE4C\uC694?",
        () => this.plugin.hardReset()
      ).open();
    }));
  }
};
var DupNameModal = class extends import_obsidian.Modal {
  constructor(app, name) {
    super(app);
    this.name = name;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "\u{1F534} \uAE30\uAE30 \uC774\uB984 \uC911\uBCF5" });
    contentEl.createEl("p", { text: `\uB2E4\uB978 \uAE30\uAE30\uAC00 \uC774\uBBF8 \xAB${this.name}\xBB \uB77C\uB294 \uC774\uB984\uC744 \uC4F0\uACE0 \uC788\uC2B5\uB2C8\uB2E4. \uAC19\uC740 \uC774\uB984\uC774\uBA74 \uC11C\uB85C \uB36E\uC5B4\uC368 \uC0AC\uACE0\uAC00 \uB098\uBBC0\uB85C, \uC774 \uAE30\uAE30\uC758 \uD3B8\uC9D1\xB7\uB3D9\uAE30\uD654\uB97C \uC7A0\uAC14\uC2B5\uB2C8\uB2E4.` });
    const g = contentEl.createEl("p", { text: "\uC124\uC815 \u2192 (\uB85C\uADF8\uC778 \uD6C4) \uAE30\uAE30 \uC774\uB984\uC744 \xAB\uB2E4\uB978 \uC774\uB984\xBB\uC73C\uB85C \uBC14\uAFB8\uACE0 \u300C\uC911\uBCF5\uD655\uC778\u300D\uC744 \uB204\uB974\uBA74 \uD480\uB9BD\uB2C8\uB2E4. (\uC608: Mac / iPad / LG\uADF8\uB7A8)" });
    g.style.color = "var(--text-muted)";
    const row = contentEl.createDiv();
    row.style.cssText = "display:flex;justify-content:flex-end;margin-top:8px";
    const ok = row.createEl("button", { text: "\uC124\uC815 \uC5F4\uAE30" });
    ok.classList.add("mod-cta");
    ok.onclick = () => {
      this.close();
      try {
        this.app.setting.open();
      } catch (e) {
      }
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};
var UpdateModal = class extends import_obsidian.Modal {
  constructor(app, cur, latest) {
    super(app);
    this.cur = cur;
    this.latest = latest;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "\u{1F53A} \uD50C\uB7EC\uADF8\uC778 \uC5C5\uB370\uC774\uD2B8 \uD544\uC694" });
    contentEl.createEl("p", { text: `\uC124\uCE58\uB428 ${this.cur} \u2192 \uCD5C\uC2E0 ${this.latest}. \uBC84\uC804\uC774 \uB2E4\uB974\uBA74 \uB3D9\uAE30\uD654 \uC0AC\uACE0\uAC00 \uB0A0 \uC218 \uC788\uC5B4 \uD3B8\uC9D1\uC744 \uC7A0\uAC14\uC2B5\uB2C8\uB2E4.` });
    const g = contentEl.createEl("p", { text: "BRAT \u2192 \xABCheck for updates to all beta plugins\xBB \uB97C \uB204\uB974\uBA74 \uADF8 \uC790\uB9AC\uC11C \uBC18\uC601\uB429\uB2C8\uB2E4(Obsidian \uC7AC\uC2DC\uC791 \uC548 \uD574\uB3C4 \uB429\uB2C8\uB2E4). \uC635\uC2DC\uB514\uC5B8\uC744 \uAED0\uB2E4 \uCF1C\uB3C4 BRAT \uC774 \uC2DC\uC791\uD560 \uB54C \uC54C\uC544\uC11C \uC62C\uB824 \uC90D\uB2C8\uB2E4." });
    g.style.color = "var(--text-muted)";
    const row = contentEl.createDiv();
    row.style.cssText = "display:flex;justify-content:flex-end;margin-top:8px";
    const ok = row.createEl("button", { text: "\uD655\uC778" });
    ok.classList.add("mod-cta");
    ok.onclick = () => this.close();
  }
  onClose() {
    this.contentEl.empty();
    try {
      if (this.onDismiss) this.onDismiss();
    } catch (e) {
    }
  }
};
var UpgradeResetModal = class extends import_obsidian.Modal {
  // 업데이트 직후 서버본으로 재기준하는 동안 뜬다(닫기 불가). 끝나면 자동으로 닫힌다.
  constructor(app, from2, to) {
    super(app);
    this.allowClose = false;
    this.from = from2;
    this.to = to;
  }
  onOpen() {
    const { contentEl, containerEl } = this;
    document.body.classList.add("collab-syncgate-open");
    try {
      containerEl.querySelectorAll(".modal-close-button").forEach((x) => x.remove());
    } catch (e) {
    }
    contentEl.createEl("h3", { text: "\u267B\uFE0F \uC5C5\uB370\uC774\uD2B8\uB428 \u2014 \uC11C\uBC84\uBCF8\uC73C\uB85C \uB2E4\uC2DC \uBC1B\uB294 \uC911" });
    contentEl.createEl("p", { text: `\uD50C\uB7EC\uADF8\uC778\uC774 ${this.from || "\uC61B \uBC84\uC804"} \u2192 ${this.to} \uB85C \uC62C\uB77C\uAC14\uC2B5\uB2C8\uB2E4. \uC774 \uAE30\uAE30\uC758 \uB178\uD2B8\uB97C \uC11C\uBC84 \uCD5C\uC2E0\uBCF8\uC73C\uB85C \uB2E4\uC2DC \uAE5D\uB2C8\uB2E4.` });
    const w = contentEl.createEl("p", { text: "\uC11C\uBC84\uC5D0 \uC5C6\uACE0 \uC774 \uAE30\uAE30\uC5D0\uB9CC \uC788\uB358 \uB178\uD2B8\uB294 \uC0AC\uB77C\uC9D1\uB2C8\uB2E4. \uB05D\uB098\uBA74 \uC790\uB3D9\uC73C\uB85C \uB2EB\uD788\uACE0 \uD3B8\uC9D1\xB7\uC2E4\uC2DC\uAC04 \uCC38\uC5EC\uAC00 \uC5F4\uB9BD\uB2C8\uB2E4." });
    w.style.cssText = "color:var(--text-muted);";
  }
  close() {
    if (this.allowClose) super.close();
  }
  // 완료 전엔 Esc·배경클릭·X 로 안 닫힘
  onClose() {
    try {
      document.body.classList.remove("collab-syncgate-open");
    } catch (e) {
    }
    this.contentEl.empty();
  }
};
var SyncGateModal = class extends import_obsidian.Modal {
  constructor(app) {
    super(app);
    this.allowClose = false;
    this.done = 0;
    this.total = 0;
  }
  onOpen() {
    const { contentEl, containerEl } = this;
    document.body.classList.add("collab-syncgate-open");
    try {
      containerEl.querySelectorAll(".modal-close-button").forEach((x) => x.remove());
    } catch (e) {
    }
    contentEl.createEl("h3", { text: "\u{1F504} \uB3D9\uAE30\uD654 \uC911" });
    contentEl.createEl("p", { text: "\uB2E4\uB978 \uAE30\uAE30\uC758 \uBCC0\uACBD\uC0AC\uD56D\uC744 \uBC1B\uC544\uC624\uB294 \uC911\uC785\uB2C8\uB2E4. \uC644\uB8CC\uB418\uBA74 \uC790\uB3D9\uC73C\uB85C \uB2EB\uD788\uACE0 \uD3B8\uC9D1\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." });
    const wrap = contentEl.createDiv();
    wrap.style.cssText = "height:10px;border-radius:5px;background:var(--background-modifier-border);overflow:hidden;margin:12px 0 6px;";
    this.bar = wrap.createDiv();
    this.bar.style.cssText = "height:100%;width:0%;background:var(--interactive-accent);transition:width .2s ease;";
    this.pct = contentEl.createEl("p", { text: "\uC900\uBE44 \uC911\u2026" });
    this.pct.style.cssText = "color:var(--text-muted);text-align:right;margin:0;";
    this.render();
  }
  setProgress(done, total) {
    this.done = done;
    this.total = total;
    this.render();
  }
  render() {
    if (!this.bar) return;
    const p = this.total > 0 ? Math.round(this.done / this.total * 100) : 0;
    this.bar.style.width = p + "%";
    if (this.pct) this.pct.setText(this.total > 0 ? `${p}% (${this.done}/${this.total})` : "\uC900\uBE44 \uC911\u2026");
  }
  close() {
    if (this.allowClose) super.close();
  }
  // 완료 전엔 Esc·배경클릭·X 로 안 닫힘
  onClose() {
    try {
      document.body.classList.remove("collab-syncgate-open");
    } catch (e) {
    }
    this.contentEl.empty();
  }
};
var HarnessLockModal = class extends import_obsidian.Modal {
  // 하네스가 이 노트를 갱신하는 동안 뜬다(닫기 불가). 하네스가 끝내면 자동으로 닫힌다.
  constructor(app) {
    super(app);
    this.allowClose = false;
  }
  onOpen() {
    const { contentEl, containerEl } = this;
    document.body.classList.add("collab-harnesslock-open");
    try {
      containerEl.querySelectorAll(".modal-close-button").forEach((x) => x.remove());
    } catch (e) {
    }
    contentEl.createEl("h3", { text: "\u{1F916} \uD558\uB124\uC2A4\uAC00 \uC815\uB9AC\uD558\uB294 \uC911" });
    contentEl.createEl("p", { text: "\uC774 \uB178\uD2B8\uB97C \uD558\uB124\uC2A4\uAC00 \uAC31\uC2E0\uD558\uB294 \uB3D9\uC548 \uC7A0\uC2DC \uD3B8\uC9D1\uC774 \uC7A0\uAE41\uB2C8\uB2E4. \uACE7 \uC790\uB3D9\uC73C\uB85C \uC5F4\uB9BD\uB2C8\uB2E4. (\uB2E4\uB978 \uB178\uD2B8\uB294 \uADF8\uB300\uB85C \uD3B8\uC9D1\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.)" });
  }
  close() {
    if (this.allowClose) super.close();
  }
  // 하네스가 잠금을 풀 때만 닫힘
  onClose() {
    try {
      document.body.classList.remove("collab-harnesslock-open");
    } catch (e) {
    }
    this.contentEl.empty();
  }
};
var DisconnectModal = class extends import_obsidian.Modal {
  // 연결 안됨 시각 표시(닫기 가능). 편집 잠금은 refreshLock 이 유지.
  constructor(app) {
    super(app);
    this.onDismiss = null;
    this._auto = false;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h3", { text: "\u{1F50C} \uC5F0\uACB0 \uC548\uB428" });
    contentEl.createEl("p", { text: "\uC11C\uBC84\uC5D0 \uC5F0\uACB0\uB418\uC5B4 \uC788\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC778\uD130\uB137 \uC5F0\uACB0\uC744 \uD655\uC778\uD558\uC138\uC694. \uC5F0\uACB0\uC774 \uBCF5\uAD6C\uB418\uBA74 \uD3B8\uC9D1\uC774 \uC790\uB3D9\uC73C\uB85C \uB2E4\uC2DC \uC5F4\uB9BD\uB2C8\uB2E4." });
    const hint = contentEl.createEl("p", { text: "\xB7 \uD3B8\uC9D1\uC740 \uC7A0\uAE41\uB2C8\uB2E4(\uC5F0\uACB0\uB41C \uB4A4 \uD3B8\uC9D1\uD55C \uAC83\uC774 \uB36E\uC774\uB294 \uAC83\uC744 \uB9C9\uAE30 \uC704\uD574\uC11C).\n\xB7 \uACC4\uC18D \uC548 \uB418\uBA74 \uD50C\uB7EC\uADF8\uC778 \uC5C5\uB370\uC774\uD2B8\uAC00 \uD544\uC694\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4 \u2014 BRAT \uB85C \uD655\uC778\uD558\uC138\uC694." });
    hint.style.cssText = "color:var(--text-muted);font-size:.9em;white-space:pre-line;";
    const row = contentEl.createDiv();
    row.style.cssText = "display:flex;justify-content:flex-end;margin-top:10px";
    const ok = row.createEl("button", { text: "\uB2EB\uAE30" });
    ok.classList.add("mod-cta");
    ok.onclick = () => this.close();
  }
  onClose() {
    if (!this._auto && this.onDismiss) {
      try {
        this.onDismiss();
      } catch (e) {
      }
    }
    this.contentEl.empty();
  }
};
var AlertModal = class extends import_obsidian.Modal {
  constructor(app, title, body) {
    super(app);
    this.t = title;
    this.b = body;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: this.t });
    contentEl.createEl("p", { text: this.b });
    const row = contentEl.createDiv({ cls: "modal-button-container" });
    row.style.display = "flex";
    row.style.justifyContent = "flex-end";
    const ok = row.createEl("button", { text: "\uD655\uC778" });
    ok.classList.add("mod-cta");
    ok.onclick = () => this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};
var ConflictLogModal = class extends import_obsidian.Modal {
  constructor(app, text2) {
    super(app);
    this.text = text2 || "";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "\u{1F4DB} \uCDA9\uB3CC \uB85C\uADF8" });
    const lines = this.text.split("\n").filter(Boolean);
    if (!lines.length) {
      contentEl.createEl("p", { text: "\uAE30\uB85D\uB41C \uCDA9\uB3CC\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \u{1F389}" });
      return;
    }
    const info = contentEl.createEl("p", { text: `\uCD5C\uADFC ${Math.min(lines.length, 50)}\uAC74 \uD45C\uC2DC (\uCD1D ${lines.length}\uAC74 \uAE30\uB85D)` });
    info.style.color = "var(--text-muted)";
    const box = contentEl.createDiv();
    box.style.cssText = "max-height:60vh;overflow:auto;";
    for (const ln of lines.slice(-50).reverse()) {
      let r;
      try {
        r = JSON.parse(ln);
      } catch (e) {
        continue;
      }
      const d = box.createDiv();
      d.style.cssText = "border-top:1px solid var(--background-modifier-border);padding:8px 2px;";
      const h = d.createEl("div", { text: `${r.t}  \xB7  ${(r.path || "").split("/").pop()}` });
      h.style.fontWeight = "600";
      const meta = `\uACBD\uB85C: ${r.path}
\uC9C0\uC810: ${r.where} \xB7 collab\uC5F4\uB9BC: ${r.collabOpen} \xB7 \uC11C\uBC84\uC791\uC131\uC790: ${r.serverLastEditor || "(\uC5C6\uC74C)"} \xB7 \uAE30\uAE30: ${r.device}
\uAE38\uC774 base/local/server: ${r.baseLen}/${r.localLen}/${r.serverLen} \xB7 \uB85C\uCEEC\uBCC0\uACBD:${r.localChanged} \uC11C\uBC84\uBCC0\uACBD:${r.serverChanged}
\uCCAB \uBD88\uC77C\uCE58 #${r.firstDiff}
  \uB85C\uCEEC: \u2026${r.aroundLocal}\u2026
  \uC11C\uBC84: \u2026${r.aroundServer}\u2026`;
      const pre = d.createEl("pre", { text: meta });
      pre.style.cssText = "white-space:pre-wrap;margin:4px 0 0;font-size:12px;color:var(--text-muted);";
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};
var ConfirmModal = class extends import_obsidian.Modal {
  constructor(app, title, body, onYes) {
    super(app);
    this.t = title;
    this.b = body;
    this.onYes = onYes;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: this.t });
    contentEl.createEl("p", { text: this.b });
    const row = contentEl.createDiv({ cls: "modal-button-container" });
    row.style.display = "flex";
    row.style.gap = "8px";
    row.style.justifyContent = "flex-end";
    const cancel = row.createEl("button", { text: "\uCDE8\uC18C" });
    cancel.onclick = () => this.close();
    const yes = row.createEl("button", { text: "\uC0AD\uC81C\uD558\uACE0 \uB2E4\uC2DC \uBC1B\uAE30" });
    yes.classList.add("mod-warning");
    yes.onclick = () => {
      this.close();
      this.onYes();
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};
var ParticipantModal = class extends import_obsidian.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "\u{1F465} \uACF5\uB3D9\uD3B8\uC9D1 \uCC38\uC5EC\uC790" });
    const pres = this.plugin.presence;
    const statusEl = contentEl.createEl("div");
    statusEl.style.margin = "4px 0 10px";
    statusEl.style.fontSize = "0.9em";
    const renderStatus = () => {
      const relay = !!(pres && pres.wsconnected);
      const online = this.plugin.netOk !== false;
      statusEl.setText(`${relay ? "\u{1F7E2} \uD611\uC5C5 \uC5F0\uACB0\uB428" : "\u{1F534} \uD611\uC5C5 \uB04A\uAE40"}  \xB7  ${online ? "\u{1F310} \uC11C\uBC84 \uC628\uB77C\uC778" : "\u{1F512} \uC624\uD504\uB77C\uC778(\uD3B8\uC9D1\uC7A0\uAE08)"}`);
    };
    renderStatus();
    this._sh = window.setInterval(renderStatus, 2e3);
    if (!pres) {
      contentEl.createEl("p", { text: "\uC544\uC9C1 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. (\uC124\uC815\uC5D0\uC11C \uACC4\uC815/\uC8FC\uC18C \uD655\uC778 \uD6C4 \xAB\uC5F0\uACB0 \uD655\uC778\xBB)" });
      return;
    }
    const myLabel = this.plugin.myLabel();
    const ul = contentEl.createEl("ul");
    ul.style.listStyle = "none";
    ul.style.paddingLeft = "0";
    const render = () => {
      ul.empty();
      const states = [...pres.awareness.getStates().values()].filter((st) => st && st.user && st.user.name);
      if (!states.length) {
        ul.createEl("li", { text: "(\uC5C6\uC74C)" });
        return;
      }
      const admin = !!this.plugin._modAdmin;
      const mod = this.plugin._modAll || { readonly: [], bans: {} };
      for (const st of states) {
        const u = st.user;
        const name = u.name;
        const mine = name === myLabel;
        const li = ul.createEl("li");
        li.style.display = "flex";
        li.style.flexWrap = "wrap";
        li.style.alignItems = "center";
        li.style.gap = "6px";
        li.style.padding = "5px 0";
        const dot = li.createSpan({ text: "\u25CF" });
        dot.style.color = u.color || "var(--text-muted)";
        const info = li.createDiv();
        info.style.flex = "1";
        info.style.minWidth = "45%";
        const key = this.plugin.modKey(u.login, u.deviceId);
        const ro = (mod.readonly || []).indexOf(key) >= 0;
        const ban = (mod.bans || {})[key];
        const banLeft = ban && ban.until > Date.now() ? Math.max(1, Math.ceil((ban.until - Date.now()) / 6e4)) : 0;
        const hidden = this.plugin.hiddenPeers && this.plugin.hiddenPeers.has(name);
        info.createDiv({ text: name + (mine ? " (\uB098)" : "") + (ro ? " \u{1F4D6}" : "") + (banLeft ? " \u{1F6AB}" : "") + (hidden ? " \u{1F648}" : "") });
        const where = st.path ? st.path.split("/").pop() : "(\uB178\uD2B8 \uC5C6\uC74C)";
        const sub = info.createDiv({ text: "\u{1F4C4} " + where + (ro ? " \xB7 \uC77D\uAE30\uBAA8\uB4DC" : "") + (banLeft ? ` \xB7 \uCD94\uBC29 ${banLeft}\uBD84 \uB0A8\uC74C` : "") });
        sub.style.fontSize = "0.8em";
        sub.style.color = "var(--text-muted)";
        if (mine) continue;
        const following = this.plugin.following === name;
        const btn = li.createEl("button", { text: following ? "\uB530\uB77C\uAC00\uAE30 \uD574\uC81C" : "\uB530\uB77C\uAC00\uAE30" });
        if (following) btn.classList.add("mod-cta");
        btn.onclick = async () => {
          if (this.plugin.following === name) this.plugin.unfollow();
          else await this.plugin.followUser(name);
          render();
        };
        if (!admin) continue;
        const eye = li.createEl("button", { text: hidden ? "\uCEE4\uC11C \uBCF4\uC774\uAE30" : "\uCEE4\uC11C \uC228\uAE30\uAE30" });
        eye.onclick = () => {
          this.plugin.toggleHidePeer(name);
          render();
        };
        const rob = li.createEl("button", { text: ro ? "\uC77D\uAE30\uBAA8\uB4DC \uD574\uC81C" : "\uC77D\uAE30\uBAA8\uB4DC" });
        if (ro) rob.classList.add("mod-cta");
        rob.onclick = async () => {
          rob.disabled = true;
          await this.plugin.adminReadonly(u, !ro);
          render();
        };
        if (banLeft) {
          const un = li.createEl("button", { text: "\uCD94\uBC29 \uD574\uC81C" });
          un.classList.add("mod-cta");
          un.onclick = async () => {
            un.disabled = true;
            await this.plugin.adminUnkick(u);
            render();
          };
        } else {
          const kr = li.createEl("button", { text: "\uC774 \uB178\uD2B8\uC5D0\uC11C \uCD94\uBC29" });
          kr.disabled = !st.path;
          kr.onclick = async () => {
            kr.disabled = true;
            await this.plugin.adminKick(u, "room", st.path);
            render();
          };
          const ka = li.createEl("button", { text: "\uC5F0\uACB0 \uCC28\uB2E8" });
          ka.classList.add("mod-warning");
          ka.onclick = async () => {
            ka.disabled = true;
            await this.plugin.adminKick(u, "all", null);
            render();
          };
        }
      }
    };
    render();
    this._h = () => render();
    pres.awareness.on("change", this._h);
    this.plugin.fetchMod().then(() => render());
  }
  onClose() {
    try {
      if (this._h && this.plugin.presence) this.plugin.presence.awareness.off("change", this._h);
    } catch (e) {
    }
    try {
      if (this._sh) window.clearInterval(this._sh);
    } catch (e) {
    }
    this.contentEl.empty();
  }
};
