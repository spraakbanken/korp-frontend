settings.primaryColor = "#E0F4F4";
settings.primaryLight = "#F2FFFF";
settings.wordpicture = true;

settings.kubhistattributes = {
    lemma: attrs.baseform,
    pos: attrs.pos,
    lex: attrs.lemgram,
    dalinlex: attrs.dalinlemgram,
    dephead: attrs.dephead,
    deprel: attrs.deprel,
    ref: attrs.ref,
    saldo: attrs.saldo,
    prefix: attrs.prefix,
    suffix: attrs.suffix
};

settings.kubhiststruct_attributes = {
    text_title: {
        label: "title",
        displayType: "select",
        localize: false,
         opts: settings.liteOptions
    },
    text_date: {label: "date"},
    text_edition: {label: "edition"},
    text_periodofpublication: {label: "periodofpublication"},
    text_holderofpublicationlicense: {label: "holderofpublicationlicense"},
    text_publishingfrequency: {label: "publishingfrequency"},
    text_publishingdays: {label: "publishingdays"},
    text_completetitle: {label: "completetitle"},
    text_publisher: {label: "publisher"},
    text_issn: {label: "issn"},
    text_politicaltendency: {label: "politicaltendency"},
    text_annualprice: {label: "annualprice"},
    text_editorialplace: {label: "editorialplace"},
    text_typearea: {label: "typearea"},
    text_numberofpages: {label: "numberofpages"},
    text_publicationtype: {label: "publicationtype"},
    text_editor: {label: "editor"},
    text_printedin: {label: "printedin"},
    text_printedby: {label: "printedby"},
    text_commentaries: {label: "commentaries"},
    page_no: {label: "page"},
    text_kbid: {
        label: "source",
        pattern: "<div><div>Kungliga Biblioteket</div><div><a href='http://magasin.kb.se/searchinterface/page.jsp?issue_id=<%= struct_attrs.text_kbid %>&sequence_number=<%= struct_attrs.page_no %>' target='_blank'><img src='http://magasin.kb.se:8080/fedora/get/kb:<%= parseInt((struct_attrs.text_kbid).split(':')[1]) + parseInt(struct_attrs.page_no) %>/WEBIMAGE' width='100%'></img></a></div></div>"
    }
};

var aftonbladet_custom_attributes = {
    text_kbid: {
        label: "source",
        pattern: "<div><div>Kungliga Biblioteket</div><div><a href='http://tidningar.kb.se/?newspaper=AFTONBLADET&from=<%= struct_attrs.text_date %>&to=<%= struct_attrs.text_date %>' target='_blank'><img src='http://tidningar.kb.se/4112678/<%= struct_attrs.text_date %>/edition/0/part/1/page/<%= struct_attrs.page_no %>_thumb.jpg' width='100%'></img></a></div></div>",
        customType: "struct"
    }
};

settings.aftonbladstruct_attributes = {
    text_title: {
        label: "title",
        displayType: "select",
        localize: false,
         opts: settings.liteOptions
    },
    text_date: {label: "date"},
    text_issn: {label: "issn"},
    page_no: {label: "page"}
};

digidailydescription = '<a href="http://digidaily.kb.se/">Digidaily</a> är ett utvecklingsprojekt där Riksarkivet, Kungliga biblioteket och Mittuniversitetet tillsammans ska utveckla rationella metoder och processer för digitalisering av dagstidningar.'

$("#lemgram_list_item").remove();
$("#showLineDiagram").remove();


settings.corpora = {};
settings.corporafolders = {};



settings.corporafolders.aftonbladet = {
    title: "Aftonbladet",
    contents: ["kubhist-aftonbladet-1830", "kubhist-aftonbladet-1840", "kubhist-aftonbladet-1850", "kubhist-aftonbladet-1860"]
};

settings.corpora["kubhist-aftonbladet-1830"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-aftonbladet-1830",
    title: "Aftonbladet 1830-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.aftonbladstruct_attributes,
    custom_attributes: aftonbladet_custom_attributes
};

