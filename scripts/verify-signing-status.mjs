// @claim:unsigned-builds
const api = "https://api.github.com/repos/B-Divyesh/sf-worktree-agent-pulse/releases/latest";
const response = await fetch(api, { headers: { Accept: "application/vnd.github+json" } });
if (!response.ok) throw new Error(`GitHub Releases returned ${response.status}`);
const release = await response.json();
if (!/unsigned desktop builds/i.test(release.body ?? "")) throw new Error("release does not disclose unsigned builds");
const report = release.assets.find((asset) => asset.name === "signing-status.json");
if (report) {
  const statusResponse = await fetch(report.browser_download_url);
  if (!statusResponse.ok) throw new Error(`signing-status.json returned ${statusResponse.status}`);
  const status = await statusResponse.json();
  if (status.macos?.signed !== false || status.windows?.signed !== false) throw new Error("signing report does not prove unsigned macOS and Windows artifacts");
  console.log(`unsigned-builds PASS: ${release.tag_name} has runner-generated macOS and Windows signing evidence`);
} else {
  // Older published releases predate the signing report. Inspect the shipped
  // Windows PE certificate directory and require the release disclosure.
  const windows = release.assets.find((asset) => /setup\.exe$/i.test(asset.name));
  if (!windows) throw new Error("release has no Windows installer to inspect");
  const bytes = Buffer.from(await (await fetch(windows.browser_download_url)).arrayBuffer());
  const pe = bytes.readUInt32LE(0x3c);
  if (bytes.toString("ascii", pe, pe + 4) !== "PE\0\0") throw new Error("Windows artifact is not a PE file");
  const optional = pe + 24;
  const directory = optional + (bytes.readUInt16LE(optional) === 0x20b ? 112 : 96);
  const certificateSize = bytes.readUInt32LE(directory + 4 * 8 + 4);
  if (certificateSize !== 0) throw new Error("Windows installer contains an Authenticode certificate");
  console.log(`unsigned-builds PASS: ${release.tag_name} discloses unsigned builds and its Windows installer has no certificate`);
}
