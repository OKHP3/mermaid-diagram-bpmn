# GitHub baseline for content-first repositories

Use this as a current baseline, not as a rigid template. Recheck the linked official documentation when a repository's visibility, collaboration model, or GitHub feature set matters.

## Guidance to apply

- GitHub describes a README as the first orientation surface and recommends explaining what the project does, why it is useful, how to get started, where to get help, and who maintains it. Use those questions for content repositories too, translating “how to get started” into “where to begin reading or contributing.”
- GitHub surfaces community health files from the repository root, `.github`, or `docs` according to file-specific precedence. Use the location that is easiest for the repository's audience and avoid creating files solely to satisfy a checklist.
- `CONTRIBUTING.md`, `SUPPORT.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, issue templates, and pull request templates are collaboration tools. Add them when the repository accepts contributions or needs a public support or security path.
- GitHub's repository limits recommend managing very large files with Git LFS and warn that extremely wide or deep trees reduce manageability. Use this as a review signal for large binary collections, not as a reason to flatten meaningful topic structure.
- GitHub supports non-code files. Preserve their provenance and use local document, spreadsheet, PDF, image, or browser tools to understand them before moving them.
- GitHub's web interface can render and link repository files, but readable, stable relative paths are easier to navigate and maintain than paths that depend on URL encoding. Prefer the conservative ASCII profile for new paths while preserving required GitHub filenames.

## Official sources

- [About the repository README file](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)
- [Setting up your project for healthy contributions](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions)
- [Creating a default community health file](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file)
- [Setting guidelines for repository contributors](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors)
- [About issue and pull request templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/about-issue-and-pull-request-templates)
- [Repository limits](https://docs.github.com/en/repositories/creating-and-managing-repositories/repository-limits)
- [Working with files](https://docs.github.com/en/repositories/working-with-files)
- [Getting permanent links to files](https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files)

## Translation for non-application repositories

| GitHub concern | Content-first translation |
|---|---|
| README | Explain the subject, purpose, audience, reading path, status, provenance, and boundaries |
| Contributing | Explain how to add, revise, cite, name, or retire knowledge assets |
| Support | Explain where questions, corrections, and missing-source reports belong |
| Security | Explain how to report exposed secrets, private material, or unsafe instructions |
| Issue templates | Capture content corrections, source additions, structure proposals, and broken links |
| Large-file limits | Record why large binaries remain, whether LFS or external storage is appropriate, and what is intentionally retained |
