const endpoint = "https://api.sociobot.in/api/v1/products/worktree-agent-pulse/checkout";
const response = await fetch(endpoint, { redirect: "manual" });
const location = response.headers.get("location");

if (response.status !== 303 || !location) {
  throw new Error(`checkout did not redirect: HTTP ${response.status}`);
}

const target = new URL(location);
if (target.protocol !== "https:" || target.hostname !== "checkout.dodopayments.com" || !target.pathname.startsWith("/session/")) {
  throw new Error(`checkout redirected to an unexpected target: ${target.origin}${target.pathname}`);
}

console.log(`@claim:checkout-live HTTP ${response.status} -> ${target.origin}/session/<redacted>`);
