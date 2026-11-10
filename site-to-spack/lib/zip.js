#!/usr/bin/env node
/**
 * Minimal self-contained ZIP reader/writer for Node.js (no external deps).
 *
 * Supports:
 *   - writing a ZIP archive with the STORE (no compression) method
 *   - reading archives whose entries use STORE (0) or DEFLATE (8)
 *
 * Entries are keyed by forward-slash normalized relative paths (no leading
 * slash, no ".."). Directory entries are ignored.
 */
const zlib = require("zlib");

const SIG_LOCAL = 0x04034b50;
const SIG_CENTRAL = 0x02014b50;
const SIG_EOCD = 0x06054b50;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function toUint16(value) {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(value, 0);
  return b;
}

function toUint32(value) {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(value >>> 0, 0);
  return b;
}

/**
 * Write a ZIP archive from { path -> Buffer|string }.
 * @param {Object} files map of normalized relative path to content
 * @returns {Buffer} the archive bytes (STORE method)
 */
function writeZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  const names = Object.keys(files).sort();
  for (const name of names) {
    const data = Buffer.isBuffer(files[name]) ? files[name] : Buffer.from(String(files[name]), "utf8");
    const nameBuf = Buffer.from(name, "utf8");
    const crc = crc32(data);
    const method = 0; // STORE

    const local = Buffer.concat([
      toUint32(SIG_LOCAL),
      toUint16(20), // version needed
      toUint16(0), // flags
      toUint16(method),
      toUint16(0), // mod time
      toUint16(0x21), // mod date (1980-01-01)
      toUint32(crc),
      toUint32(data.length), // compressed size (== size for STORE)
      toUint32(data.length),
      toUint16(nameBuf.length),
      toUint16(0), // extra length
      nameBuf,
    ]);
    localParts.push(local, data);

    const central = Buffer.concat([
      toUint32(SIG_CENTRAL),
      toUint16(20), // version made by
      toUint16(20), // version needed
      toUint16(0), // flags
      toUint16(method),
      toUint16(0),
      toUint16(0x21),
      toUint32(crc),
      toUint32(data.length),
      toUint32(data.length),
      toUint16(nameBuf.length),
      toUint16(0), // extra len
      toUint16(0), // comment len
      toUint16(0), // disk start
      toUint16(0), // internal attrs
      toUint32(0), // external attrs
      toUint32(offset), // local header offset
      nameBuf,
    ]);
    centralParts.push(central);

    offset += local.length + data.length;
  }

  const centralDir = Buffer.concat(centralParts);
  const eocd = Buffer.concat([
    toUint32(SIG_EOCD),
    toUint16(0), // disk number
    toUint16(0), // central dir disk
    toUint16(names.length),
    toUint16(names.length),
    toUint32(centralDir.length),
    toUint32(offset),
    toUint16(0), // comment len
  ]);

  return Buffer.concat([...localParts, centralDir, eocd]);
}

/**
 * Read a ZIP archive into { path -> Buffer }.
 * Supports STORE and DEFLATE entry methods.
 * @param {Buffer} archive
 * @returns {Object} normalized relative path -> Buffer
 */
function readZip(archive) {
  const files = {};
  const entries = readCentralDirectory(archive);
  for (const entry of entries) {
    const name = entry.name;
    if (name.endsWith("/")) continue;
    const data = readLocalEntry(archive, entry);
    files[name] = data;
  }
  return files;
}

function readCentralDirectory(archive) {
  const eocdPos = findEocd(archive);
  if (eocdPos < 0) throw new Error("Not a ZIP archive (no end-of-central-directory)");
  const count = archive.readUInt16LE(eocdPos + 10);
  const cdOffset = archive.readUInt32LE(eocdPos + 16);
  const entries = [];
  let pos = cdOffset;
  for (let i = 0; i < count; i += 1) {
    if (archive.readUInt32LE(pos) !== SIG_CENTRAL) {
      throw new Error("Corrupt ZIP central directory");
    }
    const method = archive.readUInt16LE(pos + 10);
    const compressedSize = archive.readUInt32LE(pos + 20);
    const uncompressedSize = archive.readUInt32LE(pos + 24);
    const nameLen = archive.readUInt16LE(pos + 28);
    const extraLen = archive.readUInt16LE(pos + 30);
    const commentLen = archive.readUInt16LE(pos + 32);
    const localOffset = archive.readUInt32LE(pos + 42);
    const name = archive.subarray(pos + 46, pos + 46 + nameLen).toString("utf8");
    entries.push({
      name, method, compressedSize, uncompressedSize,
      localOffset, extraLen,
    });
    pos += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

function findEocd(archive) {
  const min = archive.length > 65557 ? archive.length - 65557 : 0;
  for (let pos = archive.length - 22; pos >= min; pos -= 1) {
    if (archive.readUInt32LE(pos) === SIG_EOCD) return pos;
  }
  return -1;
}

function readLocalEntry(archive, entry) {
  const pos = entry.localOffset;
  if (archive.readUInt32LE(pos) !== SIG_LOCAL) {
    throw new Error("Corrupt ZIP local header");
  }
  const nameLen = archive.readUInt16LE(pos + 26);
  const extraLen = archive.readUInt16LE(pos + 28);
  const dataStart = pos + 30 + nameLen + extraLen;
  const raw = archive.subarray(dataStart, dataStart + entry.compressedSize);
  if (entry.method === 0) {
    return Buffer.from(raw);
  }
  if (entry.method === 8) {
    return zlib.inflateRawSync(raw);
  }
  throw new Error(`Unsupported ZIP compression method: ${entry.method}`);
}

module.exports = { writeZip, readZip, crc32 };
