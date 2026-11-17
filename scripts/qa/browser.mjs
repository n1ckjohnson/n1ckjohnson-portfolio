/**
 * A very small driver for visual QA, with no dependencies.
 *
 * It starts the Chrome already installed on this Mac, headless and with a
 * throwaway profile, and talks to it over the DevTools protocol. It exists
 * so a page can be captured at an exact viewport, part-way through an
 * animation, with reduced motion switched on, and with console errors
 * collected: the things that are tedious to check by hand.
 *
 * Nothing here is used by the site. See scripts/qa/README.md.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function launch({ port = 9333 } = {}) {
  const profile = mkdtempSync(join(tmpdir(), "qa-chrome-"));
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      "--disable-extensions",
      "--disable-background-networking",
      "--force-color-profile=srgb",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  let version = null;
  for (let attempt = 0; attempt < 60 && !version; attempt++) {
    await sleep(150);
    version = await fetch(`http://127.0.0.1:${port}/json/version`).then((response) => response.json()).catch(() => null);
  }
  if (!version) {
    chrome.kill();
    throw new Error("Chrome did not start. Set CHROME_PATH if it is installed somewhere else.");
  }

  const close = async () => {
    chrome.kill();
    await sleep(300);
    rmSync(profile, { recursive: true, force: true });
  };

  const newPage = async () => {
    const target = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" }).then((response) => response.json());
    const socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
    });

    let id = 0;
    const pending = new Map();
    const listeners = new Map();
    const problems = [];

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) {
        const { resolve, reject } = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
        return;
      }
      if (message.method === "Runtime.exceptionThrown") {
        problems.push(`exception: ${message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text}`);
      }
      if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
        problems.push(`console.error: ${message.params.args.map((arg) => arg.value ?? arg.description ?? "").join(" ").slice(0, 300)}`);
      }
      if (message.method === "Network.responseReceived" && message.params.response.status >= 400) {
        problems.push(`http ${message.params.response.status}: ${message.params.response.url}`);
      }
      for (const handler of listeners.get(message.method) ?? []) handler(message.params);
    });

    const send = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const call = ++id;
        pending.set(call, { resolve, reject });
        socket.send(JSON.stringify({ id: call, method, params }));
      });

    const once = (method) =>
      new Promise((resolve) => {
        const handler = (params) => {
          listeners.set(method, (listeners.get(method) ?? []).filter((entry) => entry !== handler));
          resolve(params);
        };
        listeners.set(method, [...(listeners.get(method) ?? []), handler]);
      });

    await send("Page.enable");
    await send("Runtime.enable");
    await send("Network.enable");

    const page = {
      /** Messages logged as errors, uncaught exceptions and failed requests since the page was opened. */
      problems,
      send,
      wait: sleep,

      async viewport(width, height, { mobile = width < 600, scale = 2 } = {}) {
        await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile });
        await send("Emulation.setTouchEmulationEnabled", { enabled: mobile });
      },

      /** Emulates the system "reduce motion" setting. */
      async reducedMotion(on = true) {
        await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: on ? "reduce" : "no-preference" }] });
      },

      async goto(url, { settle = 1500 } = {}) {
        const loaded = once("Page.loadEventFired");
        await send("Page.navigate", { url });
        await loaded;
        await sleep(settle);
      },

      async eval(expression) {
        const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
        if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
        return result.result.value;
      },

      /** Scrolls the page to an absolute position, as a wheel or a finger would leave it. */
      async scrollTo(y, { settle = 350 } = {}) {
        await page.eval(`window.scrollTo({ top: ${y}, behavior: "instant" })`);
        await sleep(settle);
      },

      /** Clicks the centre of the first element matching the selector, with a real pointer event. */
      async click(selector, { settle = 500 } = {}) {
        const box = await page.eval(`(() => {
          const node = document.querySelector(${JSON.stringify(selector)});
          if (!node) return null;
          node.scrollIntoView({ block: "nearest", behavior: "instant" });
          const r = node.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        })()`);
        if (!box) throw new Error(`click: nothing matches ${selector}`);
        await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: box.x, y: box.y });
        await send("Input.dispatchMouseEvent", { type: "mousePressed", x: box.x, y: box.y, button: "left", clickCount: 1 });
        await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: box.x, y: box.y, button: "left", clickCount: 1 });
        await sleep(settle);
      },

      async hover(selector, { settle = 500 } = {}) {
        const box = await page.eval(`(() => {
          const node = document.querySelector(${JSON.stringify(selector)});
          if (!node) return null;
          const r = node.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        })()`);
        if (!box) throw new Error(`hover: nothing matches ${selector}`);
        await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: box.x, y: box.y });
        await sleep(settle);
      },

      /** Drags with the pointer from one point to another, in steps. */
      async drag(from, to, { steps = 12, settle = 300 } = {}) {
        await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: from.x, y: from.y });
        await send("Input.dispatchMouseEvent", { type: "mousePressed", x: from.x, y: from.y, button: "left", clickCount: 1 });
        for (let step = 1; step <= steps; step++) {
          const t = step / steps;
          await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t, button: "left" });
          await sleep(16);
        }
        await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: to.x, y: to.y, button: "left", clickCount: 1 });
        await sleep(settle);
      },

      /** Presses one key, e.g. "Tab", "ArrowRight", "Enter", "Escape", " ". */
      async key(key, { settle = 250, shift = false } = {}) {
        const codes = { Tab: 9, Enter: 13, Escape: 27, " ": 32, ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, Home: 36, End: 35 };
        const base = { key, code: key === " " ? "Space" : key, windowsVirtualKeyCode: codes[key] ?? 0, modifiers: shift ? 8 : 0 };
        await send("Input.dispatchKeyEvent", { type: "keyDown", ...base, ...(key === "Enter" ? { text: "\r" } : key === " " ? { text: " " } : {}) });
        await send("Input.dispatchKeyEvent", { type: "keyUp", ...base });
        await sleep(settle);
      },

      /** Saves a PNG of the viewport, or of the whole page with `full`. */
      async shot(file, { full = false } = {}) {
        mkdirSync(dirname(file), { recursive: true });
        const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: full, fromSurface: true });
        writeFileSync(file, Buffer.from(data, "base64"));
        return file;
      },

      async close() {
        socket.close();
      },
    };
    return page;
  };

  return { newPage, close };
}
