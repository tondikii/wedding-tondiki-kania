import {
  formattedDate,
  formattedName,
  generateRandomId,
  getCurrentDateTime,
  renderElement,
} from "../utils/helper.js";
import {data} from "../assets/data/data.js";
import {commentsService} from "../services/commentsService.js";

export const wishes = () => {
  // Gunakan ID agar langsung tepat sasaran
  const form = document.getElementById("comment-form");
  const buttonForm = document.getElementById("submit-button");
  const peopleComments = document.getElementById("comment-count");
  const containerComments = document.getElementById("comment-list");
  const pageNumber = document.getElementById("page-number");
  const prevButton = document.getElementById("prev-btn");
  const nextButton = document.getElementById("next-btn");

  // State Management
  let lengthComments = 0;
  let currentPage = 1;
  let itemsPerPage = 4;
  let startIndex = 0;
  let endIndex = itemsPerPage;

  const listItemBank = (data) =>
    `  <figure data-aos="zoom-in" data-aos-duration="1000">
                <img src=${data.icon} alt="bank icon animation">
                <figcaption>No. Rekening ${data.rekening.slice(0, 4)}xxxx <br>A.n ${data.name}</figcaption>
                <button data-rekening=${data.rekening} aria-label="copy rekening">Salin No. Rekening</button>
           </figure>`;

  const initialBank = () => {
    // ✅ Fix: gunakan ID yang sudah ada di HTML, bukan wishesContainer yang tidak terdefinisi
    const containerBank = document.getElementById("bank-container");

    renderElement(data.bank, containerBank, listItemBank);

    containerBank.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const rekening = e.target.dataset.rekening;
        try {
          await navigator.clipboard.writeText(rekening);
          button.textContent = "Berhasil menyalin";
        } catch (error) {
          console.log(`Error : ${error.message}`);
        } finally {
          setTimeout(() => {
            button.textContent = "Salin No. Rekening";
          }, 2000);
        }
      });
    });
  };

  const listItemComments = (data) => {
    const name = formattedName(data.name);
    const newDate = formattedDate(data.date);
    let dateDisp = "";

    if (newDate.days < 1) {
      dateDisp =
        newDate.hours < 1
          ? `${newDate.minutes} menit yang lalu`
          : `${newDate.hours} jam, ${newDate.minutes} menit yang lalu`;
    } else {
      dateDisp = `${newDate.days} hari, ${newDate.hours} jam yang lalu`;
    }

    // Tambahkan style width: 100% pada elemen <li>
    return ` <li data-aos="zoom-in" data-aos-duration="1000" style="width: 100%; list-style: none;">
                     <div style="flex-shrink: 0;">${data.name ? data.name.charAt(0).toUpperCase() : "?"}</div>
                     <div style="flex-grow: 1;">
                         <h4>${name}</h4>
                         <p>${dateDisp} <br>${data.status}</p>
                         <p style="word-break: break-word;">${data.message}</p>
                     </div>
                 </li>`;
  };

  const initialComments = async () => {
    containerComments.innerHTML = `<h1 style="font-size: 1rem; margin: auto">Loading...</h1>`;
    peopleComments.textContent = "Memuat...";
    pageNumber.textContent = "..";

    try {
      const response = await commentsService.getComments();
      const allComments = response.comments || [];
      lengthComments = allComments.length;

      const reversedData = [...allComments].reverse();

      peopleComments.textContent =
        lengthComments > 0
          ? `${lengthComments} Orang telah mengucapkan`
          : `Belum ada yang mengucapkan`;

      pageNumber.textContent = "1";

      // Kosongkan loading sebelum render
      containerComments.innerHTML = "";
      renderElement(
        reversedData.slice(startIndex, endIndex),
        containerComments,
        listItemComments,
      );
    } catch (error) {
      console.error("Initial load error:", error);
      containerComments.innerHTML = `<p style="margin: auto; color: red;">Gagal memuat komentar</p>`;
    }
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    buttonForm.textContent = "Mengirim...";
    buttonForm.disabled = true;

    const newComments = {
      id: generateRandomId(),
      name: e.target.name.value,
      status: e.target.status.value === "y" ? "Hadir" : "Tidak Hadir",
      message: e.target.message.value,
      date: getCurrentDateTime(),
      color: "#f43f5e",
    };

    try {
      const res = await commentsService.addComments(newComments);

      if (res.status === 200 || res.result === "success") {
        lengthComments++;
        peopleComments.textContent = `${lengthComments} Orang telah mengucapkan`;

        // Optimistic UI: langsung tampilkan tanpa reload
        containerComments.insertAdjacentHTML(
          "afterbegin",
          listItemComments(newComments),
        );

        form.reset();
      } else {
        throw new Error("Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Gagal mengirim ucapan, coba lagi nanti.");
    } finally {
      buttonForm.textContent = "Kirim";
      buttonForm.disabled = false;
    }
  });

  const updatePageContent = async () => {
    containerComments.innerHTML =
      '<h1 style="font-size: 1rem; margin: auto">Loading...</h1>';
    pageNumber.textContent = "..";
    prevButton.disabled = true;
    nextButton.disabled = true;

    try {
      const response = await commentsService.getComments();
      const allComments = [...(response.comments || [])].reverse();

      containerComments.innerHTML = "";
      renderElement(
        allComments.slice(startIndex, endIndex),
        containerComments,
        listItemComments,
      );
      pageNumber.textContent = currentPage.toString();
    } catch (error) {
      console.error("Pagination error:", error);
    } finally {
      prevButton.disabled = false;
      nextButton.disabled = false;
    }
  };

  nextButton.addEventListener("click", async () => {
    if (endIndex < lengthComments) {
      currentPage++;
      startIndex = (currentPage - 1) * itemsPerPage;
      endIndex = startIndex + itemsPerPage;
      await updatePageContent();
    }
  });

  prevButton.addEventListener("click", async () => {
    if (currentPage > 1) {
      currentPage--;
      startIndex = (currentPage - 1) * itemsPerPage;
      endIndex = startIndex + itemsPerPage;
      await updatePageContent();
    }
  });

  // Jalankan inisialisasi
  initialComments();
  initialBank();
};
