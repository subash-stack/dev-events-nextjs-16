"use client";

import { useState } from "react";
import { createBooking } from "@/lib/actions/booking.actions";

const BookEvent = ({ eventId }: { eventId: string }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ignore repeat clicks while a request is in flight.
    if (pending) return;

    setPending(true);
    setError(null);
    try {
      const result = await createBooking({ eventId, email });
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.message);
      }
    } catch {
      setError("Booking failed. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm">Thank you for signing up!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder="Enter your email address"
              required
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button type="submit" className="button-submit" disabled={pending}>
            {pending ? "Booking..." : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
};
export default BookEvent;
