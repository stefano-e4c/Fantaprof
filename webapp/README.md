# FantaProf 2.0

Il fantasy game dei professori per studenti delle scuole superiori.

Crea la tua squadra di professori, guadagna punti in base a quello che fanno in classe, e scala la classifica!

---

## Indice

1. [Come Funziona](#come-funziona)
2. [Regole del Gioco](#regole-del-gioco)
3. [Sistema di Punteggio](#sistema-di-punteggio)
4. [Funzionalita](#funzionalita)
5. [Installazione](#installazione)
6. [Guida per gli Admin](#guida-per-gli-admin)

---

## Come Funziona

FantaProf e un gioco fantasy in stile "Fantacalcio", ma invece dei calciatori scegli i **professori** della tua scuola!

### Il Concetto Base

1. **Crei una squadra** di 5 professori con un budget limitato
2. **Scegli un capitano** che ti dara punti doppi
3. **Guadagni punti** quando i tuoi prof fanno cose in classe (bonus o malus)
4. **Competi** contro i tuoi compagni nella classifica

### Chi Assegna i Punti?

Un **admin** (tipicamente il rappresentante di classe o un gruppo fidato) osserva cosa succede durante le lezioni e registra gli eventi nell'app. Quando un prof fa qualcosa di notevole (es: dice una parolaccia, arriva in ritardo, fa una battuta divertente), l'admin lo registra e i punti vengono assegnati automaticamente a tutte le squadre che hanno quel prof.

---

## Regole del Gioco

### Creazione Squadra

| Regola | Valore |
|--------|--------|
| Budget totale | **100 crediti** |
| Numero professori | **5** |
| Capitano | **1** (obbligatorio) |

- Ogni professore ha un **costo** (da 5 a 35 crediti)
- Devi restare entro il budget
- Devi selezionare esattamente 5 professori
- Devi nominare 1 capitano tra i 5

### Il Capitano

Il capitano e il tuo prof di punta. Tutti i punti che guadagna (o perde) vengono **raddoppiati**!

**Esempio:**
- Prof. Rossi guadagna +30 punti per una parolaccia
- Se Rossi e il tuo capitano: ricevi +60 punti
- Se Rossi non e capitano: ricevi +30 punti

### Calcolo Punteggio Squadra

```
Punteggio Totale = Somma(punti di ogni prof) + Bonus Capitano

Dove:
- Prof normale: punti x1
- Capitano: punti x2
```

**Esempio di calcolo:**
```
La tua squadra:
- Prof. Rossi (capitano): 50 punti -> 50 x 2 = 100
- Prof. Bianchi: 30 punti -> 30
- Prof. Verdi: -10 punti -> -10
- Prof. Neri: 25 punti -> 25
- Prof. Gialli: 15 punti -> 15

TOTALE: 100 + 30 - 10 + 25 + 15 = 160 punti
```

---

## Sistema di Punteggio

I punti vengono assegnati dagli admin quando un professore fa qualcosa di notevole in classe.

### BONUS (Punti Positivi)

| Evento | Punti | Descrizione |
|--------|-------|-------------|
| Malore in classe | +200 | Il prof sta male durante la lezione |
| Capriola | +150 | Il prof fa una capriola (raro!) |
| Litiga con un prof | +100 | Discussione accesa con un collega |
| Litiga con un alunno | +50 | Discussione con uno studente |
| Mette 10 | +50 | Da un 10 a qualcuno |
| Nota di merito | +35 | Da una nota positiva |
| Area Relax | +30 | Fa fare pausa/relax alla classe |
| Parolaccia | +30 | Dice una parolaccia |
| Dimentica verifiche | +30 | Si dimentica di fare la verifica programmata |
| Caccia nota | +25 | Cancella/toglie una nota |
| Assenza | +20 | Non si presenta a scuola |
| Inciampa/Cade | +20 | Inciampa o cade in classe |
| Esercitazione | +20 | Fa fare esercizi invece di spiegare |
| Divulgatore d'oro | +20 | Spiega in modo eccellente |
| Empatia | +20 | Mostra comprensione verso gli studenti |
| Gergo giovanile | +15 | Usa slang/espressioni dei giovani |
| Video | +15 | Fa vedere un video durante la lezione |
| Esce durante verifica | +15 | Esce dall'aula durante una verifica |
| Complimento | +10 | Fa un complimento alla classe/studente |
| Risata | +10 | Ride in classe |
| Meme | +10 | Fa o cita un meme |
| Monocromo | +10 | Vestito tutto di un colore |
| Lavagna | +5 | Scrive alla lavagna (invece di usare slides) |
| Correzione immediata | +5 | Corregge subito i compiti |
| PC sabotato | +5 | Il PC/proiettore non funziona |
| Prof influencer | +5 | Si comporta da influencer |

### MALUS (Punti Negativi)

| Evento | Punti | Descrizione |
|--------|-------|-------------|
| Non mette nota a ZIC | -100 | Non punisce chi se lo merita chiaramente |
| Mette nota | -30 | Da una nota disciplinare |
| Nota ingiusta | -30 | Da una nota immeritata |
| Ritardo pochi minuti | -20 | Arriva con pochi minuti di ritardo |
| Rompe qualcosa | -20 | Rompe oggetti in classe |
| Dimentica verifiche (panico) | -20 | Si dimentica le verifiche corrette |
| Verifica giorno dopo | -15 | Fissa verifica per il giorno dopo |
| Battuta boomer | -15 | Fa una battuta vecchia/cringe |
| Bagno abolito | -15 | Non fa andare in bagno |
| Ritira telefono | -15 | Sequestra il telefono |
| Sbaglia | -10 | Fa un errore durante la spiegazione |
| Arriva tardi | -10 | Arriva in ritardo |
| Assenza con supplente | -10 | Assente ma manda un supplente |
| Insulta | -10 | Insulta qualcuno |
| Total black | -10 | Vestito tutto di nero |
| Mette ritardo | -5 | Segna ritardo a uno studente |
| Pois | -5 | Vestito a pois |
| Fuoriclasse | -5 | Manda fuori uno studente |
| Memoria | -5 | Dice "Se la memoria non mi inganna..." |

---

## Funzionalita

### Per Tutti gli Utenti

- **Registrazione/Login** - Crea il tuo account
- **Crea Squadra** - Scegli 5 prof entro budget, nomina un capitano
- **Visualizza Squadra** - Vedi i tuoi prof e il punteggio attuale
- **Classifica Globale** - Vedi chi e in testa
- **Leghe** - Crea o unisciti a leghe private con i tuoi amici
- **Achievements** - Sblocca badge e guadagna punti extra
- **Notifiche Real-time** - Ricevi avvisi quando i tuoi prof guadagnano/perdono punti

### Sistema Leghe

Puoi creare **leghe private** per competere solo con i tuoi amici o la tua classe:

1. **Crea una lega** - Dai un nome e ottieni un codice invito
2. **Condividi il codice** - Es: `ABC12345`
3. **I tuoi amici si uniscono** - Inseriscono il codice
4. **Classifica separata** - Ogni lega ha la sua classifica

Le leghe possono essere:
- **Private** - Solo chi ha il codice puo unirsi
- **Pubbliche** - Chiunque puo vederle e unirsi

### Achievements (Badge)

Sblocca badge completando obiettivi:

| Badge | Descrizione | Punti |
|-------|-------------|-------|
| Primo Passo | Crea la tua prima squadra | +10 |
| Giocatore Social | Unisciti alla prima lega | +15 |
| Leader Nato | Crea la tua prima lega | +20 |
| Centista | Raggiungi 100 punti totali | +25 |
| Mezza Potenza | Raggiungi 500 punti totali | +50 |
| Mille e Non Piu Mille | Raggiungi 1000 punti totali | +100 |
| Sul Podio | Raggiungi il podio in una lega | +30 |
| Scelta Azzeccata | Il tuo capitano fa +50 in un giorno | +20 |
| Early Adopter | Tra i primi 10 iscritti | +50 |
| Farfalla Sociale | Unisciti a 5 leghe diverse | +35 |
| Collezionista | Sblocca 5 achievements | +30 |

---

## Installazione

### Requisiti
- Node.js 18+
- npm

### Setup

```bash
# Clona il repository
git clone https://github.com/tuouser/fantaprof.git
cd fantaprof/webapp

# Installa dipendenze
npm run install-all

# Avvia in sviluppo (backend + frontend)
npm run dev-all
```

### Comandi Disponibili

```bash
# Solo backend (porta 3001)
npm run dev

# Solo frontend (porta 5173)
npm run client

# Entrambi insieme
npm run dev-all
```

### URL

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

---

## Guida per gli Admin

### Chi e Admin?

Il **primo utente** che si registra diventa automaticamente admin. Altri admin possono essere promossi dal pannello admin.

### Come Assegnare Punti

1. **Accedi** con un account admin
2. **Vai su Admin** (icona ingranaggio nella navbar)
3. **Trova il professore** a cui e successo l'evento
4. **Clicca la freccia** per espandere il pannello eventi
5. **Clicca l'evento** corrispondente (es: "Parolaccia +30")

### Cosa Succede Quando Assegni un Evento

1. Il punteggio del professore viene aggiornato
2. **Tutte le squadre** con quel prof ricevono i punti
3. Se il prof e **capitano** di una squadra → punti **x2**
4. Tutti gli utenti interessati ricevono una **notifica push**
5. La **classifica** si aggiorna in tempo reale

### Gestione Professori

Dal pannello admin puoi:
- **Aggiungere** nuovi professori (nome, materia, costo, avatar)
- **Eliminare** professori (solo se non sono in nessuna squadra)
- **Modificare** i dettagli dei professori

### Best Practices per Admin

1. **Sii imparziale** - Registra tutti gli eventi, non solo quelli dei prof che ti piacciono
2. **Sii tempestivo** - Registra gli eventi appena possibile
3. **Sii accurato** - Usa l'evento corretto per ogni situazione
4. **Coinvolgi la classe** - Se non sei sicuro, chiedi conferma ai compagni

---

## Tecnologie Utilizzate

- **Frontend:** React, Vite, Framer Motion
- **Backend:** Node.js, Express
- **Database:** SQLite
- **Real-time:** Socket.io
- **Autenticazione:** JWT

---

## Crediti

Basato sul progetto originale [Fantaprof](https://github.com/WorkWolf2/Fantaprof) in Java/Spring Boot.

Ricreato come webapp moderna con React e Node.js.

---

## License

MIT
