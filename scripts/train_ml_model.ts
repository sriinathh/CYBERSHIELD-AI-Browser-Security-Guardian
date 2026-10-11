import { extractUrlFeatures, MLRiskEngine } from '../apps/backend/src/services/mlService';

console.log('======================================================');
console.log('🤖 CYBERSHIELD ML RISK ENGINE TRAINING & EVALUATION');
console.log('======================================================\n');

// Curated dataset of representative benign and malicious URL signatures
const trainingCorpus = [
  // Benign Samples (Label 0)
  { url: 'https://google.com/search?q=cybersecurity+best+practices', label: 0 },
  { url: 'https://en.wikipedia.org/wiki/Transport_Layer_Security', label: 0 },
  { url: 'https://github.com/facebook/react/issues/2401', label: 0 },
  { url: 'https://developer.mozilla.org/en-US/docs/Web/API', label: 0 },
  { url: 'https://stackoverflow.com/questions/521295', label: 0 },
  { url: 'https://news.ycombinator.com/item?id=32400', label: 0 },
  { url: 'https://amazon.com/dp/B08N5WRWNW', label: 0 },
  { url: 'https://microsoft.com/en-us/windows', label: 0 },
  { url: 'https://apple.com/macos/sequoia', label: 0 },
  { url: 'https://cloudflare.com/learning/dns/what-is-dns', label: 0 },
  { url: 'https://nytimes.com/section/technology', label: 0 },
  { url: 'https://gitlab.com/gitlab-org/gitlab', label: 0 },
  
  // Malicious & Phishing Samples (Label 1)
  { url: 'https://paypal-security-update.account-verification.top/login.php', label: 1 },
  { url: 'http://192.168.1.105:8080/secure/wallet-claim.html', label: 1 },
  { url: 'http://apple-id-verify.support-portal.click/auth?token=9281', label: 1 },
  { url: 'https://chase-bank-alert.service-auth.xyz/verify-account', label: 1 },
  { url: 'https://metamask-airdrop-bonus.pages.dev/claim-wallet', label: 1 },
  { url: 'http://binance-security-confirm.fit/trade/session-reauth', label: 1 },
  { url: 'http://netflix-billing-issue.ngrok-free.app/update-payment', label: 1 },
  { url: 'http://secure-login-account-update.tk/banking/signin.htm', label: 1 },
  { url: 'http://microsoft-support-desk.accountant/remote-help', label: 1 },
  { url: 'http://coinbase-auth-verify.duckdns.org/restore?seed=true', label: 1 },
  { url: 'http://wellsfargo-notice-alert.work/update-credentials', label: 1 },
  { url: 'http://203.0.113.45:2082/wp-login.php?redirect=admin', label: 1 }
];

const engine = new MLRiskEngine();

console.log(`Active Model Version : ${engine.getModelVersion()}`);
console.log(`Extracted Features   : ${engine.getFeatureSchema().length} candidate features`);
console.log(`Feature Schema       : ${engine.getFeatureSchema().join(', ')}\n`);

console.log('--- Feature Sample Extraction ---');
const sampleUrl = 'https://paypal-security-update.account-verification.top/login.php';
console.log(`Sample URL : ${sampleUrl}`);
const features = extractUrlFeatures(sampleUrl);
console.log('Extracted Features:', JSON.stringify(features, null, 2));

console.log('\n--- Evaluating Model Across Corpus ---');
const metrics = engine.evaluate(trainingCorpus);

console.log(`Total Dataset Samples : ${metrics.sampleSize}`);
console.log(`Accuracy             : ${(metrics.accuracy * 100).toFixed(2)}%`);
console.log(`Precision            : ${(metrics.precision * 100).toFixed(2)}%`);
console.log(`Recall (Sensitivity) : ${(metrics.recall * 100).toFixed(2)}%`);
console.log(`F1 Score             : ${(metrics.f1Score * 100).toFixed(2)}%`);
console.log(`Estimated ROC-AUC    : ${(metrics.rocAuc * 100).toFixed(2)}%`);

console.log('\n--- Confusion Matrix ---');
console.log(`True Positives  (TP) : ${metrics.confusionMatrix.truePositive}`);
console.log(`False Positives (FP) : ${metrics.confusionMatrix.falsePositive}`);
console.log(`True Negatives  (TN) : ${metrics.confusionMatrix.trueNegative}`);
console.log(`False Negatives (FN) : ${metrics.confusionMatrix.falseNegative}`);

console.log('\n✅ ML Model Validation Completed Successfully.\n');
