$(document).ready(function () {
    // Hide flash messages after delay
    $('.msg').delay(2000).fadeOut('slow');

    // Initialize create form's datepicker
    $('.datepicker').datepicker({
        autoclose: true,
        format: "dd-mm-yyyy",
        immediateUpdates: true,
        todayBtn: true,
        todayHighlight: true
    }).datepicker("setDate", "0");

    // Set start of the current month as default
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    updateDate('.month-start-date', firstDayOfMonth);
    updateDate('.month-end-date', lastDayOfMonth);

    // Initialize Tagify for create form
    initializeCreateTagify();

    // Set today/yesterday for create form
    $('.set-today').on('click', function (e) {
        e.preventDefault();
        updateDate('.date', new Date());
    });

    $('.set-yesterday').on('click', function (e) {
        e.preventDefault();
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        updateDate('.date', yesterday);
    });
});

// Initialize Tagify for create form only once
function initializeCreateTagify() {
    $('.tag').each(function () {
        const input = this;

        // ✅ Skip if already initialized
        if (input.tagify instanceof Tagify) {
            return;
        }

        // Ensure data-tags exists and is valid JSON
        const dataTags = $(input).attr('data-tags');
        let whitelist = [];

        try {
            whitelist = JSON.parse(dataTags || '[]');
        } catch (e) {
            console.error("Invalid JSON in data-tags:", e);
        }

        const tagify = new Tagify(input, {
            whitelist: whitelist,
            dropdown: { enabled: 0 }
        });

        input.tagify = tagify;
    });
}



// Format date as dd-mm-yyyy
function formatDate(date) {
    return (
        ("0" + date.getDate()).slice(-2) + "-" +
        ("0" + (date.getMonth() + 1)).slice(-2) + "-" +
        date.getFullYear()
    );
}

// Update date field with formatted date
function updateDate(fieldId, date) {
    const formatted = formatDate(date);
    $(fieldId).datepicker('update', formatted).val(formatted);
}

// Edit click: fetch edit form via AJAX
$(document).on('click', '.edit', function (e) {
    e.preventDefault();
    const id = $(this).data('id');

    $.ajax({
        url: `/transactions/${id}/edit`,
        type: 'GET',
        success: function (html) {
            $('#edit_modal .modal-body').html(html);
            $('#edit_modal').modal('show');
            initializeDatepickerAndTagify(); // for edit form
        },
        error: function () {
            alert('Failed to load edit form.');
        }
    });
});

// Initialize Tagify and Datepicker in modal (edit form)
function initializeDatepickerAndTagify() {
    $('.datepicker').datepicker({
        format: 'dd-mm-yyyy',
        autoclose: true,
        todayHighlight: true
    });

    $('.tag').each(function () {
        const $input = $(this);
        const dataTags = $input.data('tags');

        // Destroy existing Tagify instance
        if ($input[0].tagify) {
            $input[0].tagify.destroy();
        }

        try {
            const tagify = new Tagify(this, {
                whitelist: dataTags,
                dropdown: { enabled: 0 }
            });

            $input[0].tagify = tagify;

            $input.closest('form').on('submit', function () {
                const tagString = tagify.value.map(t => t.value).join(',');
                $input.val(tagString);
            });

        } catch (e) {
            console.error("Tagify init failed:", e);
        }
    });

    // Set today/yesterday for edit form
    $('.edit-set-today').on('click', function (e) {
        e.preventDefault();
        setDateInField('.edit-date', new Date());
    });

    $('.edit-set-yesterday').on('click', function (e) {
        e.preventDefault();
        const d = new Date();
        d.setDate(d.getDate() - 1);
        setDateInField('.edit-date', d);
    });
}

// Shared helper
function setDateInField(selector, date) {
    const formatted =
        ("0" + date.getDate()).slice(-2) + "-" +
        ("0" + (date.getMonth() + 1)).slice(-2) + "-" +
        date.getFullYear();
    $(selector).datepicker('update', formatted).val(formatted);
}

$(document).on('submit', '.tag-form', function () {
    $('.tag').each(function () {
        const tagify = this.tagify;
        if (tagify) {
            const tagString = tagify.value.map(t => t.value).join(',');
            $(this).val(tagString);
        }
    });
});

