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
  assert.match(html, /<title>PL-HOME｜AIGC、项目、手绘与技术栈<\/title>/i);
  assert.match(html, /PL-HOME/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/i);
});

test("server-renders the promoted portfolio routes", async () => {
  for (const [pathname, expected] of [
    ["/aigc/ai-art", "AI 绘画"],
    ["/aigc/pokemon-cards", "宝可梦卡牌"],
    ["/projects", "项目"],
    ["/drawing", "手绘"],
    ["/tech-stack", "技术栈属性面板"],
  ]) {
    const response = await render(pathname);
    assert.equal(response.status, 200);
    assert.match(await response.text(), new RegExp(expected));
  }
});

test("removed sections return not found", async () => {
  for (const pathname of ["/comics", "/notes", "/tools/manga-translator", "/pokemon-cards", "/ai-art", "/aigc/ai-comic"]) {
    const response = await render(pathname);
    assert.equal(response.status, 404);
  }
});
