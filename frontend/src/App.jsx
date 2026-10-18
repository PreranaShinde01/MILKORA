
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, Milk, Wallet,
  TrendingUp, Plus, Search, Bell, Leaf,
  ArrowUpRight, Clock3, Droplets, RefreshCw
} from "lucide-react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(n || 0);

function App() {
  const [records, setRecords] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [milkType, setMilkType] = useState("Cow");
  const [quantity, setQuantity] = useState("10");
  const [rate, setRate] = useState("60");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const amount = (Number(quantity) || 0) * (Number(rate) || 0);
  const today = new Date().toDateString();

  async function loadRecords() {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/records`);
      if (!response.ok) throw new Error("Unable to load records");
      setRecords(await response.json());
      setError("");
    } catch {
      setError("Backend unavailable. Start the server and check MongoDB.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!customerName.trim() || Number(quantity) <= 0 ||
        !Number.isFinite(Number(quantity)) ||
        !Number.isFinite(Number(rate)) || Number(rate) < 0) {
      setError("Enter a customer name, valid quantity and non-negative rate.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API}/api/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          milkType,
          quantity: Number(quantity),
          rate: Number(rate)
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Save failed");

      setRecords((prev) => [data, ...prev]);
      setCustomerName("");
      setQuantity("10");
      setRate(milkType === "Cow" ? "60" : "75");
      setNotice("Milk collection saved successfully!");
    } catch (err) {
      setError(err.message || "Unable to save record.");
    } finally {
      setSaving(false);
    }
  }

  const todayRecords = records.filter(
    (r) => new Date(r.createdAt).toDateString() === today
  );
  const todayLitres = todayRecords.reduce((sum, r) => sum + r.quantity, 0);
  const todayAmount = todayRecords.reduce((sum, r) => sum + r.totalAmount, 0);
  const customers = new Set(records.map((r) => r.customerName.toLowerCase())).size;
  const filtered = records.filter((r) =>
    r.customerName.toLowerCase().includes(search.toLowerCase()) ||
    r.milkType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#">
          <span className="brand-icon"><Milk size={24} /></span>
          <span>MILKORA<small>DAIRY MANAGEMENT</small></span>
        </a>

        <div className="menu-label">WORKSPACE</div>
        <nav>
          <a className="nav-link active" href="#overview"><LayoutDashboard size={19} /> Overview</a>
          <a className="nav-link" href="#records"><Users size={19} /> Customers & Records</a>
          <a className="nav-link" href="#collection"><Droplets size={19} /> Milk Collection</a>
          <a className="nav-link" href="#payments"><Wallet size={19} /> Collection Value</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="farm-card">
            <Leaf size={22} />
            <strong>Every drop counts.</strong>
            <span>Simple records. Smarter dairy.</span>
          </div>
          <div className="profile">
            <div className="avatar">DT</div>
            <div><strong>Dairy Team</strong><small>Local workspace</small></div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumbs">Workspace <span>/</span> Overview</div>
          <div className="top-actions">
            <span className="date-pill"><Clock3 size={15} /> {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            <button className="icon-button" aria-label="Notifications"><Bell size={18} /></button>
            <div className="avatar">DT</div>
          </div>
        </header>

        <section className="welcome-row">
          <div>
            <div className="eyebrow"><span className="live-dot" /> YOUR DAIRY AT A GLANCE</div>
            <h1>Good morning, <span>Dairy team.</span></h1>
            <p>Keep your daily milk collections organized and flowing.</p>
          </div>
          <a className="primary-button" href="#collection"><Plus size={18} /> Add milk entry</a>
        </section>

        {error && <div className="alert error">{error}</div>}
        {notice && <div className="alert success">{notice}</div>}

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-top"><span>Total milk today</span><span className="stat-icon mint"><Milk size={20} /></span></div>
            <div className="stat-value">{todayLitres.toLocaleString("en-IN")} <small>L</small></div>
            <div className="stat-foot"> <span className="positive"><TrendingUp size={14} /> Live total</span> From today's entries</div>
          </article>
          <article className="stat-card">
            <div className="stat-top"><span>Collection value today</span><span className="stat-icon gold"><Wallet size={20} /></span></div>
            <div className="stat-value">{money(todayAmount)}</div>
            <div className="stat-foot">Calculated from milk quantity × rate</div>
          </article>
          <article className="stat-card">
            <div className="stat-top"><span>Customers recorded</span><span className="stat-icon blue"><Users size={20} /></span></div>
            <div className="stat-value">{customers.toLocaleString("en-IN")}</div>
            <div className="stat-foot">Unique customer names</div>
          </article>
          <article className="stat-card">
            <div className="stat-top"><span>Total entries</span><span className="stat-icon lilac"><ArrowUpRight size={20} /></span></div>
            <div className="stat-value">{records.length.toLocaleString("en-IN")}</div>
            <div className="stat-foot">All saved milk collections</div>
          </article>
        </section>

        <section className="content-grid">
          <article className="panel collection-panel" id="collection">
            <div className="panel-heading">
              <div><span className="section-kicker">NEW RECORD</span><h2>Milk collection</h2><p>Enter today's customer collection details.</p></div>
              <span className="heading-icon"><Droplets size={22} /></span>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Customer name</label>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Rahul Patil" required />

              <label>Milk type</label>
              <div className="milk-options">
                <button type="button" className={milkType === "Cow" ? "milk-option selected" : "milk-option"} onClick={() => { setMilkType("Cow"); setRate("60"); }}>
                  <span className="milk-emoji">🐄</span><span><strong>Cow milk</strong><small>Standard collection</small></span><span className="radio-dot" />
                </button>
                <button type="button" className={milkType === "Buffalo" ? "milk-option selected" : "milk-option"} onClick={() => { setMilkType("Buffalo"); setRate("75"); }}>
                  <span className="milk-emoji">🐃</span><span><strong>Buffalo milk</strong><small>Rich & creamy</small></span><span className="radio-dot" />
                </button>
              </div>

              <div className="form-two">
                <div><label>Quantity (litres)</label><input type="number" min="0.1" step="0.1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required /></div>
                <div><label>Rate per litre (₹)</label><input type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} required /></div>
              </div>

              <div className="amount-box">
                <div><span>Calculated total amount</span><small>{quantity || 0} L × {money(Number(rate) || 0)} / litre</small></div>
                <strong>{money(amount)}</strong>
              </div>

              <button className="submit-button" type="submit" disabled={saving}>
                <Plus size={18} /> {saving ? "Saving record..." : "Save collection"}
              </button>
            </form>
          </article>

          <article className="panel overview-panel" id="payments">
            <div className="panel-heading">
              <div><span className="section-kicker">COLLECTION MIX</span><h2>Today's breakdown</h2><p>Based on records entered today.</p></div>
              <span className="heading-icon"><TrendingUp size={22} /></span>
            </div>
            {["Cow", "Buffalo"].map((type) => {
              const litres = todayRecords.filter((r) => r.milkType === type).reduce((s, r) => s + r.quantity, 0);
              const total = todayLitres ? litres / todayLitres * 100 : 0;
              return <div className="mix-row" key={type}>
                <div className="mix-title"><span>{type === "Cow" ? "🐄" : "🐃"} {type} milk</span><strong>{litres.toFixed(1)} L</strong></div>
                <div className="progress-track"><div className={type === "Cow" ? "progress-fill cow" : "progress-fill buffalo"} style={{ width: `${total}%` }} /></div>
                <small>{total.toFixed(0)}% of today's volume</small>
              </div>;
            })}
            <div className="tip-box"><Leaf size={19} /><div><strong>Good dairy practice</strong><p>Enter collections regularly to keep your daily totals accurate.</p></div></div>
            <button className="refresh-button" onClick={loadRecords}><RefreshCw size={15} /> Refresh records</button>
          </article>
        </section>

        <section className="panel records-panel" id="records">
          <div className="records-heading">
            <div><span className="section-kicker">YOUR DATABASE</span><h2>Recent milk collections</h2><p>Records retrieved from MongoDB.</p></div>
            <div className="search-box"><Search size={17} /><input aria-label="Search records" placeholder="Search customer or milk type..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>CUSTOMER</th><th>MILK TYPE</th><th>QUANTITY</th><th>RATE / L</th><th>TOTAL AMOUNT</th><th>DATE & TIME</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan="6" className="empty-state">Loading records...</td></tr> :
                  filtered.length === 0 ? <tr><td colSpan="6" className="empty-state">No records yet. Add your first milk collection above.</td></tr> :
                  filtered.map((r) => <tr key={r._id}>
                    <td><div className="customer-cell"><span className="customer-avatar">{r.customerName.charAt(0).toUpperCase()}</span><strong>{r.customerName}</strong></div></td>
                    <td><span className={r.milkType === "Cow" ? "type-pill cow-pill" : "type-pill buffalo-pill"}>{r.milkType}</span></td>
                    <td>{r.quantity} L</td><td>{money(r.rate)}</td><td className="total-cell">{money(r.totalAmount)}</td>
                    <td className="date-cell">{new Date(r.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                  </tr>)
                }
              </tbody>
            </table>
          </div>
          <div className="table-footer"><span>Showing {filtered.length} of {records.length} records</span><span><span className="live-dot" /> MongoDB connected when records load</span></div>
        </section>

        <footer className="footer"><span>© {new Date().getFullYear()} Milkora Dairy Management</span><span>Fresh milk. Clear records. Better management.</span></footer>
      </main>
    </div>
  );
}

export default App;
