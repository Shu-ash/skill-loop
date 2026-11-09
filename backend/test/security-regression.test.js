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

test("refresh-cookie endpoints enforce trusted Origin", async () => {
  const csrf = await source("middleware/csrf.middleware.js");
  assert.match(csrf, /if \(!req\.cookies\?\.refreshToken\) return next\(\)/);
  assert.match(csrf, /!origin \|\| !trustedOrigins\.has\(origin\)/);
  assert.match(csrf, /status\(403\)/);
});

test("destructive seeders require explicit non-production opt-in", async () => {
  for (const file of ["seeders/cleanDatabase.js", "seeders/seedAllDatabase.js", "seeders/cleanDummyData.js"]) {
    const seeder = await source(file);
    assert.match(seeder, /env\.NODE_ENV === "production"/);
    assert.match(seeder, /ALLOW_DESTRUCTIVE_SEED !== "true"/);
  }
});


test("session credit settlement is transactional across state, balances, and ledger", async () => {
  const session = await source("controllers/session.controller.js");
  const helper = session.slice(session.indexOf("const settleSessionCredits"), session.indexOf("const notifySessionSettlement"));
  assert.match(helper, /withTransaction/);
  assert.match(helper, /credits: \{ \$gte: 1 \}/);
  assert.match(helper, /CreditLedger\.create\(\[/);
  assert.match(helper, /session: dbSession/);
});

test("dispute awards debit the funding participant and credit the recipient transactionally", async () => {
  const admin = await source("controllers/admin.controller.js");
  const handler = admin.slice(admin.indexOf("export const resolveSessionDispute"), admin.indexOf("// GET /api/admin/credits"));
  assert.match(handler, /withTransaction/);
  assert.match(handler, /credits: \{ \$gte: 1 \}/);
  assert.match(handler, /CreditLedger\.create\(\[/);
  assert.match(handler, /status: "disputed"/);
});

test("all OTP verification flows enforce expiry and atomically consume a single-use code", async () => {
  const otp = await source("controllers/otp.controller.js");
  assert.match(otp, /createHmac\('sha256'/);
  assert.match(otp, /timingSafeEqual/);
  assert.match(otp, /expiresAt: \{ \$gt: now \}/);
  assert.match(otp, /findOneAndDelete/);
  for (const purpose of ["register", "login", "forgot_password"]) {
    assert.match(otp, new RegExp(`consumeOtp\\(normalizedEmail, ['"]${purpose}['"]`));
  }
});

test("password reset enforces the shared maximum password length", async () => {
  const otp = await source("controllers/otp.controller.js");
  const reset = otp.slice(otp.indexOf("export const resetPasswordWithOtp"), otp.indexOf("export const socialLogin"));
  assert.match(reset, /newPassword\.length > 128/);
});

test("refresh token rotation uses atomic compare-and-swap without clearing a newer token", async () => {
  const auth = await source("controllers/auth.controller.js");
  const refresh = auth.slice(auth.indexOf("export const refresh"), auth.indexOf("export const logout"));
  assert.match(refresh, /findOneAndUpdate/);
  assert.match(refresh, /refreshTokenHash: incomingTokenHash/);
  assert.doesNotMatch(refresh, /refreshTokenHash = null/);
});

test("destructive dummy seeder has no duplicate env binding", async () => {
  const seeder = await source("seeders/cleanDummyData.js");
  const matches = seeder.match(/import \{ env \} from/g) || [];
  assert.equal(matches.length, 1);
});

test("CI blocks moderate-or-higher dependency vulnerabilities and syntax errors", async () => {
  const workflow = await readFile(path.resolve(here, "../../.github/workflows/security-regression.yml"), "utf8");
  assert.match(workflow, /npm audit --audit-level=moderate/);
  assert.match(workflow, /node --check/);
});


test("legacy email OTP flows use keyed hashes and constant-time comparisons", async () => {
  const auth = await source("controllers/auth.controller.js");
  assert.match(auth, /createHmac\("sha256", env\.JWT_ACCESS_SECRET\)/);
  assert.match(auth, /timingSafeEqual/);
  assert.doesNotMatch(auth, /hashOtp\(/);
});

test("email service neither exposes OTP in the subject nor returns it to callers", async () => {
  const email = await source("utils/emailService.js");
  assert.doesNotMatch(email, /subject:.*\$\{otp\}/);
  assert.doesNotMatch(email, /return \{ success: true, otp \}/);
});
