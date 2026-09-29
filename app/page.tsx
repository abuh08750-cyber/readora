import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = await supabaseServer();

  const { data: books } = await supabase
    .from("books")
    .select("id, title, author, cover_url")
    .order("created_at", { ascending: false });

  return (
    <main style={{ maxWidth: "480px", margin: "0 auto", padding: "32px 16px", fontFamily: "sans-serif" }}>
      <header style={{ textAlign: "center", marginBottom: "28px" }}>
        <h1 style={{ fontSize: "32px", margin: "0 0 6px 0", letterSpacing: "-0.5px" }}>Readora</h1>
        <p style={{ color: "#777", fontSize: "14px", margin: 0 }}>Free Legal & Public Domain Books</p>
      </header>

      <section>
        <h2 style={{ fontSize: "18px", marginBottom: "16px", color: "#333" }}>Available Books</h2>

        {(!books || books.length === 0) ? (
          <p style={{ textAlign: "center", color: "#888" }}>No books available yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {books.map((book) => (
              <div
                key={book.id}
                style={{
                  border: "1px solid #eaeaea",
                  borderRadius: "16px",
                  overflow: "hidden",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                {/* Poora Cover dikhane ke liye container */}
                {book.cover_url && (
                  <div style={{ width: "100%", backgroundColor: "#111", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: "420px",
                        objectFit: "contain",
                        display: "block"
                      }}
                    />
                  </div>
                )}

                <div style={{ padding: "16px" }}>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", color: "#111" }}>{book.title}</h3>
                  <p style={{ margin: "0 0 16px 0", color: "#666", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {book.author}
                  </p>

                  <Link
                    href={`/read/${book.id}`}
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "12px 16px",
                      backgroundColor: "#000",
                      color: "#fff",
                      textDecoration: "none",
                      borderRadius: "8px",
                      fontSize: "15px",
                      fontWeight: "600"
                    }}
                  >
                    Read Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
                    }
                      
