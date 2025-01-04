import type { HttpBindings } from "@hono/node-server";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { OAuth2Client } from "google-auth-library";
import { people } from "@googleapis/people";
import { env } from "#/utils/env";
import { db } from "#/utils/db";
import { randomUUID } from "crypto";
import { logger } from "#/utils/logger";

const url = env.RAILWAY_PUBLIC_DOMAIN ? env.RAILWAY_PUBLIC_DOMAIN : `http://localhost:${String(env.PORT)}`;
const redirectPath = "/google/auth";
const authorizationUUID = randomUUID();

const app = new Hono<{ Bindings: HttpBindings }>();

app.get(redirectPath, async (context) => {
  const client = new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${url}${redirectPath}`,
  );

  // If there is a code, we save it and give the connection a success:
  const code = context.req.query("code");

  if (code) {
    const tokenResponse = await client.getToken(code);
    client.setCredentials(tokenResponse.tokens);

    const peopleAPI = people({ version: "v1", auth: client });
    const emailResponse = await peopleAPI.people.get({ resourceName: "people/me", personFields: "emailAddresses" });
    const email = emailResponse.data.emailAddresses?.find(addr => addr.metadata?.primary)?.value;
    if (!email) return context.text("Error: unable to find your email");

    await db.googleUser.upsert({
      where: { email },
      create: { email, refreshToken: tokenResponse.tokens.refresh_token! },
      update: { refreshToken: tokenResponse.tokens.refresh_token! },
    });

    console.log(`NEW AUTHENTIFIED ACCOUNT: ${email}`);
    return context.text(`Successful connection! (${email})`);
  }

  // No code found, we send a OAuth consent screen to the user:
  const authorization = context.req.query("authorization");

  if (authorization !== authorizationUUID) return context.text("Unauthorized");

  const authorizeURL = client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/calendar",
    ],
  });

  return context.redirect(authorizeURL);
});

serve({ fetch: app.fetch, hostname: "0.0.0.0", port: env.PORT }).on("listening", () => {
  logger.success("auth", `connection url - ${url}${redirectPath}?authorization=${authorizationUUID}`);
});
