import { useEffect, useRef, useCallback, useState } from "react";
import { queryClient } from "@/lib/queryClient";

type WebSocketMessage = {
  type: "prices" | "trade" | "position_closed";
  data: any;
};

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case "prices":
            queryClient.setQueryData(["/api/market/prices"], message.data);
            break;
          case "trade":
            queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
            queryClient.invalidateQueries({ queryKey: ["/api/portfolio/summary"] });
            queryClient.invalidateQueries({ queryKey: ["/api/portfolio/holdings"] });
            queryClient.invalidateQueries({ queryKey: ["/api/positions"] });
            break;
          case "position_closed":
            queryClient.invalidateQueries({ queryKey: ["/api/positions"] });
            queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
            queryClient.invalidateQueries({ queryKey: ["/api/portfolio/summary"] });
            break;
        }
      } catch (error) {
        console.error("WebSocket message parse error:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      wsRef.current = null;

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected };
}
