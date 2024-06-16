import sharp from "sharp";

export default eventHandler(async (event) => {
  const query = getQuery(event);
  const imageUrl = query.url;
  const headers = getRequestURL(event);
  console.log(headers);
  const allowedRequesters = [
    "https://modrinth.com",
    "https://worldwidepixel.ca",
    "https://wsrv.nl",
    "http://localhost:3000",
  ];
  if (allowedRequesters.includes(headers.origin)) {
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
    setResponseStatus(event, 403, "Forbidden");
    return "You do not have access to this resource.";
  }
});
