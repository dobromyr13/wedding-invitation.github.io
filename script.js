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

document.addEventListener("DOMContentLoaded", function () {
  // Элементы формы
  const form = document.getElementById("telegram-form");
  const submitBtn = document.getElementById("telegram-submit");
  const successBlock = document.getElementById("telegram-success");

  // Проверяем, открыт ли сайт в Telegram WebApp
  const isTelegram =
    window.Telegram && Telegram.WebApp && Telegram.WebApp.initData;

  // Обработчик отправки формы
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Собираем данные формы
    const formData = {
      name: document.getElementById("guest-name").value.trim(),
      attendance: document.querySelector('input[name="attendance"]:checked')
        ?.value,
      song: document.getElementById("song").value.trim(),
      date: new Date().toLocaleString(),
    };

    // Валидация
    if (!formData.name) {
      showAlert("Пожалуйста, введите ваше имя");
      return;
    }
    if (!formData.attendance) {
      showAlert("Пожалуйста, выберите вариант ответа");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Отправка...";

    try {
      // Если открыто в Telegram - используем WebApp API
      if (isTelegram) {
        Telegram.WebApp.sendData(JSON.stringify(formData));
        showSuccess();
      }
      // Если открыто в браузере - используем резервный метод
      else {
        await sendViaBrowser(formData);
        showSuccess();
      }
    } catch (error) {
      console.error("Ошибка:", error);
      showAlert(
        "Не удалось отправить. Попробуйте позже или свяжитесь с организаторами"
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Отправить";
    }
  });

  // Отправка через браузер (резервный метод)
  async function sendViaBrowser(data) {
    // Здесь можно добавить отправку на email или другие методы
    const textToCopy =
      `Данные для свадьбы:\n\n` +
      `Имя: ${data.name}\n` +
      `Присутствие: ${data.attendance}\n` +
      (data.song ? `Любимый трек: ${data.song}\n` : "") +
      `\nПожалуйста, отправьте эту информацию организаторам`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      showAlert("Данные скопированы! Отправьте их организаторам");
    } catch {
      // Если не поддерживается clipboard API
      showAlert(`Отправьте организаторам:\n\n${textToCopy}`);
    }
  }

  // Показать сообщение об успехе
  function showSuccess() {
    form.style.display = "none";
    successBlock.style.display = "block";
    successBlock.scrollIntoView({ behavior: "smooth" });
  }

  // Показать ошибку
  function showAlert(message) {
    const alert = document.createElement("div");
    alert.className = "form-alert";
    alert.textContent = message;
    form.prepend(alert);
    setTimeout(() => alert.remove(), 5000);
  }
});
