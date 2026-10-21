"use server";

import { Event, type IEvent } from "@/database";
import connectDB from "@/lib/mongodb";

export const getSimilarEventsBySlug = async (slug: string): Promise<IEvent[]> => {
  try {
    await connectDB();

    // Only the fields needed for the follow-up query.
    const event = await Event.findOne({ slug }).select("_id tags").lean();
    if (!event) return [];

    return await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    }).lean<IEvent[]>();
  } catch (error) {
    console.error("getSimilarEventsBySlug failed:", error);
    return [];
  }
};
