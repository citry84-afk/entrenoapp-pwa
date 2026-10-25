const fs = require('fs');
const path = require('path');

// Backport only the initializer move from RevenueCat's Xcode 27 fix:
// https://github.com/RevenueCat/purchases-ios/commit/870899891ac9a05118ae6ee16d4ae189b2c1eac2
// Keep the Capacitor 6-compatible purchase SDK and its public API unchanged.
const initializer = [
  '    /// "Designated" initializer',
  '    private init(stringRepresentation: String, underlyingColor: (any Sendable)?) {',
  '        self.stringRepresentation = stringRepresentation',
  '        self._underlyingColor = underlyingColor',
  '    }',
  ''
].join('\n');
const property = '    fileprivate var _underlyingColor: (any Sendable)?\n';

function patchSource(source) {
  const structStart = source.indexOf('public struct PaywallColor {');
  const publicConstructors = source.indexOf('// MARK: - Public constructors');
  const initializerStart = source.indexOf(initializer);
  if (structStart < 0 || publicConstructors <= structStart || initializerStart < 0 ||
      source.split(initializer).length !== 2 || source.split(property).length !== 2) {
    throw new Error('Unexpected RevenueCat PaywallColor source; refusing to patch.');
  }
  if (initializerStart > structStart && initializerStart < publicConstructors) return source;
  if (initializerStart < publicConstructors ||
      source.lastIndexOf('private extension PaywallColor {', initializerStart) < publicConstructors ||
      source.split(initializer + '\n').length !== 2) {
    throw new Error('Unexpected RevenueCat initializer location; refusing to patch.');
  }
  return source.replace(initializer + '\n', '').replace(property, property + '\n' + initializer);
}

function patchFile(file) {
  const source = fs.readFileSync(file, 'utf8');
  const patched = patchSource(source);
  if (patched === source) return false;
  const mode = fs.statSync(file).mode & 0o777;
  try {
    fs.chmodSync(file, mode | 0o200);
    fs.writeFileSync(file, patched);
  } finally {
    fs.chmodSync(file, mode);
  }
  return true;
}

if (require.main === module) {
  const file = path.join(__dirname, '..', 'ios', 'App', 'Pods', 'RevenueCat', 'Sources', 'Paywalls', 'PaywallColor.swift');
  try {
    if (patchFile(file)) console.log('Patched RevenueCat initializer for Xcode 27 (official backport).');
    else console.log('RevenueCat Xcode 27 patch already applied.');
  } catch (error) {
    console.error('RevenueCat Xcode 27 compatibility patch failed; check the installed SDK source before building.');
    process.exitCode = 1;
  }
}

module.exports = { patchSource, patchFile };
