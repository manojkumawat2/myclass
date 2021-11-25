$(document).ready(function() {
	const socket = io();
	const unique_key = $("#class_unique_key_chat").val();
	const lecture_id = $("#lecture_id_chat").val();
	const user_id = $("#user_id_chat").val();
	const name = $("#user_name").val();

	socket.emit("join room", lecture_id, user_id);

	$(".msg_history").scrollTop($(".msg_history").height());

	$(".msg_send_btn").on('click', function() {
		let msg = $(".write_msg").val();
		$(".write_msg").val('');
		socket.emit('chat_message', msg, user_id, unique_key, lecture_id, name);
	});

	socket.on('chat_message', (msg, sendername, time) => {
		$(".msg_history").scrollTop($(".msg_history").height());
		let msg_tag = `
		<div class="incoming_msg">
			  <div class="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>
			  <div class="received_msg">
				<div class="received_withd_msg">
				  <p>${msg}</p>
				  <span class="time_date"> 	${sendername} | ${time}</span></div>
			  </div>
		</div>
		`;

		console.log(msg);

		$(".msg_history").append(msg_tag);
	});

});