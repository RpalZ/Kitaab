declare module 'firebase/storage' {
  import { FirebaseStorage, StorageReference, UploadResult } from '@firebase/storage-types';
  import { FirebaseApp } from 'firebase/app';

  export function getStorage(app?: FirebaseApp): FirebaseStorage;
  
  export function ref(storage: FirebaseStorage, path?: string): StorageReference;
  
  export function uploadBytes(
    reference: StorageReference,
    data: Blob | Uint8Array | ArrayBuffer | undefined
  ): Promise<UploadResult>;
  
  export function getDownloadURL(reference: StorageReference): Promise<string>;

  export interface UploadTask {
    ref: StorageReference;
  }

  export interface StorageReference {
    fullPath: string;
    bucket: string;
    name: string;
  }

  export function deleteObject(ref: StorageReference): Promise<void>;
}

declare module '@firebase/storage' {
  export interface StorageReference {
    bucket: string;
    fullPath: string;
    name: string;
    parent: StorageReference | null;
    root: StorageReference;
    storage: Storage;
  }

  export interface Storage {
    app: any;
    maxOperationRetryTime: number;
    maxUploadRetryTime: number;
  }
}