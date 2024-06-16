import sharp from "sharp";

export default eventHandler(async (event) => {
  const query = getQuery(event);
  const imageUrl = query.url;

  const allowedImageHosts = [
    "https://modrinth.com",
    "http://modrinth.com",
    "https://cdn.modrinth.com",
    "http://cdn.modrinth.com",
    "https://worldwidepixel.ca",
    "http://worldwidepixel.ca",
    "https://raw.theclashfruit.me",
    "http://raw.theclashfruit.me",
    "https://badger.worldwidepixel.ca",
    "http://badger.worldwidepixel.ca",
  ];
  if (allowedImageHosts.includes(imageUrl.toString())) {
    if (imageUrl === null) {
      throw createError({
        statusCode: 500,
        statusMessage: "Image not provided",
      });
    }
    const image = await fetch(imageUrl.toString());
    const imageBuffer = await image.arrayBuffer();
    const radius = query.r;

    setHeader(event, "Content-Type", "image/png");
    let baseImage = sharp(imageBuffer).png().blur(10);
    const baseMetadata = await baseImage.metadata();

    const negative = Buffer.from(
      `<svg><rect x="0" y="0" width="${baseMetadata.width}" height="${baseMetadata.height}" rx="${radius}" ry="${radius}"/></svg>`
    );

    const roundedImage = sharp(imageBuffer)
      .png()
      .composite([{ input: negative, blend: "dest-in" }]);

    return roundedImage;
  } else {
    setResponseStatus(event, 406, "Not Acceptable");
    return "The image URL provided is not allowed.";
  }
});
