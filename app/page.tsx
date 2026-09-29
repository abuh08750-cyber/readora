import { supabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import AdminForm from "@/components/AdminForm";

export default async function AdminPage(){
 const supabase=await supabaseServer(); const {data:{user}}=await supabase.auth.getUser();
 if(!user) redirect("/");
 const {data:admin}=await supabase.from("admins").select("user_id").eq("user_id",user.id).maybeSingle();
 if(!admin) return <main className="wrap"><h2>Admin access required</h2><p>Your account is signed in, but it is not on the admin allowlist.</p></main>;
 const {data:books=[]}=await supabase.from("books").select("id,title,author,category,published,created_at").order("created_at",{ascending:false});
 return <main className="admin"><span className="eyebrow">READORA</span><h1>Admin dashboard</h1><div className="panel"><AdminForm/></div><div className="panel"><h2>Books</h2><table className="table"><thead><tr><th>Title</th><th>Author</th><th>Category</th><th>Status</th></tr></thead><tbody>{books.map(b=><tr key={b.id}><td>{b.title}</td><td>{b.author}</td><td>{b.category}</td><td>{b.published?"Published":"Draft"}</td></tr>)}</tbody></table></div></main>
}