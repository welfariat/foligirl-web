class Foli {
	constructor() {
		this.loadedCount = 0;
		this.checkingDelay = parseInt(Foli.getUrlVar('ad')||30000);
		this.loading = false;
		this.pics = Foli.getUrlVar('p');
		this.tag = Foli.getUrlVar('t');
		this.days = Foli.getUrlVar('d');
		if (this.days) switch (this.days) {
			case 'w':
				this.days = new Date().getDay();
				break;
			case 'm':
				this.days = new Date().getDate() - 1;
				break;
			case 'y':
				this.days = Math.floor(new Date() - new Date(new Date().getFullYear(), 0, 0) / (1000 * 60 * 60 * 24));
				break;
		}
		this.confirmation = '请问您年龄是否已满 <b><i>28</i></b> 周岁？<br>Are you sure you are older than <b><i>28</i></b> years?';
		this.tagsTrans = {
			alter: '字母圈', author: '创作者', babe: '宝贝', bdsm: '捆绑', collect: '转载', comic: '二次元',
			dance: '舞蹈生', death: '停更', fav: '精选', girl: '少女', innocent: '清纯', japan: '日本',
			lady: '御姐', legs: '美腿', lolita: '萝莉', lust: '淫荡', model: '模特', normal: '非色情', nsfw: '色情',
			piercing: '穿刺', pussy: '批', seduce: '诱惑', silhouettes: '剪影', tongue: '香舌', ts: '性转',
			unmarked: '无水印', video: '视频', weibo: '微博', mucus: '湿'
		}
		this.adCodes = [{
			id: "exoclick",
			html0: '<iframe src="/ad-exo.html" style="width: 100%;height: 320px;border: none;"></iframe>',
			html: '<script type="application/javascript" data-idzone="4292970" src="https://a.realsrv.com/nativeads-v2.js" ></script>',
			count: 0,
			loaded: () => $('.exo-native-widget').length > 0
		}, {
			id: "eroad",
			html0: '<iframe src="/ad-ero.html" style="width: 100%;height: 380px;border: none;"></iframe>',
			html: '<div id="ea_5214668_node" class="ad-ero-more">&nbsp;</div><script src="/ad-ero.js" type="text/javascript" language="javascript" charset="utf-8"></script>',
			count: 0,
			loaded: () => $('#ea_5214668_node').html() !== '&nbsp;'
		}];
	}
	static getUrlVars() {
		var vars = [], hash;
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		for (const kv of hashes) {
			hash = kv.split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
		return vars;
	}
	static getUrlVar(name) {
		return Foli.getUrlVars()[name];
	}
	static confirmAge1() {
		var confirmed = localStorage.getItem('AGE-CONFIRM') || confirm(this.confirm);
		if (confirmed) localStorage.setItem('AGE-CONFIRM', 128, { domain: 'foligirl.org', expires: 365 });
		else Cookies.remove('AGE-CONFIRM', { domain: 'foligirl.org' });
		return confirmed;
	}
	confirmAge() {
		if (localStorage.getItem('AGE-CONFIRM')) return;
		var btnn = $('<a></a>').attr('id', 'no').html('我尚未满28周岁！').click(e => {
			alert('再见');
			localStorage.removeItem('AGE-CONFIRM');
			$('#foli').html('');
		});
		var btny = $('<a></a>').attr('id', 'yes').html('我已超过28周岁！').click(e => {
			localStorage.setItem('AGE-CONFIRM', 128);
			$('#aging-confirm').remove();
		});
		var aging = $('<div></div>').attr('id', 'aging-confirm')
			.append($('<div></div>').attr('id', 'msg').html(this.confirmation))
			.append($('<div></div>').append(btnn).append(btny));
		$('#container-overlay').show().append(aging);
	}
	init() {
		this.confirmAge();

		for (let t in this.tagsTrans) 
			$('#head-tags').append($('<a></a>').addClass('head-tag').attr('href', '?t=' + t).html(this.tagsTrans[t]));

		$('#container-overlay').click(e => {
			$('#container-overlay').hide();
		});
		this.loadPics();
		$(window).scroll(e => {
			if (this.loading) return;
			var hT = $('#load-more').offset().top, hH = $('#load-more').outerHeight(), wH = $(window).height(), wS = $(e.target).scrollTop();
			if (wS > (hT + hH - wH)) {
				console.debug('scrolled top: ' + wS + ', load-more top: ' + hT + ', load-more height: ' + hH + ', windows height: ' + wH);
				this.loadPics();
			}
		});
		if (this.checkingDelay > 1000) window.setTimeout(()=>{
			if (this.checkAllAD()) console.debug('ad loaded successfully.');
			else console.debug('ad loaded failed, content removed.');
		}, this.checkingDelay);
	}
	parsePath(path) {
		var tags = [{}], regex = /\[([^/\]\[]+)\]/g, matches;
		while (matches = regex.exec(path)) tags[0][matches[1]] = '';
		for (var tag in tags[0]) tags.push(tag);
		tags.shift();

		var dirs = path.split('/');
		var fname = dirs.pop();
		dirs.shift(); // leading slash

		var person = '';
//		if (dirs.length == 3) { // person folder
			person = dirs.pop().replaceAll(/[@\[#].*/g, '');
//		}
		regex = /@([^\.\[\]/]+)/g;
		while (matches = regex.exec(fname)) {
			person = matches[1];
		}

		var r = {
			path: path.replaceAll('#', '%23'),
			tags: tags,
			person: person,
			ext: fname.substr(fname.lastIndexOf('.') + 1).toLowerCase()
		};
		if (matches = fname.match(/(20\d{6}).*/)) r.day = matches[1];
		return r;
	}
	processPath(path) {
		if (path.length == 0) return;
		let info = this.parsePath(path);
		let fig = '<figure class="folimag">';
		switch (info.ext) {
			case 'jpeg':
			case 'jpg':
			case 'png':
			case 'gif':
			case 'jfif':
				fig += '<img class="folimag-content" src="//img.foligirl.org' + info.path + '" alt="' + info.person + '" />';
				break;
			case 'mp4':
			case 'mov':
				let vurl = '//img.foligirl.org' + info.path;// + '#t=0.3';
				fig += '<video controls class="folimag-content" preload="metadata">'
					+'<source src="'+vurl+'" type="video/mp4">视频内容无法放映</video>';
				break;
			default:
				console.debug('Unsupported: ' + info.path);
				return;
		}
		fig += '<figcaption class="folimag-cap">';
		if (info.person.length > 0) fig += '<a class="folimag-person"><b>' + info.person + '</b></a>';
		if (info.day) fig += '&zwnj;<a href="/?d=' + info.day + '" class="folimag-day"><i>' + info.day + '</i></a>';
		if (info.tags.length > 0) for (const tag of info.tags)
			fig += '&zwnj;<a href="/?t=' + tag + '" class="folimag-tag">#' + (this.tagsTrans[tag] || tag) + '</a>';
		fig += '</figcaption></figure>';
		(fig = $(fig)).insertBefore($("#geo-tracker")).click(this.showPic).find('.folimag-content').on('load',e=>this.countLoaded());
		return fig;
	}
	showPic(e) {
		let vv = $(e.target);
		let v = $('#container-overlay').find('.image-viewer');
		v.find('.folimag-content').remove();
		v.prepend(vv.clone().addClass('folimag-content'));
		v.find('.image-viewer-desc').html(vv.next().html());
		$('#container-overlay').show();
	}
	loadPics() {
		if (this.loading) return;
		this.loading = true;
		var url = '/bin/rand';
		var qs = [];
		if (this.pics) qs.push('c=' + this.pics);
		if (this.tag) qs.push('t=' + this.tag);
		if (this.days) qs.push('d=' + this.days);
		if (qs.length > 0) url += '?' + qs.join('&');
		$.ajax(url, {
			dataType: 'text'
		}).done(data => {
			let fig = undefined, lines = data.split('\n').filter(l=>l && l.length).sort((e1, e2 )=>e1.substr(e1.lastIndexOf('/')+1)>e2.substr(e2.lastIndexOf('/')+1)?-1:1);
			console.debug(lines.length + ' resources found');
			let lastad = 0, adloaded = false;
			for (const l of lines) 
				if (l.length > 0 && (fig = this.processPath(l)) && (lastad = this.loadAD(fig, lastad)) === 0) 
					adloaded = true;
			if (!adloaded) this.loadAD(fig, 999);
			this.loading = false;
			if (lines.length < parseInt(this.pics || 30)) { // not enough
				this.days = (!this.days) ? '1': 'a'; // if today, set yesterday; if other filter, fetch all image
				if (lines.length == 0) this.loadPics();
			}
		});
	}
	loadAD(fig, lastad) {
		if (lastad > 0 && Math.random()/lastad < 1/30) {
			let notFirst = (this.adCodes[0].count++ > 0);
			let embed = notFirst ? ($(this.adCodes[0].html0 || $(this.adCodes[0].html))) : $(this.adCodes[0].html);
			$("<figure class='gad-inline'></figure>").append(embed).insertAfter(fig);
			console.debug('random ad loaded after ['+lastad+']: ' + this.adCodes[0].id + ' ('+(notFirst?'Not First':'First')+')');
			this.adCodes.sort((e1, e2 )=> e1.count < e2.count ? -1 : 1);
			lastad = 0;
		} else lastad++;
		return lastad;
	}
	checkAllAD() {
		for (let ad of this.adCodes) if (ad.loaded()) return true;
		if (this.checkingDelay > 1000) {
			$('#foli').remove();
			$('body').append($('<h1 style="color:silver;padding-left:1em;">请将本站加入浏览器广告拦截/跟踪拦截白名单中，谢谢。</h1>'));
		}
		return false;
	}
	countLoaded() {
		$('#head-loaded-stats').html('本次发放福利 <span id="loaded-num">' + (++this.loadedCount) + '</span> 份');
	}
}
var foli = new Foli();
$(document).ready(() => foli.init());