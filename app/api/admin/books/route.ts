import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const supabase = await supabaseServer();
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const coverFile = formData.get("cover") as File | null;
    const ebookFile = formData.get("ebook") as File | null;

    if (!title || !author || !category || !ebookFile) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let cover_url = "";
    if (coverFile && coverFile.size > 0) {
      const ext = coverFile.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const { error: coverErr } = await supabase.storage
        .from("covers")
        .upload(path, coverFile);
      if (!coverErr) {
        const { data } = supabase.storage.from("covers").getPublicUrl(path);
        cover_url = data.publicUrl;
      }
    }

    const ebookExt = ebookFile.name.split(".").pop()?.toLowerCase() || "html";
    const ebookPath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ebookExt}`;
    const { error: ebookErr } = await supabase.storage
      .from("ebooks")
      .upload(ebookPath, ebookFile);

    if (ebookErr) {
      return NextResponse.json({ error: ebookErr.message }, { status: 500 });
    }

    const { data: ebookData } = supabase.storage.from("ebooks").getPublicUrl(ebookPath);

    // database insert: file_type, file_path aur file_url sabhi bhej rahe hain
    const { error: dbErr } = await supabase.from("books").insert({
      title,
      author,
      category,
      description,
      cover_url,
      file_path: ebookPath,
      file_url: ebookData.publicUrl,
      file_type: ebookExt,
      published: true
    });

    if (dbErr) {
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
  
