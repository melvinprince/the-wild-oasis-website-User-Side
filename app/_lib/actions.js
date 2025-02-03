"use server";

import { auth, signIn, signOut } from "@/app/_lib/auth";
import { getBookings } from "@/app/_lib/data-service";
import { supabase } from "@/app/_lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function updateGuest(formData) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  const [countryName, countryFlag] = formData.get("nationality").split("%");
  const nationalID = formData.get("nationalID");

  const nationalIdRegex = /^[a-zA-Z0-9]{6,18}$/;
  if (!nationalIdRegex.test(nationalID)) throw new Error("Invalid national ID");

  const updateData = {
    nationality: countryName,
    nationalID,
    countryFlag,
  };

  const { data, error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId);

  if (error) {
    console.error(error);
    throw new Error("Guest could not be updated");
  }
  revalidatePath("/account/profile");
}

export async function deleteReservation(bookingId) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  const guestBookings = await getBookings(session.user.guestId);
  const getBookingsId = guestBookings.map((booking) => booking.id);
  if (!getBookingsId.includes(bookingId)) throw new Error("Not authorized");

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) {
    throw new Error("Booking could not be deleted");
  }
  revalidatePath("/account/reservations");
}

export async function updateReservation(formData) {
  const bookingId = Number(formData.get("bookingId"));
  const updatedFields = {
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 500),
  };

  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  const guestBookings = await getBookings(session.user.guestId);
  const getBookingsId = guestBookings.map((booking) => booking.id);
  if (!getBookingsId.includes(bookingId)) throw new Error("Not authorized");

  const { error } = await supabase
    .from("bookings")
    .update(updatedFields)
    .eq("id", bookingId);

  if (error) {
    throw new Error("Booking could not be updated");
  }
  revalidatePath("/account/reservations");
  revalidatePath(`/account/reservations/${bookingId}`);
  redirect("/account/reservations");
}

export async function createBooking(bookingData, formData) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 500),
    extraPrice: 0,
    totalPrice: bookingData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };

  const { error } = await supabase.from("bookings").insert([newBooking]);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be created");
  }
  revalidatePath(`/cabons/${bookingData.cabinId}`);
  redirect("/cabins/thankyou");
}

export async function markBookingAsPaid(bookingId) {
  // Ensure bookingId is a number
  bookingId = Number(bookingId);
  if (!bookingId) throw new Error("Invalid booking ID");

  // Authenticate user
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  // Get user's bookings
  const guestBookings = await getBookings(session.user.guestId);
  const userBookingIds = guestBookings.map((booking) => booking.id);

  // Check if the user owns this booking
  if (!userBookingIds.includes(bookingId)) throw new Error("Not authorized");

  // Update the isPaid column
  const { error } = await supabase
    .from("bookings")
    .update({ isPaid: true })
    .eq("id", bookingId);

  if (error) {
    throw new Error("Payment status could not be updated");
  }

  // Revalidate necessary paths
  revalidatePath("/account/reservations");
  revalidatePath(`/account/reservations/${bookingId}`);
}
