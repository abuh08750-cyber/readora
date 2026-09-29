import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params; const supabase=await supabaseServer();
 const {data:book}=await supabase.from("books").select("file_path,published").eq("id",id).single();
 if(!book||!book.published)return NextResponse.json({error:"Not found"},{status:404});
 const {data,error}=await supabase.storage.from("ebooks").createSignedUrl(book.file_path,600);
 if(error||!data?.signedUrl)return NextResponse.json({error:"File unavailable"},{status:404});
 return NextResponse.redirect(data.signedUrl);
}