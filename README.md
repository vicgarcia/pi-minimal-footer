# pi-minimal-footer

A compact, responsive footer extension for [Pi Coding Agent](https://pi.dev). It shows:

- current working directory and Git branch (when in a Git repository)
- selected provider/model
- the five-hour allowance and reset time supplied by [`@latentminds/pi-quotas`](https://www.npmjs.com/package/@latentminds/pi-quotas), when installed

The footer follows directory changes made with `pi-cd`. It subscribes to Pi's asynchronous Git-branch refresh, so a `/cd` session switch does not leave the branch area blank or stale.

## Install

### From npm

```sh
pi install npm:pi-minimal-footer
```

### From a Git repository

```sh
pi install git:github.com/vicgarcia/pi-minimal-footer
```

### Local development

```sh
pi install .
```

Restart Pi or run `/reload` after installing or changing the extension.

## Optional companion packages

For the quota segment and `/cd` support:

```sh
pi install npm:@latentminds/pi-quotas
pi install npm:pi-cd
```

Without `@latentminds/pi-quotas`, the footer still displays the directory, branch, and model.

## Publish

```sh
npm login
npm publish
```

Use `npm publish --access public` if this package is later moved under an npm scope.

## License

MIT
