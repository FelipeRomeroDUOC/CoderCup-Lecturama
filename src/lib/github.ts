export interface GitHubCommitItem {
  sha: string;
  shortSha: string;
  message: string;
  description?: string;
  authorName: string;
  authorAvatar?: string;
  authorUrl?: string;
  date: string;
  formattedDate: string;
  htmlUrl: string;
  type: "feat" | "fix" | "chore" | "refactor" | "perf" | "docs" | "other";
}

const REPO_OWNER = "FelipeRomeroDUOC";
const REPO_NAME = "CoderCup-Lecturama";

function parseCommitType(
  message: string
): "feat" | "fix" | "chore" | "refactor" | "perf" | "docs" | "other" {
  const lower = message.toLowerCase();
  if (lower.startsWith("feat")) return "feat";
  if (lower.startsWith("fix")) return "fix";
  if (lower.startsWith("chore")) return "chore";
  if (lower.startsWith("refactor")) return "refactor";
  if (lower.startsWith("perf")) return "perf";
  if (lower.startsWith("docs")) return "docs";
  return "other";
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return isoString;
  }
}

/**
 * Fetches the latest commits from the main branch of the GitHub repository.
 * Cached for 5 minutes (300 seconds) via Next.js ISR.
 */
export async function getGitHubMainCommits(): Promise<GitHubCommitItem[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?sha=main&per_page=30`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Lecturama-App",
        },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      console.warn(`GitHub API returned status ${res.status}`);
      return getFallbackCommits();
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      return getFallbackCommits();
    }

    return data.map((item: any) => {
      const fullMessage = item.commit?.message || "Commit sin mensaje";
      const [firstLine, ...restLines] = fullMessage.split("\n");

      return {
        sha: item.sha,
        shortSha: item.sha?.slice(0, 7) || "",
        message: firstLine.trim(),
        description: restLines.join("\n").trim() || undefined,
        authorName: item.commit?.author?.name || item.author?.login || "Desarrollador",
        authorAvatar: item.author?.avatar_url,
        authorUrl: item.author?.html_url,
        date: item.commit?.author?.date || new Date().toISOString(),
        formattedDate: formatDate(item.commit?.author?.date || new Date().toISOString()),
        htmlUrl: item.html_url || `https://github.com/${REPO_OWNER}/${REPO_NAME}/commit/${item.sha}`,
        type: parseCommitType(firstLine),
      };
    });
  } catch (error) {
    console.error("Error fetching GitHub commits:", error);
    return getFallbackCommits();
  }
}

function getFallbackCommits(): GitHubCommitItem[] {
  return [
    {
      sha: "main-release-v1.0.0-beta.3",
      shortSha: "v1.0.0",
      message: "chore(release): v1.0.0-beta.3 - prevent full document page flood and clean debug logs",
      authorName: "Lecturama Team",
      date: new Date().toISOString(),
      formattedDate: formatDate(new Date().toISOString()),
      htmlUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases`,
      type: "chore",
    },
    {
      sha: "main-release-v1.0.0-beta.2",
      shortSha: "v1.0.0-b2",
      message: "chore(release): v1.0.0-beta.2 - calibrate and harden adaptive difficulty quiz engine",
      authorName: "Lecturama Team",
      date: new Date().toISOString(),
      formattedDate: formatDate(new Date().toISOString()),
      htmlUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases`,
      type: "chore",
    },
    {
      sha: "main-release-v1.0.0-beta.1",
      shortSha: "v1.0.0-b1",
      message: "chore(release): v1.0.0-beta.1 - initial release with gamified chapters and adaptive quiz",
      authorName: "Lecturama Team",
      date: new Date().toISOString(),
      formattedDate: formatDate(new Date().toISOString()),
      htmlUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases`,
      type: "chore",
    },
  ];
}
