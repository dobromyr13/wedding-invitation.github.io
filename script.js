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
// Обработка кнопок подтверждения (Google Sheets)
document.addEventListener("DOMContentLoaded", function () {
  // Элементы формы
  const form = document.getElementById("telegram-form");
  const submitBtn = document.getElementById("telegram-submit");
  const successBlock = document.getElementById("telegram-success");
  const guestNameInput = document.getElementById("guest-name");
  const songInput = document.getElementById("song");
  const songFormGroup = document.getElementById("song-form-group");

  // Проверка наличия элементов
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

  // Обработка выбора "Приду/Не приду"
  document.querySelectorAll('input[name="attendance"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      songFormGroup.style.display =
        this.value === "Я приду!" ? "block" : "none";
    });
  });

  // Обработка отправки формы
  submitBtn.addEventListener("click", async function (e) {
    e.preventDefault();

    // Получаем данные формы
    const formData = {
      name: guestNameInput.value.trim(),
      attendance: document.querySelector('input[name="attendance"]:checked')
        ?.value,
      song: songInput.value.trim(),
    };

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

    try {
      // Сохраняем в Google Таблицу
      await saveToGoogleSheet(formData);

      // Показываем успешное сообщение
      showSuccess();
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      showError("Не удалось сохранить данные. Пожалуйста, попробуйте позже");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Отправить ответ";
    }
  });

  // Функция сохранения в Google Таблицу
  async function saveToGoogleSheet(formData) {
    const SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbwSoSwVnB7VU8L1UmOveh8E3sqqSugJ3KgEJnIb4NjcNubqlLVFuekLLVQUtzW0Sjcm/exec";

    try {
      // Вариант 1: с использованием no-cors (если CORS не работает)
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Важное изменение!
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          attendance: formData.attendance,
          song: formData.song || "",
        }),
      });

      // Вариант 2: если используете proxy
      // const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
      // const response = await fetch(PROXY_URL + SCRIPT_URL, {...});

      // В режиме no-cors мы не можем прочитать ответ
      console.log("Запрос отправлен (ответ не читаем в no-cors режиме)");
      return { success: true };
    } catch (error) {
      console.error("Ошибка сети:", error);
      return {
        success: false,
        error: "Не удалось отправить данные",
      };
    }
  }

  // Показать успешное сообщение
  function showSuccess() {
    form.style.display = "none";
    successBlock.style.display = "block";

    // Очищаем форму через 5 секунд
    setTimeout(() => {
      form.reset();
      form.style.display = "block";
      successBlock.style.display = "none";
      songFormGroup.style.display = "none";
    }, 5000);
  }

  // Показать ошибку
  function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "form-error";
    errorDiv.textContent = message;

    // Удаляем предыдущие ошибки
    const oldError = form.querySelector(".form-error");
    if (oldError) oldError.remove();

    form.prepend(errorDiv);
  }
});
