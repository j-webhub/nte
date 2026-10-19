import { MAX_FILE_BYTES, MAX_BACKUP_BYTES, MAX_MANIFEST_BYTES } from "./config.js?v=20261020-reorganized";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export async function crc32Blob(blob) {
  let crc = 0xffffffff;
  const chunkSize = 1024 * 1024;
  for (let offset = 0; offset < blob.size; offset += chunkSize) {
    const chunk = new Uint8Array(await blob.slice(offset, offset + chunkSize).arrayBuffer());
    for (const byte of chunk) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function u16(view, offset, value) { view.setUint16(offset, value, true); }

export function u32(view, offset, value) { view.setUint32(offset, value >>> 0, true); }

export async function createZip(entries) {
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;
  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const data = entry.data;
    const size = data instanceof Blob ? data.size : data.length;
    const checksum = data instanceof Blob ? await crc32Blob(data) : crc32(data);
    const localHeader = new Uint8Array(30);
    const localView = new DataView(localHeader.buffer);
    u32(localView, 0, 0x04034b50); u16(localView, 4, 20); u16(localView, 6, 0x0800); u16(localView, 8, 0);
    u32(localView, 14, checksum); u32(localView, 18, size); u32(localView, 22, size); u16(localView, 26, name.length);
    localParts.push(localHeader, name, data);
    const centralHeader = new Uint8Array(46);
    const centralView = new DataView(centralHeader.buffer);
    u32(centralView, 0, 0x02014b50);
    u16(centralView, 4, 20);
    u16(centralView, 6, 20);
    u16(centralView, 8, 0x0800);
    u16(centralView, 10, 0);
    u32(centralView, 16, checksum);
    u32(centralView, 20, size);
    u32(centralView, 24, size);
    u16(centralView, 28, name.length);
    u32(centralView, 42, localOffset);
    centralParts.push(centralHeader, name);
    localOffset += localHeader.length + name.length + size;
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  u32(endView, 0, 0x06054b50);
  u16(endView, 8, entries.length);
  u16(endView, 10, entries.length);
  u32(endView, 12, centralSize);
  u32(endView, 16, localOffset);
  return new Blob([...localParts, ...centralParts, end], { type: "application/zip" });
}

export function safeArchivePath(path) {
  return path === "manifest.json" || /^media\/[a-z\d-]+\/[a-z\d-]+\.[a-z\d]{1,8}$/i.test(path);
}

export async function readZip(file) {
  if (file.size > MAX_BACKUP_BYTES + 10 * 1024 * 1024) throw new Error("백업 파일이 500MB를 초과합니다.");
  const tailStart = Math.max(0, file.size - 65557);
  const tail = new Uint8Array(await file.slice(tailStart).arrayBuffer());
  const tailView = new DataView(tail.buffer);
  let eocd = -1;
  for (let offset = Math.max(0, tail.length - 65557); offset <= tail.length - 22; offset++)
    if (tailView.getUint32(offset, true) === 0x06054b50) eocd = offset;
  if (eocd < 0) throw new Error("백업 ZIP 구조가 올바르지 않습니다.");
  const count = tailView.getUint16(eocd + 10, true);
  let offset = tailView.getUint32(eocd + 16, true);
  if (count > 10000) throw new Error("백업 파일이 너무 많은 항목을 포함합니다.");
  const entries = new Map();
  let totalSize = 0;
  for (let index = 0; index < count; index++) {
    const centralHeader = new Uint8Array(await file.slice(offset, offset + 46).arrayBuffer());
    const centralSignature = centralHeader.length === 46
      ? new DataView(centralHeader.buffer).getUint32(0, true)
      : null;
    if (centralSignature !== 0x02014b50)
      throw new Error("백업 파일 목록을 읽지 못했습니다.");
    const view = new DataView(centralHeader.buffer);
    const flags = view.getUint16(8, true);
    const method = view.getUint16(10, true);
    const crc = view.getUint32(16, true);
    const compressedSize = view.getUint32(20, true);
    const size = view.getUint32(24, true);
    const nameLength = view.getUint16(28, true);
    const extraLength = view.getUint16(30, true);
    const commentLength = view.getUint16(32, true);
    const localOffset = view.getUint32(42, true);
    const nameBytes = new Uint8Array(await file.slice(offset + 46, offset + 46 + nameLength).arrayBuffer());
    const name = decoder.decode(nameBytes);
    if (!safeArchivePath(name)) throw new Error("백업에 허용되지 않는 경로가 들어 있습니다.");
    if (entries.has(name)) throw new Error("백업에 중복 파일이 있습니다.");
    if (!(flags & 0x0800) || method !== 0 || compressedSize !== size) throw new Error("지원하지 않는 백업 압축 형식입니다.");
    if (size > MAX_FILE_BYTES && name !== "manifest.json") throw new Error("백업에 100MB를 초과하는 첨부파일이 있습니다.");
    totalSize += size;
    if (totalSize > MAX_BACKUP_BYTES + MAX_MANIFEST_BYTES) throw new Error("백업의 압축 해제 용량이 허용 한도를 초과합니다.");
    const localHeader = new Uint8Array(await file.slice(localOffset, localOffset + 30).arrayBuffer());
    const localSignature = localHeader.length === 30
      ? new DataView(localHeader.buffer).getUint32(0, true)
      : null;
    if (localSignature !== 0x04034b50)
      throw new Error("백업 데이터 구조가 올바르지 않습니다.");
    const localView = new DataView(localHeader.buffer);
    const localNameLength = localView.getUint16(26, true);
    const localExtraLength = localView.getUint16(28, true);
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    if (dataOffset + size > file.size) throw new Error("백업 데이터가 잘렸습니다.");
    const data = file.slice(dataOffset, dataOffset + size);
    if (await crc32Blob(data) !== crc) throw new Error("백업 파일 검증에 실패했습니다: " + name);
    entries.set(name, data);
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}
