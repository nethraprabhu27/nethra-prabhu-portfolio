import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// The preview image shown when the site is shared (LinkedIn, Slack, iMessage, email, search results).
// Generated once at build time. To check it locally, open /opengraph-image in the browser.

export const alt = "Nethra Prabhu: Product & Product Marketing, Healthtech";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

// JPG copies of public/art/hero-desk-scene.webp and nethra-headshot-hd2.webp (the image renderer can't read .webp).
const asDataUri = async (file: string) =>
  `data:image/jpeg;base64,${(await readFile(join(process.cwd(), "app/_og", file))).toString("base64")}`;

// The renderer only supports explicit offsets/sizes for absolutely positioned layers (no `inset`).
const fill = { position: "absolute", top: 0, left: 0, width: size.width, height: size.height } as const;

export default async function Image() {
  return new Response(await renderJpeg(), { headers: { "Content-Type": contentType } });
}

// Cached so the image is drawn once at build time instead of on every request.
async function renderJpeg(): Promise<Uint8Array<ArrayBuffer>> {
  "use cache";
  const [background, headshot] = await Promise.all([asDataUri("desk-scene.jpg"), asDataUri("headshot.jpg")]);

  const png = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#120c1c" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> */}
        <img src={background} alt="" width={size.width} height={size.height} style={fill} />
        {/* Darken the left side so the text stays readable; the lit desk stays visible on the right. */}
        <div
          style={{
            ...fill,
            display: "flex",
            backgroundImage:
              "linear-gradient(90deg, rgba(14,9,24,0.97) 0%, rgba(14,9,24,0.92) 45%, rgba(14,9,24,0.45) 70%, rgba(14,9,24,0.08) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: size.height,
            width: 820,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: 72,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> */}
          <img
            src={headshot}
            alt=""
            width={128}
            height={128}
            style={{ borderRadius: 999, border: "4px solid #ff9a3c", marginBottom: 34 }}
          />
          <div style={{ display: "flex", fontSize: 72, color: "#f6eedf", letterSpacing: 4, lineHeight: 1, whiteSpace: "nowrap" }}>
            NETHRA PRABHU
          </div>
          <div style={{ display: "flex", fontSize: 34, color: "#ffad5c", marginTop: 22, whiteSpace: "nowrap" }}>
            Product & Product Marketing · Healthtech
          </div>
          <div style={{ display: "flex", width: 96, height: 3, background: "#ff9a3c", opacity: 0.7, marginTop: 34, marginBottom: 26 }} />
          <div style={{ display: "flex", fontSize: 28, color: "#d9cfe6", whiteSpace: "nowrap" }}>From raw ideas → real impact</div>
        </div>
      </div>
    ),
    { ...size },
  );

  // ImageResponse only outputs PNG (~2 MB for this artwork). JPEG keeps previews well under messaging-app limits.
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  return new Uint8Array(jpeg);
}
