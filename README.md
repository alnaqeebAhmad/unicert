# UniCert

**DE:** Blockchain-basiertes System zur kryptografisch gesicherten Ausstellung
und Verifizierung akademischer Zertifikate auf der Ethereum-Blockchain.

**EN:** Blockchain-based system for the cryptographically secured issuance
and verification of academic certificates on the Ethereum blockchain.

---

## Live Demo

**https://alnaqeebahmad.github.io/unicert**

MetaMask Browser Extension erforderlich · Netzwerk: Sepolia Testnet

---

---

# Deutsche Version

## Hintergrund

Die Fälschung akademischer Zeugnisse ist ein weit verbreitetes Problem.
Arbeitgeber verlassen sich auf papierbasierte Dokumente, die weder schnell
noch zuverlässig verifiziert werden können. Zentralisierte Datenbanken
sind anfällig für Datenverlust, Manipulation und Ausfälle.

UniCert begegnet diesem Problem mit einem dezentralen Ansatz auf Basis
der Ethereum-Blockchain. Zertifikate werden unveränderlich und
fälschungssicher gespeichert. Die Verifizierung ist kostenlos, sofort
und weltweit ohne Intermediär möglich.

---

## Funktionsweise

UniCert basiert auf einem Solidity Smart Contract, der auf der
Ethereum-Blockchain deployed ist. Die Interaktion erfolgt über eine
browserbasierte Web-Applikation, die via ethers.js mit MetaMask kommuniziert.

Das System unterscheidet drei Rollen:

**Hochschulen und Bildungseinrichtungen** deployen den Smart Contract
und erhalten damit exklusiven Schreibzugriff. Sie können Zertifikate
ausstellen und bei Bedarf widerrufen.

**Absolventen** erhalten nach der Ausstellung eine eindeutige
Zertifikat-ID, die als kryptografischer Nachweis ihres Abschlusses dient.
Diese ID kann jederzeit weitergegeben werden.

**Arbeitgeber und Verifizierer** können jede Zertifikat-ID kostenlos
und ohne eigenen Account prüfen. Das Ergebnis ist sofort und
manipulationssicher.

---

## QR Code and PDF Verification

After a certificate is successfully issued, a PDF document is automatically
generated and downloaded. The PDF contains all certificate data as well as
a QR code for direct verification.

**Verification via smartphone:**
The QR code in the PDF links to a unique verification URL:
`https://alnaqeebahmad.github.io/unicert?verify=0x...`

When scanned with a smartphone, the UniCert platform opens automatically
and verifies the certificate directly from the Ethereum blockchain —
without MetaMask, without an account, and free of charge.

**Verification via laptop:**
Paste the certificate ID from the PDF into the input field and
click "Verifizieren" — also works without MetaMask.
## Technologie-Stack

| Komponente | Technologie |
|-----------|-------------|
| Smart Contract | Solidity 0.8.x |
| Blockchain | Ethereum Sepolia Testnet |
| Frontend | HTML5, CSS3, JavaScript |
| Blockchain-Bibliothek | ethers.js v5 |
| Wallet | MetaMask |
| Entwicklungsumgebung | Remix IDE, IntelliJ IDEA Ultimate |
| Lokales Testnetz | Ganache |
| Hosting | GitHub Pages |

---

## Smart Contract

| Detail | Wert |
|--------|------|
| Netzwerk | Ethereum Sepolia Testnet |
| Contract-Adresse | `0xAE4512CD58d831566463e9875398c12F54Ab3d34` |
| Compiler | Solidity 0.8.34 |
| Lizenz | MIT |

Etherscan:
https://sepolia.etherscan.io/address/0xAE4512CD58d831566463e9875398c12F54Ab3d34

---

## Contract-Funktionen

| Funktion | Zugriff | Gas | Beschreibung |
|---------|---------|-----|-------------|
| `zertifikatAusstellen()` | Aussteller | ~230,000 | Zertifikat auf der Blockchain erstellen |
| `zertifikatVerifizieren()` | Öffentlich | Kostenlos | Zertifikat anhand der ID abrufen |
| `zertifikatWiderrufen()` | Aussteller | ~35,000 | Zertifikat als ungültig markieren |
| `hochschule()` | Öffentlich | Kostenlos | Aussteller-Adresse abrufen |

