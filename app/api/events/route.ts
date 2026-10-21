import { Event } from "@/database";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Reads an array field sent either as repeated keys (tags=a, tags=b)
 * or as a single JSON array string (tags=["a","b"]).
 */
function getStringArray(formData: FormData, key: string): string[] {
  const values = formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string");

  if (values.length === 1 && values[0].trim().startsWith("[")) {
    const parsed: unknown = JSON.parse(values[0]);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  }

  return values;
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const fromData = await req.formData();
    let event: Record<string, unknown>;
    try {
      event = {
        ...Object.fromEntries(fromData.entries()),
        // Array fields: fromEntries would keep only the last value.
        agenda: getStringArray(fromData, "agenda"),
        tags: getStringArray(fromData, "tags"),
      };
    } catch (e) {
      return NextResponse.json(
        {
          message: "Invalid Json Data format",
        },
        { status: 400 },
      );
    }
    const file = fromData.get('image');
    if (!(file instanceof File)) {
      return NextResponse.json({
        message:'Image file is required'
      },{status:400})
    }
    // Validate before reading the file into memory or uploading it.
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: `Image must be one of: ${ALLOWED_IMAGE_TYPES.join(", ")}` },
        { status: 400 },
      );
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { message: `Image must be ${MAX_IMAGE_BYTES / (1024 * 1024)} MB or smaller` },
        { status: 400 },
      );
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: 'image', folder: 'DevEvent' }, (error, result) => {
          if (error || !result) return reject(error ?? new Error('Image upload failed'));
          resolve(result);
        })
        .end(buffer);
    });
    event.image = uploadResult.secure_url;
    const createEvent = await Event.create(event);
    return NextResponse.json(
      {
        message: "Event Created Successfully!",
        data: createEvent,
      },
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json(
      {
        message: "Event Creation Failed",
        error: e instanceof Error ? e.message : "Unknown",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const events = await Event.find().sort({ createdAt: -1 });
    return NextResponse.json(
      {
        message: "Events Fetched Successfully!",
        events,
      },
      { status: 200 },
    );
  } catch (e) {
    return NextResponse.json(
      {
        message: "Event Fetching Failed",
        error: e instanceof Error ? e.message : "Unknown",
      },
      { status: 500 },
    );
  }
}
