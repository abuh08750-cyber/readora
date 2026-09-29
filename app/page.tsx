import { supabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function Reader({params}:{params:Promise<{id:string}>}) {
  const {id}=await params; const supabase=await supabaseServer();
  const {data:book}=await supabase.from("books").select("id,title,author,category,file_type,file_path").eq("id",id).eq("published",true).single();
  if(!book) notFound();
  const {data}=await supabase.storage.from("ebooks").createSignedUrl(book.file_path,600);
  return <><header className="top"><Link href="/">← Readora</Link><span>{book.title}</span></header>
  <div className="ad">ADVERTISEMENT</div><main className="reader"><div className="toolbar"><div><span className="eyebrow">NOW READING</span><h2>{book.title}</h2><p>{book.author} · {book.category}</p></div>{data?.signedUrl&&<a className="btn" href={data.signedUrl} target="_blank">Open file</a>}</div>
  <div className="paper"><h2>{book.title}</h2><p>This reader delivers your licensed/public-domain eBook through a temporary signed URL. For PDFs, the browser can open the file directly. EPUB support can be added with an EPUB.js reader component.</p><p>Signed access expires automatically for security.</p></div></main></>;
}