/** @format */

let html = String.raw
export const depTreeComponent = {
    template: html`
        <div>
            <script type="text/ng-template" id="deptreeModal.html">
                <div class="modal-header py-0">
                    <h3 class="modal-title">{{ 'dep_tree' | loc:lang }}</h3>
                    <span ng-click="clickX()" class="close-x">×</span>
                </div>
                <div class="modal-body">
                    <div ng-if="label">{{label | loc:lang}}: {{value | locObj:lang}}</div>
                    <div id="magic_secret_id"></div>
                </div>
            </script>
            <style>
                svg {
                    border: none;
                }

                .sentnum {
                    display: none;
                }
            </style>
        </div>
    `,
    bindings: {
        tokens: "<",
        corpus: "<",
        onClose: "&",
    },
    controller: [
        "$uibModal",
        function ($uibModal) {
            let $ctrl = this

            let Visualizer = null

            $ctrl.$onInit = () => {
                // lazy laod the dependency tree code
                import(/* webpackChunkName: "deptree" */ "./deptree_deps.js").then((module) => {
                    Visualizer = module.default

                    const modal = $uibModal.open({
                        templateUrl: "deptreeModal.html",
                        controller: [
                            "$scope",
                            "$timeout",
                            ($scope, $timeout) => {
                                $scope.clickX = () => {
                                    modal.close()
                                }

                                $timeout(() => {
                                    draw_deptree($ctrl.tokens, function (msg) {
                                        const [type, val] = _.head(_.toPairs(msg))
                                        $scope.$apply((s) => {
                                            s.label = util.getLocaleStringObject($ctrl.corpus.attributes[type].label)
                                            s.value = $ctrl.corpus.attributes[type].translation[val]
                                        })
                                    })
                                }, 0)
                            },
                        ],
                        size: "lg",
                    })

                    modal.result.then(
                        () => $ctrl.onClose(),
                        () => $ctrl.onClose()
                    )
                })
            }

            const draw_deptree = function (sent, hover_fun) {
                return draw_brat_tree(sent, "magic_secret_id", hover_fun)
            }

            const color_from_chars = function (w, sat_min, sat_max, lightness) {
                let v = 1.0
                let hue = 0.0
                let sat = 0.0
                const len = w.length
                let i = 0
                while (i < len) {
                    v = v / 26.0
                    sat += (w.charCodeAt(i) % 26) * v
                    hue += (w.charCodeAt(i) % 26) * (1.0 / 26 / len)
                    i++
                }
                hue = hue * 360
                sat = sat * (sat_max - sat_min) + sat_min
                const light = `hsl(${hue}, ${sat * 100}%, ${lightness * 100}%)`
                const dark = `hsl(${hue}, ${sat * 100}%, ${lightness * 100 - 50}%)`
                return [light, dark]
            }

            const make_entity_from_pos = function (p) {
                const [bgColor, borderColor] = color_from_chars(p, 0.8, 0.95, 0.95)
                return {
                    type: p,
                    labels: [p],
                    bgColor,
                    borderColor,
                }
            }

            const make_relation_from_rel = function (r) {
                return {
                    type: r,
                    labels: [r],
                    color: "#000000",
                    args: [
                        {
                            role: "parent",
                            targets: [],
                        },
                        {
                            role: "child",
                            targets: [],
                        },
                    ],
                }
            }

            const isNumber = function (n) {
                return !isNaN(parseFloat(n)) && isFinite(n)
            }

            const draw_brat_tree = function (words, to_div, hover_fun) {
                const entity_types = []
                const relation_types = []
                const entities = []
                const relations = []
                const added_pos = []
                const added_rel = []

                const add_word = function (word, start, stop) {
                    const _ref = ["pos", "ref", "dephead", "deprel"].map((attr) => {
                        return word[attr]
                    })

                    const pos = _ref[0]
                    const ref = _ref[1]
                    const dephead = _ref[2]
                    const deprel = _ref[3]
                    if (!added_pos.includes(pos)) {
                        added_pos.push(pos)
                        entity_types.push(make_entity_from_pos(pos))
                    }
                    if (!added_rel.includes(deprel)) {
                        added_rel.push(deprel)
                        relation_types.push(make_relation_from_rel(deprel))
                    }
                    const entity = ["T" + ref, pos, [[start, stop]]]
                    entities.push(entity)
                    if (isNumber(dephead)) {
                        const relation = [
                            "R" + ref,
                            deprel,
                            [
                                ["parent", "T" + dephead],
                                ["child", "T" + ref],
                            ],
                        ]
                        return relations.push(relation)
                    }
                }

                const text = words.map((word) => word.word).join(" ")
                let ix = 0
                for (let _i = 0; _i < words.length; _i++) {
                    const word = words[_i]
                    const len = word.word.length
                    add_word(word, ix, ix + len)
                    ix += len + 1
                }
                const collData = {
                    entity_types,
                    relation_types,
                }
                const docData = {
                    text,
                    entities,
                    relations,
                }

                /** just make a dummy dispatcher to avoid changing the brat client too much */
                const dispatcher = {
                    on: () => {},
                    post: () => {},
                }

                const visualizer = new Visualizer(dispatcher, to_div)
                visualizer.collectionLoaded(collData)
                visualizer.renderData(docData)

                const div = $("#" + to_div)

                div.find("g.arcs")
                    .children()
                    .each(function () {
                        const g = $(this)
                        const deprel = g.find("text").data("arc-role")
                        g.hover(() => hover_fun({ deprel }))
                    })
                div.find("g.span text").each(function () {
                    const pos = $(this).text()
                    $(this)
                        .parent()
                        .hover(() => hover_fun({ pos }))
                })
            }
        },
    ],
}
