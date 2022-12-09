/** @format */
import { KWICResults } from "./kwic_results.js"
import { ExampleResults } from "./example_results.js"
import { WordPictureResults } from "./word_picture_results.js"
import { StatsResults } from "./stats_results.js"
import { GraphResults } from "./trend_results.js"

const korpFailImg = require("../../img/korp_fail.svg")

window.view = {}

view.KWICResults = KWICResults

view.ExampleResults = ExampleResults

view.WordPictureResults = WordPictureResults

view.StatsResults = StatsResults

view.GraphResults = GraphResults
