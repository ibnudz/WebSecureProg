const express = require('express');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const Joi = require('joi');

const app = express();

const csurfProtection = csurf({cookie: true});

app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

const transferSchema = Joi.object({
    _csrf: Joi.string(),
    to: Joi.string().alphanum().required().trim(),
    ammount: Joi.string().pattern(/^[0-9]+$/)
});

app.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
        <title>Login</title>
        </head>
        <body>
        <h1>Login</h1>
        <form method="post" action="http://localhost:3000/login">
        <input type="text" name="username" placeholder="Input Username"><br>
        <input type="password" name="password" placeholder="Input Password"><br>
        <button type="submit">LOGIN</button>
        </form>
        </body>
        </html>
    `);
});

app.get('/dasbor', (req, res) => {
    const token = req.cookies.token;

    if(token === 'A001') {
        res.json({message: 'Halo Administrator'});
    } else {
        res.status(401).json({message: 'Silahkan Login'});
    }
});

app.get('/transfer', csurfProtection, (req, res) => {
    const token = req.cookies.token;

    const {to, ammount} = req.body;

    if(token === 'A001') {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
            <title>Transfer</title>
            </head>
            <body>
            <h1>Transfer</h1>
            <form method="post" action="http://localhost:3000/transfer">
            <input type="text" name="_csrf" value="${req.csrfToken()}"><br>
            <input type="text" name="to" placeholder="Input Penerima"><br>
            <input type="text" name="ammount" placeholder="Input Jumlah"><br>
            <button type="submit">SEND</button>
            </form>
            </body>
            </html>
        `);
    } else {
        res.status(401).json({message: 'Silahkan Login'});
    }
});

app.post('/transfer', csurfProtection, (req, res) => {
    const token = req.cookies.token;

    const {error, value} = transferSchema.validate(req.body);

    if(error) {
        res.json(error);
    } else {
        const {to, ammount} = value;

        if(token === 'A001') {
            res.json({message: `Transfer Berhasil Ke ${to} Dengan Jumlah ${ammount}`});
        } else {
            res.status(401).json({message: 'Silahkan Login'});
        }
    }
});

app.post('/login', (req, res) => {
    const {username, password} = req.body;

    if(username === 'admin' && password === '123') {
        res.cookie('token', 'A001');
        res.json({message: 'Login Berhasil'});
    } else {
        res.status(401).json({message: 'Login Gagal'});
    }
});

app.listen(3000, () => {
    console.log('Server Running');
});
