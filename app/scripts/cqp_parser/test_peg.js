

var parser = require("CQPParser2.js")

var cqp = 
    // "[_.text_word = 'ge']"
    "[word = \"är\" & $date_interval = '20030616,20140718,000000,235900']"
//"[%(int(_.fromdate) = 20140101 & int(_.fromtime) => 120000) | (int(_.fromdate) = 20140101 & int(_.fromtime) => 120000)%% | %(int(_.fromdate) = 20140101 & int(_.fromtime) => 120000)%% | word = 'apa' & lex = 'hej']"
// "[((int(_.fromdate) = 20140101 & int(_.fromtime) => 120000) | (int(_.fromdate) = 20140101 & int(_.fromtime) => 120000)) | ((int(_.fromdate) = 20140101 & int(_.fromtime) => 120000)) | word = 'apa' & lex = 'hej']"
// '[(((int(_.fromdate) = 20140101 & int(_.fromtime) => 120000) | (int(_.fromdate) > 20140101 & int(_.fromdate) <= 20140105)))]'
// '[(word = "c" | word = "d") & (word = "a" | word = "b")]'
// "[(int(_.fromdate) = 18800101 & int(_.fromtime) => 120000) | (int(_.fromdate) > 18800101 & int(_.fromdate) <= 20141231) & (int(_.todate) < 20141231 | (int(_.todate) = 20141231 & int(_.totime) <= 183000))]"
// '[$date_interval = "18800101,20141231,120000,183000"]'
// '[word="value" | word &= "value2" & word contains "ge..vb.1"]'
// '[((int(_.fromdate) = 20140101 & int(_.fromtime) => 120000) | (int(_.fromdate) > 20140101 & int(_.fromdate) <= 20140105)) & (int(_.todate) < 20140105 | (int(_.todate) = 20140105 & int(_.totime) <= 160000))]'

try {
    console.log(JSON.stringify(parser.parse(cqp), null, 2))
} catch(err) {
    console.log("Error on column " + err.column + ":\n" + err.message)
    // console.log(err)
}