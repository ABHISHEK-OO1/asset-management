import React, { useEffect, useState } from "react"; 
import axios from "axios";
import "./App.css";
import { Line } from "react-chartjs-2";
import { IoClose } from "react-icons/io5";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
} from "chart.js";
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale
);

function App() {
  const [prices, setPrices] = useState({});
  const [portfolio, setPortfolio] = useState({});
  const [auth, setAuth] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [coinInput, setCoinInput] = useState({ coin: "bitcoin", amount: 0 });

  useEffect(() => {
    if (auth) {
      axios
        .get(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd"
        )
        .then((res) => setPrices(res.data));
    }
  }, [auth, portfolio]);

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/login", form);
      if (res.data.success) {
        setAuth(true);
      }
    } catch (err) {
      setError("Invalid username or password.");
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleMenu = () => setShowMenu(!showMenu);
  const logout = () => {
    setAuth(false);
    setForm({ username: "", password: "" });
    setShowMenu(false);
    setPortfolio({});
  };

  const toggleModal = () => setShowModal(!showModal);

  const addCoinToPortfolio = () => {
    const { coin, amount } = coinInput;
    setPortfolio({
      ...portfolio,
      [coin]: (portfolio[coin] || 0) + Number(amount),
    });
    toggleModal();
  };

  const calculateBalance = () => {
    return Object.entries(portfolio).reduce((total, [coin, amount]) => {
      return total + (prices[coin]?.usd || 0) * amount;
    }, 0).toFixed(2);
  };

  if (!auth) {
    return (
      <div className="login-background">
        <div className="login-container">
          <h1 style={{ textAlign: "center" }}>Asset Management</h1>
          <div className="login-box">
            <h2>Login</h2>
            <label>Username:</label>
            <input name="username" onChange={handleChange} value={form.username} />
            <label>Password:</label>
            <input name="password" type="password" onChange={handleChange} value={form.password} />
            {error && <p className="error">{error}</p>}
            <button onClick={handleLogin}>Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>CRYPTODASHE</h2>
        <p className="user-email">@admin</p>
        <nav>
          <ul>
            <li>🏠 Dashboard</li>
            <li>💳 Assets</li>
            <li>🔍 Explore</li>
            <li>📊 Insights</li>
          </ul>
        </nav>
      </aside>

      <main className="main-panel">
        <div className="topbar">
          <div className="balance-box">
            <span>Total Balance</span>
            <h1>
              ${showBalance ? calculateBalance() : "*****"} <span role="img" aria-label="eye">👁️</span>
            </h1>
          </div>
          <div className="profile-circle" onClick={toggleMenu}>AD</div>
          {showMenu && (
            <div className="dropdown">
              <strong>My Account</strong>
              <div className="dropdown-item">👤 Profile</div>
              <div className="dropdown-item">⚙️ Settings</div>
              <div className="dropdown-item" onClick={logout}>↩️ Logout</div>
            </div>
          )}
        </div>

        <section className="portfolio-section">
          <div className="portfolio-card">
            <h3>Portfolio</h3>
            <button className="add-btn" onClick={toggleModal}>＋</button>
          </div>

          {Object.entries(portfolio).map(([coin, amount]) => (
            <div className="coin-entry" key={coin}>
              <div>
                <strong>{coin.charAt(0).toUpperCase() + coin.slice(1)}</strong>
                <br />
                ${prices[coin]?.usd || 0} × {amount}
              </div>
              <div className="chart-wrapper">
                <Line
                  data={{
                    labels: Array(10).fill(""),
                    datasets: [
                      {
                        data: Array(10).fill(prices[coin]?.usd || 0),
                        borderColor: "orange",
                        borderWidth: 2,
                        fill: false,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { x: { display: false }, y: { display: false } },
                  }}
                />
              </div>
            </div>
          ))}
        </section>
      </main>

      {showModal && ( 
       
        <div className="modal"> 
        
          <div className="modal-content">
          <div className="modal-header">
          <h3>Add a Coin</h3>
          <button className="close-btn" id="special" onClick={toggleModal}>
  <IoClose size={24} /> X
</button>
            </div>
            <p>Enter the coin name and amount to add it to your portfolio. Click save when you're done.</p>
            <label>Coin</label>
            <select
              value={coinInput.coin}
              onChange={(e) => setCoinInput({ ...coinInput, coin: e.target.value })}
            >
              <option value="bitcoin">Bitcoin</option>
              <option value="ethereum">Ethereum</option>
              <option value="tether">Tether</option>
              <option value="xrp">XRP</option>
              <option value="cardano">Cardano</option>
              <option value="solana">Solana</option>
            </select>
            <label>Amount</label>
            <input
              type="number"
              value={coinInput.amount}
              onChange={(e) => setCoinInput({ ...coinInput, amount: e.target.value })}
            />
            <button className="save-btn" onClick={addCoinToPortfolio}>Save</button>

          </div>
        </div>
      )}
    </div>
  );
}

export default App;