---

## Projektstruktur
unicert/

│

├── contracts/

│   └── uniCert.sol         Smart Contract in Solidity.

│                           Enthält Struct, Mapping, Events,

│                           Modifier, Constructor und alle

│                           drei Hauptfunktionen.

│

├── src/

│   ├── css/

│   │   └── style.css       Stylesheet der Web-Applikation.

│   │                       Dark Theme, Orange-Akzent (#FF9100),

│   │                       responsives Grid-Layout.

│   │

│   └── js/

│       ├── abi.js           Application Binary Interface.

│       │                   Definiert alle öffentlichen Contract-

│       │                   Funktionen für ethers.js sowie

│       │                   die Contract-Adresse.

│       │

│       └── app.js           Haupt-Applikationslogik.

│                           MetaMask-Integration, alle drei

│                           Kernfunktionen, Event-Log-Parsing,

│                           Status-Anzeige.

│

├── index.html              Einstiegspunkt der Web-Applikation.

│                           HTML-Struktur, Formularfelder,

│                           Einbindung aller Ressourcen.

│

├── .gitignore              Schließt temporäre Dateien aus

│                           dem Git-Tracking aus.

│

└── README.md               Diese Datei.
---

## Lokal ausführen

### Voraussetzungen

| Tool | Download | Zweck |
|------|----------|-------|
| Git | https://git-scm.com | Repository klonen |
| MetaMask | https://metamask.io | Browser Wallet |
| Ganache | https://trufflesuite.com/ganache | Lokale Blockchain |
| Python 3.x | https://python.org | Lokaler Webserver |

### Repository klonen

```bash
git clone https://github.com/alnaqeebAhmad/unicert.git
cd unicert
```

### Ganache starten

1. Ganache öffnen und "Quickstart Ethereum" klicken
2. Ganache läuft auf `http://127.0.0.1:7545`
3. Ersten Account (Index 0) notieren — das ist der Aussteller-Account

### MetaMask konfigurieren

| Feld | Wert |
|------|------|
| Netzwerkname | Ganache Lokal |
| RPC-URL | `http://127.0.0.1:7545` |
| Chain-ID | `1337` |
| Symbol | ETH |

Ersten Ganache-Account in MetaMask importieren:
MetaMask → Konto importieren → Private Key aus Ganache einfügen.

### Contract deployen

1. https://remix.ethereum.org öffnen
2. Inhalt von `contracts/uniCert.sol` einfügen
3. Compiler `0.8.x` → Compile
4. Deploy & Run → Environment: "Browser Extension"
5. Deploy → MetaMask bestätigen
6. Contract-Adresse kopieren und in `src/js/abi.js` eintragen

### App starten

```bash
python -m http.server 8080
```

Browser öffnen: `http://localhost:8080`

---

## Online testen (Sepolia Testnet)

### MetaMask auf Sepolia wechseln

MetaMask → Netzwerk-Dropdown → "Sepolia"

Falls nicht sichtbar: Settings → Advanced → "Show test networks" aktivieren.

### Kostenlose Test-ETH holen

https://cloud.google.com/application/web3/faucet/ethereum/sepolia

MetaMask-Adresse eingeben → "Receive SepoliaETH" klicken → 1-2 Minuten warten.

### App aufrufen

https://alnaqeebahmad.github.io/unicert

### MetaMask verbinden

"MetaMask verbinden" klicken → Popup bestätigen.

### Zertifikat ausstellen

Formular ausfüllen → "Ausstellen" klicken → MetaMask bestätigen → Zertifikat-ID kopieren.

### Zertifikat verifizieren

Zertifikat-ID einfügen → "Verifizieren" klicken → Ergebnis wird sofort angezeigt.

---

## Sicherheitshinweise

Dieses Projekt läuft auf dem Sepolia Testnet und verwendet ausschließlich
wertlose Test-ETH. Private Keys und Seed Phrases dürfen niemals in einem
Repository gespeichert oder öffentlich geteilt werden.

---

## Referenzen

- Ethereum Developer Documentation. https://ethereum.org/developers
- Solidity Language Documentation. https://docs.soliditylang.org
- ethers.js v5 Documentation. https://docs.ethers.org/v5
- MetaMask Developer Documentation. https://docs.metamask.io
- Durant, Elizabeth and Trachy, Alison. Digital Diploma debuts at MIT.
  MIT News. October 17, 2017.
  Available: http://news.mit.edu/2017/mit-debuts-secure-digital-diploma-using-bitcoin-blockchain-technology-1017
- Wood, Gavin. Ethereum: A Secure Decentralised Generalised Transaction Ledger.
  Ethereum Yellow Paper. 2014.
  Available: http://gavwood.com/paper.pdf
- Nakamoto, Satoshi. Bitcoin: A Peer-to-Peer Electronic Cash System. 2008.
  Available: https://bitcoin.org/bitcoin.pdf

---

---

# English Version

## Background

The falsification of academic credentials is a widespread and growing problem.
Employers rely on paper-based documents that can neither be quickly nor
reliably verified. Centralized databases are vulnerable to data loss,
manipulation, and outages.

UniCert addresses this problem with a decentralized approach built on the
Ethereum blockchain. Certificates are stored immutably and tamper-proof.
Verification is free, instant, and globally accessible without any intermediary.

---

## How It Works

UniCert is based on a Solidity smart contract deployed on the Ethereum
blockchain. Interaction takes place through a browser-based web application
that communicates with MetaMask via ethers.js.

The system distinguishes three roles:

**Issuers** (universities and educational institutions) deploy the smart
contract and thereby receive exclusive write access. They can issue
certificates and revoke them if necessary.

**Graduates** receive a unique certificate ID after issuance, which serves
as a cryptographic proof of their degree. This ID can be shared at any time.

**Employers and verifiers** can check any certificate ID for free and without
their own account. The result is immediate and tamper-proof.

---

## QR Code and PDF Verification

After a certificate is successfully issued, a PDF document is automatically
generated and downloaded. The PDF contains all certificate data as well as
a QR code for direct verification.

**Verification via smartphone:**
The QR code in the PDF links to a unique verification URL:
`https://alnaqeebahmad.github.io/unicert?verify=0x...`

When scanned with a smartphone, the UniCert platform opens automatically
and verifies the certificate directly from the Ethereum blockchain —
without MetaMask, without an account, and free of charge.

**Verification via laptop:**
Paste the certificate ID from the PDF into the input field and
click "Verifizieren" — also works without MetaMask.

## Technology Stack

| Component | Technology |
|-----------|------------|
| Smart Contract | Solidity 0.8.x |
| Blockchain | Ethereum Sepolia Testnet |
| Frontend | HTML5, CSS3, JavaScript |
| Blockchain Library | ethers.js v5 |
| Wallet | MetaMask |
| Development Environment | Remix IDE, IntelliJ IDEA Ultimate |
| Local Test Network | Ganache |
| Hosting | GitHub Pages |

---

## Smart Contract

| Detail | Value |
|--------|-------|
| Network | Ethereum Sepolia Testnet |
| Contract Address | `0xAE4512CD58d831566463e9875398c12F54Ab3d34` |
| Compiler | Solidity 0.8.34 |
| License | MIT |

Etherscan:
https://sepolia.etherscan.io/address/0xAE4512CD58d831566463e9875398c12F54Ab3d34

---

## Contract Functions

| Function | Access | Gas | Description |
|----------|--------|-----|-------------|
| `zertifikatAusstellen()` | Issuer only | ~230,000 | Create a new certificate on the blockchain |
| `zertifikatVerifizieren()` | Public | Free | Retrieve a certificate by ID |
| `zertifikatWiderrufen()` | Issuer only | ~35,000 | Mark a certificate as invalid |
| `hochschule()` | Public | Free | Retrieve the issuer address |

---

## Project Structure
unicert/

│

├── contracts/

│   └── uniCert.sol         Smart contract written in Solidity.

│                           Contains struct definition, mapping,

│                           events, access modifier, constructor,

│                           and all three main functions.

│

├── src/

│   ├── css/

│   │   └── style.css       Stylesheet for the web application.

│   │                       Dark theme, orange accent (#FF9100),

│   │                       responsive grid layout.

│   │

│   └── js/

│       ├── abi.js           Application Binary Interface.

│       │                   Defines all public contract functions

│       │                   for ethers.js and holds the contract address.

│       │

│       └── app.js           Main application logic.

│                           MetaMask integration, all three core

│                           functions, event log parsing,

│                           status display.

│

├── index.html              Entry point of the web application.

│                           HTML structure, form fields,

│                           resource loading.

│

├── .gitignore              Excludes temporary files from

│                           Git tracking.

│

└── README.md               This file.
---

## Local Setup

### Prerequisites

| Tool | Download | Purpose |
|------|----------|---------|
| Git | https://git-scm.com | Clone the repository |
| MetaMask | https://metamask.io | Browser wallet |
| Ganache | https://trufflesuite.com/ganache | Local blockchain |
| Python 3.x | https://python.org | Local web server |

### Clone the Repository

```bash
git clone https://github.com/alnaqeebAhmad/unicert.git
cd unicert
```

### Start Ganache

1. Open Ganache and click "Quickstart Ethereum"
2. Ganache runs on `http://127.0.0.1:7545`
3. Note the first account (Index 0) — this is the issuer account

### Configure MetaMask

| Field | Value |
|-------|-------|
| Network Name | Ganache Local |
| RPC URL | `http://127.0.0.1:7545` |
| Chain ID | `1337` |
| Symbol | ETH |

Import the first Ganache account into MetaMask:
MetaMask → Import Account → paste the private key from Ganache.

### Deploy the Contract

1. Open https://remix.ethereum.org
2. Paste the contents of `contracts/uniCert.sol`
3. Compiler `0.8.x` → Compile
4. Deploy & Run → Environment: "Browser Extension"
5. Deploy → confirm in MetaMask
6. Copy the contract address and enter it in `src/js/abi.js`

### Start the Application

```bash
python -m http.server 8080
```

Open your browser and navigate to `http://localhost:8080`.

---

## Online Testing (Sepolia Testnet)

### Switch MetaMask to Sepolia

MetaMask → Network dropdown → "Sepolia"

If not visible: Settings → Advanced → enable "Show test networks".

### Get Free Test ETH

https://cloud.google.com/application/web3/faucet/ethereum/sepolia

Enter your MetaMask address → click "Receive SepoliaETH" → wait 1-2 minutes.

### Open the Application

https://alnaqeebahmad.github.io/unicert

### Connect MetaMask

Click "MetaMask verbinden" → confirm the popup.

### Issue a Certificate

Fill in the form → click "Ausstellen" → confirm in MetaMask → copy the certificate ID.

### Verify a Certificate

Paste the certificate ID → click "Verifizieren" → result is displayed immediately.

---

## Security Notes

This project runs on the Sepolia Testnet and uses only worthless test ETH.
Private keys and seed phrases must never be stored in a repository or
shared publicly.

---

## References

- Ethereum Developer Documentation. https://ethereum.org/developers
- Solidity Language Documentation. https://docs.soliditylang.org
- ethers.js v5 Documentation. https://docs.ethers.org/v5
- MetaMask Developer Documentation. https://docs.metamask.io
- Durant, Elizabeth and Trachy, Alison. Digital Diploma debuts at MIT.
  MIT News. October 17, 2017.
  Available: http://news.mit.edu/2017/mit-debuts-secure-digital-diploma-using-bitcoin-blockchain-technology-1017
- Wood, Gavin. Ethereum: A Secure Decentralised Generalised Transaction Ledger.
  Ethereum Yellow Paper. 2014.
  Available: http://gavwood.com/paper.pdf
- Nakamoto, Satoshi. Bitcoin: A Peer-to-Peer Electronic Cash System. 2008.
  Available: https://bitcoin.org/bitcoin.pdf