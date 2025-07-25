import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertOrderSchema, updateOrderStatusSchema, createOrderApiSchema } from "@shared/schema";
import { z } from "zod";

// Webhook configuration
const WEBHOOK_URL = "https://ahas1.app.n8n.cloud/webhook/4a35e868-5be4-4375-909a-2220f06ac5bc";

// Function to trigger webhook for completed orders
async function triggerCompletedOrderWebhook(order: any, restaurantId: string) {
  try {
    const webhookUrl = new URL(WEBHOOK_URL);
    webhookUrl.searchParams.set('restaurant_id', restaurantId);
    webhookUrl.searchParams.set('from_number', order.customerPhone);
    webhookUrl.searchParams.set('order_id', order.id);
    webhookUrl.searchParams.set('status', 'completed');
    webhookUrl.searchParams.set('summary', order.orderSummary);

    console.log(`Triggering webhook for completed order: ${webhookUrl.toString()}`);

    // Make the GET request to the webhook (fire and forget - no response handling needed)
    fetch(webhookUrl.toString(), { method: 'GET' })
      .catch(error => {
        console.error('Webhook request failed (non-blocking):', error.message);
      });

  } catch (error) {
    console.error('Error constructing webhook URL (non-blocking):', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        id: user.id,
        email: user.email,
        restaurantId: user.restaurantId
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get restaurant info for authenticated user
  app.get('/api/restaurant', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user || !user.restaurantId) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      const restaurant = await storage.getRestaurant(user.restaurantId);
      res.json(restaurant);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      res.status(500).json({ message: "Failed to fetch restaurant" });
    }
  });

  // Get orders for authenticated user's restaurant
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user || !user.restaurantId) {
        return res.status(403).json({ message: "No restaurant access" });
      }
      const orders = await storage.getOrdersByRestaurant(user.restaurantId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Get specific order (with restaurant access control)
  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user || !user.restaurantId) {
        return res.status(403).json({ message: "No restaurant access" });
      }
      
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.restaurantId !== user.restaurantId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Update order status (with restaurant access control)
  app.patch('/api/orders/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user || !user.restaurantId) {
        return res.status(403).json({ message: "No restaurant access" });
      }

      // Validate request body
      const result = updateOrderStatusSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: result.error.errors 
        });
      }

      // Check order exists and belongs to user's restaurant
      const existingOrder = await storage.getOrder(req.params.id);
      if (!existingOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (existingOrder.restaurantId !== user.restaurantId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedOrder = await storage.updateOrderStatus(req.params.id, result.data);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Trigger webhook if order status is changed to "completed"
      if (result.data.status === "completed") {
        triggerCompletedOrderWebhook(updatedOrder, user.restaurantId);
      }

      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Public endpoint for external systems to create orders by restaurant ID
  app.post('/api/orders/:restaurantId', async (req, res) => {
    try {
      const { restaurantId } = req.params;
      
      // Validate restaurant exists
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      console.log("Received request body:", JSON.stringify(req.body, null, 2));

      let from_number: string;
      let order_summary: string;

      // Check if it's n8n format first (phone number as key)
      const phoneKeys = Object.keys(req.body).filter(key => key.startsWith('+'));
      
      if (phoneKeys.length > 0 && req.body[phoneKeys[0]]) {
        // n8n format: { "+123...": "order details..." }
        from_number = phoneKeys[0];
        order_summary = req.body[phoneKeys[0]];
        console.log("Using n8n format - Phone:", from_number, "Summary:", order_summary);
      } else if (req.body.from_number && req.body.order_summary) {
        // Standard format: { "from_number": "+123...", "order_summary": "..." }
        const result = createOrderApiSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({ 
            message: "Invalid order data",
            errors: result.error.errors 
          });
        }
        from_number = result.data.from_number;
        order_summary = result.data.order_summary;
        console.log("Using standard format - Phone:", from_number, "Summary:", order_summary);
      } else {
        return res.status(400).json({ 
          message: "Invalid order data - expected phone number and order details",
          received: req.body,
          examples: {
            standard: { "from_number": "+1234567890", "order_summary": "order details" },
            n8n: { "+1234567890": "order details" }
          }
        });
      }

      // Create order with the data structure we need
      const orderData = {
        restaurantId,
        customerPhone: from_number,
        orderSummary: order_summary,
        status: "new" as const,
      };

      const newOrder = await storage.createOrder(orderData);
      res.status(201).json(newOrder);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
