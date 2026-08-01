import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sign } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { flat_no, pin } = await req.json();

    const flatNo = String(flat_no || "").trim().toUpperCase();
    const enteredPin = String(pin || "").trim();

    if (!flatNo || !enteredPin) {
      return NextResponse.json(
        { error: "Flat number and PIN are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin()
      .from("flats")
      .select("*")
      .eq("flat_no", flatNo)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Invalid Flat or PIN" },
        { status: 401 }
      );
    }

    // Common/plain PIN check. Current rollout uses one shared PIN for all flats.
    if (String(data.pin_hash || "").trim() !== enteredPin) {
      return NextResponse.json(
        { error: "Invalid Flat or PIN" },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true });

    res.cookies.set("resident_session", sign(data.flat_no), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 6,
    });

    return res;
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
