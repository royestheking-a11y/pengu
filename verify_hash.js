import crypto from 'crypto';

const trans_id = '100987684749';
const user_id = '6999905be1d5a61f1a63716d';
const amount_local = '50.4000';
const amount_usd = '0.72';
const secure_hash_cpx = '71104a48d855736faf50f92ec21fa247';
const APP_SECURE_HASH = '1Y7L7EjWviigSq5YOR5ONJ2BWyScB5aO';

const variations = [
    { label: 'trans_id + APP_SECURE_HASH', val: trans_id + APP_SECURE_HASH },
    { label: 'trans_id + "-" + APP_SECURE_HASH', val: trans_id + '-' + APP_SECURE_HASH },
    { label: 'user_id + trans_id + APP_SECURE_HASH', val: user_id + trans_id + APP_SECURE_HASH },
    { label: 'user_id + "-" + trans_id + "-" + APP_SECURE_HASH', val: user_id + '-' + trans_id + '-' + APP_SECURE_HASH },
    { label: 'trans_id + amount_local + APP_SECURE_HASH', val: trans_id + amount_local + APP_SECURE_HASH },
    { label: 'trans_id + amount_local + amount_usd + APP_SECURE_HASH', val: trans_id + amount_local + amount_usd + APP_SECURE_HASH },
    { label: 'trans_id + amount_usd + APP_SECURE_HASH', val: trans_id + amount_usd + APP_SECURE_HASH }
];

variations.forEach(v => {
    const hash = crypto.createHash('md5').update(v.val).digest('hex');
    console.log(`[${v.label}] => ${hash} (Match: ${hash === secure_hash_cpx})`);
});
