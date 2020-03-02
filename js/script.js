var xAuthToken = '2ed7997d356a4939af07d1c5cf8390ea';
var preLoaderAnimation = 	`<div class="row"><div class="col s12 center"><div class="preloader-wrapper big active"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div></div></div>`;
var tempId;

function requestNotifPermission() {
	Notification.requestPermission().then((result)=> {
		if (result === 'denied') {
			console.log('Fitur notifikasi tidak diizinkan.');
			return
		} else if (result === 'default') {
			console.log('Fitur notifikasi di abaikan');
			return
		}

		if ('PushManager' in window) {
			navigator.serviceWorker.getRegistration().then((registration)=> {
				registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: urlBase64ToUint8Array('BAK3oVcszBOE7JkQjA3_bajNo0f6IFzn4JCOwM9BodEfr60R80T5yb2VLDw_IMaqp5phkQybk_i52q-GnNEhkW4'),
				}).then((subscribe)=> {
					console.log('Berhasil melakukan subscribe dengan endpoint', subscribe.endpoint);
					console.log('Berhasil melakukan subscribe dengan p256dh key', btoa(String.fromCharCode.apply(
						null, new Uint8Array(subscribe.getKey('p256dh'))
					)));
					console.log('Berhasil melakukan subscribe dengan auth key', btoa(String.fromCharCode.apply(
						null, new Uint8Array(subscribe.getKey('auth'))
					)));
				}).catch((err)=> {
					console.error('Tidak dapat melakukan subscribe', err.message);
				});
			});
		}
	});
}

function urlBase64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - base64String.length %4) %4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i =0; i < rawData.length; i++) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

// Event handler untuk element yang ditambahkan kemudian
function myEventHandler(selector, event, handler) {
	document.querySelector('body').addEventListener(event, (evt) => {
		if (evt.target.matches(selector)) handler(evt);
	});
}

// Fetch Status
function status(response) {
	return response.status !== 200 ? Promise.reject(new Error(response.statusText)) : Promise.resolve(response);
}

// Promise json
function json(val) {
	return val.json();
}

