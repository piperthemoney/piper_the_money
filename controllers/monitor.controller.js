import RegularUser from "../models/regularUser.model.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";

export const monitoringData = asyncErrorHandler(async (req, res, next) => {
  const users = await RegularUser.find({});

  const lifespanCodeCount = {};

  const isActiveCodeCount = {
    active: 0, // isActive === true
    expire: 0, // isActive === false
    notActivated: 0, // isActive === null
  };

  users.forEach((user) => {
    const lifespan = user.lifespan;
    const codes = user.genCode || [];

    if (!lifespanCodeCount[lifespan]) {
      lifespanCodeCount[lifespan] = 0;
    }

    lifespanCodeCount[lifespan] += codes.length;

    // Track isActive status
    codes.forEach((codeEntry) => {
      const isActive = codeEntry.isActive;

      if (isActive === true) {
        isActiveCodeCount.active += 1;
      } else if (isActive === false) {
        isActiveCodeCount.expire += 1;
      } else {
        isActiveCodeCount.notActivated += 1;
      }
    });
  });

  const results = users.map((user) => ({
    codes: (user.genCode || []).map((codeEntry) => ({
      code: codeEntry.code,
    })),
  }));

  // Calculate the total number of codes
  const totalNumberOfCodes = results.reduce(
    (acc, user) => acc + user.codes.length,
    0
  );

  res.status(200).json({
    status: "success",
    total_code: totalNumberOfCodes,
    lifespan: lifespanCodeCount,
    isActiveStatus: isActiveCodeCount,
  });
});
