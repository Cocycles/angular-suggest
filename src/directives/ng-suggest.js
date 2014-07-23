/**
 * @ngdoc directive
 * @name angular.suggest.ngSuggest
 *
 * @description
 */
function ngSuggest() {
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: {
            stack: '=ngSuggest',
            text: '=ngModel'
        },
        link: link
    };

    function link(scope, elm, attrs, ctrl) {
        // Return if it's not an input
        if (!elm.is('input')) {
            throw new Error('cannot use ng-suggest on non-input elements');
        }

        /**
         * Suggestion text color
         * @type {*|string}
         */
        var suggestionColor = attrs.suggestionColor || '#CCC',

            /**
             * Suggestion container class
             */
            suggestionClass = attrs.suggestionClass || '',

            /**
             * Suggestion input element
             */
            suggestionInput,

            /**
             * Suggestion input class
             */
            suggestionInputClass = attrs.suggestionInputClass || '';

        /**
         * Instantiates the secondary input element
         */
        (function instantiateInput() {
            wrapInputs();
            suggestionInput = generateSuggestionInput();

            elm.after(suggestionInput.attr('disabled', 'disabled'));
        }());

        /**
         * Returns the current suggestion
         * @returns {string}
         */
        function getCurrentSuggestion() {
            return suggestionInput.val() || '';
        }

        /**
         * Bind to keydown and pick suggestion on tab click
         */
        elm.on('keydown', (function(event) {
            if (event.keyCode !== 9) {
                return true;
            }

            if (!getCurrentSuggestion()) {
                return false;
            }

            pickSuggestion();
            return false;
        }));

        /**
         * Picks the current suggestion
         */
        function pickSuggestion() {
            elm.val(suggestionInput.val());
            elm.trigger('input');
        }

        /**
         * Wraps the input with a div
         */
        function wrapInputs() {
            return elm.wrap('<div id="angular-suggest-container" class="' + suggestionClass + '"></div>');
        }

        /**
         * Generates the suggestion input
         * @returns {jQuery.element}
         */
        function generateSuggestionInput() {
            var input = elm.clone();

            return styleSuggestionInput(input);
        }

        /**
         * Styles the given suggestion input and returns it
         * @param input
         * @returns {jQuery.input}
         */
        function styleSuggestionInput(input) {
            var position = elm.position();

            input.addClass(suggestionInputClass);
            input.attr('id', 'angular-suggest-suggestion-input');

            return input.css({
                'left': position.left,
                'top': position.top,
                'text-color': suggestionColor
            });
        }

        /**
         * Watch the text scope property
         */
        scope.$watch('text', function(val) {
            if (!Array.isArray(scope.stack) || !val || scope.stack.indexOf(val) !== -1) {
                clearSuggestionInput();
                return;
            }

            suggest(val);
        });

        /**
         * Search for suggestions for the given string
         * @param val
         */
        function suggest(val) {
            var matched = match(val);

            if (matched.length === 0) {
                clearSuggestionInput();
                return;
            }

            suggestionInput.val(val + stripToVal(val, matched[0]));
        }

        /**
         * Clears the suggestion input
         */
        function clearSuggestionInput() {
            suggestionInput.val('');
        }

        /**
         * Strips the given string to the selection length
         * @param {string} val
         * @param {string} matched
         * @returns {string}
         */
        function stripToVal(val, matched) {
            return matched.slice(val.length);
        }

        /**
         * Determines if the strings strats with the given starts param
         * @param {string} starts
         * @param {string} string
         * @returns {boolean}
         */
        function startsWith(starts, string) {
            if (!starts) {
                return false;
            }

            return string.slice(0, starts.length) === starts;
        }

        /**
         * Returns array with matched results
         * @param text
         * @returns {*}
         */
        function match(text) {
            return scope.stack.filter(function(string) {
                return startsWith(text, string);
            });
        }
    }
}