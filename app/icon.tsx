import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export const size = {
    width: 32,
    height: 32,
};

export const contentType = "image/png";

export default async function Icon() {
    const logoFile = await readFile(path.join(process.cwd(), "public", "RRLogo.png"));
    const logoSrc = `data:image/png;base64,${logoFile.toString("base64")}`;

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "transparent",
                }}
            >
                <img
                    src={logoSrc}
                    alt="R&R"
                    style={{
                        width: "70%",
                        height: "70%",
                        objectFit: "contain",
                    }}
                />
            </div>
        ),
        {
            ...size,
        }
    );
}
