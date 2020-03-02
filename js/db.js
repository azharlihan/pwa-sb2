var dbPromised = idb.open('InFoot', 1, (upgradeDb)=> {
	jadwalOS = upgradeDb.createObjectStore('jadwal-pertandingan', {keyPath: 'teamId'});
	jadwalOS.createIndex('teamName', 'teamName', {unique: false});
});


function saveJadwal(teamId, teamName, data) {
	var dataToStore = {
		teamId: teamId,
		teamName: teamName,
		data: data
	}
	dbPromised.then((db)=> {
		var tx = db.transaction('jadwal-pertandingan', 'readwrite');
		var store = tx.objectStore('jadwal-pertandingan');
		store.put(dataToStore);
		return tx.complete;
	}).then(()=> {
		M.toast({
			html: `Data berhasil disimpan & diupdate untuk dibaca offline`
		});
	}).catch((err)=> {
		M.toast({
			html: `Data gagal disimpan <br> ${err}`
		});
	});
}

function getDaftarJadwalTersimpan() {
	return new Promise((resolve, reject)=> {
		dbPromised.then((db)=> {
			var tx = db.transaction('jadwal-pertandingan', 'readonly');
			var store = tx.objectStore('jadwal-pertandingan');
			return store.getAll();
		}).then((data)=> {
			resolve(data);
		}).catch((err)=> {
			reject(err);
		})
	})
}

function getJadwalTersimpan(id) {
	return new Promise((resolve)=> {
		dbPromised.then((db)=> {
			var tx = db.transaction('jadwal-pertandingan', 'readonly');
			var store = tx.objectStore('jadwal-pertandingan');
			return store.get(id);
		}).then((data)=> {
			resolve(data);
		}).catch((err)=> {
			M.toast({
				html: `Data mungkin rusak, silahkan simpan dari online lagi. Dan buka lewat daftar pertandingan disimpan`,
				displayLength: 6500
			});
		});
	})
}

function hapusJadwalTersimpan(id) {
	dbPromised.then((db)=> {
		var tx = db.transaction('jadwal-pertandingan', 'readwrite');
		var store = tx.objectStore('jadwal-pertandingan');
		store.delete(id);
		return tx.complete;
	}).then(()=> {
		M.toast({
			html: `Data berhasil dihapus`
		});
	}).catch((err)=> {
		M.toast({
			html: `Data gagal dihapus <br> ${err}`
		});
	});
}