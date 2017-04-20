settings.primaryColor = "#FFE7D2";
settings.primaryLight = "#FFF4EB";
settings.autocomplete = false;
settings.wordpicture = false;

$("#lemgram_list_item").remove();
//$("#showLineDiagram").remove();

settings.corpora = {};
settings.corporafolders = {};

settings.interfraStructs = {
    "u_who": {
        label: "speaker",
        dataset: {},
        extendedController: selectType.extendedController,
        extendedTemplate: selectType.extendedTemplate
    },
    "text_part": {
        label: "part",
        dataset: {"1A": "1A", "1B": "1B", "2": "2"},
        extendedController: selectType.extendedController,
        extendedTemplate: selectType.extendedTemplate
    },
    "text_group": {
        label: "group",
        dataset: {
            "G": "Secondary school students (G)",
            "N": "Beginners (N)",
            "L": "1st and 2nd years’ university students (L)",
            "T": "1st and 2nd years’ university students (T)",
            "R": "Future teachers (R)",
            "D": "PhD students (D)",
            "F": "FSL juniors (F)",
            "Q": "FSL seniors (Q)",
            "M": "Multi-task group NNS (M)",
            "C": "Erasmus exchange control group (C)",
            "J": "Control group of junior NS (J)",
            "S": "Control group of senior NS (S)",
            "K": "Multi-task control group (K)"
        },
        extendedController: selectType.extendedController,
        extendedTemplate: selectType.extendedTemplate
    },
    "text_xmlurl": {label: "interview", pattern: '<a href="<%=val%>">XML</a>', hideStatistics: true, hideExtended: true, hideCompare: true},
    "text_rawurl": {label: "interview", pattern: '<a href="<%=val%>">TXT</a>', hideStatistics: true, hideExtended: true, hideCompare: true},
    "text_mp3url": {label: "interview", pattern: '<a href="<%=val%>">MP3</a>', hideStatistics: true, hideExtended: true, hideCompare: true},
    "text_activity": {label: "activity"},
    "text_interviewee": {
        label: "interviewee",
        dataset: {},
        extendedController: selectType.extendedController,
        extendedTemplate: selectType.extendedTemplate
    },
    
    
    /*"text_interviewee": {label: "interviewee"},*/
    "text_activity_date": {label: "date"}/*,
    "text_transcriber": {label: ""},
    "text_transcription_date": {label: ""},
    "text_transcription_checker": {label: ""},
    "text_check_date": {label: ""}*/
};

