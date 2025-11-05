const regState = document.getElementById("regstate");
const regPer = document.getElementById("regper");
const pickedSt = document.getElementById("pickedSt");
const pickReg = document.getElementById("pickreg");
const registrationForm = document.getElementById("registrationForm");

// ---- Helper function to update UI ----
function updatePickedState(value) {
  if (value) {
    pickedSt.innerHTML = `<span style="color:#1b5e20; font-weight:bold;">State:</span> <span style="color:black; font-weight:600;">${value}</span>`;
  } else {
    pickedSt.innerHTML = `<span style="color:#1b5e20;">State:</span> <span style="color:gray; font-style:italic;">(not selected)</span>`;
  }
}

function updateRegistrar(value) {
  if (value.trim() !== "") {
    pickReg.innerHTML = `<span style="color:#1b5e20; font-weight:bold;">Registrar:</span> <span style="color:black; font-weight:600;">${value}</span>`;
  } else {
    pickReg.innerHTML = `<span style="color:#1b5e20;">Registrar:</span> <span style="color:gray; font-style:italic;">(not provided)</span>`;
  }
}

function showFormIfReady() {
  if (regState.value && regPer.value.trim() !== "") {
    registrationForm.style.display = "block";
  }
}


// ---- Event listeners ----
regState.addEventListener("change", () => {
  const val = regState.value;
  updatePickedState(val);
  localStorage.setItem("selectedState", val);
  showFormIfReady()
});

regPer.addEventListener("input", () => {
  const val = regPer.value;
  updateRegistrar(val);
  localStorage.setItem("registrarName", val);
  showFormIfReady()
});



document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registrationForm");

  const savedState = localStorage.getItem("selectedState") || "";
  const savedRegistrar = localStorage.getItem("registrarName") || "";

  // restore into inputs
  if (savedState) regState.value = savedState;
  if (savedRegistrar) regPer.value = savedRegistrar;

  // update UI
  updatePickedState(savedState);
  updateRegistrar(savedRegistrar);

  // If BOTH exist, show form
  showFormIfReady()

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitBtn = document.getElementById("submitBtn");

    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = "Loading...";
    submitBtn.style.opacity = "0.5";          // faded look
    submitBtn.style.cursor = "not-allowed";   // blocked cursor



    const formData = new FormData(form);

    // Build a plain object from form data
    const data = { action: "storeParticipant" , registrar: localStorage.getItem("registrarName"), stato: localStorage.getItem("selectedState")};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbzT-Iu2fUvfxwUMS2r4bUOmDFlwP6fpA8xGPFwgSOfbmB2ygMpEj0cWA3OBZNXB-_uo_A/exec", {
        method: "POST",
        headers: {
          "Content-Type": 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.status === "success") {
        Swal.fire({
          title: "✅ Registration Successful!",
          html: `
            <p><b>Program Code:</b> <span id="serialCode">${result.serial}</span></p>
            <p><b>Name:</b> ${result.fullname}</p>
            <button id="copyBtn" style="
              background:#4caf50;
              color:white;
              border:none;
              padding:6px 12px;
              border-radius:4px;
              margin-top:10px;
              cursor:pointer;
            ">📋 Copy Code</button>
          `,
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#388e3c",
          didOpen: () => {
            // Handle copy button click
            document.getElementById("copyBtn").addEventListener("click", () => {
              const serialText = document.getElementById("serialCode").innerText;
              navigator.clipboard.writeText(serialText).then(() => {
                Swal.showValidationMessage("✅ Copied to clipboard!");
                setTimeout(() => Swal.resetValidationMessage(), 1200);
              });
            });
          }
        }).then(() => {
          // Redirect after pressing OK
          window.location.href = "index.html";
        });
      } else if (result.status === "duplicate") {
        showError("Duplicate: " + result.message);
        window.location.href = "index.html";
      } else {
        showError("Form not submitted successfully, something went wrong: " + result.message);
      }

    } catch (error) {
      showError("Failed to submit form: " + error.message);
    } finally {
      // Reset button
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit";
    }
  });

  function showError(message) {
    alert(message);
  }
});
