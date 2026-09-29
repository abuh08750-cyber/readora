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

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#0b0f17", color: "#fff" }}>
      <header style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #222", backgroundColor: "#05070a" }}>
        <Link href="/" style={{ color: "#aaa", textDecoration: "none", fontSize: "14px" }}>
          ← Back to Readora
        </Link>
        <span style={{ fontSize: "15px", fontWeight: "bold" }}>{book.title}</span>
        <span style={{ fontSize: "12px", color: "#888" }}>{book.author}</span>
      </header>

      <div style={{ flex: 1, width: "100%", height: "calc(100vh - 55px)" }}>
        <iframe
          src={readUrl}
          title={book.title}
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </div>
    </main>
  );
}
