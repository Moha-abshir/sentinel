const WebSocket = require('ws');

let wss = null;
const clients = new Set();

const setupWebSocket = (server) => {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('[WebSocket] New client connected');
        clients.add(ws);

        ws.on('close', () => {
            console.log('[WebSocket] Client disconnected');
            clients.delete(ws);
        });

        ws.on('error', (err) => {
            console.error('[WebSocket] Error:', err.message);
            clients.delete(ws);
        });
    });

    console.log('[WebSocket] Server initialized');
};

const broadcast = (data) => {
    if (!wss) {
        console.warn('[WebSocket] Warning: broadcast called before server initialized');
        return;
    }

    const payload = JSON.stringify(data);
    let count = 0;
    
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
            count++;
        }
    });
    
    console.log(`[WebSocket] Broadcasted update to ${count} clients`);
};

module.exports = {
    setupWebSocket,
    broadcast
};
