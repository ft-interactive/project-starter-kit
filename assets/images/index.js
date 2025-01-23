import { sortFiles, ALT } from '../util';

const DEFAULT_IMAGE_PROPS = {
  imageService: import.meta.env.MODE === 'production',
  // Add any other story-default image props here
  // alt: ''
};

const images = sortFiles(import.meta.glob('./**/*.{png,jpg,jpeg,gif,svg}', { eager: true })).reduce(
  (acc, [k, v]) => {
    const [, name, count, size] =
      k.match(/\/([-_\w]+)\.([0-9]+)?\.?([SMLX]+)?\.?(png|jpe?g|gif)$/) || [];
    const c = parseInt(count || '0', 10);

    if (!acc[name] || (count && !acc[name][c])) {
      const data = {
        ...DEFAULT_IMAGE_PROPS,
        sources: {},
        alt: ALT[name],
      };

      if (count) {
        // Nest array-indexed images like `<name>.1.jpg`, `<name>.2.jpg`
        if (!acc[name]) acc[name] = [];
        acc[name][c] = data;
        if (Array.isArray(data.alt)) acc[name][c].alt = data.alt[c - 1];
      } else {
        acc[name] = data;
      }
    }

    if (count) {
      if (size) {
        acc[name][c].sources[size] = v;
      } else {
        acc[name][c].src = v;
      }
    } else if (size) {
      acc[name].sources[size] = v;
    } else {
      acc[name].src = v;
    }

    return acc;
  },
  {}
);

export default images;
