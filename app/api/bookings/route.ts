import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { eventId, tickets } = body;

    // Validate payload
    if (!eventId || !tickets || tickets <= 0 || !Number.isInteger(tickets)) {
      return NextResponse.json(
        { error: "Invalid request: eventId and tickets (positive integer) required" },
        { status: 400 }
      );
    }

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to book tickets" },
        { status: 401 }
      );
    }

    // Call the atomic booking RPC
    const { data, error } = await supabase.rpc("create_booking_atomic", {
      p_event_id: eventId,
      p_user_id: user.id,
      p_tickets: tickets,
    });

    if (error) {
      console.error("Booking RPC error:", error);

      // Map common error messages to client-friendly responses
      if (error.message.includes("Event not found")) {
        return NextResponse.json(
          { error: "Event not found" },
          { status: 404 }
        );
      }

      if (error.message.includes("Not enough seats")) {
        return NextResponse.json(
          { error: "Not enough seats available. Please reduce the number of tickets." },
          { status: 400 }
        );
      }

      if (error.message.includes("Event capacity not set")) {
        return NextResponse.json(
          { error: "Event capacity is not configured" },
          { status: 400 }
        );
      }

      // Generic error
      return NextResponse.json(
        { error: "Booking failed. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking confirmed",
        data: {
          booking_id: data?.[0]?.booking_id,
          remaining: data?.[0]?.remaining,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Booking endpoint error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
