import { Event, type IEvent } from "@/database";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// Matches slugs produced by the Event model's slugify(): lowercase alphanumerics separated by single hyphens.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 200;

type EventResponse =
  | { message: string; event: IEvent }
  | { message: string; error?: string };

/** GET /api/events/[slug] — returns a single event by its slug. */
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/events/[slug]">,
): Promise<NextResponse<EventResponse>> {
  try {
    const { slug: rawSlug } = await ctx.params;

    // The schema stores slugs trimmed and lowercased, so normalize the same way before lookup.
    const slug = rawSlug?.trim().toLowerCase();
    if (!slug) {
      return NextResponse.json({ message: "Event slug is required" }, { status: 400 });
    }
    if (slug.length > MAX_SLUG_LENGTH || !SLUG_PATTERN.test(slug)) {
      return NextResponse.json(
        { message: "Invalid event slug: use lowercase letters, numbers and hyphens only" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // lean() returns a plain object, which serializes to JSON without Mongoose internals.
    const event = await Event.findOne({ slug }).lean<IEvent>();
    if (!event) {
      return NextResponse.json({ message: `Event "${slug}" not found` }, { status: 404 });
    }

    return NextResponse.json({ message: "Event Fetched Successfully!", event }, { status: 200 });
  } catch (e) {
    console.error("GET /api/events/[slug] failed:", e);
    return NextResponse.json(
      {
        message: "Event Fetching Failed",
        error: e instanceof Error ? e.message : "Unknown",
      },
      { status: 500 },
    );
  }
}
