$(document).ready(function () {
    let totalCredits = 100; // Crediti totali iniziali
    let $creditDisplay = $('#credit');
    let selectedCount = 0;
    let isCapitanoSelected = false; // Variabile per tracciare lo stato del capitano
    let captainSelection = false;

    $creditDisplay.text(totalCredits);

    // Funzione per aggiornare lo stato dei pulsanti
    function updateButtons() {
        let selectedCheckboxes = $('input[type="checkbox"]:checked').length;

        if (selectedCheckboxes === 5) {
            captainSelection = true;
        }

        let disable = selectedCheckboxes < 5 || !captainSelection;
        $('#submitButton').prop('disabled', disable);
        $('#submitBtn').prop('disabled', disable);
        $('.capitano-btn').prop('disabled', disable);

        if (!isCapitanoSelected) {
            $('#submitButton').prop('disabled', true);
            $('#submitBtn').prop('disabled', true);
        }

        if (isCapitanoSelected) {
            $('.capitano-btn').prop('disabled', true);
        } else {
            $('.capitano-btn').prop('disabled', false);
        }
    }

    // Funzione per aggiornare lo stato dei checkbox in base ai crediti disponibili
    function updateCheckboxes() {
        $('input[type="checkbox"]').each(function () {
            let $checkbox = $(this);
            let creditCost = parseInt($checkbox.attr('data-credit'), 10) || 0;

            // Disabilita il checkbox se il credito totale è inferiore al costo e non è già selezionato
            if (totalCredits < creditCost && !$checkbox.prop('checked')) {
                $checkbox.prop('disabled', true);
            } else {
                $checkbox.prop('disabled', false);
            }
        });

        // Disabilita tutti i checkbox non selezionati se sono già stati selezionati 5 professori
        $('input[type="checkbox"]:not(:checked)').prop('disabled', selectedCount >= 5);
    }

    // Gestione del cambio di stato dei checkbox
    $('input[type="checkbox"]').on('change', function () {
        let $checkbox = $(this);
        let creditCost = parseInt($checkbox.attr('data-credit'), 10) || 0;

        if ($checkbox.prop('checked')) {
            // Se il credito totale è sufficiente, procedi con la selezione
            if (totalCredits >= creditCost) {
                totalCredits -= creditCost;
                selectedCount++;
            } else {
                // Altrimenti, deseleziona il checkbox
                $checkbox.prop('checked', false);
                return; // Esci dalla funzione
            }
        } else {
            // Se il checkbox viene deselezionato, ripristina i crediti
            totalCredits += creditCost;
            selectedCount--;
        }

        // Aggiorna il display dei crediti
        $creditDisplay.text(totalCredits);

        // Aggiorna lo stato dei checkbox e dei pulsanti
        updateCheckboxes();
        updateButtons();
    });

    // Gestione del click sui pulsanti "capitano"
    $('.capitano-btn').click(function () {
        let professorId = $(this).closest('div[data-id]').data('id');
        $(this).closest('div[data-id]').toggleClass("border-yellow-500");
        $(this).siblings('input[type="checkbox"]').attr('capitano', 'true');
        $('#capitanoId').val('capitano_' + professorId);

        isCapitanoSelected = !isCapitanoSelected;

        updateButtons();
    });

    // Gestione del pulsante "Crea Squadra"
    $('#submitButton, #submitBtn').click(function () {
        if (selectedCount < 5 || !isCapitanoSelected) {
            alert("Seleziona 5 professori e un capitano per creare la squadra.");
            return;
        }

        // Logica per creare la squadra
        let capitanoId = $('#capitanoId').val();
        let selectedProfessors = $('input[type="checkbox"]:checked').map(function () {
            return $(this).val();
        }).get();

        console.log("Capitano selezionato:", capitanoId);
        console.log("Professori selezionati:", selectedProfessors);

        // Invia i dati al server (esempio con AJAX)
        $.ajax({
            url: "/api/team/add",
            type: "POST",
            data: {
                capitanoId: capitanoId,
                professors: selectedProfessors
            },
            success: function (response) {
                alert("Squadra creata con successo!");
                location.reload();
            },
            error: function (xhr) {
                alert("Errore durante la creazione della squadra.");
                console.error(xhr.responseText);
            }
        });
    });

    // Gestione del pulsante "Login"
    $("#login_button").click(function () {
        $('#login').removeClass("hidden");
        $('#register').addClass("hidden");
    });

    // Gestione dell'eliminazione di un professore
    $(".delete-prof").click(function () {
        let professorId = $(this).closest("div[data-id]").attr("data-id");

        $.ajax({
            url: "/api/admin/delete/" + professorId,
            type: "DELETE",
            success: function () {
                $("div[data-id='" + professorId + "']").remove();
            },
            error: function (xhr) {
                console.error("Errore durante l'eliminazione del professore:", xhr.responseText);
            }
        });
    });

    // Gestione dell'aggiornamento del punteggio di un professore
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
            success: function (response) {
                location.reload();
            },
            error: function (xhr) {
                button.prop("disabled", false); // Riabilita il pulsante in caso di errore
                console.error("Errore durante l'aggiornamento del punteggio:", xhr.responseText);
            }
        });
    });

    // WebSocket per aggiornamenti in tempo reale
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

    // Chiamata iniziale per aggiornare lo stato dei bottoni e dei checkbox
    updateButtons();
    updateCheckboxes();
});
