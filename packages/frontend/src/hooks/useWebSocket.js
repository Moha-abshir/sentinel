import { useState, useEffect, useRef } from 'react';

export const useWebSocket = (url) => {
    const [socket, setSocket] = useState(null);
    const [lastMessage, setLastMessage] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectTimeoutRef = useRef(null);

    const connect = () => {
        try {
            const ws = new WebSocket(url);

            ws.onopen = () => {
                console.log('[WebSocket] Connected');
                setIsConnected(true);
                setSocket(ws);
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                }
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setLastMessage(data);
                } catch (e) {
                    console.error('[WebSocket] Failed to parse message', e);
                }
            };

            ws.onclose = () => {
                console.log('[WebSocket] Disconnected. Reconnecting in 3s...');
                setIsConnected(false);
                setSocket(null);
                reconnectTimeoutRef.current = setTimeout(connect, 3000);
            };

            ws.onerror = (error) => {
                console.error('[WebSocket] Error:', error);
                ws.close();
            };
        } catch (error) {
            console.error('[WebSocket] Connection failed', error);
        }
    };

    useEffect(() => {
        connect();
        return () => {
            if (socket) {
                socket.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [url]);

    return { socket, lastMessage, isConnected };
};
