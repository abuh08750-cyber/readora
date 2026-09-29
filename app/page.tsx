import { supabaseServer } from "@/lib/supabase-server";
import Link from "next/link";

export default async function Home() {
  const supabase = await supabaseServer();
  const { data: books } = await supabase
    .from("books")
    .select("id, title, author, category, cover_path")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Readora</h1>
        <p style={{ color: "#666" }}>Free Legal & Public Domain Books</p>
      </header>

      <section>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Available Books</h2>
        {(!books || books.length === 0) ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", border: "1px dashed #ccc", borderRadius: "8px" }}>
            <p style={{ color: "#888" }}>Abhi koi book publish nahi hui hai. Admin panel se pehli book upload karein!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem" }}>
            {books.map((book) => (
              <div key={book.id} style={{ border: "1px solid #e5e5e5", borderRadius: "8px", padding: "1rem" }}>
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem" }}>{book.title}</h3>
                <p style={{ margin: "0 0 1rem 0", color: "#666", fontSize: "0.9rem" }}>{book.author}</p>
                <Link 
                  href={`/read/${book.id}`}
                  style={{ display: "inline-block", background: "#000", color: "#fff", padding: "0.5rem 1rem", borderRadius: "4px", textDecoration: "none", fontSize: "0.85rem" }}
                >
                  Read Book
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
                }
            
