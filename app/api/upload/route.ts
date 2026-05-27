import { writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {

    const formData =
      await req.formData();

    const file =
      formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file uploaded",
        },
        { status: 400 }
      );
    }

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    const filename =
      `${Date.now()}-${file.name}`;

    const uploadPath = path.join(
      process.cwd(),
      "public/uploads",
      filename
    );

    await writeFile(
      uploadPath,
      buffer
    );

    return NextResponse.json({
      success: true,
      fileUrl:
        `/uploads/${filename}`,
    });

  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Upload failed",
      },
      { status: 500 }
    );
  }
}