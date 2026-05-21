import cron from "node-cron";

import Invitation from "../models/Invitation.js";

import { sendOnboardingReminderEmail } from "../services/emailService.js";

cron.schedule("0 * * * *", async () => {
  console.log("⏰ Checking onboarding reminders...");

  try {
    const invitations = await Invitation.find({
      status: {
        $ne: "COMPLETED",
      },
    });

    const now = new Date();

    for (const invite of invitations) {
      const lastActivity = new Date(invite.lastActivityAt || invite.createdAt);

      const diffHours =
        (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

      let shouldSend = false;

      // After 24 Hours
      if (invite.reminderCount === 0 && diffHours >= 24) {
        shouldSend = true;
      }

      // After 3 Days
      else if (invite.reminderCount === 1 && diffHours >= 72) {
        shouldSend = true;
      }

      // After 7 Days
      else if (invite.reminderCount === 2 && diffHours >= 168) {
        shouldSend = true;
      }

      if (!shouldSend) continue;

      const onboardingUrl = `${process.env.FRONTEND_URL}/onboarding/${invite.inviteToken}`;

      await sendOnboardingReminderEmail(
        invite.email,
        invite.employeeName,
        onboardingUrl,
        invite.reminderCount + 1,
      );

      invite.reminderCount += 1;

      invite.lastReminderSentAt = new Date();

      await invite.save();

      console.log(`✅ Reminder sent to ${invite.email}`);
    }
  } catch (error) {
    console.error("❌ Reminder cron failed:", error);
  }
});

// import cron from "node-cron";

// import Invitation from "../models/Invitation.js";

// import { sendOnboardingReminderEmail } from "../services/emailService.js";

// // Runs every minute
// cron.schedule("* * * * *", async () => {
//   console.log("⏰ Checking onboarding reminders...");

//   try {
//     const invitations = await Invitation.find({
//       status: {
//         $ne: "COMPLETED",
//       },
//     });

//     const now = new Date();

//     for (const invite of invitations) {
//       const lastActivity = new Date(invite.lastActivityAt || invite.createdAt);

//       // Difference in minutes
//       const diffMinutes =
//         (now.getTime() - lastActivity.getTime()) / (1000 * 60);

//       let shouldSend = false;

//       // After 3 Minutes
//       if (invite.reminderCount === 0 && diffMinutes >= 3) {
//         shouldSend = true;
//       }

//       // After 5 Minutes
//       else if (invite.reminderCount === 1 && diffMinutes >= 5) {
//         shouldSend = true;
//       }

//       // After 7 Minutes
//       else if (invite.reminderCount === 2 && diffMinutes >= 7) {
//         shouldSend = true;
//       }

//       if (!shouldSend) continue;

//       const onboardingUrl = `${process.env.FRONTEND_URL}/onboarding/auth/${invite.inviteToken}`;

//       await sendOnboardingReminderEmail(
//         invite.email,
//         invite.employeeName,
//         onboardingUrl,
//         invite.reminderCount + 1,
//       );

//       invite.reminderCount += 1;

//       invite.lastReminderSentAt = new Date();

//       await invite.save();

//       console.log(`✅ Reminder sent to ${invite.email}`);
//     }
//   } catch (error) {
//     console.error("❌ Reminder cron failed:", error);
//   }
// });
