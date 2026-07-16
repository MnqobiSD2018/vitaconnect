import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // TODO: Upload to Supabase Storage bucket
    // const supabase = await createClient();
    // const { data, error } = await supabase.storage
    //   .from('uploads')
    //   .upload(`${Date.now()}-${file.name}`, buffer, {
    //     contentType: file.type,
    //   });

    return NextResponse.json({
      url: `/uploads/${file.name}`,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 400 });
  }
}
