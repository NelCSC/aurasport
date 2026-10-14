import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No se envió ningún archivo de imagen válido.' }, { status: 400 });
    }

    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME ||
      'dornxf4al';
    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      process.env.CLOUDINARY_UPLOAD_PRESET ||
      'aurasport_uploads';

    const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
    const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);

    if (uploadPreset) {
      cloudinaryFormData.append('upload_preset', uploadPreset);
    }

    // If API key is available, add it
    if (cloudinaryApiKey) {
      cloudinaryFormData.append('api_key', cloudinaryApiKey);
    }

    const cloudinaryEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const res = await fetch(cloudinaryEndpoint, {
      method: 'POST',
      body: cloudinaryFormData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error('Cloudinary API upload error:', errorData);
      return NextResponse.json(
        { error: errorData?.error?.message || `Error en Cloudinary (HTTP ${res.status})` },
        { status: res.status }
      );
    }

    const result = await res.json();
    return NextResponse.json({
      success: true,
      url: result.url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    });
  } catch (err: any) {
    console.error('Error in /api/upload route:', err);
    return NextResponse.json(
      { error: err?.message || 'Error interno del servidor al procesar la imagen' },
      { status: 500 }
    );
  }
}
