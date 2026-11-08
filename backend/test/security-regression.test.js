import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const source = async (relativePath) =>
  readFile(path.resolve(here, "..", "src", relativePath), "utf8");

test("credentialed CORS has no wildcard Render subdomain trust", async () => {
  const server = await source("server.js");
  assert.match(server, /allowedOrigins\.includes\(origin\)/);
  assert.doesNotMatch(server, /hostname\.endsWith\("\.onrender\.com"\)/);
});

test("email verification cannot mint a session for an already-verified address", async () => {
  const auth = await source("controllers/auth.controller.js");
  assert.match(auth, /if \(user\.emailVerified\) \{[\s\S]*?status\(409\)/);
  assert.match(auth, /if \(!user\.emailVerified\) \{[\s\S]*?status\(403\)/);
});

test("social login fails closed until provider tokens are verified", async () => {
  const otp = await source("controllers/otp.controller.js");
  const handler = otp.slice(otp.indexOf("export const socialLogin"));
  assert.match(handler, /status\(501\)/);
  assert.doesNotMatch(handler, /createAccessToken\(/);
});

test("OTP secrets are not written to application logs", async () => {
  const email = await source("utils/emailService.js");
  assert.doesNotMatch(email, /OTP CODE:.*\$\{otp\}/);
});

test("only superadmins can change roles and role values are allowlisted", async () => {
  const admin = await source("controllers/admin.controller.js");
  const handler = admin.slice(admin.indexOf("export const updateUserRole"), admin.indexOf("// PATCH /api/admin/users/:userId/status"));
  assert.match(handler, /req\.user\?\.role !== "superadmin"/);
  assert.match(handler, /\["user", "admin"\]/);
});

test("admin middleware rejects non-access JWTs", async () => {
  const middleware = await source("middleware/admin.middleware.js");
  assert.match(middleware, /decoded\.type !== "access"/);
});

test("session completion requires both participants and learner credits", async () => {
  const session = await source("controllers/session.controller.js");
  assert.match(session, /!session\.learnerJoined \|\| !session\.teacherJoined/);
  assert.match(session, /credits: \{ \$gte: 1 \}/);
  assert.match(session, /A session cannot be completed before its scheduled start time/);
});

test("dispute settlement can only transition a disputed session", async () => {
  const admin = await source("controllers/admin.controller.js");
  const handler = admin.slice(admin.indexOf("export const resolveSessionDispute"), admin.indexOf("// GET /api/admin/credits"));
  assert.match(handler, /status: "disputed"/);
  assert.match(handler, /status\(409\)/);
});
