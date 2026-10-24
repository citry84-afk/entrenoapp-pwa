const fs = require('fs');
const path = require('path');

const file = path.join(
  __dirname,
  '..',
  'node_modules',
  '@capacitor-community',
  'admob',
  'ios',
  'Sources',
  'AdMobPlugin',
  'Consent',
  'ConsentExecutor.swift'
);

if (!fs.existsSync(file)) {
  process.exit(0);
}

let source = fs.readFileSync(file, 'utf8');
const patched = source
  .replace(/UMPRequestParameters/g, 'RequestParameters')
  .replace(/UMPDebugSettings/g, 'DebugSettings')
  .replace(/UMPDebugGeography/g, 'DebugGeography')
  .replace(/UMPConsentInformation\.sharedInstance/g, 'ConsentInformation.shared')
  .replace(/UMPFormStatus\.available/g, 'FormStatus.available')
  .replace(/UMPConsentForm\.load\(completionHandler:/g, 'ConsentForm.load(with:')
  .replace(/tagForUnderAgeOfConsent/g, 'isTaggedForUnderAgeOfConsent')
  .replace(/UMPConsentStatus\.required/g, 'ConsentStatus.required')
  .replace(/UMPConsentStatus\.notRequired/g, 'ConsentStatus.notRequired')
  .replace(/UMPConsentStatus\.obtained/g, 'ConsentStatus.obtained')
  .replace(/func getConsentStatusString\(_ consentStatus: UMPConsentStatus\)/g, 'func getConsentStatusString(_ consentStatus: ConsentStatus)');

if (patched !== source) {
  fs.writeFileSync(file, patched);
  console.log('Patched @capacitor-community/admob iOS consent types for current Google UMP SDK.');
}
