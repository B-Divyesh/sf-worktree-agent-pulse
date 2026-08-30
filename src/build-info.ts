/**
 * Vite injects the immutable Git commit for site and desktop bundles. It is
 * intentionally available to the WebView so a downloaded app and the
 * published release manifest can be tied to the same source.
 */
declare const __PULSE_BUILD_SOURCE_COMMIT__: string;

export const BUILD_SOURCE_COMMIT = __PULSE_BUILD_SOURCE_COMMIT__;
