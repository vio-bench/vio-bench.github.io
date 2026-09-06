import { execFileSync } from "node:child_process";
import { mkdtemp, cp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
const run = (cmd, args, cwd = process.cwd()) =>
  execFileSync(cmd, args, { cwd, stdio: "inherit" });
const read = (args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const remote = read(["remote", "get-url", "origin"]);
if (!/github\.com[:/]vio-bench\/vio-bench\.github\.io(?:\.git)?$/.test(remote))
  throw Error("Unexpected deployment repository");
if (read(["status", "--porcelain"]))
  throw Error("Commit source changes before deployment.");
const revision = read(["rev-parse", "HEAD"]);
const branch = read(["branch", "--show-current"]);
if (branch !== "main") throw Error("Deploy from reviewed main source.");
run("npm", ["run", "build"]);
run("npm", ["run", "check"]);
run("npm", ["run", "validate"]);
const temp = await mkdtemp(join(tmpdir(), "vioverse-publish-"));
const target = join(temp, "site");
try {
  const exists = read(["ls-remote", "--heads", "origin", "gh-pages"]);
  if (exists)
    run("git", [
      "clone",
      "--depth",
      "1",
      "--single-branch",
      "--branch",
      "gh-pages",
      remote,
      target,
    ]);
  else {
    run("git", ["init", "-b", "gh-pages", target]);
    run("git", ["remote", "add", "origin", remote], target);
  }
  for (const name of await readdir(target)) {
    if (name !== ".git")
      await rm(join(target, name), { recursive: true, force: true });
  }
  for (const name of await readdir(resolve("out")))
    await cp(join("out", name), join(target, name), { recursive: true });
  run("git", ["add", "--all"], target);
  const changed = execFileSync("git", ["status", "--porcelain"], {
    cwd: target,
    encoding: "utf8",
  }).trim();
  if (!changed) {
    console.log("Export already matches published branch.");
  } else {
    run(
      "git",
      ["commit", "-m", `Publish VIOVERSE from ${revision.slice(0, 12)}`],
      target,
    );
    run("git", ["push", "origin", "gh-pages"], target);
  }
} finally {
  await rm(temp, { recursive: true, force: true });
}
console.log(
  "Published static branch; verify GitHub Pages deployment and live site separately.",
);
