const endpoint =
  "https://script.google.com/macros/s/AKfycbxzWttRJ2l31ZQl6T_5zNWpSFo-oGcVbSVtQPSS5qTcFDdIsUT7j3Ri4B7vO8EASjlBoA/exec"; // Ganti dengan URL Web App kamu

// Ambil dan tampilkan data jurnal
// Ambil dan tampilkan data jurnal
function loadJurnal() {
  fetch(endpoint)
    .then((res) => res.json())
    .then((data) => {
      let html = "";
      data.reverse().forEach((row) => {
        const judul = row["judul"] || "-";
        const tanggal = row["tanggal"]
          ? new Date(row["tanggal"]).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          : "-";
        const isi = row["isi"] || "";
        const gambar = row["fileUrl"] || "";
        const author = row["author"] || "-";

        let imageUrl = "";
        if (gambar.startsWith("https://drive.google.com/uc?")) {
          imageUrl = gambar;
        } else {
          const match = gambar.match(/\/d\/([a-zA-Z0-9_-]+)\//);
          if (match && match[1]) {
            imageUrl = `https://drive.google.com/uc?export=view&id=${match[1]}`;
          }
        }

        html += `
            <div class="col">
              <div class="card shadow">
                ${
                  imageUrl
                    ? `<img src="${imageUrl}" class="card-img-top" alt="Gambar Jurnal">`
                    : ""
                }
                <div class="card-body">
                  <h5 class="card-title">${judul}</h5>
                  <small class="text-muted">${tanggal} • oleh ${author}</small>
                  <p class="card-text mt-2">${isi}</p>
                </div>
              </div>
            </div>
          `;
      });

      document.getElementById("jurnal-list").innerHTML = html;
    })
    .catch((err) => {
      console.error("Gagal memuat data:", err);
      document.getElementById("jurnal-list").innerHTML =
        "<p class='text-danger'>Gagal memuat data jurnal.</p>";
    });
}

// Upload data jurnal
$("#jurnalForm").on("submit", async function (e) {
  e.preventDefault();

  const judul = $("#judul").val().trim();
  const isi = $("#isi").val().trim();
  const author = $("#author").val().trim();
  const fileInput = document.getElementById("fileInput");

  if (!judul || !isi || !author || !fileInput.files[0]) {
    alert("Semua kolom wajib diisi!");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = async function () {
    const base64Data = reader.result.split(",")[1];

    const data = {
      action: "add",
      judul: judul,
      isi: isi,
      author: author,
      file: base64Data,
      filename: fileInput.files[0].name,
      mimeType: fileInput.files[0].type,
    };

    const formBody = new URLSearchParams(data);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formBody,
      });

      const result = await response.json();
      alert(result.message);

      if (result.success) {
        $("#jurnalForm")[0].reset();
        $("#jurnalModal").modal("hide");
        loadJurnal();
      }
    } catch (error) {
      alert("Terjadi kesalahan saat mengirim data.");
      console.error(error);
    }
  };

  reader.readAsDataURL(fileInput.files[0]);
});

// Load awal
loadJurnal();
