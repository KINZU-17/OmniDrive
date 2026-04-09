/**
 * OmniDrive Image Downloader — imagin.studio CDN
 * Run: node download-images.js
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'assets', 'vehicles');
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const BASE = 'cdn.imagin.studio';

// [file, make, modelFamily, angle, paintId]
const vehicles = [
    // ── Cars ──
    ['acura-nsx.jpg',            'acura',        'nsx',              '01', 'color-black'],
    ['alfa-romeo-giulia.jpg',    'alfa-romeo',   'giulia',           '01', 'color-red'],
    ['aston-martin-db12.jpg',    'aston-martin', 'db11',             '01', 'color-silver'],
    ['bentley-continental.jpg',  'bentley',      'continental-gt',   '01', 'color-blue'],
    ['bmw-m5.jpg',               'bmw',          'm5',               '01', 'color-grey'],
    ['bugatti-chiron.jpg',       'bugatti',      'chiron',           '01', 'color-blue'],
    ['buick-enclave.jpg',        'buick',        'enclave',          '01', 'color-white'],
    ['cadillac-escalade.jpg',    'cadillac',     'escalade',         '01', 'color-black'],
    ['chevrolet-corvette.jpg',   'chevrolet',    'corvette',         '01', 'color-red'],
    ['chrysler-pacifica.jpg',    'chrysler',     'pacifica',         '01', 'color-grey'],
    ['dodge-challenger.jpg',     'dodge',        'challenger',       '01', 'color-black'],
    ['ferrari-sf90.jpg',         'ferrari',      '488',              '01', 'color-red'],
    ['ford-mustang.jpg',         'ford',         'mustang',          '01', 'color-grey'],
    ['ford-f150.jpg',            'ford',         'f-150',            '01', 'color-black'],
    ['ford-transit.jpg',         'ford',         'transit',          '01', 'color-white'],
    ['gmc-sierra.jpg',           'gmc',          'sierra-1500',      '01', 'color-black'],
    ['gmc-hummer-ev.jpg',        'gmc',          'hummer-ev',        '01', 'color-green'],
    ['honda-civic-type-r.jpg',   'honda',        'civic',            '01', 'color-red'],
    ['honda-crv.jpg',            'honda',        'cr-v',             '01', 'color-white'],
    ['honda-odyssey.jpg',        'honda',        'odyssey',          '01', 'color-white'],
    ['honda-fit.jpg',            'honda',        'jazz',             '01', 'color-white'],
    ['hyundai-ioniq5.jpg',       'hyundai',      'ioniq-5',          '01', 'color-silver'],
    ['infiniti-qx80.jpg',        'infiniti',     'qx80',             '01', 'color-black'],
    ['jaguar-fpace.jpg',         'jaguar',       'f-pace',           '01', 'color-blue'],
    ['jeep-wrangler.jpg',        'jeep',         'wrangler',         '01', 'color-green'],
    ['jeep-grand-cherokee.jpg',  'jeep',         'grand-cherokee',   '01', 'color-black'],
    ['kia-ev9.jpg',              'kia',          'ev9',              '01', 'color-silver'],
    ['kia-carnival.jpg',         'kia',          'carnival',         '01', 'color-white'],
    ['lamborghini-huracan.jpg',  'lamborghini',  'huracan',          '01', 'color-yellow'],
    ['land-rover-rr.jpg',        'land-rover',   'range-rover-sport','01', 'color-black'],
    ['lexus-lfa.jpg',            'lexus',        'lc',               '01', 'color-white'],
    ['lincoln-navigator.jpg',    'lincoln',      'navigator',        '01', 'color-black'],
    ['lotus-emira.jpg',          'lotus',        'emira',            '01', 'color-yellow'],
    ['maserati-mc20.jpg',        'maserati',     'mc20',             '01', 'color-white'],
    ['mclaren-750s.jpg',         'mclaren',      '720s',             '01', 'color-orange'],
    ['mercedes-amg.jpg',         'mercedes-benz','amg-gt',           '01', 'color-black'],
    ['mercedes-sprinter.jpg',    'mercedes-benz','sprinter',         '01', 'color-white'],
    ['mini-jcw.jpg',             'mini',         'hatch',            '01', 'color-red'],
    ['mitsubishi-lancer.jpg',    'mitsubishi',   'lancer',           '01', 'color-red'],
    ['mitsubishi-outlander.jpg', 'mitsubishi',   'outlander',        '01', 'color-grey'],
    ['nissan-gtr.jpg',           'nissan',       'gt-r',             '01', 'color-silver'],
    ['nissan-xtrail.jpg',        'nissan',       'x-trail',          '01', 'color-black'],
    ['nissan-frontier.jpg',      'nissan',       'navara',           '01', 'color-red'],
    ['peugeot-508.jpg',          'peugeot',      '508',              '01', 'color-grey'],
    ['polestar-2.jpg',           'polestar',     '2',                '01', 'color-black'],
    ['polestar-3.jpg',           'polestar',     '3',                '01', 'color-black'],
    ['porsche-911.jpg',          'porsche',      '911',              '01', 'color-orange'],
    ['ram-1500.jpg',             'ram',          '1500',             '01', 'color-green'],
    ['renault-megane.jpg',       'renault',      'megane',           '01', 'color-yellow'],
    ['rivian-r1t.jpg',           'rivian',       'r1t',              '01', 'color-black'],
    ['rolls-royce-spectre.jpg',  'rolls-royce',  'spectre',          '01', 'color-white'],
    ['subaru-wrx.jpg',           'subaru',       'wrx',              '01', 'color-blue'],
    ['subaru-forester.jpg',      'subaru',       'forester',         '01', 'color-blue'],
    ['tesla-model-s.jpg',        'tesla',        'model-s',          '01', 'color-red'],
    ['tesla-model-y.jpg',        'tesla',        'model-y',          '01', 'color-white'],
    ['tesla-cybertruck.jpg',     'tesla',        'cybertruck',       '01', 'color-silver'],
    ['toyota-gr-corolla.jpg',    'toyota',       'gr-corolla',       '01', 'color-white'],
    ['toyota-land-cruiser.jpg',  'toyota',       'land-cruiser',     '01', 'color-white'],
    ['toyota-prado.jpg',         'toyota',       'land-cruiser-prado','01','color-black'],
    ['toyota-hiace.jpg',         'toyota',       'hiace',            '01', 'color-white'],
    ['toyota-probox.jpg',        'toyota',       'probox',           '01', 'color-white'],
    ['toyota-premio.jpg',        'toyota',       'premio',           '01', 'color-silver'],
    ['toyota-fielder.jpg',       'toyota',       'corolla-fielder',  '01', 'color-white'],
    ['toyota-voxy.jpg',          'toyota',       'voxy',             '01', 'color-white'],
    ['toyota-sienna.jpg',        'toyota',       'sienna',           '01', 'color-silver'],
    ['toyota-tundra.jpg',        'toyota',       'tundra',           '01', 'color-white'],
    ['volkswagen-golf-r.jpg',    'volkswagen',   'golf',             '01', 'color-blue'],
    ['volvo-xc90.jpg',           'volvo',        'xc90',             '01', 'color-black'],
    ['audi-rs7.jpg',             'audi',         'rs7',              '01', 'color-grey'],
    ['audi-r8.jpg',              'audi',         'r8',               '01', 'color-yellow'],
    ['audi-rs6.jpg',             'audi',         'rs6-avant',        '01', 'color-grey'],
    ['mazda-mx5.jpg',            'mazda',        'mx-5',             '01', 'color-red'],
    ['mazda-cx90.jpg',           'mazda',        'cx-90',            '01', 'color-white'],
    ['genesis-gv80.jpg',         'genesis',      'gv80',             '01', 'color-white'],
    ['lucid-air.jpg',            'lucid',        'air',              '01', 'color-blue'],
    ['skoda-octavia.jpg',        'skoda',        'octavia',          '01', 'color-white'],
    ['skoda-kodiaq.jpg',         'skoda',        'kodiaq',           '01', 'color-black'],
    ['fiat-500.jpg',             'fiat',         '500',              '01', 'color-red'],
    ['haval-h6.jpg',             'haval',        'h6',               '01', 'color-white'],
    ['mg-hs.jpg',                'mg',           'hs',               '01', 'color-red'],
    ['byd-seal.jpg',             'byd',          'seal',             '01', 'color-blue'],
    ['byd-atto3.jpg',            'byd',          'atto-3',           '01', 'color-white'],
    ['mazda-demio.jpg',          'mazda',        'mazda2',           '01', 'color-red'],
    ['isuzu-dmax.jpg',           'isuzu',        'd-max',            '01', 'color-white'],
    ['honda-stepwgn.jpg',        'honda',        'stepwgn',          '01', 'color-white'],
    ['chevrolet-silverado.jpg',  'chevrolet',    'silverado-1500',   '01', 'color-white'],
    ['acura-mdx.jpg',            'acura',        'mdx',              '01', 'color-white'],
    ['acura-tlx.jpg',            'acura',        'tlx',              '01', 'color-blue'],
    ['cupra-formentor.jpg',      'cupra',        'formentor',        '01', 'color-grey'],
    ['dacia-duster.jpg',         'dacia',        'duster',           '01', 'color-white'],
    // Bikes — imagin.studio doesn't cover bikes well, use angle 23 for side view
    ['ducati-panigale.jpg',      'ducati',       'panigale-v4',      '23', 'color-red'],
    ['yamaha-r1.jpg',            'yamaha',       'yzf-r1',           '23', 'color-blue'],
    ['kawasaki-ninja.jpg',       'kawasaki',     'ninja-zx-10r',     '23', 'color-green'],
    ['bmw-m1000rr.jpg',          'bmw',          'm-1000-rr',        '23', 'color-black'],
    ['suzuki-gsxr.jpg',          'suzuki',       'gsx-r1000',        '23', 'color-blue'],
    ['honda-cbr1000.jpg',        'honda',        'cbr1000rr-r',      '23', 'color-red'],
    ['harley-davidson.jpg',      'harley-davidson','road-glide',     '23', 'color-black'],
    ['triumph-speed-triple.jpg', 'triumph',      'speed-triple',     '23', 'color-black'],
    ['ktm-super-duke.jpg',       'ktm',          '1290-super-duke-r','23', 'color-orange'],
    ['royal-enfield.jpg',        'royal-enfield','interceptor-650',  '23', 'color-grey'],
    ['honda-pcx.jpg',            'honda',        'pcx',              '23', 'color-white'],
    ['yamaha-nmax.jpg',          'yamaha',       'nmax',             '23', 'color-blue'],
    // Buses — use truck angle
    ['mercedes-citaro.jpg',      'mercedes-benz','citaro',           '01', 'color-white'],
    ['volvo-9700.jpg',           'volvo',        'b11r',             '01', 'color-blue'],
    ['byd-k9.jpg',               'byd',          'k9',               '01', 'color-blue'],
    ['yutong-e12.jpg',           'yutong',       'e12',              '01', 'color-blue'],
];

function download(file, make, model, angle, paint) {
    return new Promise((resolve) => {
        const dest = path.join(DIR, file);
        if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
            process.stdout.write(`  ✓ skip  ${file}\n`);
            return resolve(true);
        }
        const p = `/getimage?customer=img&make=${encodeURIComponent(make)}&modelFamily=${encodeURIComponent(model)}&paintId=${paint}&angle=${angle}&width=800`;
        const req = https.get({ hostname: BASE, path: p, headers: { 'User-Agent': 'OmniDrive/1.0' } }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                req.destroy();
                // follow redirect
                const loc = res.headers.location;
                https.get(loc, { headers: { 'User-Agent': 'OmniDrive/1.0' } }, (res2) => {
                    if (res2.statusCode !== 200) { process.stdout.write(`  ✗ ${file} (${res2.statusCode})\n`); return resolve(false); }
                    const f = fs.createWriteStream(dest);
                    res2.pipe(f);
                    f.on('finish', () => { f.close(); const sz = fs.statSync(dest).size; process.stdout.write(`  ✔ ${file} (${(sz/1024).toFixed(0)}KB)\n`); resolve(sz > 5000); });
                }).on('error', () => resolve(false));
                return;
            }
            if (res.statusCode !== 200) { process.stdout.write(`  ✗ ${file} (${res.statusCode})\n`); return resolve(false); }
            const f = fs.createWriteStream(dest);
            res.pipe(f);
            f.on('finish', () => {
                f.close();
                const sz = fs.statSync(dest).size;
                if (sz < 5000) { fs.unlinkSync(dest); process.stdout.write(`  ✗ ${file} (too small)\n`); return resolve(false); }
                process.stdout.write(`  ✔ ${file} (${(sz/1024).toFixed(0)}KB)\n`);
                resolve(true);
            });
        });
        req.on('error', (e) => { process.stdout.write(`  ✗ ${file} (${e.message})\n`); resolve(false); });
        req.setTimeout(12000, () => { req.destroy(); process.stdout.write(`  ✗ ${file} (timeout)\n`); resolve(false); });
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
    console.log('\n🚗 OmniDrive Image Downloader — imagin.studio');
    console.log(`📁 ${DIR}`);
    console.log(`📦 ${vehicles.length} vehicles\n`);
    let ok = 0, fail = 0;
    for (const [file, make, model, angle, paint] of vehicles) {
        const res = await download(file, make, model, angle, paint);
        res ? ok++ : fail++;
        await sleep(150);
    }
    console.log(`\n✅ Done: ${ok} | ✗ Failed: ${fail}`);
    if (ok > 0) console.log('📝 Run: node update-image-paths.js\n');
}

run();
