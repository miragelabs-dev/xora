import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL
            ? process.env.NEXT_PUBLIC_APP_URL
            : "http://localhost:3000";

    if (error) {
        return NextResponse.redirect(`${baseUrl}/settings?tab=integrations&error=${encodeURIComponent(error)}`);
    }

    if (code) {
        return NextResponse.redirect(`${baseUrl}/settings?tab=integrations&code=${encodeURIComponent(code)}`);
    }

    return NextResponse.redirect(`${baseUrl}/settings?tab=integrations`);
}