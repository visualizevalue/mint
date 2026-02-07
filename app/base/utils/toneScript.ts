export const DEFAULT_TONE_SCRIPT =
`const synth = new Tone.Synth().toDestination()

document.addEventListener('click', async () => {
  await Tone.start()
  synth.triggerAttackRelease('C4', '8n')
})

// Display a simple visual indicator
const canvas = document.createElement('canvas')
document.body.appendChild(canvas)
canvas.width = canvas.height = Math.min(window.innerWidth, window.innerHeight)
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#000'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = '#fff'
ctx.font = canvas.width / 20 + 'px monospace'
ctx.textAlign = 'center'
ctx.fillText('Click to play', canvas.width / 2, canvas.height / 2)
`

export const getToneHtml = (title: string, script: string) =>
`<html>
    <head>
        <title>${title}</title>
        <link rel="stylesheet" href="data:text/css;base64,aHRtbHtoZWlnaHQ6MTAwJX1ib2R5e21pbi1oZWlnaHQ6MTAwJTttYXJnaW46MDtwYWRkaW5nOjB9Y2FudmFze3BhZGRpbmc6MDttYXJnaW46YXV0bztkaXNwbGF5OmJsb2NrO3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO2JvdHRvbTowO2xlZnQ6MDtyaWdodDowfQ==">
    </head>
    <body>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
        <script>${script}</script>
    </body>
</html>`

export const getToneHtmlUri = (title: string, script: string) =>
  `data:text/html;base64,${Buffer.from(getToneHtml(title, script)).toString('base64')}`
