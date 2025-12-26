const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");

async function sliceSprites(imagePath, outputDir) {
  try {
    console.log(`Reading image from: ${imagePath}`);
    const image = await Jimp.read(imagePath);
    const width = image.getWidth();
    const height = image.getHeight();

    // Assume top-left pixel is background color
    const bgColor = image.getPixelColor(0, 0);
    console.log(`Background color detected: ${bgColor.toString(16)}`);

    const visited = new Set();
    const sprites = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const key = `${x},${y}`;
        if (visited.has(key)) continue;

        const pixelColor = image.getPixelColor(x, y);
        if (pixelColor === bgColor) {
          visited.add(key);
          continue;
        }

        // Found a new sprite, start BFS to find its bounds
        let minX = x,
          maxX = x,
          minY = y,
          maxY = y;
        const stack = [[x, y]];
        visited.add(key);

        while (stack.length > 0) {
          const [cx, cy] = stack.pop();

          minX = Math.min(minX, cx);
          maxX = Math.max(maxX, cx);
          minY = Math.min(minY, cy);
          maxY = Math.max(maxY, cy);

          // Check neighbors
          const neighbors = [
            [cx - 1, cy],
            [cx + 1, cy],
            [cx, cy - 1],
            [cx, cy + 1],
          ];

          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nKey = `${nx},${ny}`;
              if (!visited.has(nKey)) {
                const nColor = image.getPixelColor(nx, ny);
                if (nColor !== bgColor) {
                  visited.add(nKey);
                  stack.push([nx, ny]);
                }
              }
            }
          }
        }

        sprites.push({
          x: minX,
          y: minY,
          w: maxX - minX + 1,
          h: maxY - minY + 1,
        });
      }
    }

    console.log(`Found ${sprites.length} sprites.`);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save each sprite
    for (let i = 0; i < sprites.length; i++) {
      const { x, y, w, h } = sprites[i];
      const sprite = image.clone().crop(x, y, w, h);

      // Optional: Make background transparent if needed,
      // but usually cropping excludes the background if the logic is tight.
      // However, the internal "holes" (like between arms and body) might still have bgColor.
      // Let's replace bgColor with transparent in the cropped sprite.

      sprite.scan(0, 0, w, h, function (sx, sy, idx) {
        const color = this.getPixelColor(sx, sy);
        if (color === bgColor) {
          this.setPixelColor(0x00000000, sx, sy); // Fully transparent
        }
      });

      const fileName = `sprite_${i}.png`;
      const outFile = path.join(outputDir, fileName);
      await sprite.writeAsync(outFile);
      // console.log(`Saved ${fileName}`);
    }
    console.log(`All sprites saved to ${outputDir}`);
  } catch (err) {
    console.error("Error processing image:", err);
  }
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("Usage: node slice_sprites.js <image_path> <output_dir>");
} else {
  sliceSprites(args[0], args[1]);
}
