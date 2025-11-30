/**
 * Migration script to set lastLogin = createdAt for existing users
 * Run this once to populate lastLogin for users who don't have it set
 *
 * Usage: node Users/migrate-lastLogin.js
 */

import "dotenv/config";
import mongoose from "mongoose";
import userSchema from "./schema.js";

const CONNECTION_STRING =
  process.env.DATABASE_CONNECTION_STRING || "mongodb://127.0.0.1:27017/momento";

const User = mongoose.model("User", userSchema);

async function migrateLastLogin() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(CONNECTION_STRING);
    console.log("Connected to MongoDB");

    // Find all users without lastLogin
    const usersWithoutLastLogin = await User.find({
      $or: [{ lastLogin: { $exists: false } }, { lastLogin: null }],
    });

    console.log(
      `Found ${usersWithoutLastLogin.length} users without lastLogin`
    );

    if (usersWithoutLastLogin.length === 0) {
      console.log("No users need migration. Exiting.");
      await mongoose.disconnect();
      return;
    }

    // Update each user to set lastLogin = createdAt
    let updatedCount = 0;
    for (const user of usersWithoutLastLogin) {
      if (user.createdAt) {
        await User.updateOne(
          { _id: user._id },
          { $set: { lastLogin: user.createdAt } }
        );
        updatedCount++;
        console.log(`Updated user: ${user.username} (${user._id})`);
      }
    }

    console.log(`\nMigration complete! Updated ${updatedCount} users.`);
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Migration failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

migrateLastLogin();