// Untuk me load halaman-halaman utama
function loadPage(page) {
	return new Promise((resolve, reject)=> {
		var contentElm = document.getElementById('main-content');
		fetch('pages/' + page + '.html').then((response) => {
			return response.ok ? response.text() :
				response.status == 404 ? Promise.resolve('Ups Not Found') :
				Promise.reject();
		}).then((result) => {
			window.scrollTo(0, 0);
			contentElm.innerHTML = result;
			if (page == 'daftar-jadwal-disimpan') {
				getDaftarJadwalTersimpan().then((data)=> {
					populateDaftarJadwalTersimpan(data, document.getElementById('daftar-jadwal-tersimpan'));
				});
			}
			else if (page == 'jadwal-disimpan') {
				getJadwalTersimpan(tempId).then((result)=> {
					populateJadwalTim(result.data, document.getElementById('jadwal-tersimpan'), result.teamId, result.teamName);
				});
			}
			M.AutoInit(); // Inisialiasi otomatis komponen materializecss
		}).catch(() => {
			contentElm.innerHTML = 'Halman Tidak dapat di akses.';
		});
		resolve(true);
	});
}
// Untuk merender tabel klasemen
function populateTabelKlasemen(data, element, tipe = null, tahap = null) {
	
	// Isian default untuk pertamakali tabel tampil (tipe = TOTAL | HOME | AWAY, tahap = GROUP_STAGE | REGULAR_SEASON )
	if (tipe == null) tipe = data.standings[0].type;
	if (tahap == null) tahap = data.standings[0].stage;

	// Variabel list untuk setiap tipe & tahap klasemen
	var standingsStage = [];
	var standingsType= [];

	var theadElm = `<thead><tr><th>#</th><th colspan="2">Team</th><th>Play</th><th>Win</th><th>Draw</th><th>Lose</th><th>Pts</th><th>GF</th><th>GA</th><th>GD</th></tr></thead>`;

	// Variabel untuk data pada tabel
	var tableData = '';

	// Perulangan untuk tiap data klasemen
	data.standings.forEach((standing) => {

		if (!(standingsStage.includes(standing.stage))) standingsStage.push(standing.stage);

		if (!(standingsType.includes(standing.type))) standingsType.push(standing.type);

		if (standing.stage === 'GROUP_STAGE' && standing.type === tipe) {
			tableData += `
				<thead>
					<tr>
						<th colspan="11">${standing.group}</th>
					</tr>
				</thead>
				${theadElm}
			`;

			tableData += '<tbody>';
			standing.table.forEach((data) => {
				tableData += `
					<tr>
						<td>${data.position}</td>
						<td class="hide-on-med-and-down"><img src="${data.team.crestUrl}" class="football-team-logo"></td>
						<td>${data.team.name}</td>
						<td>${data.playedGames}</td>
						<td>${data.won}</td>
						<td>${data.draw}</td>
						<td>${data.lost}</td>
						<td>${data.points}</td>
						<td>${data.goalsFor}</td>
						<td>${data.goalsAgainst}</td>
						<td>${data.goalDifference}</td>
					</tr>
				`;
			});
			tableData += '</tbody>';

		} else if (standing.type === tipe) {
			tableData += theadElm;

			tableData += '<tbody>';
			standing.table.forEach((data) => {
				tableData += `
					<tr>
						<td>${data.position}</td>
						<td class="hide-on-med-and-down"><img src="${data.team.crestUrl}" class="football-team-logo"></td>
						<td>${data.team.name}</td>
						<td>${data.playedGames}</td>
						<td>${data.won}</td>
						<td>${data.draw}</td>
						<td>${data.lost}</td>
						<td>${data.points}</td>
						<td>${data.goalsFor}</td>
						<td>${data.goalsAgainst}</td>
						<td>${data.goalDifference}</td>
					</tr>
				`;
			});
			tableData += '</tbody>';

		}
	});

	var standingTypeElm = standingsType.map((standingType)=> {
		if (standingType === tipe) return `<option value="${standingType}" selected>${standingType}</option>`;
		else return `<option value="${standingType}">${standingType}</option>`;
	}).join();

	var standingStageElm = standingsStage.map((standingStage)=> {
		if (standingStage === tahap) return `<option value="${standingStage}" selected>${standingStage}</option>`;
		else return `<option value="${standingStage}">${standingStage}</option>`;
	}).join();

	var htmlElement = `
		<div class="card">
			<div class="card-content">
				<span class="card-title">${data.competition.name} - ${data.competition.area.name}</span>
				<p>Periode Musim: ${data.season.startDate} s/d ${data.season.endDate}</p>
				<br>
				<div class="row">
					<div class="col s12 m6">
						<div class="input-field"> <select name="tipe-klasemen" id="tipe-klasemen">
							${standingTypeElm}
						</select> <label>Venue</label> </div>
					</div>
					<div class="col s12 m6">
						<div class="input-field"> <select name="tahap-klasemen" id="tahap-klasemen">
							${standingStageElm}
						</select> <label>Tahap Klasemen</label> </div>
					</div>
				</div>
				<br>
				<table class="striped highlight centered responsive-table">${tableData}</table>
			</div>
		</div>
	`;

	element.innerHTML = htmlElement;
	M.AutoInit();
}

// Untuk merender tabel daftar tim
function populateTabelInformasiTim(data, element) {

	var tableData = '';

	data.teams.forEach((team)=> {
		tableData += `
			<tr>
				<td><img src="${team.crestUrl}" class="football-team-logo"></td>
				<td>${team.name}</td>
				<td>${team.shortName}</td>
				<td>${team.tla}</td>
				<td>${team.address}</td>
				<td><a href="${team.website}">${team.website}</a></td>
				<td>${team.venue}</td>
				<td>${team.founded}</td>
			</tr>
		`;
	});

	var htmlElement =	`
		<div class="card">
			<div class="card-content">
				<span class="card-title">${data.competition.name} - ${data.competition.area.name}</span>
				<p>Periode Musim: ${data.season.startDate} s/d ${data.season.endDate}</p>
				<br>
				<div class="auto-overflow">
					<table class="striped highlight centered">
						<thead>
							<tr>
								<th>Logo</th>
								<th>Nama Tim</th>
								<th>Shortname</th>
								<th>Inisial</th>
								<th>Alamat</th>
								<th>Website</th>
								<th>Stadion</th>
								<th>Didirikan</th>
							</tr>
						</thead>
						<tbody>${tableData}</tbody>
					</table>
				</div>
			</div>
		</div>
	`;
	element.innerHTML = htmlElement;
}

// Untuk merender daftar pilihan tim
function populatePilihanTim(data, contentElm) {
	var htmlElement = `<select><option value="" disabled selected>Pilih Tim</option>`;
	data.teams.forEach((team) => {
		htmlElement += `<option value="${team.id}">${team.name}</option>`;
	});
	htmlElement += '</select><label>Pilih Tim</label><br><a class="waves-effect waves-light btn-small" id="save-jadwal"><i class="material-icons right">save</i>Simpan Offline</a><div id="jadwal-tim-container"></div>';

	contentElm.innerHTML = htmlElement;
	M.AutoInit();
}

