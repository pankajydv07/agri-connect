// Chatbot configuration constants
export const RECORDING_TIMEOUT = 10000; // 10 seconds
export const VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
export const OPENAI_MODEL = 'openai/gpt-4.1';
export const MAX_SPEECH_LENGTH = 300;

// System prompt for the AI assistant
export const SYSTEM_PROMPT = `You are an AI assistant for AgriConnect, an agricultural marketplace platform that connects farmers directly with buyers. 
Provide helpful, concise information about agricultural products, farming practices, and how to use the AgriConnect platform.

The user's role is {{ROLE}}. Adapt your responses based on whether they are a farmer, buyer, or not logged in.

For farmers, you can help with:
1. Managing products (add, update, delete products in their inventory)
2. Checking orders placed for their products
3. Getting organic farming tips and best practices
4. Obtaining weather forecasts for their region
5. Analyzing harvest yields and suggesting improvements

For buyers, you can help with:
1. Searching for products by keywords, category, or price range
2. Checking product availability and details
3. Placing orders for agricultural products
4. Tracking existing orders
5. Getting information about organic farming and product quality

If a user tries to access functionality not available for their role, kindly explain the limitations. For example:
- Only authenticated farmers can manage products
- Only authenticated buyers can place orders

Keep responses friendly, concise, and under 150 words unless you need to ask follow-up questions.`;

// Function definitions for OpenAI
export const FUNCTION_DEFINITIONS = [
  {
    name: 'addProduct',
    description: 'Add a new agricultural product to the farmer\'s inventory',
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
          type: 'string',
          description: 'The price per unit of the product'
        },
        quantity: {
          type: 'string',
          description: 'The available quantity of the product'
        },
        unit: {
          type: 'string',
          description: 'The unit of measurement (e.g., kg, ton, pieces, etc.)'
        }
      },
      required: ['name', 'description', 'price', 'quantity', 'unit']
    }
  },
  {
    name: 'updateProduct',
    description: 'Update an existing product in the farmer\'s inventory',
    parameters: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'The ID of the product to update'
        },
        name: {
          type: 'string',
          description: 'The updated name of the crop or product'
        },
        description: {
          type: 'string',
          description: 'The updated description of the product'
        },
        price: {
          type: 'string',
          description: 'The updated price per unit of the product'
        },
        quantity: {
          type: 'string',
          description: 'The updated available quantity of the product'
        },
        unit: {
          type: 'string',
          description: 'The updated unit of measurement'
        }
      },
      required: ['productId']
    }
  },
  {
    name: 'deleteProduct',
    description: 'Delete a product from the farmer\'s inventory',
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
    description: 'Get orders placed for the farmer\'s products',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter orders by status (pending, processing, shipped, delivered, cancelled)'
        },
        startDate: {
          type: 'string',
          description: 'Filter orders placed on or after this date (YYYY-MM-DD)'
        },
        endDate: {
          type: 'string',
          description: 'Filter orders placed on or before this date (YYYY-MM-DD)'
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
    description: 'Get weather forecast for a farmer\'s location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The location for the weather forecast'
        },
        days: {
          type: 'integer',
          description: 'Number of days to forecast (1-7)'
        }
      },
      required: ['location']
    }
  },
  {
    name: 'searchProducts',
    description: 'Search for agricultural products based on criteria',
    parameters: {
      type: 'object',
      properties: {
        keywords: {
          type: 'string',
          description: 'Keywords to search for in product names or descriptions'
        },
        category: {
          type: 'string',
          description: 'Product category (e.g., vegetables, fruits, grains, dairy)'
        },
        minPrice: {
          type: 'string',
          description: 'Minimum price range for filtering products'
        },
        maxPrice: {
          type: 'string',
          description: 'Maximum price range for filtering products'
        }
      },
      required: ['keywords']
    }
  },
  {
    name: 'placeOrder',
    description: 'Place an order for agricultural products as a buyer',
    parameters: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'The ID of the product to order'
        },
        quantity: {
          type: 'string',
          description: 'The quantity to order'
        },
        deliveryAddress: {
          type: 'string',
          description: 'The delivery address for the order'
        },
        deliveryDate: {
          type: 'string',
          description: 'The requested delivery date (optional)'
        }
      },
      required: ['productId', 'quantity', 'deliveryAddress']
    }
  },
  {
    name: 'trackOrder',
    description: 'Track the status of an existing order',
    parameters: {
      type: 'object',
      properties: {
        orderId: {
          type: 'string',
          description: 'The ID of the order to track'
        }
      },
      required: ['orderId']
    }
  }
];