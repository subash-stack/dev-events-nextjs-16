import { Suspense } from "react";
import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { getAllEvents } from "@/lib/data/events";
import { cacheLife } from "next/cache";

const EventList = async () => {
  "use cache";
  cacheLife("hours");
  // Query the database directly: fetching our own API fails during `next build`, when no server is running.
  const events = await getAllEvents();
  return (
    <ul className="events">
      {events.map((event) => (
        <li className="list-none" key={event.slug}>
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
