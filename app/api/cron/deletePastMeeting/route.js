/*
import { meetingDeletion } from "@/lib/dbHelper/bookingdeletion.js";

export function deleteion() {
  meetingDeletion();
}*/
import { meetingDeletion } from "@/lib/dbHelper/bookingdeletion";

export async function GET() {
  try {
    const result = await meetingDeletion();
    return new Response(
      JSON.stringify({ status: "success", deletedCount: result.deletedCount }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ status: "error", message: error.message }),
      { status: 500 }
    );
  }
}
