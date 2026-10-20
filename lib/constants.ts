export interface EventItem {
  slug: string;
  image: string;
  title: string;
  location: string;
  date: string;
  time: string;
}

export const events: EventItem[] = [
  {
    slug: "github-universe-2026",
    image: "/images/event1.png",
    title: "GitHub Universe 2026",
    location: "San Francisco, CA",
    date: "October 28, 2026",
    time: "9:00 AM - 5:30 PM",
  },
  {
    slug: "nextjs-conf-2026",
    image: "/images/event2.png",
    title: "Next.js Conf 2026",
    location: "San Francisco, CA",
    date: "November 5, 2026",
    time: "10:00 AM - 6:00 PM",
  },
  {
    slug: "aws-reinvent-2026",
    image: "/images/event3.png",
    title: "AWS re:Invent 2026",
    location: "Las Vegas, NV",
    date: "November 30, 2026",
    time: "8:00 AM - 6:00 PM",
  },
  {
    slug: "ethdenver-2027",
    image: "/images/event4.png",
    title: "ETHDenver 2027 Hackathon",
    location: "Denver, CO",
    date: "February 23, 2027",
    time: "9:00 AM - 9:00 PM",
  },
  {
    slug: "google-io-2027",
    image: "/images/event5.png",
    title: "Google I/O 2027",
    location: "Mountain View, CA",
    date: "May 18, 2027",
    time: "10:00 AM - 5:00 PM",
  },
  {
    slug: "react-summit-2027",
    image: "/images/event6.png",
    title: "React Summit 2027",
    location: "Amsterdam, Netherlands",
    date: "June 11, 2027",
    time: "9:00 AM - 6:00 PM",
  },
];
