import { OAuth2Client } from "google-auth-library";
import { env } from "#/utils/env";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { db } from "#/utils/db";
import { getGooglePeopleEmail } from "./google-people";

const app = new Hono();

const client = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  `http://localhost:${env.PORT}/google/auth`
);

app.get("/google/auth", async context => {
  // If there is a code, we save it and give the connection a success:
  const code = context.req.query("code");

  if (code) {
    const response = await client.getToken(code);
    const email = await getGooglePeopleEmail(response.tokens.access_token!);

    if (!email) return context.text("Error: unable to find your email");

    client.setCredentials(response.tokens);
    await db.googleUser.upsert({
      where: { email },
      create: { email, token: response.tokens.refresh_token! },
      update: { token: response.tokens.refresh_token! }
    });

    return context.text("Successful connection!");
  }

  // No code found, we send a OAuth consent screen to the user:
  const authorizeURL = client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/calendar"
    ]
  });

  return context.redirect(authorizeURL);
});

serve({ fetch: app.fetch, port: env.PORT });