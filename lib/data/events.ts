import { Booking, Event, type IEvent } from "@/database";
import connectToDatabase from "@/lib/mongodb";

/** An event as plain JSON: safe to cache and to pass to client components. */
export type EventData = Omit<IEvent, "createdAt" | "updatedAt"> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

// Lean documents still hold ObjectId and Date instances; a JSON round-trip turns them into strings.
const toPlain = <T>(value: unknown): T => JSON.parse(JSON.stringify(value)) as T;

/** All events, newest first. */
export async function getAllEvents(): Promise<EventData[]> {
  await connectToDatabase();
  const events = await Event.find().sort({ createdAt: -1 }).lean();
  return toPlain<EventData[]>(events);
}

/** A single event by slug, or null if none matches. Database errors are thrown, not hidden. */
export async function getEventBySlug(slug: string): Promise<EventData | null> {
  await connectToDatabase();
  // Slugs are stored trimmed and lowercased.
  const event = await Event.findOne({ slug: slug.trim().toLowerCase() }).lean();
  return event ? toPlain<EventData>(event) : null;
}

/** Other events sharing at least one tag with the given event. */
export async function getSimilarEvents(event: Pick<EventData, "_id" | "tags">): Promise<EventData[]> {
  await connectToDatabase();
  const events = await Event.find({ _id: { $ne: event._id }, tags: { $in: event.tags } }).lean();
  return toPlain<EventData[]>(events);
}

/** Number of bookings for an event. */
export async function getBookingCount(eventId: string): Promise<number> {
  await connectToDatabase();
  return Booking.countDocuments({ eventId });
}
