# Contributing

{{ brand.name }} accepts contributions through pull requests against the
relevant component repository. The canonical guide currently lives in
[`DocumentServer/CONTRIBUTING.md`]({{ brand.repo }}/DocumentServer/blob/main/CONTRIBUTING.md);
the points below are a summary.

## Before you start

- For non-trivial changes, open an issue first to align on approach.
- Read [`AGENTS.md`]({{ brand.repo }}/DocumentServer/blob/main/AGENTS.md) if
  you are using AI-assisted tools — there are specific commit-trailer
  requirements.

## Code style

- 120-character line width.
- 4-space indentation.
- Commits are signed (DCO) and follow
  [Conventional Commits v1.0.0](https://www.conventionalcommits.org/).

## Pull request requirements

- Tests for new behavior (Jest, Mocha, or Chai depending on the subpackage).
- Documentation updates for user-visible changes.
- Two approvals before merge.

!!! note "Coming soon"
    The full content of CONTRIBUTING.md will be migrated into this page,
    plus contributor onboarding for first-time contributors.
