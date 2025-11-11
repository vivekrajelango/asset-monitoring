import { rawData } from '../../data';

export async function GET() {
  return Response.json({
    success: true,
    data: rawData,
    message: 'Assets fetched successfully',
  });
}