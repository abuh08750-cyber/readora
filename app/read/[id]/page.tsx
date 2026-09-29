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

  // Book details fetch karna
  const { data: book, error } = await supabase
    .from("books")
    .select("id, title, author, description, file_path, file_url")
    .eq("id", id)
    .single();

  if (error || !book) {
    return notFound();
  }

  // Agar file_url direct hai toh wahi use karo, warna storage se public url banao
  let readUrl = book.file_url;
  if (!readUrl && book.file_path) {
    const { data } = supabase.storage.from("ebooks").getPublicUrl(book.file_path);
    readUrl = data.publicUrl;
  }

  return (
    <main style={{ maxWidth: "680px", margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <Link href="/" style={{ color: "#555", textDecoration: "none", fontSize: "14px", display: "inline-block", marginBottom: "20px" }}>
        ← Back to Readora
      </Link>

      <div style={{ border: "1px solid #eaeaea", borderRadius: "12px", padding: "24px", backgroundColor: "#fff", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
        <span style={{ fontSize: "12px", fontWeight: "bold", color: "#e056fd", letterSpacing: "1px" }}>READORA EBOOK</span>
        <h1 style={{ margin: "12px 0 6px 0", fontSize: "28px" }}>{book.title}</h1>
        <p style={{ margin: "0 0 16px 0", color: "#666", fontSize: "16px" }}>
          <strong>Author:</strong> {book.author}
        </p>

        {book.description && (
          <p style={{ color: "#444", lineHeight: "1.6", borderTop: "1px solid #f0f0f0", paddingTop: "14px", marginTop: "14px" }}>
            {book.description}
          </p>
        )}

        <div style={{ marginTop: "28px" }}>
          <a
            href={readUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              backgroundColor: "#000",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600"
            }}
          >
            Open / Read eBook
          </a>
        </div>
      </div>
    </main>
  );
                }
          
