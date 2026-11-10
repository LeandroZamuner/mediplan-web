import type { NextConfig } from "next";

/**
 * Dos modos de compilación:
 *
 *  - Normal (desarrollo, Vercel, un servidor Node): Next reenvía /api/* a la API de Go (sin CORS)
 *    y optimiza las imágenes.
 *  - Estático (STATIC_EXPORT=true, para GitHub Pages): se genera la carpeta `out/` con HTML puro.
 *    No hay servidor, así que no existen el reenvío de /api/* ni la optimización de imágenes:
 *    el navegador llama directo a la API (NEXT_PUBLIC_API_URL, con CORS en la API) y el sitio vive
 *    bajo una subcarpeta (NEXT_PUBLIC_BASE_PATH, por ejemplo "/mediplan").
 */
const isStaticExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const API_URL = process.env.API_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = isStaticExport
  ? {
      output: "export",
      env: { NEXT_PUBLIC_STATIC_EXPORT: "true" },
      trailingSlash: true, // /planes/ → planes/index.html: Pages lo sirve sin reglas especiales
      images: { unoptimized: true },
      ...(basePath ? { basePath } : {}),
    }
  : {
      cacheComponents: true,
      partialPrefetching: true,
      // El panel depende de la sesión del navegador (Firebase): la validación automática de "navegación
      // instantánea" de Next no aplica. Solo se validan las rutas que lo pidan con `export const instant`.
      experimental: { instantInsights: { validationLevel: "manual-warning" } },
      async rewrites() {
        return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
      },
    };

export default nextConfig;
