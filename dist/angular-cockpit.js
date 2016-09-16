(function(ng, $, cp) {
    "use strict";
    return ng.module("angular-cockpit.factories", []).factory("$cockpitFactory", [ "$q", "$log", function(q, log) {
        return {
            load: function(entity, filter, sort) {
                var deferred = q.defer();
                cp.request("/collections/get/" + entity, {
                    filter: filter,
                    sort: sort
                }).success(function(items) {
                    if (ng.isArray(items)) {
                        deferred.resolve(items);
                    } else {
                        deferred.reject(items);
                    }
                }).fail(function(reason, request) {
                    log.error(reason, request);
                    deferred.reject(reason);
                });
                return deferred.promise;
            },
            thumbs: function(imgUrls, width, height) {
                var deferred = q.defer();
                cp.request("/mediamanager/thumbnails", {
                    images: imgUrls,
                    w: width,
                    h: height,
                    options: {
                        quality: 100,
                        mode: "best_fit"
                    }
                }).success(function(map) {
                    if (ng.isObject(map)) {
                        deferred.resolve(map);
                    } else {
                        deferred.reject(map);
                    }
                }).fail(function(reason, request) {
                    log.error(reason, request);
                    deferred.reject(reason);
                });
                return deferred.promise;
            },
            i18n: function(item, property, locales) {
                var result = {};
                if (!item || !item.hasOwnProperty(property)) {
                    return result;
                }
                ng.forEach(locales, function(locale) {
                    var i18nProperty = property + "_" + locale;
                    if (item.hasOwnProperty(i18nProperty)) {
                        result[locale] = item[i18nProperty];
                    } else {
                        result[locale] = item[property];
                    }
                });
                return result;
            }
        };
    } ]).factory("$imageFactory", [ "$q", "$timeout", "$log", function(q, timeout, log) {
        return {
            loadImages: function(urls) {
                return function(defer, resolved) {
                    var numberQueued = 0, allQueued = false;
                    function loadImage(url) {
                        $(new Image()).prop("src", url).on("load", function(event) {
                            resolved.push(event.target.src);
                            if (allQueued && resolved.length === numberQueued) {
                                defer.resolve(resolved);
                            }
                        }).on("error", function(event, reason) {
                            log.error(reason);
                            defer.reject(url);
                        });
                    }
                    ng.forEach(urls, function(url) {
                        timeout(function() {
                            loadImage(url);
                        });
                        numberQueued++;
                    });
                    allQueued = true;
                    return defer.promise;
                }(q.defer(), []);
            }
        };
    } ]);
})(angular, jQuery, Cockpit);

(function(ng, $) {
    "use strict";
    return ng.module("angular-cockpit.forms", []).factory("$formFactory", [ "$q", "$http", "$log", function(q, http, log) {
        return {
            submit: function(formName) {
                var deferred = q.defer();
                var form = document.getElementById(formName), actionUrl = $(form).attr("action");
                var xhr = new XMLHttpRequest(), data = new FormData(form);
                xhr.onload = function() {
                    if (xhr.status === 200 && xhr.responseText !== "false") {
                        form.reset();
                        log.debug("Form " + formName + " submit success");
                        deferred.resolve();
                    } else {
                        log.warn("Form " + formName + " submit failure");
                        deferred.reject();
                    }
                };
                xhr.open("POST", actionUrl, true);
                xhr.send(data);
                return deferred.promise;
            }
        };
    } ]).directive("cockpitForm", [ "$http", function(http) {
        return {
            scope: {
                cockpitForm: "@"
            },
            link: function(scope, element) {
                http({
                    method: "GET",
                    url: "/forms/" + scope.cockpitForm + ".php"
                }).then(function(result) {
                    var generatedHtml = $(String(result.data)), generatedForm = generatedHtml.closest('form[name="' + scope.cockpitForm + '"]'), generatedUrl = generatedForm.attr("action"), generatedCsrf = generatedForm.find('input[name="__csrf"]').first();
                    $(element).attr("action", generatedUrl).prepend(generatedCsrf);
                });
            }
        };
    } ]);
})(angular, jQuery);

(function(ng) {
    "use strict";
    return ng.module("angular-cockpit", [ "angular-cockpit.factories", "angular-cockpit.forms" ]);
})(angular);