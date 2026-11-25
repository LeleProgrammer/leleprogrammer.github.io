# Repository workflow

Do development on the `develop` branch. Before editing, check the current branch and switch to `develop` if needed. If the local branch is missing, fetch `origin/develop` and create a local branch that tracks it. Preserve any existing working changes when switching branches.

After verifying each fix, commit it on `develop` with an English commit message and push it to `origin/develop`. Make changes directly on `main` only when the user explicitly requests it.
