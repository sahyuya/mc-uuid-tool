export default {

    async fetch(request) {

        const url = new URL(request.url);
        const path = url.pathname;

        const headers = {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*"
        };

        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers
            });
        }

        try {

            // ==========================
            // Java 名前 → UUID
            // ==========================

            if (path.startsWith("/java/name/")) {

                const name =
                    decodeURIComponent(
                        path.substring("/java/name/".length)
                    );

                const response =
                    await fetch(
                        `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(name)}`
                    );

                if (!response.ok) {

                    return Response.json(
                        {
                            success: false,
                            error: "Java player not found"
                        },
                        {
                            status: 404,
                            headers
                        }
                    );
                }

                const data =
                    await response.json();

                const uuidNoDash =
                    data.id;

                const uuid =
                    uuidNoDash.replace(
                        /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
                        "$1-$2-$3-$4-$5"
                    );

                return Response.json(
                    {
                        success: true,
                        platform: "java",
                        name: data.name,
                        uuid,
                        uuidNoDash
                    },
                    {
                        headers
                    }
                );
            }

            // ==========================
            // Java UUID → 名前
            // ==========================

            if (path.startsWith("/java/uuid/")) {

                let uuid =
                    decodeURIComponent(
                        path.substring("/java/uuid/".length)
                    );

                const uuidNoDash =
                    uuid.replaceAll("-", "");

                const response =
                    await fetch(
                        `https://sessionserver.mojang.com/session/minecraft/profile/${uuidNoDash}`
                    );

                if (!response.ok) {

                    return Response.json(
                        {
                            success: false,
                            error: "Java UUID not found"
                        },
                        {
                            status: 404,
                            headers
                        }
                    );
                }

                const data =
                    await response.json();

                uuid =
                    uuidNoDash.replace(
                        /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
                        "$1-$2-$3-$4-$5"
                    );

                return Response.json(
                    {
                        success: true,
                        platform: "java",
                        name: data.name,
                        uuid,
                        uuidNoDash
                    },
                    {
                        headers
                    }
                );
            }

            // ==========================
            // Bedrock Gamertag → UUID
            // ==========================

            if (path.startsWith("/bedrock/name/")) {

                const gamertag =
                    decodeURIComponent(
                        path.substring("/bedrock/name/".length)
                    );

                const response =
                    await fetch(
                        `https://api.geysermc.org/v2/xbox/xuid/${encodeURIComponent(gamertag)}`
                    );

                if (!response.ok) {

                    return Response.json(
                        {
                            success: false,
                            error: "Bedrock player not found"
                        },
                        {
                            status: 404,
                            headers
                        }
                    );
                }

                const data =
                    await response.json();

                const xuid =
                    data.xuid.toString();

                const hex =
                    BigInt(xuid)
                        .toString(16)
                        .padStart(16, "0");

                const uuid =
                    "00000000-0000-0000-" +
                    hex.substring(0, 4) +
                    "-" +
                    hex.substring(4);

                const uuidNoDash =
                    uuid.replaceAll("-", "");

                return Response.json(
                    {
                        success: true,
                        platform: "bedrock",
                        gamertag,
                        xuid,
                        uuid,
                        uuidNoDash
                    },
                    {
                        headers
                    }
                );
            }

            // ==========================
            // Bedrock UUID → Gamertag
            // ==========================

            if (path.startsWith("/bedrock/uuid/")) {

                const uuid =
                    decodeURIComponent(
                        path.substring("/bedrock/uuid/".length)
                    );

                const uuidNoDash =
                    uuid.replaceAll("-", "");

                if (
                    !uuid.startsWith(
                        "00000000-0000-0000-"
                    )
                ) {

                    return Response.json(
                        {
                            success: false,
                            error: "Not a Floodgate UUID"
                        },
                        {
                            status: 400,
                            headers
                        }
                    );
                }

                const hex =
                    uuidNoDash.substring(16);

                const xuid =
                    BigInt(
                        "0x" + hex
                    ).toString();

                const response =
                    await fetch(
                        `https://api.geysermc.org/v2/xbox/gamertag/${xuid}`
                    );

                if (!response.ok) {

                    return Response.json(
                        {
                            success: false,
                            error: "Gamertag not found"
                        },
                        {
                            status: 404,
                            headers
                        }
                    );
                }

                const data =
                    await response.json();

                return Response.json(
                    {
                        success: true,
                        platform: "bedrock",
                        gamertag: data.gamertag,
                        xuid,
                        uuid,
                        uuidNoDash
                    },
                    {
                        headers
                    }
                );
            }

            // ==========================
            // Not Found
            // ==========================

            return Response.json(
                {
                    success: false,
                    error: "Endpoint not found"
                },
                {
                    status: 404,
                    headers
                }
            );

        } catch (err) {

            return Response.json(
                {
                    success: false,
                    error: err.message
                },
                {
                    status: 500,
                    headers
                }
            );
        }
    }
}
