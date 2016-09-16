/* global angular */
/* global jQuery */
(function(ng, $) {
    'use strict';

    return ng
        .module('angular-cockpit.forms', [])
        .factory('$formFactory', ['$q', '$http', '$log', function(q, http, log) {
            return {
                submit: function(formName) {
                    var deferred = q.defer();

                    var form = document.getElementById(formName),
                        actionUrl = $(form).attr('action');

                    var xhr = new XMLHttpRequest(),
                        data = new FormData(form);

                    xhr.onload = function() {
                        if (xhr.status === 200 && xhr.responseText !== 'false') {
                            form.reset();
                            log.debug('Form ' + formName + ' submit success');

                            deferred.resolve();
                        } else {
                            log.warn('Form ' + formName + ' submit failure');

                            deferred.reject();
                        }
                    };

                    xhr.open('POST', actionUrl, true);
                    xhr.send(data);

                    return deferred.promise;
                }
            };
        }])
        .directive('cockpitForm', ['$http', function(http) {
            return {
                scope: {
                    cockpitForm: '@'
                },
                link: function(scope, element) {
                    http({
                        method: 'GET',
                        url: '/forms/' + scope.cockpitForm + '.php'
                    }).then(function(result) {
                        var generatedHtml = $(String(result.data)),
                            generatedForm = generatedHtml.closest('form[name="' + scope.cockpitForm + '"]'),
                            generatedUrl = generatedForm.attr('action'),
                            generatedCsrf = generatedForm.find('input[name="__csrf"]').first();

                        $(element)
                            .attr('action', generatedUrl)
                            .prepend(generatedCsrf);
                    });
                }
            };
        }]);

})(angular, jQuery);
