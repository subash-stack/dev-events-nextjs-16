import { Schema, model, models, type HydratedDocument, type Model, type Types } from "mongoose";
import Event from "./event.model";

export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingDocument = HydratedDocument<IBooking>;

// Pragmatic email check: one "@", no whitespace, and a dot in the domain.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      // Bookings are usually looked up by event, so index this field.
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      // Store emails lowercased so lookups and comparisons are case-insensitive.
      lowercase: true,
      match: [EMAIL_REGEX, "Please provide a valid email address"],
    },
  },
  { timestamps: true }
);

// Reject bookings for events that don't exist. Skipped when eventId is unchanged
// to avoid an extra query on every update.
BookingSchema.pre("save", async function () {
  if (!this.isModified("eventId")) return;

  const eventExists = await Event.exists({ _id: this.eventId });
  if (!eventExists) {
    throw new Error(`Event with id "${this.eventId.toString()}" does not exist`);
  }
});

// Reuse the compiled model across hot reloads to avoid OverwriteModelError.
const Booking = (models.Booking as Model<IBooking> | undefined) ?? model<IBooking>("Booking", BookingSchema);

export default Booking;
