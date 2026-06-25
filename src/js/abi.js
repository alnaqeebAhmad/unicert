// ABI – Application Binary Interface
// Beschreibt alle öffentlichen Funktionen des UniCert Contracts
// Muss exakt mit dem deployed Contract übereinstimmen

const UNICERT_ABI = [
    "function hochschule() view returns (address)",
    "function zertifikatAusstellen(string,string,string,string,uint256) returns (bytes32)",
    "function zertifikatVerifizieren(bytes32) view returns (string,string,string,string,uint256,uint256,bool)",
    "function zertifikatWiderrufen(bytes32)",
    "function alleIds(uint256) view returns (bytes32)",
    "event ZertifikatAusgestellt(bytes32 indexed,string,string,uint256)",
    "event ZertifikatWiderrufen(bytes32 indexed)"
];
// Sepolia Testnet Contract Address
const CONTRACT_ADDRESS = "0xAE4512CD58d831566463e9875398c12F54Ab3d34";