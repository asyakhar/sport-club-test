import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_CONFIG from "../config";
import { useNotification } from "../components/Notification";
import "./RegisterPage.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    birthDate: "",
    sportType: "",
    rank: "",
    heightCm: "",
    weightKg: "",
    role: "ATHLETE",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        birthDate: formData.birthDate,
        sportType: formData.sportType,
        rank: formData.rank,
        heightCm: formData.heightCm ? parseInt(formData.heightCm) : null,
        weightKg: formData.weightKg ? parseFloat(formData.weightKg) : null,
        coachId: null,
        role: formData.role,
      };

      const response = await fetch(`${API_CONFIG.baseURL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка регистрации");
      }

      const data = await response.json();

      sessionStorage.setItem("accessToken", data.accessToken);
      sessionStorage.setItem("refreshToken", data.refreshToken);
      window.dispatchEvent(new Event("authChange"));

      addNotification("Регистрация успешна!", "success");
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2 className="register-title">Регистрация</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Пароль *"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
                minLength="6"
              />
            </div>
          </div>

          {/* Добавляем выбор роли */}
          <div className="form-group">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="ATHLETE">Спортсмен</option>
              <option value="COACH">Тренер</option>
            </select>
          </div>

          <div className="form-group">
            <input
              type="text"
              name="fullName"
              placeholder="ФИО *"
              value={formData.fullName}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Телефон"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <input
                type="date"
                name="birthDate"
                placeholder="Дата рождения"
                value={formData.birthDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="sportType"
                placeholder="Вид спорта *"
                value={formData.sportType}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                name="rank"
                placeholder="Разряд"
                value={formData.rank}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="number"
                name="heightCm"
                placeholder="Рост (см)"
                value={formData.heightCm}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <input
                type="number"
                name="weightKg"
                placeholder="Вес (кг)"
                value={formData.weightKg}
                onChange={handleChange}
                className="form-input"
                step="0.1"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>

        <p className="login-link">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