s = _.cloneDeep(settings.interfraStructs)
s["text_part"]["dataset"] = {"1B": "1B", "2": "2"};
s["u_who"]["dataset"] = {"//": "//",
"ALE": "ALE",
"AMA": "AMA",
"AND": "AND",
"ANI": "ANI",
"ANJ": "ANJ",
"ANK": "ANK",
"ANN": "ANN",
"ARI": "ARI",
"BEA": "BEA",
"BER": "BER",
"BNJ": "BNJ",
"BNO": "BNO",
"BRI": "BRI",
"CAM": "CAM",
"CAR": "CAR",
"CAT": "CAT",
"CEC": "CEC",
"CHE": "CHE",
"CHN": "CHN",
"CHR": "CHR",
"CIA": "CIA",
"CLA": "CLA",
"COC": "COC",
"COR": "COR",
"DAN": "DAN",
"DAV": "DAV",
"DEL": "DEL",
"DOM": "DOM",
"DOR": "DOR",
"EBB": "EBB",
"ELI": "ELI",
"ELN": "ELN",
"ELO": "ELO",
"ELS": "ELS",
"EME": "EME",
"EMM": "EMM",
"ERI": "ERI",
"EVA": "EVA",
"FEL": "FEL",
"FIL": "FIL",
"FRA": "FRA",
"FRI": "FRI",
"GAB": "GAB",
"GAE": "GAE",
"GHI": "GHI",
"GOS": "GOS",
"GUD": "GUD",
"GUN": "GUN",
"HAN": "HAN",
"HED": "HED",
"HEI": "HEI",
"HEN": "HEN",
"HIL": "HIL",
"I": "I",
"IDA": "IDA",
"INE": "INE",
"ING": "ING",
"IRE": "IRE",
"ISA": "ISA",
"JAC": "JAC",
"JAN": "JAN",
"JAS": "JAS",
"JEA": "JEA",
"JEN": "JEN",
"JER": "JER",
"JES": "JES",
"JON": "JON",
"JOS": "JOS",
"KAJ": "KAJ",
"KAR": "KAR",
"KAT": "KAT",
"KER": "KER",
"KNU": "KNU",
"LAI": "LAI",
"LAR": "LAR",
"LAU": "LAU",
"LEN": "LEN",
"LIL": "LIL",
"LIN": "LIN",
"LIS": "LIS",
"LIT": "LIT",
"LIV": "LIV",
"LUC": "LUC",
"LYD": "LYD",
"MAG": "MAG",
"MAL": "MAL",
"MAR": "MAR",
"MAU": "MAU",
"MEL": "MEL",
"MIA": "MIA",
"MIC": "MIC",
"MIM": "MIM",
"MIN": "MIN",
"MIR": "MIR",
"MOA": "MOA",
"MON": "MON",
"MTI": "MTI",
"MTT": "MTT",
"NAT": "NAT",
"NIC": "NIC",
"NIL": "NIL",
"NIN": "NIN",
"NOR": "NOR",
"OLI": "OLI",
"OSK": "OSK",
"PAT": "PAT",
"PAU": "PAU",
"PEL": "PEL",
"PER": "PER",
"PET": "PET",
"PHI": "PHI",
"PIE": "PIE",
"RAC": "RAC",
"RAG": "RAG",
"RIT": "RIT",
"ROB": "ROB",
"ROS": "ROS",
"SAB": "SAB",
"SAG": "SAG",
"SAN": "SAN",
"SAR": "SAR",
"SIM": "SIM",
"SIR": "SIR",
"SIV": "SIV",
"SOF": "SOF",
"SON": "SON",
"SOP": "SOP",
"STE": "STE",
"SUS": "SUS",
"TAN": "TAN",
"TEA": "TEA",
"THE": "THE",
"THI": "THI",
"TOM": "TOM",
"URS": "URS",
"VAN": "VAN",
"VER": "VER",
"VIV": "VIV",
"WER": "WER",
"YLV": "YLV",
"YVO": "YVO",
"ZIT": "ZIT"};
s["text_interviewee"]["dataset"] = {"ALE": "ALE",
"AMA": "AMA",
"AND": "AND",
"ANI": "ANI",
"ANJ": "ANJ",
"ANK": "ANK",
"ANN": "ANN",
"ARI": "ARI",
"BEA": "BEA",
"BER": "BER",
"BNJ": "BNJ",
"BNO": "BNO",
"BRI": "BRI",
"CAM": "CAM",
"CAR": "CAR",
"CAT": "CAT",
"CEC": "CEC",
"CHE": "CHE",
"CHN": "CHN",
"CHR": "CHR",
"CIA": "CIA",
"CLA": "CLA",
"COC": "COC",
"COR": "COR",
"DAN": "DAN",
"DAV": "DAV",
"DEL": "DEL",
"DOM": "DOM",
"DOR": "DOR",
"EBB": "EBB",
"ELI": "ELI",
"ELN": "ELN",
"ELO": "ELO",
"ELS": "ELS",
"EME": "EME",
"EMM": "EMM",
"ERI": "ERI",
"EVA": "EVA",
"FEL": "FEL",
"FIL": "FIL",
"FRA": "FRA",
"FRI": "FRI",
"GAB": "GAB",
"GAE": "GAE",
"GHI": "GHI",
"GOS": "GOS",
"GUD": "GUD",
"GUN": "GUN",
"HAN": "HAN",
"HED": "HED",
"HEI": "HEI",
"HEN": "HEN",
"HIL": "HIL",
"IDA": "IDA",
"INE": "INE",
"ING": "ING",
"IRE": "IRE",
"ISA": "ISA",
"JAC": "JAC",
"JAN": "JAN",
"JAS": "JAS",
"JEA": "JEA",
"JEN": "JEN",
"JER": "JER",
"JES": "JES",
"JON": "JON",
"JOS": "JOS",
"KAJ": "KAJ",
"KAR": "KAR",
"KAT": "KAT",
"KER": "KER",
"KNU": "KNU",
"LAI": "LAI",
"LAR": "LAR",
"LAU": "LAU",
"LEN": "LEN",
"LIL": "LIL",
"LIN": "LIN",
"LIS": "LIS",
"LIT": "LIT",
"LIV": "LIV",
"LUC": "LUC",
"LYD": "LYD",
"MAG": "MAG",
"MAL": "MAL",
"MAR": "MAR",
"MAU": "MAU",
"MEL": "MEL",
"MIA": "MIA",
"MIC": "MIC",
"MIM": "MIM",
"MIN": "MIN",
"MIR": "MIR",
"MOA": "MOA",
"MON": "MON",
"MTI": "MTI",
"MTT": "MTT",
"NAT": "NAT",
"NIC": "NIC",
"NIL": "NIL",
"NIN": "NIN",
"NOR": "NOR",
"OLI": "OLI",
"OSK": "OSK",
"PAT": "PAT",
"PAU": "PAU",
"PEL": "PEL",
"PER": "PER",
"PET": "PET",
"PHI": "PHI",
"PIE": "PIE",
"RAC": "RAC",
"RAG": "RAG",
"RIT": "RIT",
"ROB": "ROB",
"ROS": "ROS",
"SAB": "SAB",
"SAG": "SAG",
"SAN": "SAN",
"SAR": "SAR",
"SIM": "SIM",
"SIR": "SIR",
"SIV": "SIV",
"SOF": "SOF",
"SON": "SON",
"SOP": "SOP",
"STE": "STE",
"SUS": "SUS",
"TAN": "TAN",
"TEA": "TEA",
"THE": "THE",
"THI": "THI",
"TOM": "TOM",
"URS": "URS",
"VAN": "VAN",
"VER": "VER",
"VIV": "VIV",
"WER": "WER",
"YLV": "YLV",
"YVO": "YVO",
"ZIT": "ZIT"};

