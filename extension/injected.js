var JSErrorCollector_errors = {
	callback: null,
	sendCommand: function(command, returnData) {
		//console.log('222:' + command);
		window.postMessage({
				type: 'DebuggerErrorCollectorMessageToBackground',
				command: command
			},
			'*'
		);
	},
	pump: function(callback) {
		//console.log(callback);
		this.callback = callback;
		this.sendCommand('getMessages', true);
	},
	clear: function() {
		this.sendCommand('clear');
	},
	onMessage: function(event) {
		if (!event.data.type)
			return;
//console.log('~~~~~');
		if (event.data.type == 'DebuggerErrorCollectorMessageToWindow') {
			//console.log(event.data);
		//console.log(event.data.command == 'getMessages');
		//console.log(!!event.data.data);
			if(event.data.command == 'getMessages' && !!event.data.data) {
				//console.log('!!!');
				//console.log(JSErrorCollector_errors.callback);
				if(JSErrorCollector_errors.callback)
					JSErrorCollector_errors.callback(event.data.data);
				JSErrorCollector_errors.sendCommand('clear');
			}
		}
	},
	initialize: function() {
		window.addEventListener('message', JSErrorCollector_errors.onMessage);
	}
};

JSErrorCollector_errors.initialize();
