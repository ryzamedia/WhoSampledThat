import { initWasm, Resvg } from "@resvg/resvg-wasm";
import wasm from "@resvg/resvg-wasm/index_bg.wasm";
// Module initialization is shared; no request data or I/O is retained here.
let initialization;
export async function renderShareImage(svg, fontBuffer) {
  await (initialization ??= initWasm(wasm));
  const renderer = new Resvg(svg, {
    font: {
      fontBuffers: [new Uint8Array(fontBuffer)],
      defaultFontFamily: "DM Sans",
    },
  });
  let image;
  try {
    image = renderer.render();
    return image.asPng();
  } finally {
    image?.free();
    renderer.free();
  }
}
