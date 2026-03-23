const { google } = require("googleapis");
const cheerio = require("cheerio");
const { PrismaClient } = require("@prisma/client");
const path = require("path");

const prisma = new PrismaClient();

const auth = process.env.GOOGLE_SERVICE_ACCOUNT
  ? new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    })
  : new google.auth.GoogleAuth({
      keyFile: path.join(
        __dirname,
        "../../steady-shard-428702-m8-b6681c9927cd.json",
      ),
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
const drive = google.drive({ version: "v3", auth });
const FOLDER_ID = "1fz92FX4zca2i4jJuox2psRFXLc3Ac_Lq";

function extractFromOpalJson(jsonData) {
  try {
    const parsed =
      typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

    // Get the base64 HTML from Opal's output structure
    const parts = parsed?.finalOutputValues?.context?.[0]?.parts || [];

    for (const part of parts) {
      if (part?.inlineData?.mimeType === "text/html") {
        const html = Buffer.from(part.inlineData.data, "base64").toString(
          "utf-8",
        );

        const $ = cheerio.load(html);

        const title =
          $("title").text().trim() ||
          $("h1").first().text().trim() ||
          "Untitled Blog Post";

        const excerpt =
          $("p").first().text().trim().slice(0, 300) || "Read more...";

        const content = $("body").html() || html;

        return { title, excerpt, content };
      }
    }
  } catch (err) {
    console.error("Parse error:", err.message);
  }
  return null;
}

async function syncBlogsFromDrive() {
  try {
    console.log("🔄 Syncing blogs from Drive...");

    const { data } = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed=false`,
      fields: "files(id, name, createdTime, mimeType)",
      orderBy: "createdTime desc",
    });

    const files = data.files || [];
    console.log(`📁 Found ${files.length} files in Drive folder`);

    for (const file of files) {
      // Skip if already synced
      const existing = await prisma.blog.findUnique({
        where: { driveId: file.id },
      });
      if (existing) {
        console.log(`⏭️  Already synced: ${file.name}`);
        continue;
      }

      // Download file content
      const res = await drive.files.get(
        { fileId: file.id, alt: "media" },
        { responseType: "text" },
      );

      // Parse Opal JSON structure
      const extracted = extractFromOpalJson(res.data);

      if (!extracted) {
        console.log(`⚠️  Could not parse: ${file.name}`);
        continue;
      }

      const { title, excerpt, content } = extracted;

      // Generate unique slug
      const slug =
        title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim() +
        "-" +
        Date.now();

      await prisma.blog.create({
        data: {
          driveId: file.id,
          title,
          slug,
          author: "Dreamers Softtech",
          category: "General",
          excerpt,
          content,
          status: "draft",
          tags: "",
        },
      });

      console.log(`✅ Synced: ${title}`);
    }

    console.log("✅ Sync complete");
  } catch (error) {
    console.error("❌ Blog sync error:", error.message);
  }
}

module.exports = { syncBlogsFromDrive };
