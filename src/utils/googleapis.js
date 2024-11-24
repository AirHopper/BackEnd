import { google } from "googleapis";

// Setting up
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `http://${process.env.APP_URL}/api/v1/auth/google/callback`
);

// Access information about user
const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
]

// Generate authorization url
const getAuthorizationUrl = async () => {
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true
    })
}

// Set Up Oauth2Client
const setUpOauth2Client = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens)
  return oauth2Client;
}

// Get user info
const getUserInfo = async (oauth2Client) => {
  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: "v2"
  })
  const { data } = await oauth2.userinfo.get();
  return data;
}

export { getAuthorizationUrl, setUpOauth2Client, getUserInfo };