import { useState, useEffect } from "react";

const colorCache = new Map<string, string>();

function getDominantEdgeColor(imageSrc: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("#ffffff");
        return;
      }

      const width = img.width;
      const height = img.height;
      const sampleSize = 10;

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0);

      const colors: number[][] = [];

      for (let i = 0; i < sampleSize; i++) {
        const topPixel = ctx.getImageData(
          Math.floor((width * i) / sampleSize),
          0,
          1,
          1
        ).data;
        colors.push([topPixel[0], topPixel[1], topPixel[2]]);

        const bottomPixel = ctx.getImageData(
          Math.floor((width * i) / sampleSize),
          height - 1,
          1,
          1
        ).data;
        colors.push([bottomPixel[0], bottomPixel[1], bottomPixel[2]]);

        const leftPixel = ctx.getImageData(
          0,
          Math.floor((height * i) / sampleSize),
          1,
          1
        ).data;
        colors.push([leftPixel[0], leftPixel[1], leftPixel[2]]);

        const rightPixel = ctx.getImageData(
          width - 1,
          Math.floor((height * i) / sampleSize),
          1,
          1
        ).data;
        colors.push([rightPixel[0], rightPixel[1], rightPixel[2]]);
      }

      const avgR = Math.round(colors.reduce((sum, c) => sum + c[0], 0) / colors.length);
      const avgG = Math.round(colors.reduce((sum, c) => sum + c[1], 0) / colors.length);
      const avgB = Math.round(colors.reduce((sum, c) => sum + c[2], 0) / colors.length);

      const hex = `#${avgR.toString(16).padStart(2, "0")}${avgG.toString(16).padStart(2, "0")}${avgB.toString(16).padStart(2, "0")}`;
      
      colorCache.set(imageSrc, hex);
      resolve(hex);
    };

    img.onerror = () => {
      resolve("#ffffff");
    };

    img.src = imageSrc;
  });
}

export function useImageBorderColor(imageSrc: string | undefined) {
  const [borderColor, setBorderColor] = useState<string>("#ffffff");

  useEffect(() => {
    if (!imageSrc) {
      setBorderColor("#ffffff");
      return;
    }

    if (colorCache.has(imageSrc)) {
      setBorderColor(colorCache.get(imageSrc)!);
      return;
    }

    setBorderColor("#ffffff");

    getDominantEdgeColor(imageSrc).then((color) => {
      setBorderColor(color);
    });
  }, [imageSrc]);

  return borderColor;
}
