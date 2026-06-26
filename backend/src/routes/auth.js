import { Router } from 'express';
import { google } from 'googleapis';
import { createOAuth2Client, getAuthUrl } from '../config/google.js';

const router = Router();

/**
 * GET /api/auth/google
 * Redirects the user to Google's OAuth 2.0 consent screen.
 */
router.get('/google', (req, res) => {
  const oauth2Client = createOAuth2Client();
  const authUrl = getAuthUrl(oauth2Client);
  res.redirect(authUrl);
});

/**
 * GET /api/auth/google/callback
 * Handles the OAuth 2.0 callback from Google.
 * Exchanges the authorization code for tokens and stores them in the session.
 */
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!code) {
    return res.redirect(`${frontendUrl}?error=no_code`);
  }

  try {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch user profile info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    // Store tokens and user info in session
    req.session.tokens = tokens;
    req.session.user = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    };

    // Redirect to frontend with success
    res.redirect(`${frontendUrl}?auth=success`);
  } catch (err) {
    console.error('Erro na autenticação OAuth:', err.message);
    res.redirect(`${frontendUrl}?error=auth_failed`);
  }
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's info.
 */
router.get('/me', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ authenticated: false });
  }

  res.json({
    authenticated: true,
    user: req.session.user,
  });
});

/**
 * POST /api/auth/logout
 * Destroys the session and logs the user out.
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao fazer logout:', err.message);
      return res.status(500).json({ error: 'Erro ao fazer logout.' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout realizado com sucesso.' });
  });
});

export default router;
