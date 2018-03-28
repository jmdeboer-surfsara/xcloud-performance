/* global jstz */
$(document).ready(function () {
		$('#timezone_offset').val((-new Date().getTimezoneOffset() / 60));
		$('#timezone').val(jstz.determine().name());

		// only enable the submit button once we are sure that the timezone is set
		var $loginForm = $('form[name="login"]');
		if ($loginForm.length) {
			$loginForm.find('input#submit').prop('disabled', false);
		}
	}
);



OC.Lostpassword = {
	sendErrorMsg : t('core', 'Couldn\'t send reset email. Please contact your administrator.'),

	sendSuccessMsg : t('core', 'The link to reset your password has been sent to your email. If you do not receive it within a reasonable amount of time, check your spam/junk folders.<br>If it is not there ask your local administrator.'),

	encryptedMsg : t('core', "Your files are encrypted. There will be no way to get your data back after your password is reset.<br />If you are not sure what to do, please contact your administrator before you continue. <br />Do you really want to continue?")
			+ ('<br /><input type="checkbox" id="encrypted-continue" value="Yes" />')
			+ '<label for="encrypted-continue">'
			+ t('core', 'I know what I\'m doing')
			+ '</label><br />',

	resetErrorMsg : t('core', 'Password can not be changed. Please contact your administrator.'),

	init : function() {
		$('#lost-password').click(OC.Lostpassword.resetLink);
		$('#reset-password #submit').click(OC.Lostpassword.resetPassword);
	},

	resetLink : function(event){
		event.preventDefault();
		if (!$('#user').val().length){
			$('#submit').trigger('click');
		} else {
			if (OC.config.lost_password_link === 'disabled') {
				return;
			} else if (OC.config.lost_password_link) {
				window.location = OC.config.lost_password_link;
			} else {
				$.post(
					OC.generateUrl('/lostpassword/email'),
					{
						user : $('#user').val()
					},
					OC.Lostpassword.sendLinkDone
				).fail(function() {
					OC.Lostpassword.sendLinkError(OC.Lostpassword.sendErrorMsg);
				});
			}
		}
	},

	sendLinkDone : function(result){
		var sendErrorMsg;

		if (result && result.status === 'success'){
			OC.Lostpassword.sendLinkSuccess();
		} else {
			if (result && result.msg){
				sendErrorMsg = result.msg;
			} else {
				sendErrorMsg = OC.Lostpassword.sendErrorMsg;
			}
			OC.Lostpassword.sendLinkError(sendErrorMsg);
		}
	},

	sendLinkSuccess : function(msg){
		var node = OC.Lostpassword.getSendStatusNode();
		// update is the better success message styling
		node.addClass('update').css({width:'auto'});
		node.html(OC.Lostpassword.sendSuccessMsg);
	},

	sendLinkError : function(msg){
		var node = OC.Lostpassword.getSendStatusNode();
		node.addClass('warning');
		node.html(msg);
		OC.Lostpassword.init();
	},

	getSendStatusNode : function(){
		if (!$('#lost-password').length){
			$('<p id="lost-password"></p>').insertBefore($('#remember_login'));
		} else {
			$('#lost-password').replaceWith($('<p id="lost-password"></p>'));
		}
		return $('#lost-password');
	},

	resetPassword : function(event){
		event.preventDefault();
		if ($('#password').val()){
			$.post(
					$('#password').parents('form').attr('action'),
					{
						password : $('#password').val(),
						proceed: $('#encrypted-continue').is(':checked') ? 'true' : 'false'
					},
					OC.Lostpassword.resetDone
			);
		}
		if($('#encrypted-continue').is(':checked')) {
			$('#reset-password #submit').hide();
			$('#reset-password #float-spinner').removeClass('hidden');
		}
	},

	resetDone : function(result){
		var resetErrorMsg;
		if (result && result.status === 'success'){
			$.post(
					OC.webroot + '/',
					{
						user : window.location.href.split('/').pop(),
						password : $('#password').val()
					},
					OC.Lostpassword.redirect
			);
		} else {
			if (result && result.msg){
				resetErrorMsg = result.msg;
			} else if (result && result.encryption) {
				resetErrorMsg = OC.Lostpassword.encryptedMsg;
			} else {
				resetErrorMsg = OC.Lostpassword.resetErrorMsg;
			}
			OC.Lostpassword.resetError(resetErrorMsg);
		}
	},

	redirect : function(msg){
		if(OC.webroot !== '') {
			window.location = OC.webroot;
		} else {
			window.location = '/';
		}
	},

	resetError : function(msg){
		var node = OC.Lostpassword.getResetStatusNode();
		node.addClass('warning');
		node.html(msg);
	},

	getResetStatusNode : function (){
		if (!$('#lost-password').length){
			$('<p id="lost-password"></p>').insertBefore($('#reset-password fieldset'));
		} else {
			$('#lost-password').replaceWith($('<p id="lost-password"></p>'));
		}
		return $('#lost-password');
	}

};

$(document).ready(OC.Lostpassword.init);


/**
 * Copyright (c) 2015
 *  Vincent Petry <pvince81@owncloud.com>
 *  Jan-Christoph Borchardt, http://jancborchardt.net
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

/**
 * @namespace
 * @memberOf OC
 */
OC.Login = _.extend(OC.Login || {}, {
	onLogin: function () {
		$('#submit')
			.removeClass('icon-confirm-white')
			.addClass('icon-loading-small')
			.attr('value', t('core', 'Logging in …'));
		return true;
	},

	rememberLogin: function(){
		if($(this).is(":checked")){
			if($("#user").val() && $("#password").val()) {
				$('#submit').trigger('click');
			}
		}
	}
});

$(document).ready(function() {
	$('form[name=login]').submit(OC.Login.onLogin);

	$('#remember_login').click(OC.Login.rememberLogin);
});


