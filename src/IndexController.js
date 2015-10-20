/**
 * controller
 * @return
 */
module.exports = Controller( function () {
    "use strict";
    return {
        indexAction: function () {
            return this.json(["Hello ThinkNode!", "A Node.js MVC Framework Based on Promise"]);
        },

        addAction: function () {
            return this.deny(403);
        },

        editAction: function () {
            return this.deny(403);
        },

        delAction: function () {
            return this.deny(403);
        },

        sortAction: function () {
            return this.deny(403);
        },

        copyAction: function () {
            return this.deny(403);
        }
    };
});