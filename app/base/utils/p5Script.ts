export const DEFAULT_P5_SCRIPT =
`let dimension

function setup() {
  dimension = Math.min(windowWidth, windowHeight)

  createCanvas(dimension, dimension)

  background(255)
}

function draw() {
	const width  = dimension/16
  			offset = width / 2

 	fill(0)
  strokeWeight(0)

  rect(
    dimension/3 - offset, dimension/3,
    width, dimension/3
  )

  rect(
    dimension/2 - offset, dimension/2.5,
    width, dimension/5
  )

  rect(
    dimension - dimension/3 - offset, dimension/3,
    width, dimension/3
  )
}
`

export const getP5Html = (title: string, script: string, isUri: boolean = false) =>
`<html>
    <head>
        <title>${title}</title>
        <link rel="stylesheet" href="data:text/css;base64,aHRtbHtoZWlnaHQ6MTAwJX1ib2R5e21pbi1oZWlnaHQ6MTAwJTttYXJnaW46MDtwYWRkaW5nOjB9Y2FudmFze3BhZGRpbmc6MDttYXJnaW46YXV0bztkaXNwbGF5OmJsb2NrO3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO2JvdHRvbTowO2xlZnQ6MDtyaWdodDowfQ==">
    </head>
    <body>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.5.0/p5.min.js"></script>
        ${
          isUri ? `<script src="${script}"></script>` : `<script>${script}</script>`
        }
    </body>
</html>`

export const getP5HtmlUri = (title: string, script: string, isUri: boolean = false) =>
  `data:text/html;base64,${Buffer.from(getP5Html(title, script, isUri)).toString('base64')}`

