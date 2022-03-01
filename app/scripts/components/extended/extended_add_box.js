/** @format */
export const componentName = "addBox"

export const component = {
    template: `
    <div class="mt-10 mr-14 inline-block" ng-mouseleave="$ctrl.reset()">
        <button ng-class="{'fade-out': $ctrl.showStuffSelectButtons}" class="btn btn-sm image_button insert_token border-gray-300 transition duration-200 hover_bg-gray-200" ng-click="$ctrl.addTokenLocal()">
            <i class="fa-solid fa-lg fa-plus-circle text-blue-600 mr-1"></i>
            <span class="">{{"add_token" | loc:$root.lang}}</span>
        </button>
        <div class="mt-2">
            <button ng-show="!$ctrl.showStuffSelectButtons" class="btn btn-sm image_button insert_token border-gray-300 transition duration-200 hover_bg-gray-200" ng-click="$ctrl.showSelectButtons()">
                <i class="fa-solid fa-lg fa-plus-circle text-orange-900 mr-1"></i>
                {{ 'add_tag_box' | loc:$root.lang }}
            </button>
            <div class="pos-buttons" ng-class="{'fade-in': $ctrl.showStuffSelectButtons}">
                <button ng-click="$ctrl.addStructTokenLocal()" class="block btn btn-sm image_button insert_token border-gray-300 transition duration-200 hover_bg-gray-200">
                    <i class="fa-solid fa-arrow-left mr-1"></i>
                    {{ 'before_token' | loc:$root.lang }}
                </button>
                <button ng-click="$ctrl.addStructTokenLocal(false)" class="block btn btn-sm image_button insert_token border-gray-300 transition duration-200 hover_bg-gray-200 mt-2">
                    <i class="fa-solid fa-arrow-right mr-1"></i>
                    {{ 'after_token' | loc:$root.lang }}
                </button>
            </div>
        </div>
    </div>
    <style>
    .fade-out {
        transition: opacity ease-out 0.3s;
        opacity: 0.5;
    }
    .pos-buttons {
        display: none;
    }
    .fade-in {
        display: block;
    }
    </style>
    `,
    bindings: {
        addToken: "&",
        addStructToken: "&",
    },
    controller: function AddBoxCtrl() {
        const ctrl = this

        ctrl.showStuffSelectButtons = false

        ctrl.addTokenLocal = function () {
            ctrl.addToken()
        }

        ctrl.showSelectButtons = function () {
            ctrl.showStuffSelectButtons = true
        }

        ctrl.addStructTokenLocal = function (start = true) {
            ctrl.reset()
            ctrl.addStructToken({ start })
        }

        ctrl.reset = function () {
            ctrl.showStuffSelectButtons = false
        }
    },
}
