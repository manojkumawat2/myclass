$(document).ready(function () {
    /**
     * Authentication Validation
     */
    validate_login_form();
    validate_register_form();
    /**
     * End Login Validation
     */

    join_function_validation();
    create_function_validation();

    /**
     * Lecture Schedule Form
     */
    $("#lecture_date").datepicker({
        dateFormat: "yy-mm-dd",
    });
    lecture_schedule_form_validation();

    update_preference_from_validation();

    /**
     * Copy Content
     **/
     $(document).on('click', '#unique_code_copy_button', function() {
        $('#unique_code_copy_input').select();
        document.execCommand('copy');
     });

     /**
      * Student Search in table
      **/
      $("#student_search_input").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $("#student_table_body tr").filter(function() {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
      });


      /**
       * Student Attendance Mark
       **/
       mark_attendace();
});

/**
 * Authentication Validation
 */
function validate_login_form() {
    $('#login_form').validate({
        onfocusout: function (element) {
            $(element).valid();
        },
        rules: {
            login_email: {
                required: true,
                email: true
            },
            login_password: {
                required: true,
                minlength: 8
            }
        },
        submitHandler: function (form) {
            let url = $(form).attr('action');
            let data = new FormData(form);
            NProgress.start();
            $(".form_submit").attr('disabled', true);
            $.ajax(url, {
                data: data,
                success: form_success,
                error: form_error,
                type: 'POST',
                processData: false,
                contentType: false
            });
            return false;
        }
    });

}

function form_success(data) {
    NProgress.done();
    try {
        if (data.status == "success") {
            console.log(window.location.origin + data.success_page);
            $(location).attr('href', window.location.origin + data.success_page);
        } else {
            $(".error_show").text(data.message);
            $(".error_show").css("display", "block");
        }
    } catch (e) {
        console.log(e);
    }
    $(".form_submit").attr('disabled', false);
}

function form_error(error) {
    $(".error_show").text("Something went wrong. Please try again!");
    $(".error_show").css("display", "block");
}

function validate_register_form() {
    $("#register_form").validate({
        onfocusout: function (element) {
            $(element).valid();
        },
        rules: {
            name: {
                required: true,
            },
            register_email: {
                required: true,
                email: true
            },
            name: {
                required: true,
            },
            register_password: {
                required: true,
                minlength: 8
            },
            register_password_confirm: {
                required: true,
                minlength: 8,
                equalTo: "#register_password"
            }
        },
        submitHandler: function (form) {
            let url = $(form).attr('action');
            let data = new FormData(form);
            NProgress.start();
            $(".form_submit").attr('disabled', true);
            $.ajax(url, {
                data: data,
                success: form_success,
                error: form_error,
                type: 'POST',
                processData: false,
                contentType: false
            });
            return false;
        }
    })
}

/**
 * End Authentication Validation
 */

/**
 * Join and Create Validation
 */

function join_function_validation() {
    $("#join_form").validate({
        onfocusout: function (element) {
            $(element).valid();
        },
        rules: {
            join_code: {
                required: true,
            }
        },
        submitHandler: function (form) {
            let url = $(form).attr('action');
            let data = new FormData(form);
            NProgress.start();
            $.ajax(url, {
                data: data,
                success: form_success,
                error: form_error,
                method: "POST",
                data: data,
                processData: false,
                contentType: false
            });
            return false;
        }
    });
}

function create_function_validation() {
    $("#create_form").validate({
        onfocusout: function (element) {
            $(element).valid();
        },
        rules: {
            subject: {
                required: true
            }
        },
        submitHandler: function (form) {
            let url = $(form).attr('action');
            let data = new FormData(form);
            NProgress.start();
            $.ajax(url, {
                data: data,
                success: form_success,
                error: form_error,
                method: "POST",
                data: data,
                processData: false,
                contentType: false
            });
            return false;
        }
    });
}

/**
 * End Join and Create Validation
 */

/**
 * Lecture schedule form validation
 */

function lecture_schedule_form_validation() {
    $("#lecture_schedule").validate({
        onfocusout: function (element) {
            $(element).valid();
        },
        rules: {
            title: {
                required: true
            },
            lecture_date: {
                required: true,
                date: true
            },
            start_time: {
                required: true,
            },
            end_time: {
                required: true,
            },
            lecture_mode: {
                required: true,
            }
        },
        submitHandler: function (form) {
            let url = $(form).attr('action');
            let data = new FormData(form);
            NProgress.start();
            $.ajax(url, {
                data: data,
                success: form_success,
                error: form_error,
                method: "POST",
                data: data,
                processData: false,
                contentType: false
            });
            return false;
        }
    });
}


/**
* preference update from validation
*/

function update_preference_from_validation() {
    $("#preference_form_update").validate({
        rules: {
            select_preference: {
                required: true
            }
        },
        submitHandler: function(form) {
            let url = $(form).attr('action');
            let data = new FormData(form);
            NProgress.start();
            $.ajax(url, {
                data: data,
                success: form_success,
                error: form_error,
                method: "POST",
                data: data,
                processData: false,
                contentType: false
            });
            return false;
        }
    });
}


/**
* Mark Attendance
**/

function mark_attendace() {
    $(".mark_attendance_toggle").change(function() {
        let row = $(this).parent().parent().parent();
        let user_id = row.attr('data-user_id');
        let unique_key = row.attr('data-unique_key');
        let lecture_id = row.attr('data-lecture_id');
        let attendance = $(this).is(':checked') ? 1 : 0;

        let url = window.location.origin + "/mark_attendance/" + unique_key + '/' + lecture_id + '/' + user_id + '/' + attendance;
        console.log(url);
        $.ajax(url, {
            success: form_success,
            error: form_error,
            method: "GET",
        });
        return false;
    });
}