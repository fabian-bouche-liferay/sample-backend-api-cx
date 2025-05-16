import { defineConfig } from 'vite';
import path from 'path';

const local = process.env.LOCAL_DEV === 'true';

export default defineConfig({
    plugins: [],
    root: path.resolve('__dirname'),
    server: {
      open: '/index.html', // opens localhost:5173/index.html
    },
    build: {
        rollupOptions: {
            external: local
                ? []  
                : [
                    '@clayui/*',
                    'react',
                    'react-dom'
                ]
        },
        outDir: path.resolve(__dirname, 'build/static'),
        emptyOutDir: true,
        assetsDir: 'assets',
    }
});