const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'responses.json');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

/**
 * POMOCNÁ FUNKCE: Načtení dat z JSON souboru
 * Zajišťuje, že aplikace nespadne, pokud soubor chybí nebo je prázdný
 */
const readData = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, '[]');
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data || "[]");
    } catch (err) {
        console.error("Chyba při čtení databáze:", err);
        return [];
    }
};

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/vote', (req, res) => {
    const responses = readData();

    const newVote = {
        id: Date.now(), 
        team: req.body.team,
        driver: req.body.driver,
        comment: req.body.comment,
        timestamp: new Date().toLocaleString('cs-CZ')
    };

    responses.push(newVote);
    fs.writeFileSync(DATA_FILE, JSON.stringify(responses, null, 2));

    res.redirect('/results');
});

app.get('/results', (req, res) => {
    const responses = readData();

    const teamStats = {};
    const driverStats = {};

    responses.forEach(item => {
        if (item.team) {
            teamStats[item.team] = (teamStats[item.team] || 0) + 1;
        }
        if (item.driver) {
            driverStats[item.driver] = (driverStats[item.driver] || 0) + 1;
        }
    });


    res.render('results', {
        responses: responses, 
        teamStats: teamStats, 
        driverStats: driverStats, 
        total: responses.length 
    });
});

app.listen(PORT, () => {
    console.log(`Server běží na http://localhost:${PORT}`);
});
