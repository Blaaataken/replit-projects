import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product categories
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Digital products
export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  categoryId: uuid("category_id").references(() => categories.id),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  previewImageUrl: varchar("preview_image_url"),
  downloadCount: integer("download_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product files (the actual digital assets)
export const productFiles = pgTable("product_files", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customer orders
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  stripePaymentIntentId: varchar("stripe_payment_intent_id").unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default('pending'), // pending, completed, failed, refunded
  downloadToken: varchar("download_token", { length: 100 }).unique(),
  downloadExpiresAt: timestamp("download_expires_at"),
  downloadCount: integer("download_count").default(0),
  maxDownloads: integer("max_downloads").default(5),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product reviews
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  orders: many(orders),
  reviews: many(reviews),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  files: many(productFiles),
  orders: many(orders),
  reviews: many(reviews),
}));

export const productFilesRelations = relations(productFiles, ({ one }) => ({
  product: one(products, {
    fields: [productFiles.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
  seller: one(users, {
    fields: [orders.sellerId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  customer: one(users, {
    fields: [reviews.customerId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  slug: true,
  downloadCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductFileSchema = createInsertSchema(productFiles).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  downloadToken: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type ProductFile = typeof productFiles.$inferSelect;
export type InsertProductFile = z.infer<typeof insertProductFileSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Extended types with relations
export type ProductWithDetails = Product & {
  seller: User;
  category: Category | null;
  files: ProductFile[];
  reviews: Review[];
  _count: {
    reviews: number;
  };
  averageRating: number;
};

export type OrderWithDetails = Order & {
  customer: User;
  product: Product;
  seller: User;
};