// Untuk merender jadwal pertandingan tim
function populateJadwalTim(data, contentElm, teamId = null, teamName = null) {
	var seletedTeamElm = document.querySelector('#daftar-pilihan-tim select');
	if (seletedTeamElm !== null) {
		teamId = seletedTeamElm.value
		teamName = seletedTeamElm[seletedTeamElm.selectedIndex].innerHTML;
	}
	var tableData = '';
	
	data.matches.forEach((match)=> {

		var venue = (match.homeTeam.id == teamId) ? 'HOME' : 'AWAY';
		var vs = (venue == 'HOME') ? match.awayTeam.name : match.homeTeam.name;
		
		if (venue == 'HOME' && match.score.winner !== null) {
			var isWinner = (match.score.winner == 'HOME_TEAM') ? 'WIN' : (match.score.winner == 'AWAY_TEAM') ? 'LOSE' : 'DRAW';
			var score = match.score.fullTime.homeTeam;
			var rivalScore = match.score.fullTime.awayTeam;
		} else if (venue == 'AWAY' && match.score.winner !== null){
			var isWinner = (match.score.winner == 'AWAY_TEAM') ? 'WIN' : (match.score.winner == 'HOME_TEAM') ? 'LOSE' : 'DRAW';
			var score = match.score.fullTime.awayTeam;
			var rivalScore = match.score.fullTime.homeTeam;
		} else {
			var isWinner = '';
			var score = '';
			var rivalScore = '';
		}
		
		tableData += `
			<tr>
				<td>${match.competition.name}</td>
				<td>${new Date(match.utcDate).toLocaleString()}</td>
				<td>${vs}</td>
				<td>${match.status}</td>
				<td>${isWinner}&nbsp${score}&nbsp-&nbsp${rivalScore}</td>
				<td>${venue}</td>
			</tr>
		`;
	});
	
	var htmlElement = `
		<div class="card">
			<div class="card-content">
				<span class="card-title">Jadwal Pertandingan <strong>${teamName.replace(/\s/g,'&nbsp')}</strong></span>
				<br>
				<table class="striped highlight centered responsive-table">
					<thead>
						<tr>
							<th>Kompetisi</th>
							<th>Jadwal</th>
							<th>VS</th>
							<th>Status</th>
							<th>Score</th>
							<th>Venue</th>
						</tr>
					</thead>
					<tbody>${tableData}</tbody>
				</table>
			</div>
		</div>
	`;

	contentElm.innerHTML = htmlElement;
}

function populateDaftarJadwalTersimpan(data, contentElm) {
	var tableData = '';

	data.forEach((data)=> {
		tableData += `
			<tr>
				<td>${data.teamName}</td>
				<td>
					<a data-id="${data.teamId}" class="waves-effect waves-light btn-small lihat-jadwal-tersimpan">Lihat</a>
				</td>
				<td>
					<a data-id="${data.teamId}" class="waves-effect waves-light btn-small hapus-jadwal-tersimpan">Hapus</a>
				</td>
			</tr>
		`;
	});
	var htmlElement = `
		<table class="striped highlight centered responsive-table">
			<thead>
				<tr>
					<th>Nama Tim</th>
					<th>Lihat</th>
					<th>Hapus</th>
				</tr>
			</thead>
			<tbody>${tableData}</tbody>
		</table>
	`;

	contentElm.innerHTML = htmlElement;
}


