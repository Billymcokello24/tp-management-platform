"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function updateProfile(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const updates: any = {};

    if (name && name !== user.name) {
      updates.name = name;
    }

    if (phone && phone !== user.phone) {
      updates.phone = phone;
    }

    if (newPassword) {
      if (!currentPassword) {
        return { success: false, error: "Current password is required to set a new password." };
      }

      if (!user.password) {
        // If the user was created without a password (e.g. OAuth), they can't "change" it normally.
        // For our system, let's just allow setting it if they don't have one, or return an error.
        return { success: false, error: "Your account is linked to an external provider. Please contact IT." };
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return { success: false, error: "Incorrect current password." };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updates.password = hashedPassword;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updates,
      });
      return { success: true, message: "Profile updated successfully." };
    }

    return { success: true, message: "No changes detected." };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, error: "An error occurred while updating profile." };
  }
}
