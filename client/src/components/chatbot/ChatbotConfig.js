// Chatbot configuration constants
export const RECORDING_TIMEOUT = 10000; // 10 seconds
export const MAX_SPEECH_LENGTH = 300;

// NOTE: the model name and the TTS voice id are chosen server-side now, along
// with the provider credentials. Nothing provider-specific belongs in here.

// System prompt for the AI assistant
export const SYSTEM_PROMPT = `You are an AI assistant for AgriConnect, an agricultural marketplace platform that connects farmers directly with buyers.
Provide helpful, concise information about agricultural products, farming practices, and how to use the AgriConnect platform.

The user's role is {{ROLE}}. Adapt your responses based on whether they are a farmer, buyer, or not logged in.

For farmers, you can help with:
1. Managing products (add, update, delete products in their inventory)
2. Checking orders placed for their products
3. Getting organic farming tips and best practices
4. Obtaining weather forecasts for their region

For buyers, you can help with:
1. Searching for products by crop name or price range
2. Checking product availability and details
3. Placing orders for agricultural products (always confirm with the user before placing)
4. Tracking existing orders

If a user tries to access functionality not available for their role, kindly explain the limitations. For example:
- Only authenticated farmers can manage products
- Only authenticated buyers can place orders

When placing an order, you MUST summarise the crop name, quantity, unit price, total cost, and delivery address, then explicitly ask the user to confirm before proceeding. Never place an order on a single ambiguous utterance.

Keep responses friendly, concise, and under 150 words unless you need to ask follow-up questions.`;

// Function definitions for OpenAI
export const FUNCTION_DEFINITIONS = [
  {
    name: 'addProduct',
    description: "Add a new agricultural product to the farmer's inventory",
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the crop or product'
        },
        description: {
          type: 'string',
          description: 'A detailed description of the product'
        },
        price: {
          type: 'number',
          description: 'The price per unit of the product'
        },
        quantity: {
          type: 'number',
          description: 'The available quantity of the product'
        },
        unit: {
          type: 'string',
          enum: ['kg', 'quintal', 'ton', 'litre', 'dozen', 'piece'],
          description: 'The unit of measurement'
        }
      },
      required: ['name', 'description', 'price', 'quantity', 'unit']
    }
  },
  {
    name: 'updateProduct',
    description: "Update an existing product in the farmer's inventory",
    parameters: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'The ID of the product to update'
        },
        cropName: {
          type: 'string',
          description: 'The updated name of the crop or product'
        },
        description: {
          type: 'string',
          description: 'The updated description of the product'
        },
        price: {
          type: 'number',
          description: 'The updated price per unit of the product'
        },
        quantity: {
          type: 'number',
          description: 'The updated available quantity of the product'
        },
        unit: {
          type: 'string',
          enum: ['kg', 'quintal', 'ton', 'litre', 'dozen', 'piece'],
          description: 'The updated unit of measurement'
        },
        availableUntil: {
          type: 'string',
          description: 'The date until the product is available (ISO 8601)'
        },
        status: {
          type: 'string',
          // Must match the Product model enum exactly — anything else is
          // rejected by the server's validation schema with a 400.
          enum: ['Available', 'Out of Stock', 'Coming Soon'],
          description: 'The updated status of the product'
        }
      },
      required: ['productId']
    }
  },
  {
    name: 'deleteProduct',
    description: "Delete a product from the farmer's inventory",
    parameters: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'The ID of the product to delete'
        },
        confirmDelete: {
          type: 'boolean',
          description: 'Confirmation to delete the product'
        }
      },
      required: ['productId', 'confirmDelete']
    }
  },
  {
    name: 'getFarmerOrders',
    description: "Get orders placed for the farmer's products",
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled'],
          description: 'Filter orders by status'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of orders to return (default 10)'
        }
      }
    }
  },
  {
    name: 'getFarmingTips',
    description: 'Get organic farming tips and best practices',
    parameters: {
      type: 'object',
      properties: {
        cropType: {
          type: 'string',
          description: 'The type of crop for specific farming tips'
        },
        season: {
          type: 'string',
          description: 'The season for which to get farming tips'
        },
        challenge: {
          type: 'string',
          description: 'Specific farming challenge (e.g., pest control, irrigation)'
        }
      }
    }
  },
  {
    name: 'getWeatherForecast',
    description: "Get weather forecast for a location relevant to farming",
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city, district, or region for the weather forecast'
        },
        days: {
          type: 'integer',
          description: 'Number of days to forecast (1-7, default 3)'
        }
      },
      required: ['location']
    }
  },
  {
    name: 'searchProducts',
    description: 'Search for agricultural products by crop name and/or price range',
    parameters: {
      type: 'object',
      properties: {
        keywords: {
          type: 'string',
          description: 'Crop name or substring to search for (maps to cropName filter)'
        },
        minPrice: {
          type: 'number',
          description: 'Minimum price per unit'
        },
        maxPrice: {
          type: 'number',
          description: 'Maximum price per unit'
        },
        location: {
          type: 'string',
          description: 'Filter by farmer location'
        }
      }
    }
  },
  {
    name: 'placeOrder',
    description: 'Place an order for an agricultural product. Always confirm with the user before calling this function.',
    parameters: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'The _id of the product to order (from searchProducts results)'
        },
        quantityOrdered: {
          type: 'number',
          description: 'The quantity to order'
        },
        deliveryAddress: {
          type: 'string',
          description: 'The full delivery address (minimum 10 characters)'
        },
        confirmed: {
          type: 'boolean',
          description: 'Set to true only after the user has explicitly confirmed the order details'
        }
      },
      required: ['productId', 'quantityOrdered', 'deliveryAddress', 'confirmed']
    }
  },
  {
    name: 'trackOrder',
    description: 'Track the status of an existing order by order ID, or list recent orders if no ID is known',
    parameters: {
      type: 'object',
      properties: {
        orderId: {
          type: 'string',
          description: "The _id of the order to track. Omit if the user doesn't know their order ID."
        }
      }
    }
  }
];
