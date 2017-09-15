// /**
//  * Created by cheese on 2017. 1. 6..
//  */
//
// // 웹에서의 유효성 검사 시스템 & api도 붙여 적용 가능
// $('#login-form').validate({
//     onkeyup: false,
//     submitHandler: function () {
//         return true;
//     },
//     rules: {
//         id: {
//             required: true,
//             minlength: 6
//         },
//         password: {
//             required: true,
//             minlength: 8,
//             remote: {
//                 url: '/api/v1/login',
//                 type: 'post',
//                 data: {
//                     id: function () {
//                         console.log('test');
//                         return $('#id').val();
//                     }
//                 },
//                 dataFilter: function (data) {
//                     var data = JSON.parse(data);
//                     if (data.success) {
//                         return true;
//                     } else {
//                         return "\"" + data.msg + "\"";
//                     }
//                 }
//             }
//         }
//     }
// });
//

/**
 * Created by cheese on 2017. 1. 6..
 */

// 웹에서의 유효성 검사 시스템 & api도 붙여 적용
$(document).ready(function() {
    $('#login-form').validate({
        onkeyup: false,
        submitHandler: function () {
            return true;
        },
        rules: {
            id: {
                required: true,
                minlength: 6
            },
            password: {
                required: true,
                minlength: 8,
                remote: {
                    url: '/api/v1/login',
                    type: 'post',
                    data: {
                        id: function () {
                            return $('#id').val();
                        }
                    },
                    dataFilter: function (data) {
                        var data = JSON.parse(data);
                        if (data.success) {
                            return true;
                        } else {
                            return "\"" + data.msg + "\"";
                        }
                    }
                }
            }
        }
    });
});

