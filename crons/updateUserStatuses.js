import RegularUser from "../models/regularUser.model.js";
import moment from "moment-timezone";

// Helper function to convert lifespan to minutes
const lifespanToMinutes = (lifespan) => {
  switch (lifespan) {
    case "5mins":
      return 5;
    case "1hour":
      return 60;
    case "1day":
      return 60 * 24;
    case "7days":
      return 60 * 24 * 7;
    case "1month":
      return 60 * 24 * 30;
    case "3months":
      return 60 * 24 * 90;
    case "6months":
      return 60 * 24 * 180;
    case "1year":
      return 60 * 24 * 365;
    default:
      return 60 * 24 * 30; // Default to 1 month
  }
};

// Function to update isActive status for all codes
export const updateActivationStatuses = async () => {
  try {
    const users = await RegularUser.find({});

    for (const user of users) {
      for (const codeEntry of user.genCode) {
        if (codeEntry.activationDate) {
          const activationDateUTC = moment(codeEntry.activationDate).utc();
          const lifespanMinutes = lifespanToMinutes(user.lifespan);
          const expirationTime = activationDateUTC.add(
            lifespanMinutes,
            "minutes"
          );

          codeEntry.isActive = moment().utc().isSameOrBefore(expirationTime);
        } else {
          codeEntry.isActive = null;
        }
      }

      await user.save();
    }

    console.log("Activation statuses updated successfully.");
  } catch (error) {
    console.error("Error updating activation statuses:", error);
  }
};
