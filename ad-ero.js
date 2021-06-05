if (typeof eaCtrl == "undefined") {
	var eaCtrlRecs = [];
	var eaCtrl = { add: function (ag) { eaCtrlRecs.push(ag) } };
	var js = document.createElement('script');
	js.setAttribute("src", "//go.eabids.com/loadeactrl.go?pid=127578&siteid=2287163&spaceid=5214668");
	document.head.appendChild(js);
}
eaCtrl.add({
	"plugin": "native", "subid": "", "keywords": "", "maincat": "", "sid": 5214668, "display": "ea_5214668_node", 
	settings: { "rows": 1, "cols": 1 },
	"tpl_body": '<table cellpadding="0" cellspacing="0" id="ntbTbl"><tbody>{body}</tbody></table>',
	"tpl_row": '<tr valign="top" id="ntvRow">{items}</tr>',
	"tpl_item": '<td id="ntvCell"><div id="ntvContent"><a id="{href_itemid}" href="#"><div id="ntvTitle">{title}</div><div id="ntvImage">{image}</div><div id="ntvDescr">{description}</div><div id="ntvDisplayUrl">{displayurl}</div></a></div></td>'
});
