// PayPal integration using @paypal/paypal-server-sdk
import type { Request, Response } from "express";

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

// Lazy-loaded SDK instances
let PayPalSDK: any = null;
let ordersController: any = null;
let oAuthAuthorizationController: any = null;

async function getPayPalSDK() {
  if (!PayPalSDK) {
    PayPalSDK = await import("@paypal/paypal-server-sdk");
    
    if (!PAYPAL_CLIENT_ID) {
      throw new Error("Missing PAYPAL_CLIENT_ID");
    }
    if (!PAYPAL_CLIENT_SECRET) {
      throw new Error("Missing PAYPAL_CLIENT_SECRET");
    }

    const client = new PayPalSDK.Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: PAYPAL_CLIENT_ID,
        oAuthClientSecret: PAYPAL_CLIENT_SECRET,
      },
      timeout: 0,
      environment: process.env.NODE_ENV === "production"
        ? PayPalSDK.Environment.Production
        : PayPalSDK.Environment.Sandbox,
      logging: {
        logLevel: PayPalSDK.LogLevel.Info,
        logRequest: {
          logBody: true,
        },
        logResponse: {
          logHeaders: true,
        },
      },
    });

    ordersController = new PayPalSDK.OrdersController(client);
    oAuthAuthorizationController = new PayPalSDK.OAuthAuthorizationController(client);
  }
  
  return { PayPalSDK, ordersController, oAuthAuthorizationController };
}

export async function getClientToken() {
  const { oAuthAuthorizationController } = await getPayPalSDK();
  
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const { result } = await oAuthAuthorizationController.requestToken(
    {
      authorization: `Basic ${auth}`,
    },
    { intent: "sdk_init", response_type: "client_token" },
  );

  return result.accessToken;
}

export async function createPaypalOrder(req: Request, res: Response) {
  try {
    const { ordersController } = await getPayPalSDK();
    const { amount, currency, intent } = req.body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res
        .status(400)
        .json({
          error: "Invalid amount. Amount must be a positive number.",
        });
    }

    if (!currency) {
      return res
        .status(400)
        .json({ error: "Invalid currency. Currency is required." });
    }

    if (!intent) {
      return res
        .status(400)
        .json({ error: "Invalid intent. Intent is required." });
    }

    const collect = {
      body: {
        intent: intent,
        purchaseUnits: [
          {
            amount: {
              currencyCode: currency,
              value: amount,
            },
          },
        ],
      },
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } =
          await ordersController.createOrder(collect);

    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
}

export async function capturePaypalOrder(req: Request, res: Response) {
  try {
    const { ordersController } = await getPayPalSDK();
    const { orderID } = req.params;
    const collect = {
      id: orderID,
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } =
          await ordersController.captureOrder(collect);

    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to capture order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
}

export async function loadPaypalDefault(req: Request, res: Response) {
  const clientToken = await getClientToken();
  res.json({
    clientToken,
  });
}

export async function verifyPaypalOrder(orderId: string): Promise<{ verified: boolean; status: string; amount: string | null }> {
  try {
    const { ordersController } = await getPayPalSDK();
    const collect = {
      id: orderId,
    };
    
    const { body } = await ordersController.getOrder(collect);
    const orderData = JSON.parse(String(body));
    
    const status = orderData.status || '';
    const amount = orderData.purchase_units?.[0]?.amount?.value || null;
    
    return {
      verified: status === 'COMPLETED',
      status,
      amount,
    };
  } catch (error) {
    console.error('Failed to verify PayPal order:', error);
    return { verified: false, status: 'ERROR', amount: null };
  }
}
