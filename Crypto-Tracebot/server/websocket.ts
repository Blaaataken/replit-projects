import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { getMarketPrices } from "./market-data";
import { log } from "./index";

let wss: WebSocketServer | null = null;
let priceUpdateInterval: NodeJS.Timeout | null = null;

export function setupWebSocket(httpServer: Server) {
  wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    log("WebSocket client connected", "ws");

    const prices = getMarketPrices();
    ws.send(JSON.stringify({ type: "prices", data: prices }));

    ws.on("close", () => {
      log("WebSocket client disconnected", "ws");
    });

    ws.on("error", (error) => {
      log(`WebSocket error: ${error.message}`, "ws");
    });
  });

  priceUpdateInterval = setInterval(() => {
    broadcastPrices();
  }, 2000);

  log("WebSocket server started on /ws", "ws");
}

export function broadcastPrices() {
  if (!wss) return;

  const prices = getMarketPrices();
  const message = JSON.stringify({ type: "prices", data: prices });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export function broadcastTradeExecuted(trade: any) {
  if (!wss) return;

  const message = JSON.stringify({ type: "trade", data: trade });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export function broadcastPositionClosed(position: any) {
  if (!wss) return;

  const message = JSON.stringify({ type: "position_closed", data: position });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export function broadcastKillSwitch(data: { active: boolean; reason: string }) {
  if (!wss) return;

  const message = JSON.stringify({ type: "kill_switch", data });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export function broadcastSafetyUpdate(data: { dailyLoss: number; dailyLossPercent: number; killSwitchActive: boolean }) {
  if (!wss) return;

  const message = JSON.stringify({ type: "safety_update", data });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
