// Instituto Santa Rosa — menu mobile, máscaras e validação do formulário de cadastro
(function () {
  "use strict";

  /* -----------------------------------------
     Menu mobile (hambúrguer) — roda em todas as páginas
     ----------------------------------------- */
  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // fecha o menu ao clicar num link (evita ficar aberto após navegar/rolar até a âncora)
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const form = document.getElementById("cadastro-form");
  if (!form) return; // o restante deste script só roda na página de cadastro

  /* -----------------------------------------
     Máscaras de entrada (somente dígitos -> formato)
     ----------------------------------------- */
  function onlyDigits(value) {
    return value.replace(/\D/g, "");
  }

  function maskCPF(value) {
    let d = onlyDigits(value).slice(0, 11);
    d = d.replace(/(\d{3})(\d)/, "$1.$2");
    d = d.replace(/(\d{3})(\d)/, "$1.$2");
    d = d.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return d;
  }

  function maskTelefone(value) {
    let d = onlyDigits(value).slice(0, 11);
    if (d.length > 10) {
      // celular: (00) 00000-0000
      d = d.replace(/(\d{2})(\d)/, "($1) $2");
      d = d.replace(/(\d{5})(\d{1,4})$/, "$1-$2");
    } else {
      // fixo: (00) 0000-0000
      d = d.replace(/(\d{2})(\d)/, "($1) $2");
      d = d.replace(/(\d{4})(\d{1,4})$/, "$1-$2");
    }
    return d;
  }

  function maskCEP(value) {
    let d = onlyDigits(value).slice(0, 8);
    d = d.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
    return d;
  }

  function attachMask(id, maskFn) {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener("input", () => {
      const cursorFromEnd = input.value.length - input.selectionStart;
      input.value = maskFn(input.value);
      const pos = input.value.length - cursorFromEnd;
      input.setSelectionRange(pos, pos);
    });
  }

  attachMask("cpf", maskCPF);
  attachMask("telefone", maskTelefone);
  attachMask("cep", maskCEP);

  /* -----------------------------------------
     Validação de CPF (dígitos verificadores)
     ----------------------------------------- */
  function isValidCPF(cpf) {
    const d = onlyDigits(cpf);
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(d[i], 10) * (10 - i);
    let check1 = (sum * 10) % 11;
    if (check1 === 10) check1 = 0;
    if (check1 !== parseInt(d[9], 10)) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(d[i], 10) * (11 - i);
    let check2 = (sum * 10) % 11;
    if (check2 === 10) check2 = 0;
    return check2 === parseInt(d[10], 10);
  }

  /* -----------------------------------------
     Validação nativa + mensagens de erro
     ----------------------------------------- */
  function fieldWrap(input) {
    return input.closest(".field");
  }

  function showError(input, message) {
    const wrap = fieldWrap(input);
    if (!wrap) return;
    wrap.classList.add("show-error");
    if (message) {
      const msg = wrap.querySelector(".error-msg");
      if (msg) msg.textContent = message;
    }
  }

  function clearError(input) {
    const wrap = fieldWrap(input);
    if (wrap) wrap.classList.remove("show-error");
  }

  function validateField(input) {
    // validação HTML5 nativa primeiro (required, pattern, type=email/date...)
    if (!input.checkValidity()) {
      showError(input);
      return false;
    }
    // regra extra: dígito verificador do CPF
    if (input.id === "cpf" && !isValidCPF(input.value)) {
      showError(input, "CPF inválido — confira os números digitados.");
      return false;
    }
    clearError(input);
    return true;
  }

  const validatable = form.querySelectorAll("input[required], select[required]");
  validatable.forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => {
      if (fieldWrap(input).classList.contains("show-error")) {
        validateField(input);
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let allValid = true;

    validatable.forEach((input) => {
      if (!validateField(input)) allValid = false;
    });

    const status = document.getElementById("form-status");

    if (allValid) {
      status.classList.add("visible");
      status.textContent = "Cadastro enviado com sucesso! Em breve entraremos em contato.";
      form.reset();
      status.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      status.classList.remove("visible");
      const firstError = form.querySelector(".show-error input, .show-error select");
      if (firstError) firstError.focus();
    }
  });
})();
