# vexproof sample

A small React dashboard, built with esbuild, that shows what [vexproof](https://vexproof.dev) writes for a real
production bundle. The [full VEX file in the docs](https://vexproof.dev/docs/#sample) comes from this repository.

The app depends on `recharts`, which pulls in `lodash`, and on `moment`, which nothing imports. `src/main.jsx` never
mentions either:

```
grep -c "lodash\|moment" src/main.jsx   →  0
```

`npm audit` reports four advisories. Here is what the shipped bundle says about each:

| Advisory | Package | Vulnerable code | In `dist/app.js`? | vexproof |
|---|---|---|---|---|
| GHSA-8hfj-j24r-96c4 | moment 2.29.1 | path traversal in locale loading | no file of moment ships | **not_affected**, package level |
| GHSA-wc69-rhjr-hc9g | moment 2.29.1 | ReDoS in date parsing | no file of moment ships | **not_affected**, package level |
| GHSA-r5fr-rjxr-66jc | lodash 4.17.21 | `_.template` | `template.js` not shipped; 225 other lodash files are | **not_affected**, module level (Pro) |
| GHSA-xxjr-mmjv-4gpg | lodash 4.17.21 | `_.unset`, `_.omit` | `omit.js` and `_baseUnset.js` shipped (recharts' Treemap uses `lodash/omit`) | **in_triage**, with the files' hashes as evidence |

An analysis that reads only your own import statements sees no lodash and no moment, and calls all four unreachable.
That is wrong for the last one, and it is the kind of statement that fails an audit. vexproof reads what the bundler
emitted: it settles what it can prove and leaves the one it cannot, with the evidence a reviewer needs to decide.

## Run it

```
npm ci
npm run all
```

`npm run all` builds the app (`dist/app.js` plus esbuild's metafile, which is the module map), writes the lockfile SBOM
and the bundle SBOM with the CycloneDX tools, runs `npm audit`, and runs vexproof on the four files. Output:

- `vex/vex.cdx.json`: CycloneDX 1.6 VEX, one entry per advisory plus one per CVE alias
- `vex/vex.openvex.json`: the same statements as OpenVEX, which Trivy and Grype apply directly

The committed copies in `vex/` are from the free tier, so the `_.template` advisory is `in_triage` there. With a
license (`VEXPROOF_LICENSE`), the module-level check settles it; that is the file shown in the docs.

Set `SOURCE_DATE_EPOCH` to pin the timestamps and the output is reproducible byte for byte.

## In CI

[`.github/workflows/vex.yml`](.github/workflows/vex.yml) does the same on every push, pull request and once a week
(advisories arrive without a commit), using the vexproof GitHub Action. Add `VEXPROOF_LICENSE` as a repository
secret and the same workflow runs Pro. The VEX files are uploaded as a build artifact; in a real project you would
commit them next to the SBOM or publish them with the release.

## License

MIT. vexproof itself is MIT for the free tier and source-available for Pro; see [its repository](https://github.com/septakis/vexproof).
