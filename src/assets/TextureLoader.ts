import * as THREE from 'three';

export interface PreloadOptions {
  filter?: 'nearest' | 'linear';
  onProgress?: (loaded: number, total: number) => void;
}

export async function preloadTextures(
  urls: readonly string[],
  opts: PreloadOptions = {},
): Promise<Map<string, THREE.Texture>> {
  const loader = new THREE.TextureLoader();
  const filter = opts.filter === 'nearest' ? THREE.NearestFilter : THREE.LinearFilter;
  const total = urls.length;
  let loaded = 0;

  const entries = await Promise.all(
    urls.map(
      (url) =>
        new Promise<[string, THREE.Texture]>((resolve, reject) => {
          loader.load(
            url,
            (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace;
              tex.magFilter = filter;
              tex.minFilter = filter;
              tex.wrapS = THREE.ClampToEdgeWrapping;
              tex.wrapT = THREE.ClampToEdgeWrapping;
              loaded += 1;
              opts.onProgress?.(loaded, total);
              resolve([url, tex]);
            },
            undefined,
            (err) => reject(new Error(`Failed to load ${url}: ${String(err)}`)),
          );
        }),
    ),
  );

  return new Map(entries);
}
