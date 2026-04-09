/**
 * OmniDrive Image Path Updater
 * Updates imageDatabase in script.js to use local assets/vehicles/ paths
 * Run AFTER download-images.js: node update-image-paths.js
 */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'assets', 'vehicles');
const SCRIPT_PATH = path.join(__dirname, 'script.js');

// Map: imageDatabase key pattern → local filename
const localMap = {
    'Acura NSX':               'acura-nsx.jpg',
    'Acura MDX':               'acura-nsx.jpg',
    'Acura TLX':               'acura-nsx.jpg',
    'Acura':                   'acura-nsx.jpg',
    'Alfa Romeo Giulia':       'alfa-romeo-giulia.jpg',
    'Alfa Romeo':              'alfa-romeo-giulia.jpg',
    'Aston Martin DB12':       'aston-martin-db12.jpg',
    'Aston Martin':            'aston-martin-db12.jpg',
    'Bentley Continental':     'bentley-continental.jpg',
    'Bentley':                 'bentley-continental.jpg',
    'BMW M1000':               'bmw-m1000rr.jpg',
    'BMW M3':                  'bmw-m5.jpg',
    'BMW':                     'bmw-m5.jpg',
    'Bugatti Chiron':          'bugatti-chiron.jpg',
    'Bugatti':                 'bugatti-chiron.jpg',
    'Cadillac Escalade':       'cadillac-escalade.jpg',
    'Cadillac':                'cadillac-escalade.jpg',
    'Chevrolet Corvette':      'chevrolet-corvette.jpg',
    'Chevrolet Silverado':     'ford-f150.jpg',
    'Chevrolet':               'chevrolet-corvette.jpg',
    'Dodge Challenger':        'dodge-challenger.jpg',
    'Dodge':                   'dodge-challenger.jpg',
    'Ferrari 296':             'ferrari-sf90.jpg',
    'Ferrari':                 'ferrari-sf90.jpg',
    'Ford F-150 Lightning':    'ford-f150.jpg',
    'Ford F-150':              'ford-f150.jpg',
    'Ford':                    'ford-f150.jpg',
    'GMC Hummer':              'gmc-hummer-ev.jpg',
    'GMC Sierra':              'ford-f150.jpg',
    'GMC':                     'gmc-hummer-ev.jpg',
    'Honda Super Cub':         'honda-pcx.jpg',
    'Honda CBR':               'honda-cbr1000.jpg',
    'Honda CR-V':              'honda-crv.jpg',
    'Honda':                   'honda-civic-type-r.jpg',
    'Hyundai Ioniq':           'hyundai-ioniq5.jpg',
    'Hyundai':                 'hyundai-ioniq5.jpg',
    'Jaguar F-PACE':           'jaguar-fpace.jpg',
    'Jaguar':                  'jaguar-fpace.jpg',
    'Jeep Wrangler':           'jeep-wrangler.jpg',
    'Jeep Grand Cherokee':     'jeep-wrangler.jpg',
    'Jeep':                    'jeep-wrangler.jpg',
    'Kia EV9':                 'kia-ev9.jpg',
    'Kia':                     'kia-ev9.jpg',
    'Koenigsegg Regera':       'koenigsegg-regera.jpg',
    'Koenigsegg':              'koenigsegg-regera.jpg',
    'Lamborghini Huracan':     'lamborghini-revuelto.jpg',
    'Lamborghini':             'lamborghini-revuelto.jpg',
    'Land Rover Range Rover':  'land-rover-rr.jpg',
    'Land Rover':              'land-rover-rr.jpg',
    'Lexus LC':                'lexus-lfa.jpg',
    'Lexus':                   'lexus-lfa.jpg',
    'Lotus Emira':             'lotus-emira.jpg',
    'Lotus':                   'lotus-emira.jpg',
    'Lucid Air':               'lucid-air.jpg',
    'Lucid':                   'lucid-air.jpg',
    'Maserati MC20':           'maserati-mc20.jpg',
    'Maserati':                'maserati-mc20.jpg',
    'Mazda RX-7':              'mazda-mx5.jpg',
    'Mazda':                   'mazda-mx5.jpg',
    'McLaren':                 'mclaren-750s.jpg',
    'Mercedes Citaro':         'mercedes-citaro.jpg',
    'Mercedes-Benz':           'mercedes-sprinter.jpg',
    'Mercedes':                'mercedes-citaro.jpg',
    'Mitsubishi Lancer':       'mitsubishi-lancer.jpg',
    'Mitsubishi':              'mitsubishi-lancer.jpg',
    'Nissan Skyline GT-R':     'nissan-gtr.jpg',
    'Nissan GT-R':             'nissan-gtr.jpg',
    'Nissan':                  'nissan-gtr.jpg',
    'Pagani Utopia':           'pagani-utopia.jpg',
    'Pagani':                  'pagani-utopia.jpg',
    'Polestar 3':              'polestar-3.jpg',
    'Polestar':                'polestar-3.jpg',
    'Porsche 911 GT3':         'porsche-911.jpg',
    'Porsche 911':             'porsche-911.jpg',
    'Porsche':                 'porsche-911.jpg',
    'Rimac Nevera':            'rimac-nevera.jpg',
    'Rimac':                   'rimac-nevera.jpg',
    'Rivian R1T':              'rivian-r1t.jpg',
    'Rivian':                  'rivian-r1t.jpg',
    'Rolls Royce Spectre':     'rolls-royce-spectre.jpg',
    'Rolls Royce':             'rolls-royce-spectre.jpg',
    'Subaru WRX':              'subaru-wrx.jpg',
    'Subaru':                  'subaru-wrx.jpg',
    'Tesla Model S':           'tesla-model-s.jpg',
    'Tesla Model 3':           'tesla-model-s.jpg',
    'Tesla':                   'tesla-model-s.jpg',
    'Toyota GR Supra':         'toyota-gr-corolla.jpg',
    'Toyota Supra':            'toyota-gr-corolla.jpg',
    'Toyota Crown':            'toyota-gr-corolla.jpg',
    'Toyota':                  'toyota-gr-corolla.jpg',
    'Volkswagen Golf':         'volkswagen-golf-r.jpg',
    'Volkswagen':              'volkswagen-golf-r.jpg',
    'Audi RS7':                'audi-rs7.jpg',
    'Audi':                    'audi-rs7.jpg',
    'Haval H6':                'haval-h6.jpg',
    'Haval':                   'haval-h6.jpg',
    'MG HS':                   'mg-hs.jpg',
    'MG':                      'mg-hs.jpg',
    'BYD K9':                  'byd-k9.jpg',
    'BYD':                     'byd-k9.jpg',
    // Bikes
    'Ducati Panigale V4':      'ducati-panigale.jpg',
    'Ducati Panigale':         'ducati-panigale.jpg',
    'Ducati':                  'ducati-panigale.jpg',
    'Yamaha YZF-R1':           'yamaha-r1.jpg',
    'Yamaha YZF':              'yamaha-r1.jpg',
    'Yamaha':                  'yamaha-r1.jpg',
    'Kawasaki Ninja ZX-6R':    'kawasaki-ninja.jpg',
    'Kawasaki Ninja':          'kawasaki-ninja.jpg',
    'Kawasaki':                'kawasaki-ninja.jpg',
    'Suzuki GSX-R1000':        'suzuki-gsxr.jpg',
    'Suzuki GSX':              'suzuki-gsxr.jpg',
    'Suzuki':                  'suzuki-gsxr.jpg',
    'Honda CBR1000RR':         'honda-cbr1000.jpg',
    'Harley-Davidson':         'harley-davidson.jpg',
    'Triumph Speed Triple':    'triumph-speed-triple.jpg',
    'Triumph':                 'triumph-speed-triple.jpg',
    'KTM':                     'ktm-super-duke.jpg',
    'Royal Enfield Interceptor':'royal-enfield.jpg',
    'Royal Enfield':           'royal-enfield.jpg',
    'Zero':                    'zero-srf.jpg',
    // Buses
    'Volvo 9700':              'volvo-9700.jpg',
    'Volvo Coach':             'volvo-9700.jpg',
    'Volvo':                   'volvo-9700.jpg',
    'Scania':                  'volvo-9700.jpg',
    'MAN':                     'mercedes-citaro.jpg',
    'Alexander Dennis':        'alexander-dennis.jpg',
    'New Flyer':               'mercedes-citaro.jpg',
    'Gillig':                  'mercedes-citaro.jpg',
    'Wrightbus':               'mercedes-citaro.jpg',
    'Yutong':                  'yutong-e12.jpg',
};

let script = fs.readFileSync(SCRIPT_PATH, 'utf8');
let updated = 0;
let skipped = 0;

// Find the imageDatabase block and replace all Wikipedia URLs with local paths
for (const [key, file] of Object.entries(localMap)) {
    const localPath = path.join(ASSETS_DIR, file);
    if (!fs.existsSync(localPath) || fs.statSync(localPath).size < 1000) {
        skipped++;
        continue;
    }
    // Replace the URL value for this key in imageDatabase
    // Pattern: "Key": "https://...jpg"
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`("${escapedKey}"\\s*:\\s*)"https://[^"]*"`, 'g');
    const newVal = `$1"assets/vehicles/${file}"`;
    const before = script;
    script = script.replace(regex, newVal);
    if (script !== before) updated++;
}

fs.writeFileSync(SCRIPT_PATH, script, 'utf8');
console.log(`\n✅ Updated ${updated} image paths to local assets`);
console.log(`⚠️  Skipped ${skipped} (image not downloaded or too small)`);
console.log(`\n🎉 Done! Refresh index.html to see local images.\n`);
