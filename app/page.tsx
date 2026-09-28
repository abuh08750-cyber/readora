import { supabaseServer } from "@/lib/supabase-server";
import Link from "next/link";

export default async function Home({searchParams}:{searchParams:Promise<{q?:string}>}) {
  const q=(await searchParams).q?.trim()||"";
  const supabase=await supabaseServer();
  let query=supabase.from("books").select("id,title,author,category,cover_path,file_type").eq("published",true).order("created_at",{ascending:false}).limit(40);
  if(q) query=query.or(`title.ilike.%${q}%,author.ilike.%${q}%,category.ilike.%${q}%`);
  const {data:books=[]}=await query;
  return <><header className="top"><div className="brand"><span>R</span>Readora</div><Link href="/admin">Admin</Link></header>
  <main><section className="hero"><div><span className="eyebrow">YOUR DIGITAL READING ROOM</span><h1>Thousands of stories.<br/><i>One beautiful library.</i></h1><p>Discover and read your eBooks in one simple place.</p>
  <form className="search"><input name="q" defaultValue={q} placeholder="Search books, authors or categories…"/><button className="btn">Search</button></form></div><div><div className="panel"><span className="eyebrow">READORA</span><h2>Read anywhere.</h2><p>Private eBook files are delivered through short-lived signed URLs, while public metadata stays searchable.</p></div></div></section>
  <div className="ad">ADVERTISEMENT</div><section className="wrap"><span className="eyebrow">EXPLORE</span><h2>Library</h2><div className="grid">{books.map(b=><article className="card" key={b.id}><div className="cover">{b.title}</div><div className="card-body"><b>{b.title}</b><p>{b.author} · {b.category}</p><Link className="btn" href={`/read/${b.id}`}>Read now →</Link></div></article>)}</div>{!books.length&&<p>No books found.</p>}</section></main></>;
}