import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../components/Notification";
import "./MyTrainingsPage.css";

const MyTrainingsPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { userData, triggerUpdate } = useAuth();

  const [myTrainings, setMyTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("active");

  const fetchMyTrainings = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetchWithAuth(
        "http://localhost:8080/api/trainings/my-with-status"
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Ошибка загрузки");
      }
      const data = await response.json();
      setMyTrainings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserId = () => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub;
      } catch (e) {}
    }
    return null;
  };

  const userId = getUserId();

  useEffect(() => {
    if (!userId) return;

    console.log("Подключаем SSE для userId:", userId);

    const eventSource = new EventSource(
      `http://localhost:8080/api/sse/subscribe?userId=${userId}`
    );

    eventSource.onopen = () => {
      console.log("SSE подключено");
    };

    eventSource.addEventListener("training-updated", () => {
      console.log("Обновление тренировок");
      fetchMyTrainings();
    });

    eventSource.addEventListener("attendance-marked", (event) => {
      const data = JSON.parse(event.data);
      fetchMyTrainings();
      if (data.message) addNotification(data.message, "info");
    });

    eventSource.onerror = (error) => {
      console.log("SSE ошибка, переподключение...");
    };

    return () => {
      eventSource.close();
      console.log("SSE отключено");
    };
  }, [userId]);

  useEffect(() => {
    fetchMyTrainings();
  }, [triggerUpdate]);

  useEffect(() => {
    const handleFocus = () => fetchMyTrainings();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchMyTrainings]);

  const handleCancelRegistration = async (trainingId) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/trainings/${trainingId}/cancel`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Ошибка отмены");
      addNotification("Регистрация отменена", "info");

      await fetchMyTrainings();
    } catch (err) {
      addNotification(err.message, "error");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredTrainings = myTrainings.filter((training) => {
    const now = new Date();
    const trainingDate = new Date(training.trainingDate);

    if (activeTab === "active") {
      return trainingDate > now;
    } else {
      return trainingDate <= now;
    }
  });

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="my-trainings-page">
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
              Все тренировки
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        <h1 className="page-title">Мои тренировки</h1>

        {/* Табы - оставить старые */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            Активные (
            {
              myTrainings.filter((t) => new Date(t.trainingDate) > new Date())
                .length
            }
            )
          </button>
          <button
            className={`tab ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            Завершенные (
            {
              myTrainings.filter((t) => new Date(t.trainingDate) <= new Date())
                .length
            }
            )
          </button>
        </div>

        {filteredTrainings.length === 0 ? (
          <div className="no-data">
            <p>
              Нет {activeTab === "active" ? "активных" : "завершенных"}{" "}
              тренировок
            </p>
          </div>
        ) : (
          <div className="trainings-list">
            {filteredTrainings.map((training) => (
              <div key={training.id} className="training-item">
                <div className="training-item-left">
                  <div className="training-date-badge">
                    <span className="date-day">
                      {new Date(training.trainingDate).getDate()}
                    </span>
                    <span className="date-month">
                      {new Date(training.trainingDate).toLocaleString("ru-RU", {
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>

                <div className="training-item-body">
                  <div className="training-item-header">
                    <h3>{training.title}</h3>
                    <span className="training-sport-tag">
                      {training.sportType}
                    </span>
                  </div>

                  <div className="training-item-meta">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>
                      {new Date(training.trainingDate).toLocaleString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="meta-sep">·</span>
                    <span>{training.durationMinutes} мин</span>
                    {training.location && <span className="meta-sep">·</span>}
                    {training.location && <span>{training.location}</span>}
                  </div>

                  <div className="training-item-meta">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
                    </svg>
                    <span>{training.coachName || "Тренер не назначен"}</span>
                  </div>
                  <div className="training-item-meta">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span
                      className={
                        training.status === "ATTENDED"
                          ? "status-attended"
                          : training.status === "LATE"
                          ? "status-late"
                          : training.status === "ABSENT"
                          ? "status-absent"
                          : "status-registered"
                      }
                    >
                      {training.status === "ATTENDED"
                        ? "Присутствовал"
                        : training.status === "LATE"
                        ? "Опоздал"
                        : training.status === "ABSENT"
                        ? "Не пришел"
                        : "Записан"}
                    </span>
                  </div>
                  {training.description && (
                    <p className="training-item-desc">{training.description}</p>
                  )}
                </div>

                {new Date(training.trainingDate) > new Date() && (
                  <button
                    className="btn-cancel"
                    onClick={() => handleCancelRegistration(training.id)}
                  >
                    Отменить
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyTrainingsPage;
