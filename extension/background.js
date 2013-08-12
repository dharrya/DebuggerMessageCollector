
(function() {

JSDebuggerConsole = function()
{
	this.version = '1.0';
	this.messages = [];
	this.tabsPageUrls = [];
	chrome.debugger.onEvent.addListener($.proxy(this.listener, this));
	chrome.debugger.onDetach.addListener($.proxy(this.onDetach, this));
	chrome.runtime.onMessage.addListener($.proxy(this.onMessage, this));
};

JSDebuggerConsole.prototype.onDetach = function(source, reason) {
	delete attachedDebuggers[source.tabId];
}

JSDebuggerConsole.prototype.setPageUrl = function(tabId, tabUrl) {
	this.tabsPageUrls[tabId] = tabUrl;
}

JSDebuggerConsole.prototype.getPageUrl = function(tabId) {
	if(!!this.tabsPageUrls[tabId])
		return this.tabsPageUrls[tabId];
	else
		return 'undefined';
}

JSDebuggerConsole.prototype.listener = function(source, method, params) {
	//console.log('----');
	//console.log(source);
	//console.log(method);
	//console.log(params);

	if(!this.isInterestingMethod(method))
		return;
	if(!this.isInterestingMessage(params.message))
		return;

	this.messages.push({
		text: params.message.text.replace(/^Uncaught /g, ''),
		line: params.message.line,
		source: params.message.source,
		stackTrace: params.message.stackTrace,
		sourceUrl: params.message.url,
		pageUrl: this.getPageUrl(source.tabId)
	});
};

JSDebuggerConsole.prototype.attach = function(attachTabId) {
	chrome.debugger.attach({tabId: attachTabId}, this.version);
	chrome.debugger.sendCommand({tabId: attachTabId}, "Console.enable");
	// chrome.debugger.sendCommand({tabId: pTabId}, "CSS.disable");
	// chrome.debugger.sendCommand({tabId: pTabId}, "Network.disable");
};

JSDebuggerConsole.prototype.isInterestingMethod = function(methodName) {
	if(methodName == 'Console.messageAdded')
		return true;

	return false;
};

JSDebuggerConsole.prototype.isInterestingMessage = function(message) {
	if(message.level == 'error')
		return true;

	return false;
};

JSDebuggerConsole.prototype.deatach = function(detachTabId) {
	chrome.debugger.detach({tabId: detachTabId});
};

JSDebuggerConsole.prototype.onMessage = function(request, sender, sendResponse) {
	if (!request.command)
		return;
	
	if (request.command == 'clear') {
		//console.log('clearning: ' + this.messages);
		this.messages = [];
	} else if(request.command == 'getMessages') {
		//console.log('sending: ' + this.messages);
		sendResponse(this.messages);
	} else if(request.command == 'attach') {
		myConsole.attach(2);
	}
}
})();

var attachedDebuggers = [];
var myConsole = new JSDebuggerConsole();

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if(!/(https?:\/\/|file:\/\/)/gi.test(tab.url))
		return;

	myConsole.setPageUrl(tabId, tab.url);
	if(attachedDebuggers.indexOf(tabId) > -1) {
		//console.log('alredy attached: ' + tabId);
		return;
	}
	//console.log(attachedDebuggers);
	console.log('atach for tabId: ' + tabId);
	myConsole.attach(tabId);
	attachedDebuggers.push(tabId);
	
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	//console.log('deatached: ' + tabId);

	var id = attachedDebuggers.indexOf(tabId);
	if(id > 0)
		delete attachedDebuggers[id];
});