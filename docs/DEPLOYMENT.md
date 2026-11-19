# PhiCloneLab GitHub Pages deployment

The static site lives in `site/`. GitHub Pages uses a dedicated **build** job to package it and a dependent **deploy** job to publish it.

## Why the v0.2 deployment failed on November 19, 2026

- Deployment attempt 1 uploaded one valid `github-pages` artifact but `actions/deploy-pages` immediately saw zero.
- Re-running the entire original one-job workflow uploaded a second artifact under the same run. Deployment attempt 2 then found **two** artifacts named `github-pages` and failed.
- The research validation workflow passed; neither failure established a problem with website code.

## Fix

- Build/upload and deployment are now separate jobs, with `deploy` depending on `build`.
- Deployment checks the Actions artifact API until exactly one unexpired `github-pages` artifact is visible.
- GitHub grants `actions: read` to the deploy job for the visibility check; no artifact deletion permissions are used.

## How to recover from a future failure

1. Open **Actions → Deploy PhiCloneLab** and inspect the **deploy** job log.
2. When build/upload succeeded but deployment failed, choose **Re-run failed jobs**. Do **not** select **Re-run all jobs** for that same workflow run, because it can add a duplicate artifact.
3. For a completely fresh workflow run, use **Run workflow** on `main` instead. This creates a new run ID with no leftover same-named artifact.

The public URLs should be:
- https://michaelwave369.github.io/PhiCloneLab/
- https://michaelwave369.github.io/PhiCloneLab/atlas.html

A successful GitHub Actions run is necessary but actual browser behavior should still be checked on the live site.
