import { Image as TiptapImage, type ImageOptions as TiptapImageOptions } from '@tiptap/extension-image';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import TiptapImageView from '@/components/tiptap/ImageView.vue';

export interface ImageAttrsOptions {
  src?: string;
  alt?: string;
  title?: string;
  width?: number | string | null;
}

interface SetImageAttrsOptions extends ImageAttrsOptions {
  /** The source URL of the image. */
  src: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageResize: {
      setImage: (options: Partial<SetImageAttrsOptions>) => ReturnType;
      updateImage: (options: Partial<SetImageAttrsOptions>) => ReturnType;
    };
  }
}

interface ImageOptions extends TiptapImageOptions {
  width?: string | number;
}

export const ImageResize = TiptapImage.extend<ImageOptions>({
  name: 'imageResize',

  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null
      },
      alt: {
        default: null
      },
      width: {
        default: this.options.width
      },
      heigth: {
        default: null
      }
    };
  },

  addOptions() {
    return {
      ...this.parent?.(),
      width: '100%',
      inline: true
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(TiptapImageView);
  },

  addCommands() {
    return {
      ...this.parent?.(),
      updateImage: (options) => ({ commands }) => {
        return commands.updateAttributes(this.name, options);
      }
    };
  }
});
