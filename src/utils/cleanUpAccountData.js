// Clean Up Account Properties before send it to frontend
const cleanUpAccountData = (account) => {
  [
    "createdAt",
    "updatedAt",
    // "role",
    "password",
    "otpCode",
    "otpExpiration",
    "notificationSubscription",
  ].forEach((key) => delete account[key]);
};

export default cleanUpAccountData;
