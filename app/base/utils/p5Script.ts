export const DEFAULT_P5_SCRIPT =
`let dimension

function setup() {
  dimension = Math.min(windowWidth, windowHeight)

  createCanvas(dimension, dimension)

  background(50)
}

function draw() {
  // ...
}
`

export const getP5Html = (title: string, script: string) =>
`<html>
    <head>
        <title>${title}</title>
        <link rel="stylesheet" href="data:text/css;base64,aHRtbHtoZWlnaHQ6MTAwJX1ib2R5e21pbi1oZWlnaHQ6MTAwJTttYXJnaW46MDtwYWRkaW5nOjB9Y2FudmFze3BhZGRpbmc6MDttYXJnaW46YXV0bztkaXNwbGF5OmJsb2NrO3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO2JvdHRvbTowO2xlZnQ6MDtyaWdodDowfQ==">
    </head>
    <body>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.5.0/p5.min.js"></script>
        <script>${script}</script>
    </body>
</html>`

export const getP5HtmlUri = (title: string, script: string) =>
  `data:text/html;base64,${Buffer.from(getP5Html(title, script)).toString('base64')}`