settings.corpora["kubhist-aftonbladet-1840"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-aftonbladet-1840",
    title: "Aftonbladet 1840-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.aftonbladstruct_attributes,
    custom_attributes: aftonbladet_custom_attributes
};

settings.corpora["kubhist-aftonbladet-1850"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-aftonbladet-1850",
    title: "Aftonbladet 1850-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.aftonbladstruct_attributes,
    custom_attributes: aftonbladet_custom_attributes
};

settings.corpora["kubhist-aftonbladet-1860"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-aftonbladet-1860",
    title: "Aftonbladet 1860-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.aftonbladstruct_attributes,
    custom_attributes: aftonbladet_custom_attributes
};



settings.corporafolders.blekingsposten = {
    title: "Blekingsposten",
    contents: ["kubhist-blekingsposten-1850", "kubhist-blekingsposten-1860", "kubhist-blekingsposten-1870", "kubhist-blekingsposten-1880"]
};

settings.corpora["kubhist-blekingsposten-1850"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-blekingsposten-1850",
    title: "Blekingsposten 1850-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-blekingsposten-1860"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-blekingsposten-1860",
    title: "Blekingsposten 1860-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-blekingsposten-1870"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-blekingsposten-1870",
    title: "Blekingsposten 1870-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-blekingsposten-1880"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-blekingsposten-1880",
    title: "Blekingsposten 1880-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corporafolders.bollnastidning = {
    title: "Bollnäs tidning",
    contents: ["kubhist-bollnastidning-1870", "kubhist-bollnastidning-1880"]
};

