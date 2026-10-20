import Link from "next/link";
import Image from "next/image";
import { EventItem } from "@/lib/constants";

const EventCard = ({ title, image, slug, location, date, time }: EventItem) => {
  return (
    <Link href={`/events/${slug}`} id="event-card">
      <div className="relative h-75 w-full">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="poster"
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <Image src="/icons/pin.svg" alt="location" width={16} height={18} />
        <p>{location}</p>
      </div>

      <p className="title">{title}</p>

      <div className="datetime">
        <div>
          <Image src="/icons/calendar.svg" alt="date" width={14} height={14} className="size-3.5 shrink-0" />
          <p>{date}</p>
        </div>
        <div>
          <Image src="/icons/clock.svg" alt="time" width={14} height={14} className="size-3.5 shrink-0" />
          <p>{time}</p>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
