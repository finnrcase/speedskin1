/*
  Visual QA: starts the production server, captures key screens (desktop,
  tablet, mobile, plus the blank-keyboard and stuck-hint states), and saves
  PNGs to /screenshots. Run with `npm run screenshots` (which builds first).
*/
import { chromium, devices } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = 3100;
const BASE = `http://localhost:${PORT}`;
const OUT = "screenshots";
const SERVER_BIN = "node_modules/.bin/next";

const DESKTOP = { width: 1280, height: 860 };
const LESSON_VIEW = { width: 1200, height: 950 };

/** device localStorage key used by DeviceProvider. */
const setDevice = (d) => ({ "speedskin:device": d });

/** Local demo session so screenshots can get past the auth landing. */
function demoProfile(role = "student") {
  const now = "2026-06-16T00:00:00.000Z";
  const fullName =
    role === "teacher" ? "Ms. Rivera" : role === "admin" ? "Site Admin" : "Jordan";
  return JSON.stringify({
    id: `demo-${role}`,
    userId: `demo-${role}`,
    email: `demo-${role}@speedskin.app`,
    fullName,
    role,
    createdAt: now,
    updatedAt: now,
  });
}

const SHOTS = [
  {
    name: "01-home-desktop.png",
    url: "/",
    viewport: DESKTOP,
    fullPage: true,
  },
  {
    name: "02-lessons-desktop.png",
    url: "/lesson",
    viewport: DESKTOP,
    fullPage: true,
  },
  {
    name: "03-lesson-blank-keyboard.png",
    url: "/lesson/l1-home-row-letters",
    viewport: LESSON_VIEW,
    storage: setDevice("ipad"),
    waitMs: 1200, // before the 4s stuck reveal
    fullPage: true,
  },
  {
    name: "04-lesson-stuck-hint.png",
    url: "/lesson/l1-home-row-letters",
    viewport: LESSON_VIEW,
    storage: setDevice("ipad"),
    waitMs: 4800, // after the correct key fades in
    fullPage: true,
  },
  {
    name: "05-teacher-desktop.png",
    url: "/teacher",
    viewport: DESKTOP,
    demoRole: "teacher",
    fullPage: true,
  },
  {
    name: "06-homework-join.png",
    url: "/homework",
    viewport: DESKTOP,
    waitForText: "Join your class",
    fullPage: true,
  },
  {
    name: "07-homework-assignments.png",
    url: "/homework",
    viewport: DESKTOP,
    fullPage: true,
    waitForText: "Join your class",
    action: async (page) => {
      await page.getByLabel("Class code").fill("SPEED-6021");
      await page.getByRole("button", { name: /join class/i }).click();
      await page.getByText("Home Row Mastery").first().waitFor();
    },
  },
  {
    name: "08-home-mobile.png",
    url: "/",
    device: devices["iPhone 13"],
    fullPage: false,
  },
  {
    name: "09-home-tablet.png",
    url: "/",
    device: devices["iPad (gen 7)"],
    fullPage: false,
  },
  {
    name: "10-awards-desktop.png",
    url: "/achievements",
    viewport: DESKTOP,
    fullPage: true,
  },
  {
    name: "11-settings-desktop.png",
    url: "/settings",
    viewport: DESKTOP,
    fullPage: true,
  },
  {
    name: "12-lessons-mobile.png",
    url: "/lesson",
    device: devices["iPhone 13"],
    fullPage: false,
  },
  {
    name: "13-courses-desktop.png",
    url: "/courses",
    viewport: DESKTOP,
    fullPage: true,
  },
  {
    name: "14-courses-mobile.png",
    url: "/courses",
    device: devices["iPhone 13"],
    fullPage: false,
  },
  {
    name: "15-auth-landing.png",
    url: "/",
    viewport: DESKTOP,
    demoRole: null, // no demo profile -> show the auth landing + demo CTA
    fullPage: true,
  },
];

function startServer() {
  const proc = spawn(SERVER_BIN, ["start", "-p", String(PORT)], {
    stdio: "ignore",
  });
  return proc;
}

async function waitForServer(timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await sleep(500);
  }
  throw new Error("Server did not become ready in time");
}

async function capture(browser, shot) {
  const context = await browser.newContext(
    shot.device ?? { viewport: shot.viewport, deviceScaleFactor: 2 },
  );
  const storage = { ...(shot.storage ?? {}) };
  if (shot.demoRole !== null) {
    storage["speedskin:demo-profile"] = demoProfile(shot.demoRole ?? "student");
  }
  await context.addInitScript((entries) => {
    for (const [k, v] of entries) window.localStorage.setItem(k, v);
  }, Object.entries(storage));
  const page = await context.newPage();
  await page.goto(`${BASE}${shot.url}`, { waitUntil: "networkidle" });
  if (shot.waitForText) {
    await page.getByText(shot.waitForText).first().waitFor();
  }
  if (shot.action) await shot.action(page);
  if (shot.waitMs) await page.waitForTimeout(shot.waitMs);
  await page.screenshot({
    path: `${OUT}/${shot.name}`,
    fullPage: shot.fullPage ?? false,
  });
  await context.close();
  console.log(`  ✓ ${shot.name}`);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  console.log("Starting production server…");
  const server = startServer();
  try {
    await waitForServer();
    console.log("Server ready. Capturing screenshots…");
    const browser = await chromium.launch();
    try {
      for (const shot of SHOTS) {
        await capture(browser, shot);
      }
    } finally {
      await browser.close();
    }
    console.log(`\nDone. ${SHOTS.length} screenshots saved to /${OUT}`);
  } finally {
    server.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