ss = _.cloneDeep(settings.interfraStructs)
ss["text_part"]["dataset"] = {"1B": "1B", "2": "2"};
ss["u_who"]["dataset"] = {"AND": "AND",
"ANI": "ANI",
"BRI": "BRI",
"CAM": "CAM",
"CHR": "CHR",
"COR": "COR",
"HAN": "HAN",
"I": "I",
"IDA": "IDA",
"ING": "ING",
"JES": "JES",
"KER": "KER",
"LEN": "LEN",
"LIV": "LIV",
"MAR": "MAR",
"MIN": "MIN",
"MOA": "MOA",
"MON": "MON",
"NAT": "NAT",
"PAT": "PAT",
"PEL": "PEL",
"PER": "PER",
"TAN": "TAN",
"URS": "URS",
"VER": "VER",
"YVO": "YVO"};
ss["text_interviewee"]["dataset"] = {"AND": "AND",
"ANI": "ANI",
"BRI": "BRI",
"CAM": "CAM",
"CHR": "CHR",
"COR": "COR",
"HAN": "HAN",
"IDA": "IDA",
"ING": "ING",
"JES": "JES",
"KER": "KER",
"LEN": "LEN",
"LIV": "LIV",
"MAR": "MAR",
"MIN": "MIN",
"MOA": "MOA",
"MON": "MON",
"NAT": "NAT",
"PAT": "PAT",
"PEL": "PEL",
"PER": "PER",
"TAN": "TAN",
"URS": "URS",
"VER": "VER",
"YVO": "YVO"};

