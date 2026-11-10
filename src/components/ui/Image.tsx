import NextImage, { type ImageProps } from "next/image";
import { BASE_PATH } from "@/lib/routes";

/**
 * <Image> de Next que, en la publicación estática (GitHub Pages), agrega la subcarpeta del sitio a las
 * imágenes de /public. Sin servidor no hay optimizador de imágenes, y Next no antepone la subcarpeta por sí solo.
 * En desarrollo y en el modo normal no cambia nada.
 */
const STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

export default function Image({ src, ...props }: ImageProps) {
  const prefixed = STATIC_EXPORT && BASE_PATH && typeof src === "string" && src.startsWith("/") && !src.startsWith(`${BASE_PATH}/`) ? `${BASE_PATH}${src}` : src;
  return <NextImage src={prefixed} {...props} />;
}
