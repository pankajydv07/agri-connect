/**
 * Request validation.
 *
 * Previously no endpoint validated its input: controllers destructured
 * `req.body` and handed the result straight to Mongoose, which is how
 * `role: "admin"` at registration and mass-assignment on product update became
 * possible. Every mutating route now declares an explicit schema, and anything
 * not in the schema is stripped rather than forwarded.
 */

const { z } = require('zod');
const { AppError } = require('./errorHandler');

/**
 * Validates and REPLACES `req[source]` with the parsed result, so controllers
 * only ever see allow-listed, correctly typed fields.
 */
const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      }));
      return next(new AppError('Validation failed', 400, details));
    }

    req[source] = result.data;
    return next();
  };

// --- Reusable field primitives ---------------------------------------------

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid id');

const email = z.string().trim().toLowerCase().email('Must be a valid email address');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters');

// Indian mobile numbers, tolerating an optional +91 / 0 prefix.
const phone = z
  .string()
  .trim()
  .regex(/^(\+91[-\s]?)?[0]?[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number');

const positiveNumber = (label) =>
  z.coerce.number({ invalid_type_error: `${label} must be a number` }).positive(`${label} must be greater than zero`);

// --- Schemas ---------------------------------------------------------------

const schemas = {
  register: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email,
    password,
    // Deliberately excludes 'admin': self-service admin signup was an open
    // privilege-escalation path. Admins are promoted out of band.
    role: z.enum(['farmer', 'buyer', 'ngo_buyer']).default('buyer'),
    location: z.string().trim().min(2, 'Please add your location').max(200),
    phone,
  }),

  login: z.object({
    email,
    password: z.string().min(1, 'Password is required'),
  }),

  updateProfile: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    email: email.optional(),
    location: z.string().trim().min(2).max(200).optional(),
    phone: phone.optional(),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: password,
  }),

  createProduct: z.object({
    cropName: z.string().trim().min(2, 'Crop name is required').max(120),
    description: z.string().trim().min(10, 'Please describe the produce').max(2000),
    quantity: positiveNumber('Quantity'),
    unit: z.enum(['kg', 'quintal', 'ton', 'litre', 'dozen', 'piece']),
    price: positiveNumber('Price'),
    availableUntil: z.coerce.date().refine((d) => d.getTime() > Date.now(), {
      message: 'Availability date must be in the future',
    }),
    status: z.enum(['Available', 'Out of Stock', 'Coming Soon']).optional(),
  }),

  // Same shape, all optional — and critically, no `farmer` field, so a farmer
  // can no longer reassign someone else's produce to themselves.
  updateProduct: z
    .object({
      cropName: z.string().trim().min(2).max(120).optional(),
      description: z.string().trim().min(10).max(2000).optional(),
      quantity: z.coerce.number().nonnegative('Quantity cannot be negative').optional(),
      unit: z.enum(['kg', 'quintal', 'ton', 'litre', 'dozen', 'piece']).optional(),
      price: positiveNumber('Price').optional(),
      availableUntil: z.coerce.date().optional(),
      status: z.enum(['Available', 'Out of Stock', 'Coming Soon']).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Provide at least one field to update',
    }),

  updateProductStatus: z.object({
    status: z.enum(['Available', 'Out of Stock', 'Coming Soon']),
  }),

  createOrder: z.object({
    productId: objectId,
    quantityOrdered: positiveNumber('Quantity'),
    deliveryAddress: z.string().trim().min(10, 'Please provide a full delivery address').max(500),
  }),

  updateOrderStatus: z.object({
    status: z.enum(['Pending', 'Confirmed', 'Delivered', 'Cancelled']),
  }),

  cropRecommendation: z.object({
    soil: z.string().trim().min(2, 'Soil type is required').max(100),
    season: z.string().trim().min(2, 'Season is required').max(100),
    location: z.string().trim().min(2, 'Location is required').max(200),
    previousCrops: z.string().trim().max(500).optional(),
    irrigationAvailable: z.string().trim().max(100).optional(),
    landSize: z.coerce.number().positive().optional(),
    soilPh: z.coerce.number().min(0).max(14).optional(),
    farmingExperience: z.string().trim().max(100).optional(),
  }),

  aiChat: z.object({
    messages: z
      .array(
        z.object({
          role: z.enum(['system', 'user', 'assistant', 'tool']),
          content: z.string().max(8000),
          name: z.string().max(120).optional(),
          tool_call_id: z.string().max(120).optional(),
        })
      )
      .min(1, 'At least one message is required')
      .max(40, 'Conversation is too long'),
    // Tool definitions are forwarded to the provider in OpenAI's shape. The
    // schema stays loose because the function parameter JSON Schema is
    // arbitrary by design, but the array is bounded.
    tools: z
      .array(
        z.object({
          type: z.literal('function'),
          function: z.object({
            name: z.string().max(64),
            description: z.string().max(1000).optional(),
            parameters: z.record(z.any()).optional(),
          }),
        })
      )
      .max(20, 'Too many tools')
      .optional(),
    language: z.string().trim().max(10).optional(),
  }),

  speak: z.object({
    message: z.string().trim().min(1, 'Nothing to speak').max(2000),
    language: z.enum(['en-US', 'hi-IN', 'te-IN']).default('en-US'),
  }),

  idParam: z.object({ id: objectId }),

  listQuery: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sort: z.string().trim().max(100).optional(),
    select: z.string().trim().max(200).optional(),
    status: z.enum(['Available', 'Out of Stock', 'Coming Soon']).optional(),
    cropName: z.string().trim().max(120).optional(),
    farmer: objectId.optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    location: z.string().trim().max(200).optional(),
  }),

  orderListQuery: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    status: z.enum(['Pending', 'Confirmed', 'Delivered', 'Cancelled']).optional(),
  }),
};

module.exports = { validate, schemas, z };
