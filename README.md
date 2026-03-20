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

### PDF Generation

The documentation PDF is generated automatically during deploy. To generate locally:

```shell
npm run build
npx docusaurus serve --no-open &
npx wait-on http://localhost:3000/turing/getting-started/intro --timeout 60000
npm run gen-pdf
```

#### Page Breaks in PDF

Use the following classes in MDX files to control page breaks in the generated PDF. These are invisible on the website.

**Force a page break at a specific point:**

```mdx
Some content before the break.

<div className="page-break" />

This starts on a new page in the PDF.
```

**Force an element to start on a new page:**

```mdx
<h2 className="page-break-before">New Section</h2>
```

**Force a page break after an element:**

```mdx
<div className="page-break-after">Last content on this page</div>
```

| Class | Effect |
|---|---|
| `page-break` | Insert a page break at that position |
| `page-break-before` | Element starts on a new page |
| `page-break-after` | Page break after the element |
