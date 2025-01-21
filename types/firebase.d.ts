declare module 'firebase/storage' {
  import { FirebaseStorage } from '@firebase/storage-types';
  import { FirebaseApp } from 'firebase/app';
  export function getStorage(app?: FirebaseApp): FirebaseStorage;
}