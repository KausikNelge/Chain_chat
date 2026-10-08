/// <reference types="vite/client" />

// Web NFC API Type Declarations
interface NDEFRecord {
  recordType: string;
  mediaType?: string;
  id?: string;
  data?: DataView;
  encoding?: string;
  lang?: string;
  toRecords?: () => NDEFRecord[];
}

interface NDEFMessage {
  records: NDEFRecord[];
}

interface NDEFReadingEvent extends Event {
  serialNumber: string;
  message: NDEFMessage;
}

interface NDEFWriteOptions {
  overwrite?: boolean;
  signal?: AbortSignal;
}

interface NDEFMessageInit {
  records: NDEFRecordInit[];
}

interface NDEFRecordInit {
  recordType: string;
  mediaType?: string;
  id?: string;
  data?: string | BufferSource | NDEFMessageInit;
  encoding?: string;
  lang?: string;
}

interface NDEFScanOptions {
  signal?: AbortSignal;
}

declare class NDEFReader {
  constructor();
  scan(options?: NDEFScanOptions): Promise<void>;
  write(message: NDEFMessageInit | string, options?: NDEFWriteOptions): Promise<void>;
  addEventListener(type: "reading", callback: (event: Event) => void): void;
  addEventListener(type: "readingerror", callback: (event: Event) => void): void;
  removeEventListener(type: "reading", callback: (event: Event) => void): void;
  removeEventListener(type: "readingerror", callback: (event: Event) => void): void;
}
