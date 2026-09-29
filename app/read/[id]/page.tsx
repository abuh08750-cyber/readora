import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReaderPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const { data: book, error } = await supabase
    .from("books")
    .select("id, title, author, description, file_path")
    .eq("id", id)
    .single();

  if (error || !book) {
    notFound();
  }

  const { data: fileData, error: fileError } = await supabase
    .storage
    .from("ebooks")
    .createSignedUrl(book.file_path, 60 * 60);

  if (fileError || !fileData?.signedUrl) {
    return (
      <main className="wrap">
        <Link href="/">← Back to Readora</Link>

        <h1>{book.title}</h1>

        <p>
          The ebook file could not be opened right now.
        </p>
      </main>
    );
  }

  return (
    <main className="wrap">
      <Link href="/">← Back to Readora</Link>

      <div className="panel">
        <span className="eyebrow">READORA</span>

        <h1>{book.title}</h1>

        <p>
          <strong>Author:</strong> {book.author}
        </p>

        {book.description && <p>{book.description}</p>}

        <div style={{ marginTop: "24px" }}>
          <a
            href={fileData.signedUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open eBook
          </a>
        </div>
      </div>
    </main>
  );
          }
          
