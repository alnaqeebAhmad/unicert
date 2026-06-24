// app.js – UniCert Web-App Logic
// connects Frontend with the Ethereum Smart Contract via ethers.js

'use strict';

//  Global Variables
let provider = null;
let signer   = null;
let contract = null;
let account  = null;

// App starts when DOM loaded
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-connect').addEventListener('click', connectWallet);
    document.getElementById('btn-ausstellen').addEventListener('click', ausstellen);
    document.getElementById('btn-verifizieren').addEventListener('click', verifizieren);
    document.getElementById('btn-widerrufen').addEventListener('click', widerrufen);
});
// Wallet connection
async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        showStatus('error', 'MetaMask nicht gefunden! Bitte installieren.');
        return;
    }

    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer   = provider.getSigner();
        account  = await signer.getAddress();
        contract = new ethers.Contract(CONTRACT_ADDRESS, UNICERT_ABI, signer);

        // checks if logged Account from the University is
        const hochschule = await contract.hochschule();
        const istHS = account.toLowerCase() === hochschule.toLowerCase();

        document.getElementById('wallet-info').textContent =
            `Verbunden: ${account.slice(0,6)}...${account.slice(-4)} ${istHS ? '🏛️ Hochschule' : '👤 Gast'}`;

        showStatus('success', 'Wallet erfolgreich verbunden!');

    } catch (err) {
        showStatus('error', 'Verbindung fehlgeschlagen: ' + err.message);
    }
}

// MetaMask Account-change
window.ethereum?.on('accountsChanged', () => location.reload());
window.ethereum?.on('chainChanged',    () => location.reload());

// Certificates issue (only Universities)
async function ausstellen() {
    if (!contract) { showStatus('error', 'Bitte zuerst Wallet verbinden!'); return; }

    const name      = document.getElementById('inp-name').value.trim();
    const matrikel  = document.getElementById('inp-matrikel').value.trim();
    const studgang  = document.getElementById('inp-studiengang').value.trim();
    const abschluss = document.getElementById('inp-abschluss').value.trim();
    const note      = parseFloat(document.getElementById('inp-note').value);

    if (!name || !matrikel || !studgang || !abschluss || isNaN(note)) {
        showStatus('error', 'Bitte alle Felder ausfüllen!');
        return;
    }

    const noteX100 = Math.round(note * 100); // 1.7 → 170

    try {
        showStatus('info', 'Transaktion wird gesendet… MetaMask bestätigen.');

        const tx = await contract.zertifikatAusstellen(
            name, matrikel, studgang, abschluss, noteX100
        );

        showStatus('info', `Warte auf Bestätigung… TX: ${tx.hash.slice(0,10)}...`);
        const receipt = await tx.wait();    // wartet bis Block gemined

        // read Certificate-ID from Event
        /*Old Bug const event = receipt.events?.find(e => e.event === 'ZertifikatAusgestellt');
        const zertId = event?.args?.zertifikatId; */
        /*Correction: receipt.events works only with Truffle with MetaMask/Browser we must parse Logs manually with iface.parseLog(). */
        const iface = new ethers.utils.Interface(UNICERT_ABI);
        let zertId = null;
        for (const log of receipt.logs) {
            try {
                const parsed = iface.parseLog(log);
                if (parsed.name === 'ZertifikatAusgestellt') {
                    zertId = parsed.args[0];
                }
            } catch {}
        }

        showStatus('success',
            `✅ Zertifikat ausgestellt!\nID: ${zertId}\nBlock: #${receipt.blockNumber}`
        );

    } catch (err) {
        showStatus('error', 'Fehler: ' + (err.reason || err.message));
    }
}

// ── Zertifikat verifizieren (öffentlich, kein Gas) ─────────
async function verifizieren() {
    if (!contract) { showStatus('error', 'Bitte zuerst Wallet verbinden!'); return; }

    const id = document.getElementById('inp-zert-id').value.trim();
    if (!id) { showStatus('error', 'Bitte Zertifikat-ID eingeben!'); return; }

    try {
        const z = await contract.zertifikatVerifizieren(id);
        // z = [name, matrikel, studgang, abschluss, noteX100, datum, gueltig]

        const note  = (z[4].toNumber() / 100).toFixed(1);
        const datum = new Date(z[5].toNumber() * 1000).toLocaleDateString('de-DE');
        const status = z[6] ? '✅ GÜLTIG' : '❌ WIDERRUFEN';

        showStatus('success',
            `${status}\n` +
            `Name:       ${z[0]}\n` +
            `Matrikel:   ${z[1]}\n` +
            `Studiengang:${z[2]}\n` +
            `Abschluss:  ${z[3]}\n` +
            `Note:       ${note}\n` +
            `Ausgestellt:${datum}`
        );

    } catch (err) {
        showStatus('error', 'Zertifikat nicht gefunden: ' + (err.reason || err.message));
    }
}

// Certificates cancel (only Universities)
async function widerrufen() {
    if (!contract) { showStatus('error', 'Bitte zuerst Wallet verbinden!'); return; }

    const id = document.getElementById('inp-zert-id').value.trim();
    if (!id) { showStatus('error', 'Bitte Zertifikat-ID eingeben!'); return; }

    if (!confirm('Zertifikat wirklich widerrufen? Nicht rückgängig machbar!')) return;

    try {
        showStatus('info', 'Widerruf wird gesendet… MetaMask bestätigen.');
        const tx = await contract.zertifikatWiderrufen(id);
        const receipt = await tx.wait();
        showStatus('success', `✅ Zertifikat widerrufen! Block: #${receipt.blockNumber}`);
    } catch (err) {
        showStatus('error', 'Fehler: ' + (err.reason || err.message));
    }
}

// Show-Status
function showStatus(type, message) {
    const el = document.getElementById('status');
    el.className = `status ${type}`;  // CSS-Klasse: success / error / info
    el.textContent = message;
    el.style.display = 'block';
}