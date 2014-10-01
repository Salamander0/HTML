$(document).ready(function () {
    var socket;
    var protocol_identifier = 'chat';
    var nickname = 'Guest-' + Math.floor(Math.random() * 100);
    var chatroom = 'public';
    var myId;
    var nicklist;
    var window_has_focus = true;
    var actual_window_title = document.title;
    var flash_title_timer;
    var connected = false;
    var connection_retry_timer;

    //IP adresa na ktere bezi server
    var server_url = 'ws://89.102.3.22:8804/';

    //barvicky bublin se zpravami
    var msg_bubble_colors = [
        '#FFFFFF',
        '#E2EBC0',
        '#F3F1DC',
        '#F6E1E1',
        '#EDF9FC',
        '#EBF3EC',
        '#F4EAF1',
        '#FCF1F8',
        '#FBFAEF',
        '#EFF2FC'
    ];

    if (!is_websocket_supported()) {
        $('#chat-nickname-form').html('Your browser <strong>doesnt</strong> support ' + 'websockets :( <br/>Please use an updated version ' + 'of a modern browser, such as <a href="http://www.firefox.com/">Firefox</a> ' + 'or <a href="http://www.google.com/chrome">Google Chrome</a>.');
    }

    $('#nickname-submit').click(function () {
        handshake_with_server();
    });

    $('#nickname, #chatroom').keypress(function (e) {
        if (e.which === 13) {
            handshake_with_server();
        }
    });

    $('#send-btn').click(function () {
        send_msg_box_content();
    });

    $('#msg-box').keypress(function (e) {
        if (e.which === 13 && !e.shiftKey) {
            send_msg_box_content();
            e.preventDefault();
        }
    });

    //Aktualizace nazvu chatovaci mistnosti na titulni strane
    update_chat_room_title_displayed();

    $('body').on('keyup change paste cut', '#chatroom', function () {
        update_chat_room_title_displayed($('#chatroom').val());
    });

    //Aktualizace share-url
    $('#room-share-url').val(window.location);

    $(window).on('hashchange', function () {
        update_chat_room_title_displayed(window.location.hash.substr(1));
    });

    //URL select
    $('body').on('focus', '#room-share-url', function () {
        $('#room-share-url').select();
    });

    $(window).focus(function() {
        window_has_focus = true;
        clearInterval(flash_title_timer);
        document.title = actual_window_title;
    });

    $(window).blur(function() {
        window_has_focus = false;
    });

    $('#emoticons a').click(function() {
        var smiley = $(this).attr('title');
        ins2pos(smiley, 'msg-box');
    });

    //zkopirovani smajlika do zpravy
    function ins2pos(str, id) {
        var TextArea = document.getElementById(id);
        var val = TextArea.value;
        var before = val.substring(0, TextArea.selectionStart);
        var after = val.substring(TextArea.selectionEnd, val.length);

        TextArea.value = before + str + after;
        setCursor(TextArea, before.length + str.length);
    }

    //posunuti kurzoru v okne chatu
    function setCursor(elem, pos) {
        if (elem.setSelectionRange) {
            elem.focus();
            elem.setSelectionRange(pos, pos);
        } else if (elem.createTextRange) {
            var range = elem.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }

    //handshake se serverem
    function handshake_with_server() {
        nickname = $('#nickname').val() !== '' ? $('#nickname').val() : nickname;
        nickname = add_emoticons(nickname);
        chatroom = $('#chatroom').val() !== '' ? $('#chatroom').val() : chatroom;
        chatroom = (chatroom === 'Public Room') ? 'public' : chatroom;
        chatroom = add_emoticons(chatroom);

        window.location.hash = '#' + chatroom;

        open_connection();

        $('#chat-nickname-form').fadeOut();
    }

    //otevreni websocket spojeni
    function open_connection() {
        socket = new WebSocket(server_url, protocol_identifier);
        socket.addEventListener("open", connection_established);
    }

    //spojeni otevreno
    function connection_established(event) {
        connected = true;
        clearInterval(connection_retry_timer);

        introduce(nickname);
        socket.addEventListener('message', function (event) {
            message_received(event.data);
        });

        socket.addEventListener('close', function (event) {
            connected = false;
            reConnect();
        });
    }

    function introduce(nickname) {
        var intro = {
            type: 'intro',
            nickname: nickname,
            chatroom: chatroom
        };

        socket.send(JSON.stringify(intro));
    }

    //zprava prijata
    function message_received(message) {
        var message;

        message = JSON.parse(message);

        if (message.type === 'welcome') {
            myId = message.userId;

            $('#chat-container').fadeIn();
            $('#loading-message').hide();
            $('#welcome-message-user-name').html(nickname);
        } else if (message.type === 'message' && parseInt(message.sender) !== parseInt(myId)) {
            add_new_msg_to_log(message);
            blink_window_title('~ New Message ~');

        } else if (message.type === 'nicklist') {
            var chatter_list_html = '';
            nicklist = message.nicklist;
            for(var i in nicklist) {
                chatter_list_html += '<li>' + nicklist[i] + '</li>';
            }

            chatter_list_html = '<ul>' + chatter_list_html + '</ul>';

            $('#chatter-list').html(chatter_list_html);
        }
    }

    //odeslani obsahu msg-boxu
    function send_msg_box_content() {
        var message = $('#msg-box').val();
        if (message != '') {
            send_message(message);
            $('#msg-box').val('');
        }
    }

    function send_message(message) {
        var message_to_send = {
            type: 'message',
            nickname: nickname,
            message: message,
            sender: myId,
            chatroom: chatroom
        };

        var msg_data_str = JSON.stringify(message_to_send);

        socket.send(msg_data_str);
        add_new_msg_to_log(message_to_send);
    }

    //vytvori novou bublinu se zpravou
    function add_new_msg_to_log(message) {
        var msg_string;
        var bubble_bg_color = msg_bubble_colors[message.sender % msg_bubble_colors.length];

        // Lets replace \n characters with html line break before rendering to the user
        var msg_text = add_emoticons(message.message).split('\n').join('<br />');

        msg_string  = '<div class="talk-bubble-set hide">';
        msg_string += '    <div class="name">' + add_emoticons(message.nickname) + '</div>';
        msg_string += '    <div class="bubble">';
        msg_string += '        <span class="msg-text" style="background: ' + bubble_bg_color + '">';
        msg_string +=              msg_text;
        msg_string +=  '       </span>';
        msg_string += '    </div>';
        msg_string += '</div>';

        $('#message-log-area').append(msg_string);

        $("#message-log-area").animate({
            scrollTop: $("#message-log-area")[0].scrollHeight
        }, 1000);

        $('#message-log-area .talk-bubble-set:last').fadeIn();
    }

    function is_websocket_supported() {
        if ('WebSocket' in window) {
            return true;
        }
        return false;
    }

    function add_emoticons(text) {
        var temp_element = document.createElement('div');
        var searchFor = /:D|:-D|:\)|:-\)|;\)|;\(|:\(|:-\(|:\*|B\)|:p|:s|:a|:o|<3|3:\)|O:\)|\(\*\)|\(hug\)|\(-\)|\(!\)|:\|/ig;
        var emoticons = {
            ':a' : 'monkey.png',
            ':|' : 'plain.png',
            '(*)' : 'star.png',
            '(hug)' : 'hug.png',
            '(-)' : 'error.png',
            '(!)' : 'important.png',
            ':)'  : 'smile.png',
            ':-)'  : 'smile.png',
            ':D'  : 'smile-big.png',
            ':-D'  : 'smile-big.png',
            'O:)' : 'angel.png',
            ':S' : 'confused.png',
            ':s' : 'confused.png',
            'B)' : 'cool.png',
            ';(' : 'crying.png',
            '3:)' : 'devilish.png',
            ':O' : 'surprise.png',
            ':o' : 'surprise.png',
            '<3' : 'favorite.png',
            ':*' : 'kiss.png',
            ':P' : 'razz.png',
            ':p' : 'razz.png',
            ':(' : 'sad.png',
            ';)' : 'wink.png'
        }, url = "/TAMZ_Projekt/emoticons/";
        // a simple regex to match the characters used in the emoticons
        temp_element.innerHTML = text.replace(searchFor, function (match) {
            return typeof emoticons[match] != 'undefined' ?
                '<img src="'+url+emoticons[match]+'"/>' :
                match;
        });
        return temp_element.innerHTML ;
    }

    function blink_window_title(msg_to_blink) {
        if (!window_has_focus) {
            play_notification_sound();

            clearInterval(flash_title_timer);

            flash_title_timer = setInterval(function () {
                if (document.title === actual_window_title) {
                    document.title = msg_to_blink;
                } else {
                    document.title = actual_window_title;
                }
            }, 1000);
        }
    }

    function play_notification_sound() {
        document.getElementById('notification-sound').play();
    }

    function update_chat_room_title_displayed(room_name) {
        if (myId !== undefined) {
            return false;
        }

        var chat_url = window.location.protocol
            + '//'
            + window.location.hostname
            + window.location.pathname;

        if (room_name === undefined) {
            room_name = window.location.hash.substr(1);
            chat_url = window.location;
        } else if (room_name !== '') {
            chat_url += '#' + room_name;
        }

        $('#chatroom').val(room_name);

        if (room_name === '' || room_name === 'public') {
            room_name = 'Public Room';
        }

        $('#room-title').html(room_name);

        $('#room-share-url').val(chat_url);
    }

    function reConnect() {
        if (!connected) {
            connection_retry_timer = setInterval(function () {
                if (socket.readyState === 3) { // 3 => Connection closed
                    open_connection();
                }
            }, 1000);
        } else {
            clearTimeout(connection_retry_timer);
        }
    }
});
