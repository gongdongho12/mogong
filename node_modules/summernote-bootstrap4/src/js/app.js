var script = document.getElementById('start');
var isIE8 = script && script.getAttribute('data-browser') === 'ie8';

var jqueryLink = isIE8 ? '//code.jquery.com/jquery-1.11.3' : 'https://code.jquery.com/jquery-3.1.1.slim.min';
require.config({
  baseUrl: 'src/js',
  paths: {
    jquery: jqueryLink,
    bootstrap4: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min',
    bootstrap: '//netdna.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap',
    lang: '../../lang/summernote-de-DE'
  },
  shim: {
    bootstrap: ['jquery'],
    lang: ['jquery']
  },
  packages: [{
    name: 'summernote',
    main: 'summernote',
    location: './'
  }]
});

require(['jquery', 'summernote'], function ($) {
  var requireByPromise = function (paths) {
    return $.Deferred(function (deferred) {
      require(paths, function () {
        deferred.resolve.apply(this, arguments);
      });
    });
  };

  var promise = $.Deferred();
  // editor type setting
  switch ($('script[data-editor-type]').data('editor-type')) {
    case 'lite':
      promise = requireByPromise(['summernote/lite/settings']);
      break;
    case 'bs4':
      promise = requireByPromise(['bootstrap4', 'summernote/bs4/settings']).then(function () {
        return requireByPromise(['lang']);
      });
      break;
    case 'bs3':
      promise = requireByPromise(['bootstrap', 'summernote/bs3/settings']).then(function () {
        return requireByPromise(['lang']);
      });
      break;
  }

  promise.then(function () {
    // initialize summernote
    $('.summernote').summernote({
      height: 300,
      lang: 'ko-KR',
      placeholder: 'type here...'
    });
  });
});
