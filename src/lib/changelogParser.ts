import fs from "fs/promises";
import path from "path";

export interface ChangelogCategory {
  title: string;
  type: "added" | "fixed" | "changed" | "other";
  items: string[];
}

export interface ChangelogRelease {
  version: string;
  date: string;
  summary: string;
  categories: ChangelogCategory[];
}

/**
 * Parses the local CHANGELOG.md file into structured release objects.
 */
export async function getParsedChangelog(): Promise<ChangelogRelease[]> {
  try {
    const changelogPath = path.join(process.cwd(), "CHANGELOG.md");
    const content = await fs.readFile(changelogPath, "utf-8");
    return parseChangelogMarkdown(content);
  } catch (err) {
    console.error("Error reading CHANGELOG.md:", err);
    return [];
  }
}

export function parseChangelogMarkdown(content: string): ChangelogRelease[] {
  const releases: ChangelogRelease[] = [];
  const lines = content.split(/\r?\n/);

  let currentRelease: ChangelogRelease | null = null;
  let currentCategory: ChangelogCategory | null = null;
  let currentItemBuffer: string[] = [];

  const flushItem = () => {
    if (currentCategory && currentItemBuffer.length > 0) {
      currentCategory.items.push(currentItemBuffer.join("\n"));
      currentItemBuffer = [];
    }
  };

  const flushCategory = () => {
    flushItem();
    if (currentRelease && currentCategory) {
      currentRelease.categories.push(currentCategory);
      currentCategory = null;
    }
  };

  const flushRelease = () => {
    flushCategory();
    if (currentRelease) {
      releases.push(currentRelease);
      currentRelease = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Release header: ## [1.0.0-beta.6] - 2026-08-22
    const releaseMatch = line.match(/^##\s+\[(.*?)\](?:\s+-\s+(.*))?/);
    if (releaseMatch) {
      flushRelease();
      currentRelease = {
        version: releaseMatch[1].trim(),
        date: releaseMatch[2] ? releaseMatch[2].trim() : "",
        summary: "",
        categories: [],
      };
      continue;
    }

    if (!currentRelease) continue;

    // Category header: ### ✨ Añadido (Added) or ### 🛡️ Corregido (Fixed) or ### 🎨 Mejorado (Changed)
    const categoryMatch = line.match(/^###\s+(.*)/);
    if (categoryMatch) {
      flushCategory();
      const rawTitle = categoryMatch[1].trim();
      let type: ChangelogCategory["type"] = "other";
      if (rawTitle.toLowerCase().includes("añadido") || rawTitle.toLowerCase().includes("added")) {
        type = "added";
      } else if (rawTitle.toLowerCase().includes("corregido") || rawTitle.toLowerCase().includes("fixed")) {
        type = "fixed";
      } else if (rawTitle.toLowerCase().includes("mejorado") || rawTitle.toLowerCase().includes("changed")) {
        type = "changed";
      }
      currentCategory = {
        title: rawTitle,
        type,
        items: [],
      };
      continue;
    }

    // Top-level item: - **Item title**: Details
    if (line.match(/^-\s+/)) {
      flushItem();
      currentItemBuffer.push(line.replace(/^-\s+/, ""));
      continue;
    }

    // Sub-item or continuation under current item
    if (
      line.match(/^\s+-\s+/) ||
      (currentItemBuffer.length > 0 &&
        line.trim().length > 0 &&
        !line.startsWith("#") &&
        !line.startsWith("---"))
    ) {
      currentItemBuffer.push(line);
      continue;
    }

    // If before any category, it's the summary text of the release
    if (
      !currentCategory &&
      line.trim().length > 0 &&
      !line.startsWith("---") &&
      !line.startsWith("#")
    ) {
      if (currentRelease.summary) {
        currentRelease.summary += " " + line.trim();
      } else {
        currentRelease.summary = line.trim();
      }
    }
  }

  flushRelease();
  return releases;
}
