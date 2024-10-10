# Example For IPFS hosting

Hosting on IPFS is tricky as we don't know the CID of the content
before code generation.

Hence, we have to resort to `#`-based routing to ensure initial requests
are always resolved to the root `index.html` page.

This example implements hash based routing for static hosting with
unknown base paths.

