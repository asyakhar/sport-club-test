import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../api";
import { useAuth } from "../context/AuthContext";
import "./CoachPages.css";

const CoachAthletesPage = () => {
  const navigate = useNavigate();
  const { userData, triggerUpdate } = useAuth();
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  const fetchAthletes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(
        "http://localhost:8080/api/coach/athletes"
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Ошибка загрузки спортсменов");
      }
      const data = await response.json();
      setAthletes(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching athletes:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const userId = userData?.sub;
    if (!userId) return;

    const eventSource = new EventSource(
      `http://localhost:8080/api/sse/subscribe?userId=${userId}`
    );

    eventSource.addEventListener("participant-added", () => {
      fetchAthletes();
    });

    eventSource.addEventListener("training-updated", () => {
      fetchAthletes();
    });

    eventSource.onerror = () => {
      console.log("SSE ошибка, переподключение...");
    };

    return () => eventSource.close();
  }, [userData, fetchAthletes]);

  useEffect(() => {
    fetchAthletes();
  }, [triggerUpdate]);

  useEffect(() => {
    const handleFocus = () => fetchAthletes();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchAthletes]);

  if (loading) {
    return (
      <div className="coach-page">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="coach-page">
        <header className="header">
          <div className="container header-container">
            <div className="logo" onClick={() => navigate("/")}>
              <span className="logo-text">FORCE LAB</span>
            </div>
            <div className="header-actions">
              <button className="btn-outline" onClick={() => navigate("/")}>
                На главную
              </button>
            </div>
          </div>
        </header>
        <main className="container">
          <div className="error">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="coach-page">
      <header className="header">
        <div className="container header-container">
          <div className="logo" onClick={() => navigate("/")}>
            <span className="logo-text">FORCE LAB</span>
          </div>
          <div className="header-actions">
            <button className="btn-outline" onClick={() => navigate("/")}>
              На главную
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate("/trainings")}
            >
              + Создать тренировку
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        <h1 className="page-title">Мои спортсмены</h1>

        {selectedAthlete ? (
          <div className="athlete-detail">
            <button
              className="btn-back"
              onClick={() => setSelectedAthlete(null)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              К списку
            </button>

            <div className="athlete-profile-card">
              <div className="athlete-avatar-circle">
                {(selectedAthlete.fullName || "A")[0]}
              </div>
              <h2>{selectedAthlete.fullName}</h2>

              <div className="athlete-info-grid">
                <div className="info-item">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 8l10 6 10-6" />
                  </svg>
                  <span>{selectedAthlete.email}</span>
                </div>
                <div className="info-item">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <span>{selectedAthlete.sportType || "Не указан"}</span>
                </div>
                <div className="info-item">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span>{selectedAthlete.rank || "Без разряда"}</span>
                </div>
                <div className="info-item">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>
                    {selectedAthlete.status === "ACTIVE"
                      ? "Активный"
                      : "Неактивный"}
                  </span>
                </div>
              </div>
            </div>

            <div className="quick-actions"></div>
          </div>
        ) : (
          <>
            {athletes.length === 0 ? (
              <div className="no-data">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
                </svg>
                <p>У вас пока нет спортсменов</p>
                <p className="no-data-hint">
                  Спортсмены появятся здесь после записи на ваши тренировки
                </p>
              </div>
            ) : (
              <div className="athletes-grid">
                {athletes.map((athlete) => (
                  <div
                    key={athlete.id}
                    className="athlete-card"
                    onClick={() => setSelectedAthlete(athlete)}
                  >
                    <div className="card-top">
                      <div className="athlete-avatar-small">
                        {(athlete.fullName || "A")[0]}
                      </div>
                      <div className="card-status">
                        <span
                          className={`status-dot ${
                            athlete.status === "ACTIVE" ? "active" : "inactive"
                          }`}
                        ></span>
                        {athlete.status === "ACTIVE" ? "Активен" : "Неактивен"}
                      </div>
                    </div>

                    <h3 className="card-name">{athlete.fullName}</h3>

                    <div className="card-meta">
                      <div className="card-meta-row">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        <span className="meta-label">Вид спорта</span>
                        <span className="meta-value">
                          {athlete.sportType || "Не указан"}
                        </span>
                      </div>

                      <div className="card-meta-row">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span className="meta-label">Разряд</span>
                        <span className="meta-value">
                          {athlete.rank || "Без разряда"}
                        </span>
                      </div>

                      <div className="card-meta-row">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="M2 8l10 6 10-6" />
                        </svg>
                        <span className="meta-label">Email</span>
                        <span className="meta-value">{athlete.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default CoachAthletesPage;