settings.corpora["kubhist-bollnastidning-1870"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-bollnastidning-1870",
    title: "Bollnäs tidning 1870-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-bollnastidning-1880"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-bollnastidning-1880",
    title: "Bollnäs tidning 1880-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};



settings.corporafolders.dalpilen = {
    title: "Dalpilen",
    contents: ["kubhist-dalpilen-1850", "kubhist-dalpilen-1860", "kubhist-dalpilen-1870", "kubhist-dalpilen-1880", "kubhist-dalpilen-1890", "kubhist-dalpilen-1900", "kubhist-dalpilen-1910", "kubhist-dalpilen-1920"]
};

settings.corpora["kubhist-dalpilen-1850"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-dalpilen-1850",
    title: "Dalpilen 1850-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-dalpilen-1860"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-dalpilen-1860",
    title: "Dalpilen 1860-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-dalpilen-1870"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-dalpilen-1870",
    title: "Dalpilen 1870-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-dalpilen-1880"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-dalpilen-1880",
    title: "Dalpilen 1880-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-dalpilen-1890"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-dalpilen-1890",
    title: "Dalpilen 1890-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-dalpilen-1900"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-dalpilen-1900",
    title: "Dalpilen 1900-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-dalpilen-1910"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-dalpilen-1910",
    title: "Dalpilen 1910-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-dalpilen-1920"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-dalpilen-1920",
    title: "Dalpilen 1920-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};



settings.corporafolders.fahluweckoblad = {
    title: "Fahlu weckoblad",
    contents: ["kubhist-fahluweckoblad-1780", "kubhist-fahluweckoblad-1790", "kubhist-fahluweckoblad-1800", "kubhist-fahluweckoblad-1810", "kubhist-fahluweckoblad-1820"]
};

settings.corpora["kubhist-fahluweckoblad-1780"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-fahluweckoblad-1780",
    title: "Fahlu weckoblad 1780-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-fahluweckoblad-1790"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-fahluweckoblad-1790",
    title: "Fahlu weckoblad 1790-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-fahluweckoblad-1800"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-fahluweckoblad-1800",
    title: "Fahlu weckoblad 1800-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-fahluweckoblad-1810"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-fahluweckoblad-1810",
    title: "Fahlu weckoblad 1810-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-fahluweckoblad-1820"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-fahluweckoblad-1820",
    title: "Fahlu weckoblad 1820-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};



settings.corporafolders.faluposten = {
    title: "Faluposten",
    contents: ["kubhist-faluposten-1860", "kubhist-faluposten-1870", "kubhist-faluposten-1880", "kubhist-faluposten-1890"]
};

settings.corpora["kubhist-faluposten-1860"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-faluposten-1860",
    title: "Faluposten 1860-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-faluposten-1870"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-faluposten-1870",
    title: "Faluposten 1870-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-faluposten-1880"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-faluposten-1880",
    title: "Faluposten 1880-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-faluposten-1890"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-faluposten-1890",
    title: "Faluposten 1890-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};



settings.corporafolders.folketsrost = {
    title: "Folkets röst",
    contents: ["kubhist-folketsrost-1850", "kubhist-folketsrost-1860"]
};

settings.corpora["kubhist-folketsrost-1850"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-folketsrost-1850",
    title: "Folkets röst 1850-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-folketsrost-1860"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-folketsrost-1860",
    title: "Folkets röst 1860-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};



settings.corporafolders.gotlandstidning = {
    title: "Gotlands tidning",
    contents: ["kubhist-gotlandstidning-1860", "kubhist-gotlandstidning-1870", "kubhist-gotlandstidning-1880"]
};

settings.corpora["kubhist-gotlandstidning-1860"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-gotlandstidning-1860",
    title: "Gotlands tidning 1860-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-gotlandstidning-1870"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-gotlandstidning-1870",
    title: "Gotlands tidning 1870-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-gotlandstidning-1880"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-gotlandstidning-1880",
    title: "Gotlands tidning 1880-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};



settings.corporafolders.goteborgsweckoblad = {
    title: "Göteborgs weckoblad",
    contents: ["kubhist-goteborgsweckoblad-1870", "kubhist-goteborgsweckoblad-1880", "kubhist-goteborgsweckoblad-1890"]
};

settings.corpora["kubhist-goteborgsweckoblad-1870"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-goteborgsweckoblad-1870",
    title: "Göteborgs weckoblad 1870-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-goteborgsweckoblad-1880"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-goteborgsweckoblad-1880",
    title: "Göteborgs weckoblad 1880-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-goteborgsweckoblad-1890"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-goteborgsweckoblad-1890",
    title: "Göteborgs weckoblad 1890-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};



settings.corporafolders.gotheborgsweckolista = {
    title: "Götheborgs weckolista",
    contents: ["kubhist-gotheborgsweckolista-1740", "kubhist-gotheborgsweckolista-1750"]
};

settings.corpora["kubhist-gotheborgsweckolista-1740"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-gotheborgsweckolista-1740",
    title: "Götheborgs weckolista 1740-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-gotheborgsweckolista-1750"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-gotheborgsweckolista-1750",
    title: "Götheborgs weckolista 1750-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};



settings.corporafolders.jonkopingsbladet = {
    title: "Jönköpingsbladet",
    contents: ["kubhist-jonkopingsbladet-1840", "kubhist-jonkopingsbladet-1850", "kubhist-jonkopingsbladet-1860", "kubhist-jonkopingsbladet-1870"]
};

settings.corpora["kubhist-jonkopingsbladet-1840"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-jonkopingsbladet-1840",
    title: "Jönköpingsbladet 1840-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-jonkopingsbladet-1850"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-jonkopingsbladet-1850",
    title: "Jönköpingsbladet 1850-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-jonkopingsbladet-1860"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-jonkopingsbladet-1860",
    title: "Jönköpingsbladet 1860-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-jonkopingsbladet-1870"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-jonkopingsbladet-1870",
    title: "Jönköpingsbladet 1870-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};



settings.corporafolders.kalmar = {
    title: "Kalmar",
    contents: ["kubhist-kalmar-1860", "kubhist-kalmar-1870", "kubhist-kalmar-1880", "kubhist-kalmar-1890", "kubhist-kalmar-1900", "kubhist-kalmar-1910"]
};

settings.corpora["kubhist-kalmar-1860"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-kalmar-1860",
    title: "Kalmar 1860-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-kalmar-1870"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-kalmar-1870",
    title: "Kalmar 1870-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-kalmar-1880"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-kalmar-1880",
    title: "Kalmar 1880-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-kalmar-1890"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-kalmar-1890",
    title: "Kalmar 1890-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-kalmar-1900"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-kalmar-1900",
    title: "Kalmar 1900-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-kalmar-1910"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-kalmar-1910",
    title: "Kalmar 1910-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};



settings.corporafolders.lindesbergsallehanda = {
    title: "Lindesbergs allehanda",
    contents: ["kubhist-lindesbergsallehanda-1870", "kubhist-lindesbergsallehanda-1880"]
};

settings.corpora["kubhist-lindesbergsallehanda-1870"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-lindesbergsallehanda-1870",
    title: "Lindesbergs allehanda 1870-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-lindesbergsallehanda-1880"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-lindesbergsallehanda-1880",
    title: "Lindesbergs allehanda 1880-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};



settings.corporafolders.norraskane = {
    title: "Norra Skåne",
    contents: ["kubhist-norraskane-1880", "kubhist-norraskane-1890"]
};

settings.corpora["kubhist-norraskane-1880"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-norraskane-1880",
    title: "Norra Skåne 1880-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-norraskane-1890"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-norraskane-1890",
    title: "Norra Skåne 1890-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};



settings.corporafolders.postochinrikestidning = {
    title: "Post- och Inrikes Tidningar",
    contents: ["kubhist-postochinrikestidning-1770", "kubhist-postochinrikestidning-1780", "kubhist-postochinrikestidning-1790", "kubhist-postochinrikestidning-1800",
        "kubhist-postochinrikestidning-1810", "kubhist-postochinrikestidning-1820", "kubhist-postochinrikestidning-1830", "kubhist-postochinrikestidning-1840",
        "kubhist-postochinrikestidning-1850", "kubhist-postochinrikestidning-1860",]
};

settings.corpora["kubhist-postochinrikestidning-1770"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-postochinrikestidning-1770",
    title: "Post- och Inrikes Tidningar 1770-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-postochinrikestidning-1780"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-postochinrikestidning-1780",
    title: "Post- och Inrikes Tidningar 1780-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-postochinrikestidning-1790"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-postochinrikestidning-1790",
    title: "Post- och Inrikes Tidningar 1790-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-postochinrikestidning-1800"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-postochinrikestidning-1800",
    title: "Post- och Inrikes Tidningar 1800-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-postochinrikestidning-1810"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-postochinrikestidning-1810",
    title: "Post- och Inrikes Tidningar 1810-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-postochinrikestidning-1820"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-postochinrikestidning-1820",
    title: "Post- och Inrikes Tidningar 1820-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-postochinrikestidning-1830"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-postochinrikestidning-1830",
    title: "Post- och Inrikes Tidningar 1830-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-postochinrikestidning-1840"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-postochinrikestidning-1840",
    title: "Post- och Inrikes Tidningar 1840-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-postochinrikestidning-1850"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-postochinrikestidning-1850",
    title: "Post- och Inrikes Tidningar 1850-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-postochinrikestidning-1860"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-postochinrikestidning-1860",
    title: "Post- och Inrikes Tidningar 1860-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};



settings.corporafolders.stockholmsposten = {
    title: "Stockholmsposten",
    contents: ["kubhist-stockholmsposten-1770", "kubhist-stockholmsposten-1780", "kubhist-stockholmsposten-1790", "kubhist-stockholmsposten-1800",
        "kubhist-stockholmsposten-1810", "kubhist-stockholmsposten-1820", "kubhist-stockholmsposten-1830"]
};

settings.corpora["kubhist-stockholmsposten-1770"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-stockholmsposten-1770",
    title: "Stockholmsposten 1770-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-stockholmsposten-1780"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-stockholmsposten-1780",
    title: "Stockholmsposten 1780-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-stockholmsposten-1790"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-stockholmsposten-1790",
    title: "Stockholmsposten 1790-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-stockholmsposten-1800"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-stockholmsposten-1800",
    title: "Stockholmsposten 1800-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-stockholmsposten-1810"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-stockholmsposten-1810",
    title: "Stockholmsposten 1810-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-stockholmsposten-1820"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-stockholmsposten-1820",
    title: "Stockholmsposten 1820-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-stockholmsposten-1830"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-stockholmsposten-1830",
    title: "Stockholmsposten 1830-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};



settings.corporafolders.tidningforwenersborg = {
    title: "Tidning för Wenersborgs stad och län",
    contents: ["kubhist-tidningforwenersborg-1840" , "kubhist-tidningforwenersborg-1850", "kubhist-tidningforwenersborg-1860", "kubhist-tidningforwenersborg-1870",
        "kubhist-tidningforwenersborg-1880", "kubhist-tidningforwenersborg-1890"]
};

settings.corpora["kubhist-tidningforwenersborg-1840"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-tidningforwenersborg-1840",
    title: "Tidning för Wenersborgs stad och län 1840-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-tidningforwenersborg-1850"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-tidningforwenersborg-1850",
    title: "Tidning för Wenersborgs stad och län 1850-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-tidningforwenersborg-1860"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-tidningforwenersborg-1860",
    title: "Tidning för Wenersborgs stad och län 1860-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-tidningforwenersborg-1870"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-tidningforwenersborg-1870",
    title: "Tidning för Wenersborgs stad och län 1870-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-tidningforwenersborg-1880"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-tidningforwenersborg-1880",
    title: "Tidning för Wenersborgs stad och län 1880-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-tidningforwenersborg-1890"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-tidningforwenersborg-1890",
    title: "Tidning för Wenersborgs stad och län 1890-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};



settings.corporafolders.wermlandslanstidning = {
    title: "Wermlands läns tidning",
    contents: ["kubhist-wermlandslanstidning-1870"]
};

settings.corpora["kubhist-wermlandslanstidning-1870"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-wermlandslanstidning-1870",
    title: "Wermlands läns tidning 1870-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};



settings.corporafolders.wernamotidning = {
    title: "Wernamo tidning",
    contents: ["kubhist-wernamotidning-1870", "kubhist-wernamotidning-1880"]
};

settings.corpora["kubhist-wernamotidning-1870"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-wernamotidning-1870",
    title: "Wernamo tidning 1870-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-wernamotidning-1880"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-wernamotidning-1880",
    title: "Wernamo tidning 1880-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};



settings.corporafolders.ostergotlandsveckoblad = {
    title: "Östergötlands veckoblad",
    contents: ["kubhist-ostergotlandsveckoblad-1880", "kubhist-ostergotlandsveckoblad-1890"]
};

settings.corpora["kubhist-ostergotlandsveckoblad-1880"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-ostergotlandsveckoblad-1880",
    title: "Östergötlands veckoblad 1880-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-ostergotlandsveckoblad-1890"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-ostergotlandsveckoblad-1890",
    title: "Östergötlands veckoblad 1890-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};



settings.corporafolders.ostgotaposten = {
    title: "Östgötaposten",
    contents: ["kubhist-ostgotaposten-1890", "kubhist-ostgotaposten-1900", "kubhist-ostgotaposten-1910"]
};

settings.corpora["kubhist-ostgotaposten-1890"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-ostgotaposten-1890",
    title: "Östgötaposten 1890-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-ostgotaposten-1900"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-ostgotaposten-1900",
    title: "Östgötaposten 1900-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora["kubhist-ostgotaposten-1910"] = {
    morf: 'saldom|dalinm|swedbergm',
    id: "kubhist-ostgotaposten-1910",
    title: "Östgötaposten 1910-talet",
    description: digidailydescription,
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: settings.kubhistattributes,
    struct_attributes: settings.kubhiststruct_attributes
};

settings.corpora = _(settings.corpora)
                        .sortBy("title")
                        .map(function(item) {return [item.id, item]})
                        .object()
                        .value()

settings.corpusListing = new CorpusListing(settings.corpora);
