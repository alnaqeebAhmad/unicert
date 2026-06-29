// app.js – UniCert Web-App Logic
// connects Frontend with the Ethereum Smart Contract via ethers.js

'use strict';

//  Global Variables
let provider = null;
let signer   = null;
let contract = null;
let account  = null;

// Auto-Verifizierung via URL-Parameter
// Falls URL ?verify=0x... enthält, wird sofort verifiziert
window.addEventListener('DOMContentLoaded', () => {
    // Buttons verbinden
    document.getElementById('btn-connect').addEventListener('click', connectWallet);
    document.getElementById('btn-ausstellen').addEventListener('click', ausstellen);
    document.getElementById('btn-verifizieren').addEventListener('click', verifizieren);
    document.getElementById('btn-widerrufen').addEventListener('click', widerrufen);

    // Auto-Verifizierung via URL-Parameter
    const params = new URLSearchParams(window.location.search);
    const autoVerifyId = params.get('verify');
    if (autoVerifyId) {
        document.getElementById('inp-zert-id').value = autoVerifyId;
        setTimeout(async () => {
            const readProvider = new ethers.providers.JsonRpcProvider(
                //'https://ethereum-sepolia-rpc.publicnode.com'
                // Neu:
                'https://rpc.sepolia.org'
            );
            const readContract = new ethers.Contract(CONTRACT_ADDRESS, UNICERT_ABI, readProvider);
            try {
                const z = await readContract.zertifikatVerifizieren(autoVerifyId);
                const note  = (z[4].toNumber() / 100).toFixed(1);
                const datum = new Date(z[5].toNumber() * 1000).toLocaleDateString('de-DE');
                showStatus('success',
                    `${z[6] ? '✅ GÜLTIG' : '❌ WIDERRUFEN'}\n` +
                    `Name:        ${z[0]}\n` +
                    `Matrikel:    ${z[1]}\n` +
                    `Studiengang: ${z[2]}\n` +
                    `Abschluss:   ${z[3]}\n` +
                    `Note:        ${note}\n` +
                    `Ausgestellt: ${datum}`
                );
            } catch (err) {
                showStatus('error', 'Zertifikat nicht gefunden: ' + err.message);
            }
        }, 1000);
    }
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
        // PDF mit QR-Code generieren
        await generatePDF(
            zertId,
            name,
            matrikel,
            studgang,
            abschluss,
            (note).toFixed(1),
            receipt.blockNumber
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
            `Ausgestellt: ${datum}`
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

// PDF + QR-Code generieren
async function generatePDF(zertId, name, matrikel, studgang, abschluss, note, blockNr) {
    const verifyUrl = `https://alnaqeebahmad.github.io/unicert?verify=${zertId}`;

    // QR-Code generieren
    const qrContainer = document.getElementById('qr-container');
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
        text: verifyUrl,
        width: 200,
        height: 200,
        correctLevel: QRCode.CorrectLevel.H
    });

    // Kurz warten bis QR-Code gerendert ist
    await new Promise(resolve => setTimeout(resolve, 500));

    const qrCanvas = qrContainer.querySelector('canvas');
    const qrDataUrl = qrCanvas.toDataURL('image/png');

    // PDF erstellen
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Hintergrund
    doc.setFillColor(15, 15, 26);
    doc.rect(0, 0, 210, 297, 'F');

    // Orange Linie oben
    doc.setDrawColor(255, 145, 0);
    doc.setLineWidth(2);
    doc.line(15, 20, 195, 20);

    // Titel
    doc.setTextColor(255, 145, 0);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('UniCert', 105, 35, { align: 'center' });

    // Untertitel
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Blockchain-gesichertes Abschlusszertifikat', 105, 44, { align: 'center' });

    // Orange Linie unter Titel
    doc.setDrawColor(255, 145, 0);
    doc.setLineWidth(0.5);
    doc.line(15, 50, 195, 50);

    // Zertifikat-Daten
    doc.setTextColor(136, 146, 164);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const felder = [
        ['Name',         name],
        ['Matrikelnummer', matrikel],
        ['Studiengang',  studgang],
        ['Abschluss',    abschluss],
        ['Note',         note],
        ['Block',        `#${blockNr}`],
    ];

    let y = 68;
    felder.forEach(([label, wert]) => {
        doc.setTextColor(136, 146, 164);
        doc.setFontSize(9);
        doc.text(label, 20, y);

        doc.setTextColor(224, 224, 224);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(wert, 20, y + 6);
        doc.setFont('helvetica', 'normal');
        y += 18;
    });

    // Zertifikat-ID
    doc.setTextColor(136, 146, 164);
    doc.setFontSize(9);
    doc.text('Zertifikat-ID (Blockchain)', 20, y);
    doc.setTextColor(255, 145, 0);
    doc.setFontSize(7);
    doc.text(zertId, 20, y + 6);
    y += 18;

    // Trennlinie
    doc.setDrawColor(255, 145, 0);
    doc.setLineWidth(0.3);
    doc.line(15, y + 5, 195, y + 5);

    // QR-Code
    doc.addImage(qrDataUrl, 'PNG', 130, 65, 60, 60);

    doc.setTextColor(136, 146, 164);
    doc.setFontSize(8);
    doc.text('QR-Code scannen', 160, 130, { align: 'center' });
    doc.text('zur Verifizierung', 160, 135, { align: 'center' });

    // Footer
    doc.setDrawColor(255, 145, 0);
    doc.setLineWidth(0.5);
    doc.line(15, 275, 195, 275);

    doc.setTextColor(136, 146, 164);
    doc.setFontSize(8);
    doc.text('Dieses Zertifikat ist auf der Ethereum Sepolia Blockchain verankert.', 105, 282, { align: 'center' });
    doc.text('Verifizierung: ' + verifyUrl, 105, 288, { align: 'center' });

    // PDF speichern
    doc.save(`UniCert_${name.replace(' ', '_')}_${matrikel}.pdf`);
}