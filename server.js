

const nodeJsonDb = require('node-json-db');
const express = require('express');
var cors = require('cors');
const app = express()
app.use(cors());
app.use(express.json());
const port = 3000; // change to whatever you like

const db = new nodeJsonDb.JsonDB(new nodeJsonDb.Config("db", true, false, '/'));

app.post('/:user', async function (req, res) {
    const user = req.params.user;
    const url = req.body.url;
    const host = req.body.host;

    if (host !== undefined) {
        try {
            const data = await db.getData(`/${user}/page/${host}`);
            res.status(200).send({ page: data });
        } catch {
            res.status(404).send({ error: 'User not found' });
        }
    } else {
        try {
            const data = await db.getData(`/${user}/time/${Buffer.from(url).toString('base64')}`);
            res.status(200).send({ time: data });
        } catch {
            res.status(404).send({ error: 'User or url not found' });
        }
    }
});

app.put('/:user', async function (req, res) {
    const user = req.params.user;
    const url = req.body.url;
    const host = new URL(url).host;
    const time = req.body.time; // not in base64

    if (time !== undefined) {
        try {
            await db.push(`/${user}/time/${Buffer.from(url).toString('base64')}`, time);
            res.status(200).send({ msg: 'Time saved' });
        } catch (e) {
            console.log(e)
            res.status(500).send({ error: 'Something went wrong, please open an issue on https://github.com/Philip2809/where-was-i' });
        }
    } else {
        try {
            await db.push(`/${user}/page/${host}`, url);
            res.status(200).send({ msg: 'Latest page saved' });
        } catch {
            res.status(500).send({ error: 'Something went wrong, please open an issue on https://github.com/Philip2809/where-was-i' });
        }
    }
});


app.listen(port, () => {
    console.log(`Where Was I? running on port ${port}`)
})