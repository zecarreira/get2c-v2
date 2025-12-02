import { NextRequest, NextResponse } from "next/server";
import { processExcelFile } from "@/lib/excel-processor";
import { validateExcelFile } from "@/lib/validations/upload";
import { checkRateLimit, getClientIP } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Demasiados pedidos. Tente novamente em ${Math.ceil(
            rateLimit.resetIn / 1000
          )} segundos`,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": Math.ceil(rateLimit.resetIn / 1000).toString(),
          },
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { success: false, error: "Nenhum ficheiro foi enviado" },
        { status: 400 }
      );
    }

    // Validate file with Zod schema
    const validation = validateExcelFile(file);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process the Excel file
    const result = processExcelFile(buffer);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(
      {
        ...result,
        fileName: file.name,
        fileSize: file.size,
      },
      {
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error("Error processing upload:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno ao processar o ficheiro",
      },
      { status: 500 }
    );
  }
}
