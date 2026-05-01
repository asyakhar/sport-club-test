import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../api";
import { useAuth } from "../context/AuthContext";
import Icons from "../components/Icons";
import "./AchievementsPage.css";

const AchievementsPage = () => {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    earned: 0,
    points: 0,
  });
  const { userRole, triggerUpdate } = useAuth();
  const [athleteId, setAthleteId] = useState(null);

  useEffect(() => {
    initializePage();
  }, [triggerUpdate]);
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token || !athleteId) return;

    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId = payload.sub;

    const eventSource = new EventSource(
      `http://localhost:8080/api/sse/subscribe?userId=${userId}`
    );

    eventSource.addEventListener("attendance-marked", () => {
      fetchAchievements(athleteId);
    });

    eventSource.addEventListener("training-updated", () => {
      fetchAchievements(athleteId);
    });

    return () => eventSource.close();
  }, [athleteId]);
  const initializePage = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        setError("Необходимо войти в систему");
        setLoading(false);
        return;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));

      if (payload.role === "COACH") {
        setError("Достижения доступны только для спортсменов");
        setLoading(false);
        return;
      }

      const profileResponse = await fetchWithAuth(
        "http://localhost:8080/api/athletes/profile"
      );

      if (!profileResponse.ok) {
        if (profileResponse.status === 404) {
          setError(
            "Профиль спортсмена не найден. Возможно, вы зарегистрированы как тренер."
          );
        } else {
          throw new Error("Ошибка загрузки профиля");
        }
        setLoading(false);
        return;
      }

      const profileData = await profileResponse.json();
      setAthleteId(profileData.id);

      await fetchAchievements(profileData.id);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchAchievements = async (aId) => {
    try {
      const id = aId || athleteId;
      if (!id) {
        throw new Error("ID спортсмена не найден");
      }

      const response = await fetchWithAuth(
        `http://localhost:8080/api/achievements/athlete/${id}`
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Ошибка загрузки достижений" }));
        throw new Error(errorData.message || "Ошибка загрузки достижений");
      }

      const data = await response.json();
      setAchievements(data);

      const earned = data.filter((a) => a.earned);
      setStats({
        total: data.length,
        earned: earned.length,
        points: earned.reduce((sum, a) => sum + (a.points || 0), 0),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      ATTENDANCE: <Icons.Runner className="icon-small" />,
      RECORD: <Icons.Trophy className="icon-small" />,
      STREAK: <Icons.Fire className="icon-small" />,
      COMPETITION: <Icons.Medal className="icon-small" />,
      SPECIAL: <Icons.Star className="icon-small" />,
    };
    return icons[type] || <Icons.Target className="icon-small" />;
  };

  const getTypeName = (type) => {
    const names = {
      ATTENDANCE: "Посещаемость",
      RECORD: "Рекорды",
      STREAK: "Серии",
      COMPETITION: "Соревнования",
      SPECIAL: "Особые",
    };
    return names[type] || type;
  };

  const filteredAchievements = achievements.filter((achievement) => {
    if (activeTab === "all") return true;
    if (activeTab === "earned") return achievement.earned;
    if (activeTab === "locked") return !achievement.earned;
    return achievement.type === activeTab;
  });

  if (loading) {
    return (
      <div className="achievements-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Загрузка достижений...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="achievements-page">
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
          <div className="error-container">
            <div className="error-icon">
              <Icons.Warning className="icon-large" />
            </div>
            <h2>Ошибка</h2>
            <p>{error}</p>
            <button className="btn-primary" onClick={() => navigate("/")}>
              Вернуться на главную
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="achievements-page">
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
        <h1 className="page-title">
          <Icons.Trophy className="page-icon" /> Достижения
        </h1>

        {/* Статистика */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">
              <Icons.Target className="icon" />
            </div>
            <div className="stat-value">
              {stats.earned}/{stats.total}
            </div>
            <div className="stat-label">Получено</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Icons.Star className="icon" />
            </div>
            <div className="stat-value">{stats.points}</div>
            <div className="stat-label">Очков</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Icons.Chart className="icon" />
            </div>
            <div className="stat-value">
              {stats.total > 0
                ? Math.round((stats.earned / stats.total) * 100)
                : 0}
              %
            </div>
            <div className="stat-label">Прогресс</div>
          </div>
        </div>

        {/* Фильтры */}
        <div className="achievement-filters">
          {[
            { key: "all", label: "Все" },
            { key: "earned", label: "Полученные" },
            { key: "locked", label: "Не полученные" },
            { key: "ATTENDANCE", label: "Посещаемость" },
            { key: "RECORD", label: "Рекорды" },
            { key: "STREAK", label: "Серии" },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`filter-btn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Сетка достижений */}
        {filteredAchievements.length === 0 ? (
          <div className="no-achievements">
            <p>Нет достижений в этой категории</p>
          </div>
        ) : (
          <div className="achievements-grid">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`achievement-card ${
                  achievement.earned ? "earned" : "locked"
                }`}
              >
                <div className="achievement-icon">
                  {achievement.earned ? (
                    achievement.icon ? (
                      <Icons.Trophy className="icon-medium" />
                    ) : (
                      <Icons.Trophy className="icon-medium" />
                    )
                  ) : (
                    <Icons.Lock className="icon-medium" />
                  )}
                </div>
                <div className="achievement-info">
                  <h3 className="achievement-name">{achievement.name}</h3>
                  <p className="achievement-description">
                    {achievement.description}
                  </p>

                  {!achievement.earned && achievement.requirementCount > 0 && (
                    <div className="achievement-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(
                              ((achievement.progress || 0) /
                                achievement.requirementCount) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="progress-text">
                        {achievement.progress || 0}/
                        {achievement.requirementCount}
                      </span>
                    </div>
                  )}

                  <div className="achievement-meta">
                    <span className="achievement-type">
                      {getTypeIcon(achievement.type)}{" "}
                      {getTypeName(achievement.type)}
                    </span>
                    <span className="achievement-points">
                      +{achievement.points} очков
                    </span>
                  </div>

                  {achievement.earned && achievement.earnedAt && (
                    <div className="earned-date">
                      <Icons.Party className="icon-small" /> Получено:{" "}
                      {new Date(achievement.earnedAt).toLocaleDateString(
                        "ru-RU"
                      )}
                    </div>
                  )}

                  {!achievement.earned && (
                    <div className="requirement-hint">
                      <Icons.Note className="icon-small" />{" "}
                      {achievement.requirementDescription}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AchievementsPage;
