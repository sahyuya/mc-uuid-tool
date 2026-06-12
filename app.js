const resultBox = document.getElementById("result");

function isUUID(str) {
    return /^[0-9a-fA-F-]{36}$/.test(str);
}

function normalizeUUID(uuid) {
    return uuid.replace(/-/g, "");
}

function formatUUID(uuid) {
    return uuid.replace(
        /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
        "$1-$2-$3-$4-$5"
    );
}

function isFloodgateUUID(uuid) {
    return uuid.startsWith("00000000-0000-0000-");
}

async function searchPlayer() {

    resultBox.innerHTML = "検索中...";

    const mode =
        document.getElementById("mode").value;

    const input =
        document.getElementById("input").value.trim();

    try {

        if (mode === "java") {

            if (isUUID(input))
                return searchJavaUUID(input);

            return searchJavaName(input);
        }

        if (mode === "bedrock") {

            if (isUUID(input))
                return searchBedrockUUID(input);

            return searchBedrockName(input);
        }

        // AUTO

        if (isUUID(input)) {

            if (isFloodgateUUID(input))
                return searchBedrockUUID(input);

            return searchJavaUUID(input);
        }

        const javaResult =
            await tryJavaLookup(input);

        if (javaResult) {

            resultBox.innerHTML =
`種類: Java版

名前:
${javaResult.name}

UUID:
${javaResult.uuid}`;

            return;
        }

        return searchBedrockName(input);

    }
    catch(err) {

        resultBox.innerHTML =
            "エラー\n\n" + err.message;
    }
}

async function tryJavaLookup(name) {

    const response =
        await fetch(
            `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(name)}`
        );

    if(response.status !== 200)
        return null;

    const data =
        await response.json();

    return {
        name:data.name,
        uuid:formatUUID(data.id)
    };
}

async function searchJavaName(name) {

    const player =
        await tryJavaLookup(name);

    if(!player) {

        resultBox.innerHTML =
            "Java版プレイヤーが見つかりません";

        return;
    }

    resultBox.innerHTML =
`種類: Java版

名前:
${player.name}

UUID:
${player.uuid}`;
}

async function searchJavaUUID(uuid) {

    uuid = normalizeUUID(uuid);

    const response =
        await fetch(
            `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`
        );

    if(response.status !== 200) {

        resultBox.innerHTML =
            "プレイヤーが見つかりません";

        return;
    }

    const data =
        await response.json();

    resultBox.innerHTML =
`種類: Java版

名前:
${data.name}

UUID:
${formatUUID(data.id)}`;
}

async function searchBedrockName(name) {

    const response =
        await fetch(
            `https://api.geysermc.org/v2/xbox/xuid/${encodeURIComponent(name)}`
        );

    if(response.status !== 200) {

        resultBox.innerHTML =
            "統合版プレイヤーが見つかりません";

        return;
    }

    const data =
        await response.json();

    const xuid =
        BigInt(data.xuid);

    const hex =
        xuid.toString(16).padStart(16,"0");

    const uuid =
        "00000000-0000-0000-"
        + hex.substring(0,4)
        + "-"
        + hex.substring(4);

    resultBox.innerHTML =
`種類: 統合版

Gamertag:
${name}

XUID:
${data.xuid}

Floodgate UUID:
${uuid}`;
}

async function searchBedrockUUID(uuid) {

    const hex =
        uuid.replaceAll("-","")
            .substring(16);

    const xuid =
        BigInt("0x" + hex).toString();

    const response =
        await fetch(
            `https://api.geysermc.org/v2/xbox/gamertag/${xuid}`
        );

    if(response.status !== 200) {

        resultBox.innerHTML =
`種類: 統合版

XUID:
${xuid}

Gamertag取得失敗`;

        return;
    }

    const data =
        await response.json();

    resultBox.innerHTML =
`種類: 統合版

Gamertag:
${data.gamertag}

XUID:
${xuid}

Floodgate UUID:
${uuid}`;
}