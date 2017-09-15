$(document).ready(function() {
    $('#summernote').summernote({
        toolbar: [
            // [groupName, [list of button]]
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['font', ['strikethrough', 'superscript', 'subscript']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['insert', ['link', 'picture', 'hr']],
            ['height', ['height']]
        ],
        height: 400,
        lang: 'ko-KR'
    });

    $('.note-popover').css({
        'display': 'none'
    });
});

var postForm = function() {
    $('#summernote').html($('#summernote').summernote('code'));
}