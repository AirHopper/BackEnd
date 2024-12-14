import webpush from 'web-push';

webpush.setVapidDetails(
  `mailto:${process.env.MAILER_USER}`,
  process.env.WEB_PUSH_PUBLIC_KEY,
  process.env.WEB_PUSH_PRIVATE_KEY
)

export const sendNotification = async (subscription, title, description) => {
  const payload = JSON.stringify({
    title: title, 
    body: description, 
    // icon
  });
  await webpush.sendNotification(subscription, payload);
}