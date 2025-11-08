import { onRequest } from 'firebase-functions/v2/https';

// Firebase loads this file twice: once for discovery, once to actually serve
const server = process.env.FUNCTIONS_CONTROL_API
    ? null
    : await import('./run-server.js');

export const ssr = onRequest(
    { region: 'europe-west1', memory: '1GiB', timeoutSeconds: 300 },
    (req, res) => {
      if (!server) {
        res.status(500).send('Server not yet loaded.');
        return;
      }

      const app = server.app();
      app(req, res);
    }
);
