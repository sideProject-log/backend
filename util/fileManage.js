const { createClient } = require("@supabase/supabase-js");
const parseDataURL = require("data-urls");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET
);

async function uploadFile(file, name) {
  const path = `/public/${Date.now()}-${name}`;

  const fileData = parseDataURL(file).body;

  const { data, error } = await supabase.storage
    .from("Images")
    .upload(path, fileData, {
      contentType: "image/webp",
    });

  if (!error) {
    const url = await getFileUrl(path);
    return { name, url: url.url };
  } else {
    console.warn(error);
    return error;
  }
}

async function getFileUrl(name) {
  const { data, error } = supabase.storage.from("Images").getPublicUrl(name);

  if (!error) {
    console.log(data);
    return { name, url: data.publicUrl };
  } else {
    console.warn(error);
    return error;
  }
}

module.exports = { uploadFile, getFileUrl };
