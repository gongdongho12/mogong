$(document).ready(function() {
    $('#review_button').on('click', function () {
        jQuery.ajax({
            type:'POST',
            url:'/board/review/write',
            data : $('#wrtie_review').serialize(),
            dataType:'JSON',
            success : function(data) {
                if(data.message == 'success')
                    location.reload();
                else
                    alert('에러 ' + data);
            },
            error : function(xhr, status, error) {
                alert('에러 ' + status);
            }
        });
    });

    $(".close").each(function() {
        $(this).click(function() {
            console.log($(this).val());
            jQuery.ajax({
                type:'POST',
                url:'/board/review/delete',
                data : 'id=' + $(this).val(),
                dataType:'JSON',
                success : function(data) {
                    if(data.message == 'success')
                        location.reload();
                    else
                        alert('삭제에러 ' + data.message);
                }
            });
        });
    });
});