// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`,    
  });

  admin.firestore().settings({
    ignoreUndefinedProperties: true,
  });
}


export const bucket = admin.storage().bucket();
export const adminDb = admin.firestore();
