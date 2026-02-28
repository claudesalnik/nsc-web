"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import {
  updateContactPreferences,
  type ContactPreferenceUpdateInput,
} from "@/lib/profile/contact-preferences";

export async function updateContactPreferencesAction(
  input: ContactPreferenceUpdateInput,
) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("UNAUTHORIZED");

  const updated = await updateContactPreferences(session.user.email, input);
  revalidatePath("/profile");

  return { success: true, data: updated } as const;
}
