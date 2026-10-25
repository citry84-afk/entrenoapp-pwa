const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { patchSource, patchFile } = require('./patch-revenuecat-ios');

const fixture = `public struct PaywallColor {
    public var stringRepresentation: String
    fileprivate var _underlyingColor: (any Sendable)?

}

// MARK: - Public constructors
extension PaywallColor {
    public init(stringRepresentation: String) throws {
        self.init(stringRepresentation: stringRepresentation, color: try Self.parseColor(stringRepresentation))
    }
}

private extension PaywallColor {
    /// "Designated" initializer
    private init(stringRepresentation: String, underlyingColor: (any Sendable)?) {
        self.stringRepresentation = stringRepresentation
        self._underlyingColor = underlyingColor
    }

}
`;
const patched = patchSource(fixture);
assert.ok(patched.indexOf('private init(') < patched.indexOf('// MARK: - Public constructors'));
assert.equal((patched.match(/private init\(/g) || []).length, 1);
assert.ok(patched.includes('public init(stringRepresentation: String) throws {'));
assert.equal(patchSource(patched), patched);
assert.throws(() => patchSource(fixture.replace('any Sendable', 'Any')), /refusing to patch/);
assert.throws(() => patchSource(fixture + fixture), /refusing to patch/);
assert.throws(() => patchSource(fixture.replace('    }\n\n}\n', '    }\n}\n')), /refusing to patch/);

const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'entrenoapp-revenuecat-patch-'));
const file = path.join(folder, 'PaywallColor.swift');
try {
  fs.writeFileSync(file, fixture, { mode: 0o444 });
  assert.equal(patchFile(file), true);
  assert.equal(fs.readFileSync(file, 'utf8'), patched);
  assert.equal(fs.statSync(file).mode & 0o777, 0o444);
  assert.equal(patchFile(file), false);
} finally {
  fs.chmodSync(file, 0o644);
  fs.unlinkSync(file);
  fs.rmdirSync(folder);
}
console.log('PASS: RevenueCat official initializer move, public API, idempotence, fail-closed checks and read-only permissions.');
