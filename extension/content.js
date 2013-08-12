var DebuggerConsoleProxy = {
	sendCommand: function(command, data) {
		window.postMessage({
				type: 'DebuggerErrorCollectorMessageToWindow',
				command: command,
				data: data
			},
			'*'
		);
	},
	sendRuntimeCommand: function(command, data) {
		chrome.runtime.sendMessage({command: command, data: data}, function(response){
			//console.log(response);
			//console.log('11');
			DebuggerConsoleProxy.sendCommand(command, response);
		});
	},
	onMessage: function(event) {
		//console.log(event);
		if (event.source != window || !event.data.type)
			return;

		if (event.data.type == 'DebuggerErrorCollectorMessageToBackground') {
			DebuggerConsoleProxy.sendRuntimeCommand(event.data.command)
		}
	},
	initialize: function() {
		this.initEvents();
		this.initPublicContainer();
	},
	initEvents: function() {
		// window.addEventListener('error', JSErrorCollector.onError, false);
		window.addEventListener('message', DebuggerConsoleProxy.onMessage, false);
		chrome.runtime.onMessage.addListener(DebuggerConsoleProxy.onMessage);
	},
	initPublicContainer: function() {
		// var s = document.createElement('script');
		// s.src = chrome.extension.getURL('jquery.min.js');
		// (document.head||document.documentElement).appendChild(s);
		// 	s.onload = function() {
		// 		s.parentNode.removeChild(s);
		// };

		var s = document.createElement('script');
		s.src = chrome.extension.getURL('injected.js');
		(document.head||document.documentElement).appendChild(s);
			s.onload = function() {
				s.parentNode.removeChild(s);
		};
	}
};
DebuggerConsoleProxy.initialize();



// JSErrorCollector.initialize();

// var tabId = parseInt(window.location.search.substring(1));

