import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

function stripAnsi(text: string): string {
  return text.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
}

function extractFiveHourQuota(status: string): string | undefined {
  // pi-quotas publishes styled text such as: "5h:82% left (↺in 3h 14m)".
  const plain = stripAnsi(status);
  const match = plain.match(/(?:^|\s)5h:\s*(\d+%)(?:\s+left)?\s*\(↺?\s*(?:in\s+)?([^)]+)\)/i);
  return match ? `5h ${match[1]} · ${match[2].trim()}` : undefined;
}

function effectiveCwd(status: string | undefined, fallback: string): string {
  if (!status) return fallback;
  const path = stripAnsi(status).replace(/^📂\s*/, "");
  const home = process.env.HOME;
  return home && (path === "~" || path.startsWith("~/") || path.startsWith("~\\"))
    ? home + path.slice(1)
    : path || fallback;
}

export default function (pi: ExtensionAPI) {
  const installFooter = (ctx: any) => {
    ctx.ui.setFooter((_tui: any, theme: any, footerData: any) => ({
      dispose() {},
      invalidate() {},
      render(width: number): string[] {
        if (width <= 0) return [];

        // pi-cd publishes its effective directory through this status key.
        // Support the older pi-cwd key as a fallback.
        const statuses = footerData.getExtensionStatuses();
        const cwdStatus = statuses.get("pi-cd") ?? statuses.get("cwd");
        const location = effectiveCwd(cwdStatus, ctx.cwd);
        const model = ctx.model ? `${ctx.model.provider}/${ctx.model.id}` : "no model";
        // pi-quotas publishes this status asynchronously; tolerate it not being ready yet.
        const quotaStatus = footerData?.getExtensionStatuses?.().get?.("pi-quotas-usage");
        const quota = typeof quotaStatus === "string" ? extractFiveHourQuota(quotaStatus) : undefined;

        // On narrow terminals, prioritize the working directory.
        if (width < 8) return [theme.fg("muted", truncateToWidth(location, width))];

        const modelText = theme.fg("muted", truncateToWidth(model, Math.max(1, Math.floor(width * 0.35))));
        const usageText = quota
          ? theme.fg("muted", truncateToWidth(quota, Math.max(1, Math.floor(width * 0.35)))) + " · "
          : "";
        const right = usageText + modelText;
        const leftWidth = Math.max(1, width - visibleWidth(right) - 1);
        const left = truncateToWidth(location, leftWidth);
        const padding = " ".repeat(Math.max(1, width - visibleWidth(left) - visibleWidth(right)));

        return [theme.fg("muted", left + padding) + right];
      },
    }));
  };

  // Session replacement (including pi-cd's /cd) rebuilds the interactive UI.
  // Reinstall during resource discovery as a final pass after every rebind.
  pi.on("session_start", (_event, ctx) => installFooter(ctx));
  pi.on("resources_discover", (_event, ctx) => installFooter(ctx));
  pi.on("model_select", (_event, ctx) => installFooter(ctx));
}
