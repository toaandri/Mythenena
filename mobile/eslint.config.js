// eslint-config-expo/flat requires `eslint/config` from the package-level eslint.
// In a monorepo with npm workspaces, the hoisted root eslint (v8) doesn't expose
// that subpath, causing a crash. We load the config defensively here.
let expoConfig = [];
try {
  expoConfig = require('eslint-config-expo/flat');
} catch {
  // eslint-config-expo unavailable in this environment — skip.
}

module.exports = [...expoConfig, { ignores: ['.expo/**', 'dist/**'] }];
