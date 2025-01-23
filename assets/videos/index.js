import { sortFiles, ALT } from '../util';

const DEFAULT_VIDEO_PROPS = {
  // Add any story-default video props here
};

const DEFAULT_IMAGE_PROPS = {
  imageService: import.meta.env.MODE === 'production',
  // Add any other story-default video still props here
};

const videos = sortFiles(import.meta.glob('./**/*.mp4*', { eager: true })).reduce(
  (dict, [file, src]) => {
    const [, name, size, isStill] = file.match(
      /\/([-_\w]+)\.?([A-Z]+)?\.mp4(\.jpe?g|\.png|\.gif)?$/
    );

    const fields = dict[name] || { ...DEFAULT_VIDEO_PROPS };

    if (isStill) {
      // ".mp4.jpg" files are the first frame stills
      fields.image = fields.image || {
        ...DEFAULT_IMAGE_PROPS,
        alt: ALT[name] || '',
      };

      if (size) {
        // Configure sized images like "<name>.M.mp4.jpg"
        if (!fields.image.sources) fields.image.sources = {};
        fields.image.sources[size] = src;
      } else {
        // Default images like "<name>.mp4.jpg"
        fields.image.src = src;
      }
    } else if (size) {
      // Configure sized videos like "<name>.M.mp4"
      if (!fields.sources) fields.sources = {};
      fields.sources[size] = src;
    } else {
      // Default videos like "<name>.mp4"
      fields.src = src;
    }

    return {
      ...dict,
      [name]: fields,
    };
  },
  {}
);

export default videos;
