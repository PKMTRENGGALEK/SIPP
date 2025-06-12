(() => {
  const scriptURL = "https://script.google.com/macros/s/AKfycbzv7hK23jFpuh6swh5aYWekPytcIqK_VmjFYHNS5Kyvuz6RAHeRTZepwTMeYg4FKJ0j/exec";
  const container = document.getElementById("profil-container");

  const nip = window.pageQuery?.nip;
  if (!nip) {
    container.innerHTML = `<div class="alert alert-danger">NIP tidak ditemukan.</div>`;
    return;
  }

  fetch(scriptURL)
    .then(res => res.json())
    .then(data => {
      const pegawai = data.find(item => item.NIP === nip);
      if (!pegawai) {
        container.innerHTML = `<div class="alert alert-warning">Data pegawai dengan NIP <strong>${nip}</strong> tidak ditemukan.</div>`;
        return;
      }

      // Render profil
      container.innerHTML = `
        <div class="card shadow">
          <div class="card-body">
            <h5 class="card-title">${pegawai.NAMA}</h5>
            <p><strong>NIP:</strong> ${pegawai.NIP}</p>
            <p><strong>Jabatan:</strong> ${pegawai.JABATAN || "-"}</p>
            <!-- Tambahkan data lain sesuai kebutuhan -->
          </div>
        </div>
      `;
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = `<div class="alert alert-danger">Gagal mengambil data.</div>`;
    });
})();
