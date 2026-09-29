import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const revalidate = 0;

export default async function ReaderPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const { data: book, error } = await supabase
    .from("books")
    .select("id, title, author, description, file_path, file_url")
    .eq("id", id)
    .single();

  if (error || !book) {
    return notFound();
  }

  let readUrl = book.file_url;
  if (!readUrl && book.file_path) {
    const { data } = supabase.storage.from("ebooks").getPublicUrl(book.file_path);
    readUrl = data.publicUrl;
  }

  let htmlContent = "";
  if (readUrl) {
    try {
      const res = await fetch(readUrl, { cache: "no-store" });
      if (res.ok) {
        htmlContent = await res.text();
      }
    } catch (e) {
      console.error("HTML fetch error:", e);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", backgroundColor: "#0b0f17", zIndex: 9999 }}>
      {/* Top Header */}
      <header style={{ height: "50px", padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #222", backgroundColor: "#05070a", flexShrink: 0 }}>
        <Link href="/" style={{ color: "#aaa", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}>
          ← Back
        </Link>
        <span style={{ fontSize: "14px", fontWeight: "bold", color: "#fff", maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {book.title}
        </span>
        <span style={{ fontSize: "12px", color: "#888" }}>
          {book.author}
        </span>
      </header>

      {/* Full Screen Reader Body */}
      <main style={{ flex: 1, width: "100%", height: "calc(100% - 50px)", position: "relative" }}>
        {htmlContent ? (
          <iframe
            srcDoc={htmlContent}
            title={book.title}
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          />
        ) : (
          <iframe
            src={readUrl}
            title={book.title}
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          />
        )}
      </main>
    </div>
  );
          }
            
