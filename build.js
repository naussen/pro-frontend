const fs = require('fs');
const replace = require('replace-in-file');

const templatePath = 'firebase-config.template.js';
const configPath = 'firebase-config.js';

// Copy the template to the new config file
fs.copyFileSync(templatePath, configPath);

const options = [
  {
    files: configPath,
    from: /__API_KEY_NVP__/g,
    to: process.env.API_KEY_NVP,
  },
  {
    files: configPath,
    from: /__API_KEY_PRO__/g,
    to: process.env.API_KEY_PRO,
  },
];

(async () => {
  try {
    const results = await Promise.all(options.map(option => replace(option)));
    console.log('Replacement results:', results);
  } catch (error) {
    console.error('Error occurred:', error);
  }
})();