import { Schema, model, models, type HydratedDocument, type Model } from "mongoose";

export type EventMode = "online" | "offline" | "hybrid";

export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: EventMode;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = HydratedDocument<IEvent>;

// `required` rejects empty strings; `trim` ensures whitespace-only values are caught too.
const requiredString = { type: String, required: true, trim: true } as const;

// `required` alone accepts an empty array, so enforce at least one non-empty item.
const requiredStringArray = {
  type: [String],
  required: true,
  validate: {
    validator: (items: string[]) =>
      items.length > 0 && items.every((item) => item.trim().length > 0),
    message: "{PATH} must contain at least one non-empty value",
  },
};

/** Converts a title into a URL-friendly slug, e.g. "Next.js Conf 2026!" -> "nextjs-conf-2026". */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
}

/** Normalizes any parseable date string to ISO calendar format (YYYY-MM-DD). */
function normalizeDate(value: string): string {
  // Already ISO: validate it is a real calendar date without timezone conversion.
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (isoMatch) {
    const [, y, m, d] = isoMatch.map(Number);
    const parsed = new Date(Date.UTC(y, m - 1, d));
    if (parsed.getUTCFullYear() === y && parsed.getUTCMonth() === m - 1 && parsed.getUTCDate() === d) {
      return value;
    }
    throw new Error(`Invalid event date: "${value}"`);
  }

  // Other formats (e.g. "October 28, 2026") parse as local time, so read local
  // components to avoid toISOString() shifting the day across timezones.
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid event date: "${value}"`);
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
}

/** Converts a single time like "9:00 AM", "9am" or "14:30" to 24-hour "HH:mm". */
function normalizeClockTime(value: string): string {
  const match = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid event time: "${value}"`);
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  const meridiem = match[3]?.toLowerCase();

  if (meridiem) {
    if (hours < 1 || hours > 12) throw new Error(`Invalid event time: "${value}"`);
    hours = (hours % 12) + (meridiem === "pm" ? 12 : 0);
  }
  if (hours > 23 || minutes > 59) {
    throw new Error(`Invalid event time: "${value}"`);
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Normalizes a single time or a range ("9:00 AM - 5:30 PM" -> "09:00 - 17:30"). */
function normalizeTime(value: string): string {
  return value
    .split(/\s*[-–]\s*/)
    .map(normalizeClockTime)
    .join(" - ");
}

const EventSchema = new Schema<IEvent>(
  {
    title: requiredString,
    // Not required in the schema: it is derived from the title in the pre-save hook.
    slug: { type: String, unique: true, lowercase: true, trim: true },
    description: requiredString,
    overview: requiredString,
    image: requiredString,
    venue: requiredString,
    location: requiredString,
    date: requiredString,
    time: requiredString,
    mode: {
      ...requiredString,
      lowercase: true,
      enum: { values: ["online", "offline", "hybrid"], message: "{VALUE} is not a valid event mode" },
    },
    audience: requiredString,
    agenda: requiredStringArray,
    organizer: requiredString,
    tags: requiredStringArray,
  },
  { timestamps: true }
);

// Runs after schema validation, so required fields are guaranteed to be present here.
EventSchema.pre("save", function () {
  // Only regenerate the slug when the title changes, keeping existing URLs stable.
  if (this.isModified("title")) {
    const slug = slugify(this.title);
    if (!slug) {
      throw new Error("Title must contain at least one letter or number to generate a slug");
    }
    this.slug = slug;
  }

  if (this.isModified("date")) {
    this.date = normalizeDate(this.date);
  }

  if (this.isModified("time")) {
    this.time = normalizeTime(this.time);
  }
});

// Reuse the compiled model across hot reloads to avoid OverwriteModelError.
const Event = (models.Event as Model<IEvent> | undefined) ?? model<IEvent>("Event", EventSchema);

export default Event;
