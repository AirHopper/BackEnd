import webpush from 'web-push';

webpush.setVapidDetails(
  `mailto:${process.env.MAILER_USER}`,
  process.env.WEB_PUSH_PUBLIC_KEY,
  process.env.WEB_PUSH_PRIVATE_KEY
)

export const sendNotification = async (subscription, message) => {
  await webpush.sendNotification(subscription, message);
}