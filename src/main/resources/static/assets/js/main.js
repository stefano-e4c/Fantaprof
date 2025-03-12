$(document).ready(function () {
    $("input[type='number']").on("input", function () {
        if ($(this).val() < 0) {
            $(this).val(0);
        }
    });

    let professorId = $("#scores").data("professor-id");

    $.ajax({
        url: "/api/admin/canupdate/" + professorId,
        type: "GET",
        success: function (canUpdate) {
            if (!canUpdate) {
                $(".update-score").prop("disabled", true); // Disabilita i pulsanti se l'aggiornamento non è consentito
            }
        }
    });

    let totalCredits = 100;
    let $creditDisplay = $('#credit');
    let selectedCount = 0;

    $creditDisplay.text(totalCredits);

    function updateButtons() {
        let selectedCheckboxes = $('input[type="checkbox"]:checked').length;
        let disable = selectedCheckboxes < 5;
        $('#submitButton').prop('disabled', disable);
        $('#submitBtn').prop('disabled', disable);
        $('.capitano-btn').prop('disabled', disable);
    }

    $('input[type="checkbox"]').on('change', function () {
        let $checkbox = $(this);
        let creditCost = parseInt($checkbox.attr('data-credit'), 10) || 0;

        if ($checkbox.prop('checked')) {
            totalCredits -= creditCost;
            selectedCount++;
        } else {
            totalCredits += creditCost;
            selectedCount--;
        }

        $creditDisplay.text(totalCredits);

        $('input[type="checkbox"]').each(function () {
            let $checkbox = $(this);
            let creditCost = parseInt($checkbox.attr('data-credit'), 10) || 0;

            if (totalCredits < creditCost && !$checkbox.prop('checked')) {
                $checkbox.prop('disabled', true);
            } else {
                $checkbox.prop('disabled', false);
            }
        });

        $('input[type="checkbox"]:not(:checked)').prop('disabled', selectedCount >= 5);

        updateButtons();
    });

    $('.capitano-btn').click(function () {
        let professorId = $(this).closest('div[data-id]').data('id');
        $(this).closest('div[data-id]').toggleClass("border-yellow-500");
        $(this).siblings('input[type="checkbox"]').attr('capitano', 'true');
        $('#capitanoId').val('capitano_' + professorId);
        updateButtons();
    });

    $("#register_button").click(function () {
        $('#register').removeClass("hidden");
        $('#login').addClass("hidden");
    });

    $("#login_button").click(function () {
        $('#login').removeClass("hidden");
        $('#register').addClass("hidden");
    });

    $(".delete-prof").click(function () {
        let professorId = $(this).closest("div[data-id]").attr("data-id");

        $.ajax({
            url: "/api/admin/delete/" + professorId,
            type: "DELETE",
            success: function () {
                $("div[data-id='" + professorId + "']").remove();
            }
        });
    });

    $(".updateprofscore").click(function () {
        let professorId = $(this).parents("div[data-id]").attr("data-id");
        $("#scores").toggleClass("hidden").data("professor-id", professorId);
    });

    $(".update-score").click(function () {
        let professorId = $("#scores").data("professor-id");
        let score = $(this).attr("data-score");
        let button = $(this);

        $.ajax({
            url: "/api/admin/modifyscore/" + professorId + "/" + score,
            type: "PUT",
            beforeSend: function () {
                button.prop("disabled", true);
            },
            success: function (response) {
                location.reload();
            },
            error: function (xhr) {
                button.prop("disabled", false); // Riabilita il pulsante in caso di errore
            }
        });
    });

    let socket = new SockJS('/ws');
    let stompClient = Stomp.over(socket);

    stompClient.connect({}, function (options) {
        stompClient.subscribe('/topic/orders/delete', function (message) {
            let professorId = message.body;
            $("div[data-id='" + professorId + "']").remove();
            location.reload();
        });

        stompClient.subscribe('/topic/orders/save', function () {
            location.reload();
        });

        stompClient.subscribe('/topic/orders/modifyScore', function () {
            location.reload();
        });

        stompClient.subscribe('/topic/orders/creaSquadra', function () {
            location.reload();
        });
    });

    // Chiamata iniziale per aggiornare lo stato dei bottoni
    updateButtons();
});
