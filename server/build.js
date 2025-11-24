const path = require('path');
const fs = require('fs');

const { build } = require('esbuild');



const distName = 'dist';
const distPath = path.join(__dirname, '..', distName);

build({
  entryPoints: [
    path.join(__dirname, 'src', 'server.ts')
  ],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: path.join(distPath, 'server.js'),
  format: 'cjs'
}).then(() => {
  // Copy the default settings file.
  const src = path.join(__dirname, 'settings.default.json');
  const dst = path.join(distPath, 'settings.json');
  fs.copyFileSync(src, dst);
})
.catch(() => process.exit(1));