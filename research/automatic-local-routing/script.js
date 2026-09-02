"use strict";

// Reading progress.
const progress = document.querySelector(".reading-progress span");

function updateReadingProgress() {
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = documentHeight > 0 ? window.scrollY / documentHeight : 0;
    progress.style.width = `${Math.min(1, Math.max(0, ratio)) * 100}%`;
}

updateReadingProgress();
window.addEventListener("scroll", updateReadingProgress, { passive: true });
window.addEventListener("resize", updateReadingProgress);

// Pixel diagrams. These use the same one-pixel primitives as the routing hero.
document.querySelectorAll(".pixel-diagram").forEach((canvas) => {
    const logicalWidth = canvas.width;
    const logicalHeight = canvas.height;
    const cssWidth = canvas.getBoundingClientRect().width || logicalWidth;
    const resolutionScale = Math.max(
        4,
        Math.ceil((window.devicePixelRatio || 1) * cssWidth / logicalWidth),
    );

    canvas.width = logicalWidth * resolutionScale;
    canvas.height = logicalHeight * resolutionScale;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.setTransform(resolutionScale, 0, 0, resolutionScale, 0, 0);

    const styles = getComputedStyle(document.documentElement);
    const background = styles.getPropertyValue("--background").trim();
    const foreground = styles.getPropertyValue("--text").trim();

    const faint = 0.16;
    const dim = 0.42;
    const mid = 0.65;
    const strong = 0.9;

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);

    function rect(x, y, width, height, alpha = 1) {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = foreground;
        ctx.fillRect(x, y, width, height);
        ctx.globalAlpha = 1;
    }

    function outline(x, y, width, height, alpha = 1) {
        rect(x, y, width, 1, alpha);
        rect(x, y + height - 1, width, 1, alpha);
        rect(x, y, 1, height, alpha);
        rect(x + width - 1, y, 1, height, alpha);
    }

    function label(text, x, y, alpha = 1, size = 7, align = "left") {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = foreground;
        ctx.font = `${size}px "SFMono-Regular", Consolas, "Liberation Mono", monospace`;
        ctx.textAlign = align;
        ctx.textBaseline = "top";
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    function blit(bitmap, x, y, alpha = 1) {
        bitmap.forEach((row, rowIndex) => {
            for (let column = 0; column < row.length; column += 1) {
                if (row[column] === "X") rect(x + column, y + rowIndex, 1, 1, alpha);
            }
        });
    }

    function box(x, y, width, height, title, detail, alpha = mid) {
        outline(x, y, width, height, alpha);

        ctx.fillStyle = background;
        for (const [cornerX, cornerY] of [
            [x, y],
            [x + width - 1, y],
            [x, y + height - 1],
            [x + width - 1, y + height - 1],
        ]) {
            ctx.fillRect(cornerX, cornerY, 1, 1);
        }

        label(title, x + 6, y + 4, alpha + (1 - alpha) * 0.55, 8);
        if (detail) label(detail, x + 6, y + 16, alpha, 7);
    }

    function dots(points, alpha = dim) {
        for (let index = 0; index < points.length - 1; index += 1) {
            const [startX, startY] = points[index];
            const [endX, endY] = points[index + 1];
            const steps = Math.abs(endX - startX) + Math.abs(endY - startY);

            for (let step = 0; step <= steps; step += 4) {
                const progress = steps ? step / steps : 0;
                rect(
                    Math.round(startX + (endX - startX) * progress),
                    Math.round(startY + (endY - startY) * progress),
                    1,
                    1,
                    alpha,
                );
            }
        }
    }

    function chevronDown(x, y, alpha = dim) {
        blit(["X...X", ".X.X.", "..X.."], x - 2, y, alpha);
    }

    function packet(points) {
        points.forEach(([x, y, alpha]) => rect(x - 1, y - 1, 3, 3, alpha));
    }

    function diamond(centerX, centerY, radius, alpha = mid) {
        for (let offset = -radius; offset <= radius; offset += 1) {
            const vertical = radius - Math.abs(offset);
            rect(centerX + offset, centerY + vertical, 1, 1, alpha);
            rect(centerX + offset, centerY - vertical, 1, 1, alpha);
        }
    }

    function drawShadowMode() {
        box(122, 6, 116, 30, "CANONICAL REQUEST", "one provider context", mid);

        dots([[180, 36], [180, 46], [85, 46], [85, 59]], mid);
        dots([[180, 46], [275, 46], [275, 59]], dim);
        chevronDown(85, 56, mid);
        chevronDown(275, 56, dim);

        box(20, 63, 130, 30, "REFERENCE MODEL", "authoritative stream", strong);
        box(210, 63, 130, 30, "LOCAL MODEL", "bounded background copy", mid);

        dots([[85, 93], [85, 109]], mid);
        dots([[275, 93], [275, 109]], dim);
        chevronDown(85, 106, mid);
        chevronDown(275, 106, dim);

        box(20, 113, 130, 30, "REFERENCE RESPONSE", "result agent trusts", strong);
        box(210, 113, 130, 30, "LOCAL RESPONSE", "not executed", mid);

        dots([[85, 143], [85, 159]], mid);
        dots([[275, 143], [275, 159]], dim);
        chevronDown(85, 156, mid);
        chevronDown(275, 156, dim);

        box(20, 163, 130, 30, "NORMAL AGENT PATH", "shown + tools run", strong);
        box(210, 163, 130, 30, "EVALUATOR", "grades local action", mid);

        dots([[275, 193], [275, 209]], dim);
        chevronDown(275, 206, dim);
        box(210, 213, 130, 30, "SQLITE EVIDENCE", "grade + output + vector", mid);

        packet([[142, 46, 1], [146, 46, 0.45], [150, 46, 0.18]]);
        packet([[275, 151, 1], [275, 147, 0.45], [275, 143, 0.18]]);
    }

    function drawAutomaticMode() {
        box(122, 8, 116, 30, "INCOMING REQUEST", "embed + retrieve", mid);
        dots([[180, 38], [180, 56]], dim);
        chevronDown(180, 53, dim);

        diamond(180, 72, 14, mid);
        label("gate", 180, 68, strong, 7, "center");

        dots([[166, 72], [85, 72], [85, 106]], faint);
        dots([[194, 72], [275, 72], [275, 106]], mid);
        label("holdout", 52, 87, dim, 7);
        label("eligible", 282, 87, strong, 7);
        chevronDown(85, 103, dim);
        chevronDown(275, 103, mid);

        box(20, 110, 130, 30, "REFERENCE + SHADOW", "collect another label", dim);
        box(210, 110, 130, 30, "LOCAL MODEL", "authoritative stream", strong);

        dots([[85, 140], [85, 158]], dim);
        dots([[275, 140], [275, 158]], mid);
        chevronDown(85, 155, dim);
        chevronDown(275, 155, mid);

        box(20, 162, 130, 30, "UPDATE EVIDENCE", "add result to cohort", dim);
        box(210, 162, 130, 30, "NORMAL AGENT PATH", "text + tool calls", strong);

        packet([[232, 72, 1], [228, 72, 0.45], [224, 72, 0.18]]);
        packet([[275, 149, 1], [275, 145, 0.45], [275, 141, 0.18]]);
    }

    if (canvas.dataset.diagram === "shadow") drawShadowMode();
    if (canvas.dataset.diagram === "automatic") drawAutomaticMode();
});
