import Image from '@tiptap/extension-image';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import ImageResizeComponent from './NodeImageResize.vue';

export const ImageResize = Image.extend({
  name: 'imageResize',

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attrs) => ({
          style: attrs.width ? `max-width: ${attrs.width}px; width: 100%;` : null
        })
      },
      height: {
        default: null,
        renderHTML: (attrs) => ({
          style: attrs.height ? `max-height: ${attrs.height}px;` : null
        })
      }
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(ImageResizeComponent);
  }
});

export default ImageResize;
