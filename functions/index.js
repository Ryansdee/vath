// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Liste des emails autorisés (à synchroniser avec votre .env)
const ALLOWED_EMAILS = [
  'ryan.deschuyteneer@gmail.com',
  // Ajoutez d'autres emails ici
];

/**
 * Vérifie si un email est autorisé en tant qu'admin
 * Callable function - appelée depuis le client
 */
exports.verifyAdminEmail = functions.https.onCall(async (data, context) => {
  const { email } = data;

  if (!email) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email is required'
    );
  }

  // Normaliser l'email
  const normalizedEmail = email.toLowerCase().trim();

  // Vérifier si l'email est dans la liste autorisée
  const isAuthorized = ALLOWED_EMAILS
    .map(e => e.toLowerCase())
    .includes(normalizedEmail);

  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'This email is not authorized'
    );
  }

  // Créer ou mettre à jour le document utilisateur dans Firestore
  const userRef = admin.firestore().collection('adminUsers').doc(normalizedEmail);
  
  await userRef.set({
    email: normalizedEmail,
    role: 'admin',
    lastLogin: admin.firestore.FieldValue.serverTimestamp(),
    authorized: true
  }, { merge: true });

  // Générer un token personnalisé
  const customToken = await admin.auth().createCustomToken(normalizedEmail, {
    admin: true,
    email: normalizedEmail
  });

  return {
    success: true,
    token: customToken,
    email: normalizedEmail,
    message: 'Email verified successfully'
  };
});

/**
 * Vérifie si un utilisateur a les droits admin
 * Utilisé pour validation côté serveur
 */
exports.checkAdminStatus = functions.https.onCall(async (data, context) => {
  // Vérifier l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const email = context.auth.token.email;
  
  if (!email) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'User email not found'
    );
  }

  const isAdmin = ALLOWED_EMAILS
    .map(e => e.toLowerCase())
    .includes(email.toLowerCase());

  return {
    isAdmin,
    email
  };
});

/**
 * Génère un signed URL pour upload sécurisé
 * Permet l'upload direct vers Storage avec expiration
 */
exports.generateUploadUrl = functions.https.onCall(async (data, context) => {
  // Vérifier l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const email = context.auth.token.email;
  
  // Vérifier si admin
  const isAdmin = ALLOWED_EMAILS
    .map(e => e.toLowerCase())
    .includes(email.toLowerCase());

  if (!isAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Admin access required'
    );
  }

  const { portalId, fileName, contentType } = data;

  if (!portalId || !fileName) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'portalId and fileName are required'
    );
  }

  // Créer une référence au fichier
  const bucket = admin.storage().bucket();
  const filePath = `portals/${portalId}/${Date.now()}-${fileName}`;
  const file = bucket.file(filePath);

  // Générer un signed URL pour upload (valide 15 minutes)
  const [signedUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType: contentType || 'application/octet-stream',
  });

  return {
    uploadUrl: signedUrl,
    filePath,
    expiresIn: 900 // secondes
  };
});

/**
 * Webhook pour nettoyer les anciennes sessions admin
 * S'exécute tous les jours à minuit
 */
exports.cleanupOldSessions = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('Europe/Brussels')
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const snapshot = await admin.firestore()
      .collection('adminUsers')
      .where('lastLogin', '<', thirtyDaysAgo)
      .get();

    const batch = admin.firestore().batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    
    console.log(`Cleaned up ${snapshot.size} old admin sessions`);
    return null;
  });