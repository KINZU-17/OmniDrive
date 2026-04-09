const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'assets/vehicles');
const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|webp|png)$/i.test(f));

let saved = 0, count = 0;

(async () => {
  for (const file of files) {
    const fp = path.join(dir, file);
    const orig = fs.statSync(fp).size;
    const tmp = fp + '.tmp';

    try {
      await sharp(fp)
        .resize({ width: 800, withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(tmp);

      const newSize = fs.statSync(tmp).size;
      fs.renameSync(tmp, fp);
      saved += orig - newSize;
      count++;
      console.log(`✓ ${file}: ${(orig/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB`);
    } catch (e) {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      console.error(`✗ ${file}: ${e.message}`);
    }
  }

  console.log(`\nDone: ${count} images, saved ${(saved/1024/1024).toFixed(2)}MB`);
})();
