import express from 'express';
import session from 'express-session';
import fetch from 'node-fetch';
import config from './util/configTreePath.js';
import { logger } from './util/logger.js';
import cors from 'cors';
import crypto from 'crypto';

const app = express();

const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080'];

app.use(cors({
  origin: function (origin, callback) {
    logger.info(`CORS request from origin: ${origin}`);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true
}));

app.use(session({
  secret: 'some-random-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // true if using HTTPS
    sameSite: 'lax'
  }
}));

app.use(express.json());

const serverPort = config['server.port'];
const {
  keycloakTokenUrl,
  keycloakAuthorizationServerUrl,
  keycloakClientId,
  keycloakClientSecret,
  redirectUri,
  readyPath
} = config;

logger.info(`Server config loaded:\n${JSON.stringify(config, null, 2)}`);

app.get(readyPath, (req, res) => {
  logger.info('/ready called');
  res.send('READY');
});

app.get('/foo', async (req, res) => {
  logger.info(`/foo called. Session ID: ${req.sessionID}`);
  logger.info(`Access token in session: ${req.session.accessToken ? 'YES' : 'NO'}`);

  const { accessToken } = req.session;

  if (!accessToken) {
    logger.info('No access token found. Returning 401.');
    return res.status(401).send('Not authenticated');
  }

  try {
    logger.info('Calling Keycloak userinfo endpoint...');
    const apiResponse = await fetch('http://sso:28080/realms/master/protocol/openid-connect/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (apiResponse.ok) {
      const data = await apiResponse.json();
      logger.info('Userinfo call successful.');
      return res.status(200).json(data);
    } else {
      logger.warn(`Userinfo call failed with status ${apiResponse.status}`);
      return res.status(403).send('Token invalid or expired');
    }
  } catch (err) {
    logger.error('Error accessing Keycloak userinfo:', err);
    return res.status(500).send('Server error');
  }
});

app.get('/oauth2/init', async (req, res) => {
  const userRedirect = req.query.redirect || '/';
  const state = crypto.randomUUID();

  if (!req.session.oauthStates) {
    req.session.oauthStates = {};
  }

  req.session.oauthStates[state] = userRedirect;
  logger.info(`OAuth init: saving redirect '${userRedirect}' for state '${state}'`);

  const authUrl = `${keycloakAuthorizationServerUrl}?response_type=code&client_id=${encodeURIComponent(keycloakClientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile&state=${state}`;

  logger.info(`Redirecting to Keycloak auth URL: ${authUrl}`);
  res.redirect(authUrl);
});

app.get('/oauth2/callback', async (req, res) => {
  const { code, state } = req.query;
  logger.info(`/oauth2/callback received. Code: ${code}, State: ${state}`);

  if (!code || !state) {
    logger.warn('Missing code or state in callback');
    return res.status(400).send('Missing code or state');
  }

  const redirectTarget = req.session.oauthStates?.[state];
  delete req.session.oauthStates?.[state];

  if (!redirectTarget) {
    logger.warn(`No redirect target found for state '${state}'`);
  } else {
    logger.info(`Found redirect target for state '${state}': ${redirectTarget}`);
  }

  try {
    const tokenResponse = await fetch(keycloakTokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: keycloakClientId,
        client_secret: keycloakClientSecret
      })
    });

    const tokenData = await tokenResponse.json();
    logger.info(`Token response: ${JSON.stringify(tokenData, null, 2)}`);

    if (tokenData.access_token) {
      req.session.accessToken = tokenData.access_token;
      logger.info('Access token stored in session');
      res.redirect(redirectTarget || '/');
    } else {
      logger.warn('Token not received from Keycloak');
      res.status(400).send('Failed to retrieve access token');
    }
  } catch (err) {
    logger.error('Token exchange failed:', err);
    res.status(500).send('Internal error');
  }
});

app.listen(serverPort, () => {
  logger.log(`App listening on port ${serverPort}`);
});

export default app;
