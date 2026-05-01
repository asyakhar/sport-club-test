import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./MainPage.css";

const FeatureIcons = {
  individual: (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  progress: (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  coach: (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  online: (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
};

const MainPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole, logout, updateTrigger } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="main-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <nav className="navbar">
            <div className="logo" onClick={() => navigate("/")}>
              <span className="logo-text">FORCE LAB</span>
            </div>
            <div className="nav-links">
              <Link to="/" className="nav-link">
                Главная
              </Link>
              <Link to="/trainings" className="nav-link">
                Программы
              </Link>

              {/* ДОБАВИТЬ: Для спортсмена */}
              {isLoggedIn && userRole === "ATHLETE" && (
                <>
                  <Link to="/my-trainings" className="nav-link">
                    Мои тренировки
                  </Link>
                  <Link to="/achievements" className="nav-link">
                    Достижения
                  </Link>
                  <Link to="/progress" className="nav-link">
                    Прогресс
                  </Link>
                </>
              )}

              {/* Для тренера */}
              {isLoggedIn && userRole === "COACH" && (
                <>
                  <Link to="/coach/athletes" className="nav-link">
                    Мои спортсмены
                  </Link>
                </>
              )}
            </div>
            <div className="nav-actions">
              {isLoggedIn ? (
                <>
                  <button
                    className="btn-profile"
                    onClick={() => navigate("/profile")}
                  >
                    Профиль
                  </button>
                  <button className="btn-logout" onClick={handleLogout}>
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn-login"
                    onClick={() => navigate("/login")}
                  >
                    Войти
                  </button>
                  <button
                    className="btn-trial"
                    onClick={() => navigate("/register")}
                  >
                    Регистрация
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="title-accent">FORCE LAB</span>
              <br />
              современная платформа для физической подготовки
              <br />
              профессионалов и любителей спорта
            </h1>
            <button
              className="btn-primary-large"
              onClick={() => navigate("/trainings")}
            >
              Начать тренировки
            </button>
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="approach">
        <div className="container">
          <div className="approach-grid">
            <div className="approach-card">
              <h3>Научно обоснованный подход</h3>
              <p>
                Используем современные методики тренировок, доказавшие свою
                эффективность. Это позволяет безопасно развивать силу, скорость,
                выносливость и координацию
              </p>
            </div>
            <div className="approach-card">
              <h3>Идеальная техника и профилактика травм</h3>
              <p>
                Наши тренеры следят за каждым движением. Мы не разрешаем
                выполнять упражнения с ошибками, чтобы сохранить ваше здоровье
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="programs">
        <div className="container">
          <h2 className="section-title">Наши программы</h2>
          <div className="programs-grid">
            {/* Спортсмены */}
            <div className="program-card">
              <h3 className="program-title">Спортсмены</h3>
              <p className="program-subtitle">
                Для профессионалов и любителей любого уровня подготовки
              </p>
              <ul className="program-list">
                <li>Индивидуальная программа тренировок</li>
                <li>ОФП для пловцов</li>
                <li>Специальная подготовка для триатлетов</li>
                <li>Профилактика травм плечевого сустава</li>
                <li>Восстановительный блок</li>
              </ul>
            </div>

            {/* Тренеры */}
            <div className="program-card">
              <h3 className="program-title">Тренеры</h3>
              <p className="program-subtitle">
                Для специалистов, которые хотят внедрить научный подход в
                тренировки
              </p>
              <ul className="program-list">
                <li>Методика тренировки групп</li>
                <li>Индивидуальные планы для подопечных</li>
                <li>Практикум по профилактике травм</li>
                <li>Восстановление и реабилитация</li>
              </ul>
            </div>

            {/* Юные спортсмены */}
            <div className="program-card">
              <h3 className="program-title">Юные спортсмены</h3>
              <p className="program-subtitle">
                Для детей и подростков до 14 лет
              </p>
              <ul className="program-list">
                <li>Игровая физическая подготовка</li>
                <li>Детский фитнес курс</li>
                <li>Развитие координации и гибкости</li>
                <li>Базовые навыки для любого вида спорта</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">{FeatureIcons.individual}</div>
              <h4>Индивидуальный подход</h4>
              <p>Программы подбираются под ваши цели и уровень подготовки</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">{FeatureIcons.progress}</div>
              <h4>Отслеживание прогресса</h4>
              <p>
                Ведите статистику, анализируйте результаты и улучшайте
                показатели
              </p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">{FeatureIcons.coach}</div>
              <h4>Профессиональные тренеры</h4>
              <p>Опытные специалисты с высшим спортивным образованием</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">{FeatureIcons.online}</div>
              <h4>Онлайн формат</h4>
              <p>Занимайтесь из любой точки мира в удобное для вас время</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Нужна помощь с выбором программы?</h2>
            <p>
              Оставьте заявку, и наш специалист подберет идеальный вариант для
              вас
            </p>
            <button className="btn-cta" onClick={() => navigate("/register")}>
              Получить консультацию
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-info">
              <div className="footer-logo">
                <span>FORCE LAB</span>
              </div>
              <p>
                Современная платформа для подготовки спортсменов любого уровня.
                Наука движения. Результат силы.
              </p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>О нас</h4>
                <Link to="/about">Команда</Link>
                <Link to="/methodology">Методика</Link>
                <Link to="/contacts">Контакты</Link>
              </div>
              <div className="footer-column">
                <h4>Программы</h4>
                <Link to="/trainings">Для спортсменов</Link>
                <Link to="/trainings">Для тренеров</Link>
                <Link to="/trainings">Для юных спортсменов</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 FORCE LAB. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;
