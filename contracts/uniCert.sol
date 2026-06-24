// SPDX-License-Identifier: MIT
// SPDX -> open-source-license marker
pragma solidity ^0.8.0;

contract UniCert {
    address public hochschule;

    struct Zertifikat {
        string studentenName;
        string matrikelnummer;
        string studiengang;
        string abschluss;
        uint256 noteX100;                                       // 1.7 -> ignores DecimalNrs
        uint256 ausstellungsDatum;
        bool gueltig;
    }
    mapping(bytes32 => Zertifikat) public zertifikate;          //Solidity's HashMap-ID -> Zertifikat.
    bytes32[] public alleIds;                                  // Array of all ID's, so Lists can be built later

    //Events: Notifications logged to the Blockchain, MetaMask and Web-App can capture them
    //Indexed: means these Filters can be filtered
    event ZertifikatAusgestellt(
        bytes32 indexed zertifikatId,
        string studentenName,
        string matrikelnummer,
        uint256 ausstellungsDatum
    );

    event ZertifikatWiderrufen(
        bytes32 indexed zertifikatId
    );

    //Modifier: re-useable Access-Controll
    modifier nurHochschule(){
        require(
            msg.sender ==hochschule,
            "Nur die Hochschule darf das"
    );
        _;                                                     // _; -> function here keeps on going
    }

    constructor(){                                             // used only once by deployment
        hochschule = msg.sender;                               // msg.sender -> who deploys the contract assigned automatic to the uni
    }

    //Function: Create
    function zertifikatAusstellen(
        string memory _studentenName,                          //Memory -> parameter kept only during the call
        string memory _matrikelnummer,
        string memory _studiengang,
        string memory _abschluss,
        uint256 _noteX100
    ) public nurHochschule returns (bytes32){

        bytes32 id = keccak256(abi.encodePacked(        //keccak256 -> Ethereum's Hash-Function, creates unique IDs
        _matrikelnummer,
        _studiengang,
        block.timestamp                                       // actual UNIX-timestamp of the  Blockchain
    ));

        zertifikate[id] = Zertifikat({
        studentenName:  _studentenName,
        matrikelnummer: _matrikelnummer,
        studiengang:    _studiengang,
        abschluss:      _abschluss,
        noteX100:       _noteX100,
        ausstellungsDatum:  block.timestamp,
        gueltig:        true
    });

        alleIds.push(id);
        //emit ->starts the defined event
        emit ZertifikatAusgestellt(id,_studentenName,_matrikelnummer, block.timestamp);
        return id;
    }
    /* Function: view -> reads only
     * storage -> Refernce of the real Blockchain Variable, no copie
     * require -> sends a failure, when the date = 0 -> means no ID exists
     */
    function zertifikatVerifizieren(bytes32 _id)
        public view
        returns(
        string memory,
        string memory,
        string memory,
        string memory,
        uint256,
        uint256,
        bool
    )
    {
        Zertifikat storage z = zertifikate[_id];
        require(z.ausstellungsDatum != 0, "Zertifikate nicht gefunden");

        return(
        z.studentenName,
        z.matrikelnummer,
        z.studiengang,
        z.abschluss,
        z.noteX100,
        z.ausstellungsDatum,
        z.gueltig
    );

    }

    /*
     * Function -> revoke
     */
    function zertifikatWiderrufen(bytes32 _id)
    public nurHochschule
    {
        require(zertifikate[_id].ausstellungsDatum != 0, "Zertifikate nicht gefunden");
        require(zertifikate[_id].gueltig, "Bereits widerrufen");

        zertifikate[_id].gueltig = false;
        emit ZertifikatWiderrufen(_id);

    }
}