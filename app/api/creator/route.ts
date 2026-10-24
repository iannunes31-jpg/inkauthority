import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// POST /api/creator — salva ou atualiza um criador + curso
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, bio, photo_url, specialty, instagram, slug,
      course_title, course_subtitle, main_promise, description, target_audience,
      modules, testimonials,
      price, price_installments, price_installment_value, checkout_url, video_id,
    } = body;

    if (!slug || !name || !course_title) {
      return NextResponse.json({ error: "Campos obrigatórios: slug, name, course_title" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Signed-in owner only: before, anyone could overwrite any creator's page (and its checkout link) by slug.
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: owner } = await supabase.from("creator_profiles").select("user_id").eq("slug", slug).maybeSingle();
    if (owner && owner.user_id && owner.user_id !== userId) {
      return NextResponse.json({ error: "Esse endereço já está em uso." }, { status: 403 });
    }

    // 1. Upsert creator profile
    const { data: profile, error: profileErr } = await supabase
      .from("creator_profiles")
      .upsert({ slug, name, bio, photo_url, specialty, instagram, user_id: userId }, { onConflict: "slug" })
      .select()
      .single();

    if (profileErr) throw new Error(`Perfil: ${profileErr.message}`);

    // 2. Upsert course
    const { data: course, error: courseErr } = await supabase
      .from("creator_courses")
      .upsert({
        creator_id: profile.id,
        title: course_title,
        subtitle: course_subtitle,
        main_promise,
        description,
        target_audience,
        price: price ? parseFloat(price) : null,
        price_installments: price_installments ? parseInt(price_installments) : null,
        price_installment_value: price_installment_value ? parseFloat(price_installment_value.replace(",", ".")) : null,
        checkout_url,
        video_id,
        is_published: true,
      }, { onConflict: "creator_id" })
      .select()
      .single();

    if (courseErr) throw new Error(`Curso: ${courseErr.message}`);

    // 3. Replace modules
    await supabase.from("creator_modules").delete().eq("course_id", course.id);
    const cleanModules = (modules as string[])
      .filter((m: string) => m.trim())
      .map((title: string, order_index: number) => ({ course_id: course.id, title, order_index }));
    if (cleanModules.length > 0) {
      const { error: modErr } = await supabase.from("creator_modules").insert(cleanModules);
      if (modErr) throw new Error(`Módulos: ${modErr.message}`);
    }

    // 4. Replace testimonials
    await supabase.from("creator_testimonials").delete().eq("course_id", course.id);
    const cleanTestimonials = (testimonials as any[])
      .filter((t: any) => t.name?.trim() && t.text?.trim())
      .map((t: any) => ({ course_id: course.id, name: t.name, role: t.role, text: t.text, stars: t.stars || 5 }));
    if (cleanTestimonials.length > 0) {
      const { error: testErr } = await supabase.from("creator_testimonials").insert(cleanTestimonials);
      if (testErr) throw new Error(`Depoimentos: ${testErr.message}`);
    }

    return NextResponse.json({ success: true, slug, url: `/c/${slug}` });
  } catch (e: any) {
    console.error("[/api/creator POST]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET /api/creator?slug=xxx ou ?user_id=xxx
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const userId = req.nextUrl.searchParams.get("user_id");

  const supabase = getSupabase();

  if (userId) {
    const { data, error } = await supabase
      .from("creator_profiles")
      .select(`*, creator_courses(*, creator_modules(*), creator_testimonials(*))`)
      .eq("user_id", userId)
      .single();
    if (error || !data) return NextResponse.json({ profile: null });
    return NextResponse.json({ profile: data });
  }

  if (!slug) return NextResponse.json({ error: "slug ou user_id obrigatório" }, { status: 400 });

  const { data, error } = await supabase
    .from("creator_profiles")
    .select(`*, creator_courses(*, creator_modules(*), creator_testimonials(*))`)
    .eq("slug", slug)
    .single();

  if (error || !data) return NextResponse.json({ error: "Criador não encontrado" }, { status: 404 });
  return NextResponse.json(data);
}
