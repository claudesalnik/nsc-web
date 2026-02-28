import { NextRequest, NextResponse } from 'next/server';

import { PhotoUploadError, processPhotoUpload } from '@/lib/photos/upload-handler';

export { GET, DELETE } from '@/app/api/photos/[vehicleId]/route';

type RouteContext = { params: Promise<{ vehicleId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  let formData: FormData;
  const vehicleId = await resolveVehicleId(context);

  try {
    formData = await request.formData();
  } catch (error) {
    console.error('[nsc/vehicles/photos] Failed to read form data', error);
    return jsonError('Malformed upload payload.');
  }

  try {
    const photos = await processPhotoUpload(formData, { vehicleIdOverride: vehicleId });
    return NextResponse.json({ photos }, { status: 201 });
  } catch (error) {
    if (error instanceof PhotoUploadError) {
      return jsonError(error.message, error.status);
    }

    console.error('[nsc/vehicles/photos] Upload failed', error);
    const message = error instanceof Error ? error.message : 'Failed to upload photo.';
    return jsonError(message, 500);
  }
}

async function resolveVehicleId(context: RouteContext) {
  const { vehicleId } = await context.params;
  return vehicleId;
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