document.addEventListener('DOMContentLoaded', function () {
	// Inisialisasi materializecss sidenav
	M.Sidenav.init(document.querySelectorAll('.sidenav'));

	// Load halaman saat webApp pertamakali dibuka
	var page = window.location.hash.substr(1);
	page === '' ? loadPage('home') : loadPage(page);


	// Daftarkan event listener untuk setiap kali navigasi di klik
	document.querySelectorAll('.sidenav a').forEach(function (elm) {
		elm.addEventListener('click', function (event) {
			// Tutup sidenav
			if (window.screen.width < 992) M.Sidenav.getInstance(document.querySelector('.sidenav')).close();

			// Muat konten halaman yang akan dipaggil
			page = event.target.getAttribute('href').substr(1);
			loadPage(page);
		});
	});

	// Variabel sementara untuk menampung data saat tipe klasemen / tahap klasemen diubah
	var tempDataKlasemen;
	// Event Listener untuk load data klasemen
	myEventHandler('select#nama-kompetisi-fklasemen', 'change', (event) => {
		var contentElm = document.getElementById('tabel-klasemen');
		contentElm.innerHTML = preLoaderAnimation;
		competitionId = event.target.value;
		fetch(`https://api.football-data.org/v2/competitions/${competitionId}/standings`, {
			headers: {
				'X-Auth-Token': xAuthToken
			}
		}).then(status).then(json).then((result) => {
			populateTabelKlasemen(result, contentElm);
			tempDataKlasemen = result;
		}).catch((err) => {
			M.toast({
				html: `Gagal mengambil data <br> (${err})`
			});
			contentElm.innerHTML = '';
		});
	});
	// Event Listener untuk pergantian pilihan data klasemen
	myEventHandler('#tipe-klasemen, #tahap-klasemen', 'change', ()=> {
		var tipe = document.getElementById('tipe-klasemen');
		var tahap = document.getElementById('tahap-klasemen');
		populateTabelKlasemen(tempDataKlasemen, document.getElementById('tabel-klasemen'), tipe.value, tahap.value);
	});

	// Event listener untuk informasi tim
	myEventHandler('select#nama-kompetisi-ftim', 'change', (event)=> {
		var contentElm = document.getElementById('tabel-daftar-tim');
		contentElm.innerHTML = preLoaderAnimation;
		competitionId = event.target.value;
		fetch(`https://api.football-data.org/v2/competitions/${competitionId}/teams`, {
			headers: {
				'X-Auth-Token': xAuthToken
			}
		}).then(status).then(json).then((result)=> {
			populateTabelInformasiTim(result, contentElm);
		}).catch((err) => {
			M.toast({
				html: `Gagal mengambil data <br> (${err})`
			});
			contentElm.innerHTML = '';
		});
	});

	// Event listener untuk melist daftar tim dari suatu kompetisi di halaman jadwal pertandingan
	myEventHandler('select#nama-kompetisi-fjadwal', 'change', (event)=> {
		contentElm = document.getElementById('daftar-pilihan-tim');
		contentElm.innerHTML = preLoaderAnimation;
		competitionId = event.target.value;

		fetch(`https://api.football-data.org/v2/competitions/${competitionId}/teams`, {
			headers: {
				'X-Auth-Token': xAuthToken
			}
		}).then(status).then(json).then((result)=> {
			populatePilihanTim(result, contentElm);
			document.getElementById('save-jadwal').classList.add('hide');
		}).catch((err) => {
			M.toast({
				html: `Gagal mengambil data <br> (${err})`
			});
			contentElm.innerHTML = '';
		});
	});

	// Variabel Sementara Untuk Menyimpan data pertandingan tim
	var tempDataPertandingan;
	// Event listener untuk menampilkan jadwal pertandingan tim
	myEventHandler('#daftar-pilihan-tim select', 'change', (event)=> {
		contentElm = document.getElementById('jadwal-tim-container');
		contentElm.innerHTML = preLoaderAnimation;
		teamId = event.target.value;
		document.getElementById('save-jadwal').classList.add('hide');
		fetch(`https://api.football-data.org/v2/teams/${teamId}/matches/`, {
			headers: {
				'X-Auth-Token': xAuthToken
			}
		}).then(status).then(json).then((result)=> {
			populateJadwalTim(result, contentElm);
			tempDataPertandingan = result;
			document.getElementById('save-jadwal').classList.remove('hide');
		}).catch((err) => {
			M.toast({
				html: `Gagal mengambil data <br> (${err})`
			});
			contentElm.innerHTML = '';
		});
	});

	myEventHandler('#save-jadwal', 'click', ()=> {
		var seletedTeamElm = document.querySelector('#daftar-pilihan-tim select');
		var teamId = seletedTeamElm.value;
		var teamName = seletedTeamElm[seletedTeamElm.selectedIndex].innerHTML;
		saveJadwal(teamId, teamName, tempDataPertandingan);
	});

	
	myEventHandler('.lihat-jadwal-tersimpan', 'click', (event)=> {
		tempId = event.target.dataset.id;
		loadPage('jadwal-disimpan');
	})

	myEventHandler('.hapus-jadwal-tersimpan', 'click', (event)=> {
		var id = event.target.dataset.id;
		hapusJadwalTersimpan(id);
		getDaftarJadwalTersimpan().then((data)=> {
			populateDaftarJadwalTersimpan(data, document.getElementById('daftar-jadwal-tersimpan'));
		});
	});

	myEventHandler('#back-to-daftar', 'click', (event)=>{
		loadPage('daftar-jadwal-disimpan');
	})

});