import sharp from "sharp";

export default eventHandler(async (event) => {
  const query = getQuery(event);
  const imageUrl = query.url;
  const image = await fetch(imageUrl.toString());
  const imageBuffer = await image.arrayBuffer();
  const radius = query.r;

  async function toBase64ImageUrl(imgUrl: string): Promise<string> {
    const fetchImageUrl = await fetch(imgUrl);
    const responseArrBuffer = await fetchImageUrl.arrayBuffer();
    const toBase64 = `data:${
      fetchImageUrl.headers.get("Content-Type") || "image/png"
    };base64,${Buffer.from(responseArrBuffer).toString("base64")}`;
    return toBase64;
  }

  setHeader(event, "Content-Type", "image/png");
  let baseImage = sharp(imageBuffer).png().blur(10);
  const baseMetadata = await baseImage.metadata();

  const negative = Buffer.from(
    `<svg><rect x="0" y="0" width="${baseMetadata.width}" height="${baseMetadata.height}" rx="${radius}" ry="50"/></svg>`
  );

  const roundedImage = sharp(imageBuffer)
    .png()
    .composite([{ input: negative, blend: "dest-in" }]);

  return roundedImage;
});
