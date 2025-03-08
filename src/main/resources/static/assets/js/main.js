$(document).ready(function() {
    $("input[type='number']").on("input", function() {
        if ($(this).val() < 0) {
            $(this).val(0);
        }
    });
});

$(document).on("click", ".delete-order", function () {
    let professorDiv = $(this).parents("div[data-id]");
    let professorId = professorDiv.val(professorDiv).attr("data-id")

    $.ajax({
        url: "/api/admin/delete/" + professorId,
        type: "DELETE",
    });
});

let socket = new SockJS('/ws');
let stompClient = Stomp.over(socket);

stompClient.connect({}, function (options) {
    stompClient.subscribe('/topic/orders/delete', function (message) {
        $("div[data-id='" + message.body + "']").remove();
        location.reload();
    });

    stompClient.subscribe('/topic/orders/save', function (message) {
        location.reload();
    });
});