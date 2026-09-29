"use client";
import { useState } from "react";

export default function AdminForm() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const form = e.currentTarget;
    const body = new FormData(form);
    const r = await fetch("/api/admin/books", { method: "POST", body });
    const j = await r.json();
    setBusy(false);
    setMsg(j.error || "Book uploaded successfully.");
    if (r.ok) form.reset();
  }

  return (
    <form className="form" onSubmit={submit}>
      <input name="title" required placeholder="Book title" />
      <input name="author" required placeholder="Author" />
      <input name="category" required placeholder="Category" />
      <textarea name="description" placeholder="Description" />
      <label>
        Cover image
        <input name="cover" type="file" accept="image/*" />
      </label>
      <label>
        eBook file
        <input name="ebook" type="file" accept=".pdf,.epub,.html" required />
      </label>
      <button className="btn" disabled={busy}>
        {busy ? "Uploading..." : "Upload eBook"}
      </button>
      {msg && <small>{msg}</small>}
    </form>
  );
}
