import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";

export const revalidate = 0; // Taaki nayi upload hui book turant dikhe

export default async function HomePage() {
  const supabase = await supabaseServer();

  const { data: books, error } = await supabase
    .from("books")
    .select("id, title, author, cover_url")
    .order("created_at", { ascending: false });

  return (
    <main style={{ maxWidth: "600px", margin: "40px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <header style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "36px", marginBottom: "8px" }}>Readora</h1>
        <p style={{ color: "#666" }}>Free Legal & Public Domain Books</p>
      </header>

      <section>
        <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>Available Books</h2>

        {(!books || books.length === 0) ? (
          <p>No books available yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {books.map((book) => (
              <div
                key={book.id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: "10px",
                  padding: "16px",
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}
              >
                {book.cover_url && (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    style={{
                      width: "100%",
                      maxHeight: "240px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      marginBottom: "12px"
                    }}
                  />
                )}

                <h3 style={{ margin: "0 0 4px 0", fontSize: "18px" }}>{book.title}</h3>
                <p style={{ margin: "0 0 16px 0", color: "#666", fontSize: "14px" }}>{book.author}</p>

                {/* Sahi dynamic reader link */}
                <Link
                  href={`/read/${book.id}`}
                  style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    backgroundColor: "#000",
                    color: "#fff",
                    textDecoration: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
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
