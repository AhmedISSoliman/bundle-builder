import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      // Human-readable, debuggable class names in the DOM, e.g.
      // "ProductCard-card", "ReviewItem-item" — instead of hashed gibberish.
      generateScopedName: (name: string, filename: string) => {
        const component = filename
          .split(/[\\/]/)
          .pop()!
          .replace(/\.module\.css$/, "");
        return `${component}-${name}`;
      },
    },
  },
});
