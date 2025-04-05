// Инициализация карты
ymaps.ready(init);

function init() {
  const restaurantCoordinates = [52.707286, 41.569664];
  const map = new ymaps.Map("map", {
    center: restaurantCoordinates,
    zoom: 15,
  });

  const placemark = new ymaps.Placemark(restaurantCoordinates, {
    hintContent: 'Ресторан "Перун"',
    balloonContent: "Мы ждем вас здесь!",
  });

  map.geoObjects.add(placemark);
}

// Счетчик
function updateCountdown() {
  const weddingDate = new Date("2025-08-08T16:00:00");
  const now = new Date();
  const diff = weddingDate - now;

  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById("days").textContent = totalDays;
  document.getElementById("hours").textContent = hours
    .toString()
    .padStart(2, "0");
  document.getElementById("minutes").textContent = minutes
    .toString()
    .padStart(2, "0");
  document.getElementById("seconds").textContent = seconds
    .toString()
    .padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Анимация всех блоков
document.addEventListener("DOMContentLoaded", function () {
  const animatedElements = document.querySelectorAll(
    ".header-decoration, .invitation-block, .date-block, .countdown, .additional-photo-block, .section"
  );

  const checkVisibility = () => {
    animatedElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementBottom = element.getBoundingClientRect().bottom;

      if (
        elementTop < window.innerHeight * 0.8 &&
        elementBottom > 0 &&
        !element.classList.contains("visible")
      ) {
        element.classList.add("visible");
      }
    });
  };

  // Проверяем сразу при загрузке
  checkVisibility();

  // Добавляем обработчики событий
  window.addEventListener("scroll", checkVisibility);
  window.addEventListener("resize", checkVisibility);

  // Анимируем видимые блоки сразу
  animatedElements.forEach((element) => {
    if (element.getBoundingClientRect().top < window.innerHeight) {
      element.classList.add("visible");
    }
  });
});

// Обработка кнопок подтверждения
// Конфигурация бота
const BOT_TOKEN = "TOKEN";
const CHAT_ID = "CHAT_ID";

document.addEventListener("DOMContentLoaded", function () {
  // Элементы формы
  const form = document.getElementById("telegram-form");
  const submitBtn = document.getElementById("telegram-submit");
  const successBlock = document.getElementById("telegram-success");
  const guestNameInput = document.getElementById("guest-name");
  const songInput = document.getElementById("song");
  const songFormGroup = document.getElementById("song-form-group");

  // 1. Проверяем, все ли элементы найдены
  if (
    !form ||
    !submitBtn ||
    !successBlock ||
    !guestNameInput ||
    !songInput ||
    !songFormGroup
  ) {
    console.error("Ошибка: не найдены необходимые элементы формы");
    return;
  }

  console.log("Все элементы формы найдены");

  // 2. Обработка выбора "Приду/Не приду"
  document.querySelectorAll('input[name="attendance"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      songFormGroup.style.display =
        this.value === "Я приду!" ? "block" : "none";
      console.log("Выбрано:", this.value);
    });
  });

  // 3. Обработка отправки формы
  submitBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    console.log("Кнопка нажата");

    // Получаем данные формы
    const formData = {
      name: guestNameInput.value.trim(),
      attendance: document.querySelector('input[name="attendance"]:checked')
        ?.value,
      song: songInput.value.trim(),
    };

    console.log("Данные формы:", formData);

    // Валидация
    if (!formData.name) {
      showError("Пожалуйста, введите ваше имя");
      guestNameInput.focus();
      return;
    }

    if (!formData.attendance) {
      showError("Пожалуйста, выберите вариант ответа");
      return;
    }

    // Блокируем кнопку
    submitBtn.disabled = true;
    submitBtn.textContent = "Отправка...";
    console.log("Начата отправка данных");

    try {
      // Формируем сообщение
      const message = createMessage(formData);
      console.log("Сформировано сообщение:", message);

      // Отправляем в Telegram
      const response = await sendToTelegram(message);
      console.log("Ответ от Telegram:", response);

      // Успешная отправка
      showSuccess();
      console.log("Форма успешно отправлена");
    } catch (error) {
      console.error("Ошибка отправки:", error);
      showError(getErrorMessage(error));
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Отправить через Telegram";
    }
  });

  // Функции помощники

  function createMessage(data) {
    return (
      `🎉 <b>Новое подтверждение на свадьбу!</b>\n\n` +
      `👤 <b>Имя:</b> ${escapeHtml(data.name)}\n` +
      `✏️ <b>Присутствие:</b> ${data.attendance}\n` +
      (data.attendance === "Я приду!" && data.song
        ? `🎵 <b>Любимый трек:</b> ${escapeHtml(data.song)}\n`
        : "") +
      `\n<i>Дата отправки:</i> ${new Date().toLocaleString()}`
    );
  }

  async function sendToTelegram(message) {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    return await response.json();
  }

  function showSuccess() {
    form.style.display = "none";
    successBlock.style.display = "block";
  }

  function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "form-error";
    errorDiv.textContent = message;

    // Удаляем предыдущие ошибки
    const oldError = form.querySelector(".form-error");
    if (oldError) oldError.remove();

    form.prepend(errorDiv);
  }

  function getErrorMessage(error) {
    if (error.message.includes("chat not found")) {
      return "Ошибка: чат не найден. Сообщите организаторам";
    } else if (error.message.includes("bot was blocked")) {
      return "Бот временно недоступен";
    } else {
      return "Не удалось отправить данные. Пожалуйста, попробуйте позже";
    }
  }

  function escapeHtml(text) {
    return text
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
