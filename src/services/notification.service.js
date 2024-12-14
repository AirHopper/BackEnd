import prisma from "../utils/prisma.js";
// import customError from "../utils/AppError.js"
import cleanUpAccountData from "../utils/cleanUpAccountData.js";
import { sendNotification } from "../utils/webpush.js";

export const createPromotionNotif = async (userData) => {
  try {
    const { title, description } = userData;
    const accounts = await prisma.account.findMany({
      where: { role: "Buyer" },
    });
    accounts.forEach(async (account) => {
      await prisma.notification.create({
        data: {
          title: title,
          description: description,
          accountId: account.id,
        },
      });
    });
    return `Successfully create notification to ${accounts.length} users`;
  } catch (error) {
    console.log("Error create notification of promotion!");
    throw error;
  }
};

export const getUserNotification = async (userId) => {
  try {
    const account = await prisma.account.findUnique({
      where: { id: userId },
      include: { Notification: true },
    });
    await prisma.notification.updateMany({
      where: { accountId: userId },
      data: { isRead: true },
    });
    cleanUpAccountData(account);
    return account;
  } catch (error) {
    console.log("Error read all user notification");
    throw error;
  }
};

export const createOrderNotification = async (userId, title, description) => {
  try {
    // Save to database
    const notification = await prisma.notification.create({
      data: {
        title: title,
        accountId: userId,
        description: description,
        type: "Notifikasi",
      },
      include: { Account: true },
    });

    // Push notification
    if (notification.Account.notificationSubscription) {
      await sendNotification(JSON.parse(notification.Account.notificationSubscription), notification.title, notification.description);
    }
    return notification;
  } catch (error) {
    console.log("Error create notification of order!");
    throw error;
  }
};

// try {
//   await createOrderNotification(1, "Order", "OrderSuksesBang!");
// } catch(error) {
//   console.log(error);
// }
