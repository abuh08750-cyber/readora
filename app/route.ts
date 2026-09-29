import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req:Request){
 const supabase=await supabaseServer();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user) return NextResponse.json({error:"Unauthorized"},{status:401});
 const {data:admin}=await supabase.from("admins").select("user_id").eq("user_id",user.id).maybeSingle();
 if(!admin) return NextResponse.json({error:"Forbidden"},{status:403});
 const form=await req.formData();
 const title=String(form.get("title")||"").trim(), author=String(form.get("author")||"").trim(), category=String(form.get("category")||"General").trim();
 const description=String(form.get("description")||"");
 const ebook=form.get("ebook"), cover=form.get("cover");
 if(!title||!author||!(ebook instanceof File)) return NextResponse.json({error:"Title, author and eBook file are required."},{status:400});
 const ext=ebook.name.toLowerCase().endsWith(".epub")?"epub":"pdf";
 if(!["pdf","epub"].includes(ext)) return NextResponse.json({error:"Only PDF and EPUB files are allowed."},{status:400});
 if(ebook.size>50*1024*1024) return NextResponse.json({error:"eBook must be 50MB or smaller."},{status:400});
 const id=crypto.randomUUID(), filePath=`${user.id}/${id}.${ext}`;
 const up=await supabaseAdmin.storage.from("ebooks").upload(filePath,ebook,{contentType:ebook.type||`application/${ext}`,upsert:false});
 if(up.error) return NextResponse.json({error:up.error.message},{status:500});
 let coverPath:string|null=null;
 if(cover instanceof File && cover.size){
  if(cover.size>5*1024*1024) return NextResponse.json({error:"Cover must be 5MB or smaller."},{status:400});
  const ce=cover.name.split(".").pop()?.toLowerCase()||"jpg";
  coverPath=`${user.id}/${id}.${ce}`;
  const cu=await supabaseAdmin.storage.from("covers").upload(coverPath,cover,{contentType:cover.type||"image/jpeg",upsert:false});
  if(cu.error) return NextResponse.json({error:cu.error.message},{status:500});
 }
 const ins=await supabaseAdmin.from("books").insert({id,title,author,category,description,file_path:filePath,file_type:ext,cover_path:coverPath,created_by:user.id,published:true});
 if(ins.error){await supabaseAdmin.storage.from("ebooks").remove([filePath]);if(coverPath)await supabaseAdmin.storage.from("covers").remove([coverPath]);return NextResponse.json({error:ins.error.message},{status:500});}
 return NextResponse.json({ok:true,id});
}