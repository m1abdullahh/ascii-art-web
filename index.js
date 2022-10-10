const express = require('express');
const app = express();
const http = require('http').createServer(app);
const PORT = process.env.PORT || 3000
const cors = require('cors')
const bodyParser = require('body-parser')
const { appendFile, open, } = require('fs/promises')
const { existsSync, readFileSync } = require('fs')

// app.set('case sensitive routing', true)
app.use(cors())
app.use(express.static('static'))
app.use(bodyParser.urlencoded({'extended': false}))
app.use(bodyParser.json())

app.use((req, res, next) => {
    res.set('X-Powered-By', 'ABServes');
    next();
})

app.get('/', (req, res) => {
    res.status(200).sendFile(__dirname + '/index.html')
})
app.get('/:id', (req, res) => {
    const filePath = `./static/saved_arts/${req.params.id}.txt`
    console.log(filePath);
    if (existsSync(filePath)) {
        // res.status(200).sendFile(__dirname + filePath.slice(1, (filePath.length)))

        // Sending custom HTML instead of just the file.
        res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Photo-To-ASCII - ${filePath}</title>
            </head>
            <body style="background-color: black; color: white;">
                <pre>${readFileSync(filePath)}</pre>
                <br>
                <p style="text-align: end;">Made with ❤️ by Photo-To-ASCII. ~ Abdullah, 2022</p>
            </body>
        </html>
        `)
    } else {
        res.status(404).json({
            'message': 'Art not found.',
            'artId': req.params.id
        })
    }
})
app.post('/saveData', async (req, res) => {
    const file = await open(`./static/saved_arts/${req.body.id}.txt`, 'w');
    await file.appendFile(req.body.data)
    res.status(201).json({
        'message': 'File Created.',
        'request': {
            'method': 'GET',
            'url': `${req.protocol}://${req.hostname}:${PORT}/${req.body.id}`
        }
    })
    await file.close();
})

http.listen(PORT, () => {
    console.log(`Server is up on http://localhost:${PORT}`)
})