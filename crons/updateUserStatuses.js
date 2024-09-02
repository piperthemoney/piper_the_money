import cron from "node-cron";
import RegularUser from "../models/regularUser.model.js"; // Adjust the path as necessary
import moment from "moment-timezone";

// Helper function to convert lifespan to days
const lifespanToDays = (lifespan) => {
  switch (lifespan) {
    case "5mins":
      return 5 / (24 * 60);
    case "1hour":
      return 1 / 24;
    case "1day":
      return 1;
    case "7days":
      return 7;
    case "1month":
      return 30;
    case "3months":
      return 90;
    case "6months":
      return 180;
    case "1year":
      return 365;
    default:
      return 30;
  }
};

// Function to update isActive status for all codes
export const updateActivationStatuses = async () => {
  try {
    // Fetch all users
    const users = await RegularUser.find({});

    // Process each user
    for (const user of users) {
      // Update each code entry's isActive status
      for (const codeEntry of user.genCode) {
        if (codeEntry.activationDate) {
          // Convert activation date to UTC
          const activationDateUTC = moment(codeEntry.activationDate).utc();

          // Calculate the expiration date based on the lifespan
          const lifespanDays = lifespanToDays(user.lifespan);
          const lifespanEndUTC = activationDateUTC.add(lifespanDays, "days");

          // Check if the current date in UTC is less than or equal to the expiration date
          codeEntry.isActive = moment().utc().isSameOrBefore(lifespanEndUTC);
        } else {
          codeEntry.isActive = null;
        }
      }

      // Save updated user document
      await user.save();
    }

    console.log("Activation statuses updated successfully.");
  } catch (error) {
    console.error("Error updating activation statuses:", error);
  }
};
