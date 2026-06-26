import { createOAuth2Client } from '../config/google.js';

/**
 * Middleware that ensures the user is authenticated.
 * Attaches a configured OAuth2 client to req.oauth2Client.
 * Automatically refreshes expired access tokens using the refresh token.
 */
export async function requireAuth(req, res, next) {
  if (!req.session || !req.session.tokens) {
    return res.status(401).json({ error: 'Não autenticado. Faça login primeiro.' });
  }

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(req.session.tokens);

  // Check if the access token is expired or about to expire (within 5 minutes)
  const now = Date.now();
  const expiryDate = req.session.tokens.expiry_date || 0;
  const isExpiringSoon = expiryDate - now < 5 * 60 * 1000;

  if (isExpiringSoon && req.session.tokens.refresh_token) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      // Preserve the refresh token (Google may not return it on refresh)
      credentials.refresh_token = credentials.refresh_token || req.session.tokens.refresh_token;
      oauth2Client.setCredentials(credentials);
      req.session.tokens = credentials;
    } catch (err) {
      console.error('Erro ao renovar token de acesso:', err.message);
      // Clear the session since tokens are invalid
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
    }
  }

  req.oauth2Client = oauth2Client;
  next();
}
