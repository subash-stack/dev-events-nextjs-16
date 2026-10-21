import { Suspense } from "react";
import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { IEvent } from "@/database";
import { cacheLife } from "next/cache";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventList = async () => {
  "use cache";
  cacheLife("hours");
  const response = await fetch(`${BASE_URL}/api/events`);
  const { events } = await response.json();
  return (
    <ul className="events">
      {events.map((event: IEvent) => (
        <li className="list-none" key={event.title}>
          <EventCard {...event} />
        </li>
      ))}
    </ul>
  );
};

const Page = () => {
  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can&apos;t Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferences, All in One Place
      </p>
      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        <Suspense fallback={<p>Loading events...</p>}>
          <EventList />
        </Suspense>
      </div>
    </section>
  );
};

export default Page;
