import prisma from "../utils/prisma.js";
// import customError from "../utils/AppError.js"
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

export const getUserNotification = async (userId, params) => {
  try {
    let { type, q } = params
    if (type)
      type = params.type.charAt(0).toUpperCase() + params.type.slice(1);

    const notifications = await prisma.notification.findMany({
      where: { 
        accountId: userId, 
        ...(type && { type }),
        ...(q && {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    notifications.forEach(async notif => {
      await prisma.notification.update({
        where: { id: notif.id },
        data: { isRead: true },
      });
    })
    return notifications;
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

export const clearAllUserNotification = async (userId) => {
  try {
    const notification = await prisma.notification.deleteMany({
      where: { accountId: userId }
    })
    return `Success to delete ${notification.count} notifications!`
  } catch (error) {
    console.log("Error delete all user notifications");
    throw error;
  }
}

// try {
//   await createOrderNotification(1, "Order", "OrderSuksesBang!");
// } catch(error) {
//   console.log(error);
// }
