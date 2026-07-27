## Viglet Documentation

Documentation site for Viglet products, built with [Docusaurus 3](https://docusaurus.io/).

### Development

```shell
npm install
npm start
```

### Build

```shell
npm run build
```

### Printing

There is no PDF build step. Readers who need an offline copy use the browser's
**Print → Save as PDF** on any page; `src/css/custom.css` has a `@media print`
block that hides the site chrome and keeps diagrams, tables and code blocks
intact.

Do not add manual page-break markup to MDX files: pagination is left to the
browser.
