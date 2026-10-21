"use server";

import { mongo } from "mongoose";
import { updateTag } from "next/cache";
import Booking from "@/database/booking.model";
import { eventCacheTag } from "@/lib/cache-tags";
import connectDB from "@/lib/mongodb";

type CreateBookingResult = { success: true } | { success: false; message: string };

// MongoDB's error code for a unique index violation.
const DUPLICATE_KEY_ERROR = 11000;

export const createBooking = async ({
  eventId,
  email,
}: {
  eventId: string;
  email: string;
}): Promise<CreateBookingResult> => {
  try {
    await connectDB();

    await Booking.create({ eventId, email });

    // Expire the cached event page so the new booking count shows immediately.
    updateTag(eventCacheTag(eventId));

    return { success: true };
  } catch (e) {
    if (e instanceof mongo.MongoServerError && e.code === DUPLICATE_KEY_ERROR) {
      return { success: false, message: "You have already booked this event with this email." };
    }
    console.error("create booking failed", e);
    return { success: false, message: "Booking failed. Please try again." };
  }
};
