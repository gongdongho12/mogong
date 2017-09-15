//테이블 실행
$(document).ready(function() {
    $("tr").each(function() {
        var context = $(this);
        context.find("td").slice(0, 4).click(function() {
            location.href = "/board/" + $(this).parents().children().eq(0).text().trim();
        });
    });
});