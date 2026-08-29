/**
 * The release workflow injects the immutable Git commit used for a desktop
 * bundle. It is intentionally available to the WebView so a downloaded app
 * and the published release manifest can be tied to the same source.
 */
export const BUILD_SOURCE_COMMIT = import.meta.env.VITE_BUILD_SOURCE_COMMIT ?? "local-development";
