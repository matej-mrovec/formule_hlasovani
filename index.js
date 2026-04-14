const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs'); // Modul pro práci se souborovým systémem
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'responses.json');

// Nastavení EJS jako šablonovacího stroje
app.set('view engine', 'ejs');

// Nastavení statické složky pro CSS a obrázky
app.use(express.static('public'));

// Middleware pro zpracování dat z formuláře (POST požadavky)
app.use(bodyParser.urlencoded({ extended: true }));

// Pomocná funkce pro bezpečné načtení dat z JSON souboru, pokud soubor neexistuje nebo je poškozený, vrátí prázdné pole
const readData = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) return [];
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data || "[]");
    } catch (err) { 
        console.error("Chyba při čtení databáze:", err);
        return []; 
    }
};

// route: zobrazení hlavní stránky s formulářem
app.get('/', (req, res) => {
    res.render('index');
});

// route: zpracování odeslaného formuláře
app.post('/vote', (req, res) => {
    const responses = readData(); // Načteme aktuální stav
    
    // Vytvoření nového objektu s odpovědí
    const newResponse = {
        id: Date.now(), 
        team: req.body.team,
        driver: req.body.driver,
        comment: req.body.comment,
        timestamp: new Date().toLocaleString('cs-CZ') 
    };

    responses.push(newResponse); 

    // Uložení aktualizovaného pole zpět do souboru responses.json
    fs.writeFileSync(DATA_FILE, JSON.stringify(responses, null, 2));
    
    // Po úspěšném uložení spawne uživatele na výsledky
    res.redirect('/results');
});

// route: zobrazení výsledků a statistik
app.get('/results', (req, res) => {
    const responses = readData();
    
    // Výpočet statistik pro graf (kolik hlasů má každý tým)
    const stats = {};
    responses.forEach(r => {
        stats[r.team] = (stats[r.team] || 0) + 1;
    });

    // Vykreslení stránky results.ejs s předanými daty
    res.render('results', { 
        responses, 
        stats, 
        total: responses.length 
    });
});

// Spuštění serveru na definovaném portu
app.listen(PORT, () => console.log(`Server běží na http://localhost:${PORT}`));