st = _.cloneDeep(settings.interfraStructs)
st["text_part"]["dataset"] = {"1A": "1A"};
st["u_who"]["dataset"] = {"ALE": "ALE",
"AMA": "AMA",
"AND": "AND",
"ANI": "ANI",
"ANJ": "ANJ",
"ANK": "ANK",
"ANN": "ANN",
"BEA": "BEA",
"BER": "BER",
"CAR": "CAR",
"CAT": "CAT",
"CHR": "CHR",
"CIA": "CIA",
"CLA": "CLA",
"DAV": "DAV",
"DOR": "DOR",
"ELI": "ELI",
"ELN": "ELN",
"ELS": "ELS",
"EME": "EME",
"EMM": "EMM",
"ERI": "ERI",
"EVA": "EVA",
"FEL": "FEL",
"FIL": "FIL",
"FRA": "FRA",
"FRI": "FRI",
"GAB": "GAB",
"GAE": "GAE",
"GOS": "GOS",
"GUN": "GUN",
"HED": "HED",
"HEI": "HEI",
"HEN": "HEN",
"HIL": "HIL",
"IDA": "IDA",
"ING": "ING",
"IRE": "IRE",
"ISA": "ISA",
"JAN": "JAN",
"JER": "JER",
"JES": "JES",
"JON": "JON",
"JOS": "JOS",
"KAJ": "KAJ",
"KAR": "KAR",
"KAT": "KAT",
"KER": "KER",
"LAU": "LAU",
"LEN": "LEN",
"LIL": "LIL",
"LIN": "LIN",
"LIS": "LIS",
"LIT": "LIT",
"LUC": "LUC",
"MAG": "MAG",
"MAL": "MAL",
"MAR": "MAR",
"MEL": "MEL",
"MIA": "MIA",
"MON": "MON",
"NAT": "NAT",
"NIN": "NIN",
"NOR": "NOR",
"OLI": "OLI",
"OSK": "OSK",
"PAU": "PAU",
"PEL": "PEL",
"PER": "PER",
"PET": "PET",
"PHI": "PHI",
"PN": "PN",
"RAC": "RAC",
"RAG": "RAG",
"RIT": "RIT",
"ROB": "ROB",
"ROS": "ROS",
"SAB": "SAB",
"SIM": "SIM",
"SIR": "SIR",
"SIV": "SIV",
"SOF": "SOF",
"SUS": "SUS",
"THE": "THE",
"TOM": "TOM",
"URS": "URS",
"VER": "VER",
"VIV": "VIV",
"WER": "WER",
"YLV": "YLV",
"YVO": "YVO",
"ZIT": "ZIT"};
st["text_interviewee"]["dataset"] = {"ALE": "ALE",
"AMA": "AMA",
"AND": "AND",
"ANI": "ANI",
"ANJ": "ANJ",
"ANK": "ANK",
"ANN": "ANN",
"BEA": "BEA",
"BER": "BER",
"CAR": "CAR",
"CAT": "CAT",
"CHR": "CHR",
"CIA": "CIA",
"CLA": "CLA",
"DAV": "DAV",
"DOR": "DOR",
"ELI": "ELI",
"ELN": "ELN",
"ELS": "ELS",
"EME": "EME",
"EMM": "EMM",
"ERI": "ERI",
"EVA": "EVA",
"FEL": "FEL",
"FIL": "FIL",
"FRA": "FRA",
"FRI": "FRI",
"GAB": "GAB",
"GAE": "GAE",
"GOS": "GOS",
"GUN": "GUN",
"HED": "HED",
"HEI": "HEI",
"HEN": "HEN",
"HIL": "HIL",
"IDA": "IDA",
"ING": "ING",
"IRE": "IRE",
"ISA": "ISA",
"JAN": "JAN",
"JER": "JER",
"JES": "JES",
"JON": "JON",
"JOS": "JOS",
"KAJ": "KAJ",
"KAR": "KAR",
"KAT": "KAT",
"KER": "KER",
"LAU": "LAU",
"LEN": "LEN",
"LIL": "LIL",
"LIN": "LIN",
"LIS": "LIS",
"LIT": "LIT",
"LUC": "LUC",
"MAG": "MAG",
"MAL": "MAL",
"MAR": "MAR",
"MEL": "MEL",
"MIA": "MIA",
"MON": "MON",
"NAT": "NAT",
"NIN": "NIN",
"NOR": "NOR",
"OLI": "OLI",
"OSK": "OSK",
"PAU": "PAU",
"PEL": "PEL",
"PER": "PER",
"PET": "PET",
"PHI": "PHI",
"PN": "PN",
"RAC": "RAC",
"RAG": "RAG",
"RIT": "RIT",
"ROB": "ROB",
"ROS": "ROS",
"SAB": "SAB",
"SIM": "SIM",
"SIR": "SIR",
"SIV": "SIV",
"SOF": "SOF",
"SUS": "SUS",
"THE": "THE",
"TOM": "TOM",
"URS": "URS",
"VER": "VER",
"VIV": "VIV",
"WER": "WER",
"YLV": "YLV",
"YVO": "YVO",
"ZIT": "ZIT"};


settings.corpora.interfra = {
    id: "interfra",
    title: "InterFra",
    description: '<a target="_blank" href="http://spraakbanken.gu.se/eng/resource/interfra">Mer information om korpusen</a><br>Innehåller c:a 900 000 ord',
    within: spWithin,
    context: spContext,
    attributes: {
        "type": {
            label: "type"
        }
    },
    structAttributes: s,
};

settings.corpora["interfra-tagged"] = {
    id: "interfra-tagged",
    title: "InterFra taggad",
    description: '<a target="_blank" href="http://spraakbanken.gu.se/eng/resource/interfra">Mer information om korpusen</a><br>Innehåller c:a 330 000 ord',
    within: spWithin,
    context: spContext,
    attributes: {
        "type": {
            label: "type"
        }
    },
    structAttributes: st,
};

settings.corpora["interfra-sv"] = {
    id: "interfra-sv",
    title: "InterFra svenska",
    description: '<a target="_blank" href="http://spraakbanken.gu.se/eng/resource/interfra">Mer information om korpusen</a><br>Innehåller c:a 45 500 ord',
    within: spWithin,
    context: spContext,
    attributes: {
        pos: attrs.pos,
        msd: attrs.msd,
        lemma: attrs.baseform,
        lex: attrs.lemgram,
        saldo: attrs.saldo,
        dephead: attrs.dephead,
        deprel: attrs.deprel,
        ref: attrs.ref,
        prefix: attrs.prefix,
        suffix: attrs.suffix
    },
    structAttributes: ss,
};

settings.corpusListing = new CorpusListing(settings.corpora);
