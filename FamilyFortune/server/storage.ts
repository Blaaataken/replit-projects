import {
  users,
  products,
  categories,
  productFiles,
  orders,
  reviews,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type ProductFile,
  type InsertProductFile,
  type Order,
  type InsertOrder,
  type Review,
  type InsertReview,
  type ProductWithDetails,
  type OrderWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count, avg } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Product operations
  getProducts(sellerId?: string): Promise<ProductWithDetails[]>;
  getProduct(id: string): Promise<ProductWithDetails | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // Product file operations
  getProductFiles(productId: string): Promise<ProductFile[]>;
  createProductFile(file: InsertProductFile): Promise<ProductFile>;
  deleteProductFile(id: string): Promise<void>;

  // Order operations
  getOrders(sellerId?: string, customerId?: string): Promise<OrderWithDetails[]>;
  getOrder(id: string): Promise<OrderWithDetails | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order>;

  // Review operations
  getProductReviews(productId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Analytics
  getSalesAnalytics(sellerId: string): Promise<{
    totalRevenue: number;
    totalSales: number;
    productCount: number;
    downloadCount: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Product operations
  async getProducts(sellerId?: string): Promise<ProductWithDetails[]> {
    const query = db
      .select({
        id: products.id,
        sellerId: products.sellerId,
        categoryId: products.categoryId,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        previewImageUrl: products.previewImageUrl,
        downloadCount: products.downloadCount,
        isActive: products.isActive,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        seller: users,
        category: categories,
        reviewCount: count(reviews.id),
        averageRating: avg(reviews.rating),
      })
      .from(products)
      .leftJoin(users, eq(products.sellerId, users.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(reviews, eq(products.id, reviews.productId))
      .groupBy(
        products.id,
        products.sellerId,
        products.categoryId,
        products.name,
        products.slug,
        products.description,
        products.price,
        products.previewImageUrl,
        products.downloadCount,
        products.isActive,
        products.createdAt,
        products.updatedAt,
        users.id,
        users.email,
        users.firstName,
        users.lastName,
        users.profileImageUrl,
        users.stripeCustomerId,
        users.stripeSubscriptionId,
        users.createdAt,
        users.updatedAt,
        categories.id,
        categories.name,
        categories.slug,
        categories.description,
        categories.createdAt
      )
      .orderBy(desc(products.createdAt));

    if (sellerId) {
      query.where(eq(products.sellerId, sellerId));
    }

    const results = await query;

    // Get files and reviews for each product
    const productsWithDetails: ProductWithDetails[] = [];
    for (const result of results) {
      const files = await this.getProductFiles(result.id);
      const productReviews = await this.getProductReviews(result.id);

      productsWithDetails.push({
        ...result,
        files,
        reviews: productReviews,
        _count: {
          reviews: result.reviewCount || 0,
        },
        averageRating: result.averageRating ? Number(result.averageRating) : 0,
      });
    }

    return productsWithDetails;
  }

  async getProduct(id: string): Promise<ProductWithDetails | undefined> {
    const [result] = await db
      .select({
        id: products.id,
        sellerId: products.sellerId,
        categoryId: products.categoryId,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        previewImageUrl: products.previewImageUrl,
        downloadCount: products.downloadCount,
        isActive: products.isActive,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        seller: users,
        category: categories,
      })
      .from(products)
      .leftJoin(users, eq(products.sellerId, users.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id));

    if (!result) return undefined;

    const files = await this.getProductFiles(id);
    const productReviews = await this.getProductReviews(id);
    const [reviewStats] = await db
      .select({
        count: count(reviews.id),
        average: avg(reviews.rating),
      })
      .from(reviews)
      .where(eq(reviews.productId, id));

    return {
      ...result,
      files,
      reviews: productReviews,
      _count: {
        reviews: reviewStats.count || 0,
      },
      averageRating: reviewStats.average ? Number(reviewStats.average) : 0,
    };
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    // Generate slug from name
    const slug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const [newProduct] = await db
      .insert(products)
      .values({
        ...product,
        slug,
      })
      .returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const updateData: any = { ...product, updatedAt: new Date() };
    
    // Update slug if name changed
    if (product.name) {
      updateData.slug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    const [updatedProduct] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Product file operations
  async getProductFiles(productId: string): Promise<ProductFile[]> {
    return await db
      .select()
      .from(productFiles)
      .where(eq(productFiles.productId, productId))
      .orderBy(productFiles.createdAt);
  }

  async createProductFile(file: InsertProductFile): Promise<ProductFile> {
    const [newFile] = await db.insert(productFiles).values(file).returning();
    return newFile;
  }

  async deleteProductFile(id: string): Promise<void> {
    await db.delete(productFiles).where(eq(productFiles.id, id));
  }

  // Order operations
  async getOrders(sellerId?: string, customerId?: string): Promise<OrderWithDetails[]> {
    const query = db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        productId: orders.productId,
        sellerId: orders.sellerId,
        stripePaymentIntentId: orders.stripePaymentIntentId,
        amount: orders.amount,
        status: orders.status,
        downloadToken: orders.downloadToken,
        downloadExpiresAt: orders.downloadExpiresAt,
        downloadCount: orders.downloadCount,
        maxDownloads: orders.maxDownloads,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customer: users,
        product: products,
      })
      .from(orders)
      .leftJoin(users, eq(orders.customerId, users.id))
      .leftJoin(products, eq(orders.productId, products.id))
      .orderBy(desc(orders.createdAt));

    if (sellerId) {
      query.where(eq(orders.sellerId, sellerId));
    } else if (customerId) {
      query.where(eq(orders.customerId, customerId));
    }

    const results = await query;

    return results.map(result => ({
      ...result,
      seller: result.customer, // This will be properly typed
    })) as OrderWithDetails[];
  }

  async getOrder(id: string): Promise<OrderWithDetails | undefined> {
    const [result] = await db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        productId: orders.productId,
        sellerId: orders.sellerId,
        stripePaymentIntentId: orders.stripePaymentIntentId,
        amount: orders.amount,
        status: orders.status,
        downloadToken: orders.downloadToken,
        downloadExpiresAt: orders.downloadExpiresAt,
        downloadCount: orders.downloadCount,
        maxDownloads: orders.maxDownloads,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customer: users,
        product: products,
      })
      .from(orders)
      .leftJoin(users, eq(orders.customerId, users.id))
      .leftJoin(products, eq(orders.productId, products.id))
      .where(eq(orders.id, id));

    if (!result) return undefined;

    // Get seller info
    const seller = await this.getUser(result.sellerId);

    return {
      ...result,
      seller: seller!,
    } as OrderWithDetails;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    // Generate download token
    const downloadToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const downloadExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const [newOrder] = await db
      .insert(orders)
      .values({
        ...order,
        downloadToken,
        downloadExpiresAt,
      })
      .returning();
    return newOrder;
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({
        ...order,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Review operations
  async getProductReviews(productId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  // Analytics
  async getSalesAnalytics(sellerId: string): Promise<{
    totalRevenue: number;
    totalSales: number;
    productCount: number;
    downloadCount: number;
  }> {
    const [revenueResult] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${orders.amount} AS DECIMAL)), 0)`,
        totalSales: count(orders.id),
      })
      .from(orders)
      .where(and(eq(orders.sellerId, sellerId), eq(orders.status, 'completed')));

    const [productResult] = await db
      .select({
        productCount: count(products.id),
        downloadCount: sql<number>`COALESCE(SUM(${products.downloadCount}), 0)`,
      })
      .from(products)
      .where(eq(products.sellerId, sellerId));

    return {
      totalRevenue: Number(revenueResult.totalRevenue) || 0,
      totalSales: revenueResult.totalSales || 0,
      productCount: productResult.productCount || 0,
      downloadCount: Number(productResult.downloadCount) || 0,
    };
  }
}

export const storage = new DatabaseStorage();
