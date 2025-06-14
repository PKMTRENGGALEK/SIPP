
(() => {
  const scriptURL1 = "https://script.google.com/macros/s/AKfycbwoeeV-PJaEL_GB1s39IrA9yGSfiYBF99n69DzLIrcq_QKOykEWwA58DIW7RSPBkwOzBw/exec"; // Data utama pegawai
  const scriptURL2 = "https://script.google.com/macros/s/AKfycbzmF_vUD7lNBpc6blb1X0B-2hSwcPz8vUI_Kb4rha-5JNpQ7_NvLFmMpk0y9Nf78cU2zQ/exec"; // Data riwayat kepangkatan
  const container = document.getElementById("profil-container");

  const nip = window.pageQuery?.nip?.toString().trim();
  if (!nip) {
    container.innerHTML = `<div class="alert alert-danger">NIP tidak ditemukan.</div>`;
    return;
  }

  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center my-5 gap-2">
      <div class="spinner-border text-primary" role="status"></div>
      <strong>Sedang memuat data pegawai...</strong>
    </div>`;

  function formatTanggalIndonesia(dateStr) {
    const tanggal = new Date(dateStr);
    if (isNaN(tanggal)) return "-";
    return tanggal.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function hitungUmur(dateStr) {
    const lahir = new Date(dateStr);
    if (isNaN(lahir)) return "-";
    const today = new Date();
    let umur = today.getFullYear() - lahir.getFullYear();
    const m = today.getMonth() - lahir.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < lahir.getDate())) umur--;
    return `${umur} tahun`;
  }

  Promise.all([
    fetch(scriptURL1).then((res) => res.json()),
    fetch(scriptURL2).then((res) => res.json()),
  ])
    .then(([dataPegawai, dataPangkat]) => {
      const pegawai = dataPegawai.find((item) => item.NIP?.trim() === nip);
      const riwayatPangkat = dataPangkat.filter(
        (item) => item.NIP?.replace(/\s+/g, '') === nip.replace(/\s+/g, '')
      );

      if (!pegawai) {
        container.innerHTML = `<div class="alert alert-warning">Data pegawai dengan NIP <strong>${nip}</strong> tidak ditemukan.</div>`;
        return;
      }

      container.innerHTML = `
        <div class="text-center">
          <img src="Assets/garuda.png" class="garuda" width="10%" />
          <h5 class="mt-2">KARTU INDUK</h5>
          <h5>KEPEGAWAIAN SIPIL</h5>
        </div>

        <h6 class="section-title fw-bold">I. KETERANGAN PERORANGAN</h6>
        <table class="table table-borderless">
          <tr><td>1. Nama Lengkap</td><td>: ${pegawai.NAMA}</td></tr>
          <tr><td>2. NIP / No. Karpeg</td><td>: ${pegawai.NIP} ${pegawai.NOKARPEG ? "/ " + pegawai.NOKARPEG : ""}</td></tr>
          <tr><td>3. Tempat, Tgl. Lahir / Umur</td><td>: ${pegawai.TEMPAT_LAHIR} ${formatTanggalIndonesia(pegawai.TGL_LAHIR)} / ${hitungUmur(pegawai.TGL_LAHIR)}</td></tr>
          <tr><td>4. Jenis Kelamin</td><td>: ${pegawai.JK}</td></tr>
          <tr><td>5. Status Perkawinan</td><td>: ${pegawai.STATUS || "-"}</td></tr>
          <tr><td>6. Agama</td><td>: ${pegawai.AGAMA || "-"}</td></tr>
          <tr><td>7. Pangkat (Gol. Ruang / TMT)</td><td>: ${pegawai.GOL || "-"} / ${formatTanggalIndonesia(pegawai.TMT_GOL || "-")}</td></tr>
          <tr><td>8. Jabatan Sekarang / Eselon</td><td>: ${pegawai.JABATAN} / ${pegawai.ESELON || "-"}</td></tr>
          <tr><td>9. Pendidikan Terakhir / Tahun</td><td>: ${pegawai.IJAZAH || "-"} / ${pegawai.LULUS_TAHUN || "-"}</td></tr>
          <tr><td>10. Diklat Penjenjangan</td><td>: ${pegawai.DIKLAT || "-"}</td></tr>
          <tr><td>11. Alamat Rumah / No. Telepon</td><td>: ${pegawai.ALAMAT || "-"}</td></tr>
        </table>

        <h6 class="section-title fw-bold">II. RIWAYAT JABATAN</h6>
        <table class="table table-bordered text-center">
          <thead>
            <tr>
              <th rowspan="2">No.</th>
              <th rowspan="2">Jabatan / Tugas Pokok</th>
              <th colspan="2">TGL / BLN / THN</th>
              <th colspan="3">Surat Keputusan</th>
            </tr>
            <tr>
              <th>Dari</th>
              <th>S/D</th>
              <th>Pejabat</th>
              <th>Tanggal</th>
              <th>Nomor</th>
            </tr>
          </thead>
          <tbody>
            ${
              Array.isArray(pegawai.RIWAYAT_JABATAN) && pegawai.RIWAYAT_JABATAN.length > 0
                ? pegawai.RIWAYAT_JABATAN.map((jab, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${jab.JABATAN}</td>
                    <td>${jab.DARI}</td>
                    <td>${jab.SD}</td>
                    <td>${jab.PEJABAT}</td>
                    <td>${jab.TANGGAL}</td>
                    <td>${jab.NOMOR}</td>
                  </tr>
                `).join("")
                : `<tr><td colspan="7">Data belum tersedia</td></tr>`
            }
          </tbody>
        </table>

        <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="section-title fw-bold">III. RIWAYAT KEPANGKATAN</h6>
                <a href="#add_Riwayat.html?nip=${nip}" class="btn btn-danger shadow btn-sm">+ Tambah Data</a>


        </div>
        <table class="table table-bordered text-center">
          <thead>
            <tr>
              <th rowspan="2">No.</th>
              <th rowspan="2">PANGKAT</th>
              <th rowspan="2">GOL. RUANG</th>
              <th rowspan="2">T M T</th>
              <th colspan="3">Surat Keputusan</th>
              <th rowspan="2">File</th>
            </tr>
            <tr>
              <th>Pejabat</th>
              <th>Tanggal</th>
              <th>Nomor</th>
            </tr>
          </thead>
          <tbody>
            ${
              riwayatPangkat.length
                ? riwayatPangkat.map((item, i) => `
                  <tr>
                    <td style="font-size:12px">${i + 1}</td>
                    <td class="text-start" style="font-size:12px">${item.PANGKAT}</td>
                    <td class="text-start" style="font-size:12px">${item.GOL}</td>
                    <td class="text-start" style="font-size:12px">${formatTanggalIndonesia(item.TMT)}</td>
                    <td class="text-start" style="font-size:12px">${item.PEJABAT}</td>
                    <td class="text-start" style="font-size:12px">${formatTanggalIndonesia(item.TANGGAL)}</td>
                    <td class="text-start" style="font-size:12px">${item.NOMOR}</td>
                    <td style="font-size:12px">
                      <a href="${item.FILE_URL}" target="_blank" class="btn btn-warning btn-sm">View Data</a>
                    </td>
                  </tr>
                `).join("")
                : `<tr><td colspan="8">Data belum tersedia</td></tr>`
            }
          </tbody>
        </table>
      `;
    })
    .catch((err) => {
      console.error(err);
      container.innerHTML = `<div class="alert alert-danger">Gagal mengambil data.</div>`;
    });
})();
