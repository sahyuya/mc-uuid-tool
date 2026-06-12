const API_BASE =
"https://sahyuya.github.io/mc-uuid-tool/";

const resultBox =
document.getElementById("result");

const resultContent =
document.getElementById("resultContent");

const loadingBox =
document.getElementById("loading");

const searchBtn =
document.getElementById("searchBtn");

function showLoading() {

    loadingBox.classList.remove("hidden");

    resultBox.classList.add("hidden");

    searchBtn.disabled = true;
}

function hideLoading() {

    loadingBox.classList.add("hidden");

    searchBtn.disabled = false;
}

function isUUID(str) {

    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function isFloodgateUUID(uuid) {

    return uuid.startsWith(
        "00000000-0000-0000-"
    );
}

async function api(path) {

    const response =
        await fetch(
            API_BASE + path
        );

    const json =
        await response.json();

    if (!response.ok) {

        throw new Error(
            json.error || "API Error"
        );
    }

    return json;
}

async function copyText(text) {

    try {

        await navigator.clipboard.writeText(text);

    } catch {

        alert("コピーに失敗しました");
    }
}

function createCopyButton(text) {

    return `
        <button
            class="copy-btn"
            onclick="copyText('${text}')"
        >
            コピー
        </button>
    `;
}

function createJavaCard(data) {

    return `
    <div class="result-card java">

        <div class="result-title">
            Java版
        </div>

        <div class="result-row">
            <div class="result-label">
                プレイヤー名
            </div>

            <div class="result-value">
                ${data.name}
            </div>
        </div>

        <div class="result-row">

            <div class="result-label">
                UUID (ハイフンあり)
            </div>

            <div class="copy-row">

                <div class="result-value">
                    ${data.uuid}
                </div>

                ${createCopyButton(data.uuid)}

            </div>

        </div>

        <div class="result-row">

            <div class="result-label">
                UUID (ハイフンなし)
            </div>

            <div class="copy-row">

                <div class="result-value">
                    ${data.uuidNoDash}
                </div>

                ${createCopyButton(data.uuidNoDash)}

            </div>

        </div>

    </div>
    `;
}

function createBedrockCard(data) {

    return `
    <div class="result-card bedrock">

        <div class="result-title">
            統合版 (Bedrock)
        </div>

        <div class="result-row">

            <div class="result-label">
                Gamertag
            </div>

            <div class="result-value">
                ${data.gamertag}
            </div>

        </div>

        <div class="result-row">

            <div class="result-label">
                XUID
            </div>

            <div class="copy-row">

                <div class="result-value">
                    ${data.xuid}
                </div>

                ${createCopyButton(data.xuid)}

            </div>

        </div>

        <div class="result-row">

            <div class="result-label">
                Floodgate UUID
            </div>

            <div class="copy-row">

                <div class="result-value">
                    ${data.uuid}
                </div>

                ${createCopyButton(data.uuid)}

            </div>

        </div>

        <div class="result-row">

            <div class="result-label">
                Floodgate UUID (ハイフンなし)
            </div>

            <div class="copy-row">

                <div class="result-value">
                    ${data.uuidNoDash}
                </div>

                ${createCopyButton(data.uuidNoDash)}

            </div>

        </div>

    </div>
    `;
}

function showError(message) {

    resultContent.innerHTML = `
        <div class="result-card">
            <div class="error">
                ${message}
            </div>
        </div>
    `;

    resultBox.classList.remove("hidden");
}

async function searchPlayer() {

    showLoading();

    try {

        const platform =
            document.getElementById("platform").value;

        const direction =
            document.getElementById("direction").value;

        const input =
            document.getElementById("input")
                .value
                .trim();

        if (!input) {

            throw new Error(
                "入力してください"
            );
        }

        let html = "";

        // ==========
        // 自動判定
        // ==========

        if (platform === "auto") {

            if (isUUID(input)) {

                if (isFloodgateUUID(input)) {

                    const bedrock =
                        await api(
                            "/bedrock/uuid/" +
                            encodeURIComponent(input)
                        );

                    html +=
                        createBedrockCard(
                            bedrock
                        );

                } else {

                    const java =
                        await api(
                            "/java/uuid/" +
                            encodeURIComponent(input)
                        );

                    html +=
                        createJavaCard(
                            java
                        );
                }

            } else {

                try {

                    const java =
                        await api(
                            "/java/name/" +
                            encodeURIComponent(input)
                        );

                    html +=
                        createJavaCard(
                            java
                        );

                } catch {}

                try {

                    const bedrock =
                        await api(
                            "/bedrock/name/" +
                            encodeURIComponent(input)
                        );

                    html +=
                        createBedrockCard(
                            bedrock
                        );

                } catch {}

                if (!html) {

                    throw new Error(
                        "プレイヤーが見つかりません"
                    );
                }
            }
        }

        // ==========
        // Java
        // ==========

        else if (platform === "java") {

            if (
                direction === "uuid" ||
                (
                    direction === "auto" &&
                    isUUID(input)
                )
            ) {

                const data =
                    await api(
                        "/java/uuid/" +
                        encodeURIComponent(input)
                    );

                html =
                    createJavaCard(
                        data
                    );

            } else {

                const data =
                    await api(
                        "/java/name/" +
                        encodeURIComponent(input)
                    );

                html =
                    createJavaCard(
                        data
                    );
            }
        }

        // ==========
        // Bedrock
        // ==========

        else {

            if (
                direction === "uuid" ||
                (
                    direction === "auto" &&
                    isUUID(input)
                )
            ) {

                const data =
                    await api(
                        "/bedrock/uuid/" +
                        encodeURIComponent(input)
                    );

                html =
                    createBedrockCard(
                        data
                    );

            } else {

                const data =
                    await api(
                        "/bedrock/name/" +
                        encodeURIComponent(input)
                    );

                html =
                    createBedrockCard(
                        data
                    );
            }
        }

        resultContent.innerHTML =
            html;

        resultBox.classList.remove(
            "hidden"
        );

    } catch (e) {

        showError(
            e.message
        );

    } finally {

        hideLoading();
    }
}

window.copyText =
copyText;

window.searchPlayer =
searchPlayer;
