import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the portfolio homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>PL-HOME｜作品、漫画、工具与教程<\/title>/i);
  assert.match(html, /PL-HOME/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/i);
});

test("server-renders a representative content route", async () => {
  const response = await render("/works");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /作品/);
});
