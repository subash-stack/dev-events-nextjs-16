import mongoose, { type Mongoose } from "mongoose";

/**
 * Shape of the cached connection stored on the global object.
 * `conn` holds the resolved connection; `promise` holds an in-flight
 * connection attempt so concurrent callers share a single connect().
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * In development, Next.js hot reloading re-evaluates modules, which would
 * otherwise open a new connection on every change. Storing the cache on
 * `globalThis` lets it survive reloads. `var` is required for global
 * declarations to be attached to `globalThis`.
 */
declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
};

globalThis.mongooseCache = cache;

/**
 * Returns a shared Mongoose connection, creating it on first use.
 * Safe to call from any server component, route handler, or server action.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  if (cache.conn) {
    return cache.conn;
  }

  // Read lazily so importing this module never throws (e.g. during build).
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      // Fail fast instead of queueing model operations while disconnected.
      bufferCommands: false,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    // Clear the failed attempt so the next call can retry.
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}

export default connectToDatabase;
