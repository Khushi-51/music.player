

const fs = require('fs');
const path = require('path');
const https = require('https');

// Default images to download if they don't exist
const defaultImages = [
  {
    path: path.join(__dirname, '../public/uploads/images/default-cover.png'),
    url: 'https://cdn.pixabay.com/photo/2018/09/17/14/27/headphones-3683983_1280.jpg'
  },
  {
    path: path.join(__dirname, '../public/uploads/images/default-profile.png'),
    url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
  },
  {
    path: path.join(__dirname, '../public/uploads/images/default-playlist.png'),
    url: 'https://cdn.pixabay.com/photo/2018/01/12/16/15/play-3078425_1280.png'
  }
];

/**
 * Download an image from a URL to a local path
 * @param {string} url - The URL of the image
 * @param {string} filepath - The destination file path
 * @returns {Promise} A promise that resolves when the download is complete
 */
const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    // Create the directory if it doesn't exist
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // If the file already exists, skip download
    if (fs.existsSync(filepath)) {
      console.log(`File already exists: ${filepath}`);
      return resolve();
    }

    // Download the file
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image, status code: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${filepath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file if download failed
      reject(err);
    });

    file.on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file if there was an error
      reject(err);
    });
  });
};

/**
 * Download all default images
 */
const downloadDefaultImages = async () => {
  try {
    console.log('Downloading default images...');

    const promises = defaultImages.map(image =>
      downloadImage(image.url, image.path)
    );

    await Promise.all(promises);

    console.log('All default images downloaded successfully');
  } catch (error) {
    console.error('Error downloading default images:', error);
  }
};

// Export the function
module.exports = downloadDefaultImages;

// Run the function if this file is executed directly
if (require.main === module) {
  downloadDefaultImages();
}
