"use server";

import { auth, signIn, signOut } from "@/app/_lib/auth";
import { supabase } from "@/app/_lib/supabase";

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
  return data;
}
