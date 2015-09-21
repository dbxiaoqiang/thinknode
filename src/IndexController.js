/**
 * controller
 * @return
 */
module.exports = Controller( function () {
    "use strict";
    return {
        indexAction: function () {
            return this.json(["Hello ThinkNode!", "A Node.js MVC Framework Based on Promise"]);
        }
    };
});