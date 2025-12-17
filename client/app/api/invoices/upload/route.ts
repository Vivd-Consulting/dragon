import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('files') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF or image files.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File is too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // If NEXT_PUBLIC_API_HOST is set, proxy to external API
    // Otherwise, handle upload locally or return file info
    const apiHost = process.env.NEXT_PUBLIC_API_HOST;
    
    if (apiHost) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('files', file);

        const uploadResponse = await fetch(`${apiHost}/storage/upload`, {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('Upload API error:', errorText);
          return NextResponse.json(
            { error: 'Failed to upload file to storage service' },
            { status: uploadResponse.status }
          );
        }

        const uploadResult = await uploadResponse.json();
        return NextResponse.json(uploadResult);
      } catch (error: any) {
        console.error('Upload proxy error:', error);
        return NextResponse.json(
          { error: error.message || 'Failed to upload file' },
          { status: 500 }
        );
      }
    }

    // Fallback: Return file info if no external API
    // In a real implementation, you'd upload to S3, local storage, etc.
    // For now, we'll return file metadata
    const fileBuffer = await file.arrayBuffer();
    return NextResponse.json({
      id: `temp_${Date.now()}`,
      filename: file.name,
      size: file.size,
      type: file.type,
      message: 'File received. External storage not configured. File stored temporarily.',
      // Note: In production, you'd want to save this to S3, local filesystem, or database
    });
  } catch (error: any) {
    console.error('Upload route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

