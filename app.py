"""
Dubai Tram KPI Dashboard — Al Sufouh Transit System
Maintenance Agreement Performance Monitoring
"""

import io
import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import openpyxl

# ──────────────────────────────────────────────────────────────────────────────
# PAGE CONFIG
# ──────────────────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Dubai Tram KPI Dashboard",
    page_icon="🚊",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ──────────────────────────────────────────────────────────────────────────────
# THEME / STYLE
# ──────────────────────────────────────────────────────────────────────────────
COLORS = {
    "blue":    "#0098FF",
    "green":   "#00C853",
    "red":     "#DC3545",
    "amber":   "#FFC107",
    "gray":    "#6C757D",
    "bg":      "#F8F9FA",
    "white":   "#FFFFFF",
    "dark":    "#1F2937",
}

st.markdown("""
<style>
    /* ── main background ── */
    .stApp { background-color: #F0F4F8; }

    /* ── sidebar ── */
    section[data-testid="stSidebar"] { background-color: #FFFFFF; }

    /* ── metric cards ── */
    div[data-testid="metric-container"] {
        background-color: #FFFFFF;
        border: 1px solid #E0E0E0;
        border-radius: 10px;
        padding: 16px 20px;
        box-shadow: 0 2px 6px rgba(0,0,0,.06);
    }

    /* ── page title ── */
    .dash-title {
        font-size: 28px; font-weight: 700;
        color: #0098FF; margin-bottom: 4px;
    }
    .dash-subtitle {
        font-size: 14px; color: #6C757D; margin-bottom: 20px;
    }

    /* ── section header ── */
    .section-header {
        background: linear-gradient(90deg, #0098FF 0%, #0060C0 100%);
        color: white; padding: 10px 18px; border-radius: 8px;
        font-size: 16px; font-weight: 700; margin: 18px 0 12px 0;
    }

    /* ── status badge ── */
    .badge-pass {
        background:#00C853; color:#fff; padding:4px 14px;
        border-radius:20px; font-weight:700; font-size:13px;
    }
    .badge-fail {
        background:#DC3545; color:#fff; padding:4px 14px;
        border-radius:20px; font-weight:700; font-size:13px;
    }
    .badge-warn {
        background:#FFC107; color:#333; padding:4px 14px;
        border-radius:20px; font-weight:700; font-size:13px;
    }

    /* ── dataframe ── */
    .stDataFrame { border-radius: 8px; overflow: hidden; }

    /* ── divider ── */
    hr { border-color: #E0E0E0; }
</style>
""", unsafe_allow_html=True)

# ──────────────────────────────────────────────────────────────────────────────
# DEFAULT CONSTANTS  (overridden by Configuration sheet if uploaded)
# ──────────────────────────────────────────────────────────────────────────────
DEFAULT_CONSTANTS = {
    "ANNUAL_FEE":       97_329_403.00,
    "TR_REQUIRED":      6,
    "TARGET_PMPC":      0.95,
    "TARGET_TSA":       0.99,
    "WEIGHT_PMPC":      0.40,
    "WEIGHT_TSA":       0.15,
    "MC_PERCENTAGE":    0.10,
    "LIMIT_TSR":        2.83,
    "LIMIT_PDR":        3.50,
    "LIMIT_TVMR":       65.17,
    "LIMIT_LER":        4.16,
    "CAP_PMPC":         0.85,
    "CAP_TSA":          0.94,
    "PENALTY_PDR":      1_000,
    "PENALTY_TVMR":     1_000,
    "PENALTY_LER":      1_000,
    "PENALTY_TSR_5":    2_000,
    "PENALTY_TSR_10":   20_000,
    "PENALTY_TSR_30":   100_000,
}

# ──────────────────────────────────────────────────────────────────────────────
# DATA LOADING
# ──────────────────────────────────────────────────────────────────────────────

def load_configuration(xf) -> dict:
    """Read Configuration sheet and merge with defaults."""
    cfg = DEFAULT_CONSTANTS.copy()
    try:
        df = pd.read_excel(xf, sheet_name="Configuration")
        if "Parameter" in df.columns and "Value" in df.columns:
            mapping = {
                "Annual Fee (AED)":     "ANNUAL_FEE",
                "TR Required":          "TR_REQUIRED",
                "Target PMPC (%)":      "TARGET_PMPC",
                "Target TSA (%)":       "TARGET_TSA",
                "Weight PMPC":          "WEIGHT_PMPC",
                "Weight TSA":           "WEIGHT_TSA",
                "MC Percentage":        "MC_PERCENTAGE",
                "Limit TSR":            "LIMIT_TSR",
                "Limit PDR":            "LIMIT_PDR",
                "Limit TVMR":           "LIMIT_TVMR",
                "Limit LER":            "LIMIT_LER",
                "Deduction Cap PMPC":   "CAP_PMPC",
                "Deduction Cap TSA":    "CAP_TSA",
                "Penalty PDR/TVMR/LER": "PENALTY_PDR",
            }
            for _, row in df.iterrows():
                key = str(row["Parameter"]).strip()
                if key in mapping:
                    val = row["Value"]
                    cfg_key = mapping[key]
                    # Convert percentage strings like "95" → 0.95
                    if cfg_key in ("TARGET_PMPC", "TARGET_TSA") and val > 1:
                        val = val / 100.0
                    cfg[cfg_key] = float(val)
    except Exception:
        pass
    return cfg


def load_pmpc(xf) -> pd.DataFrame:
    try:
        df = pd.read_excel(xf, sheet_name="PMPC Data")
        df.columns = [c.strip() for c in df.columns]
        return df
    except Exception:
        return pd.DataFrame([{
            "Month": "Feb-26", "Planned Tasks": 1555,
            "Completed Tasks": 1555, "Status": "COMP", "KPI": "OK",
        }])


def load_tsa(xf) -> pd.DataFrame:
    try:
        df = pd.read_excel(xf, sheet_name="TSA Data")
        df.columns = [c.strip() for c in df.columns]
        return df
    except Exception:
        return pd.DataFrame([{
            "Month": "Feb-26", "Trams Available": 6,
            "Trams Required": 6, "TSA (%)": 100.0, "Status": "PASS",
        }])


def load_incidents(xf) -> pd.DataFrame:
    try:
        df = pd.read_excel(xf, sheet_name="Incidents")
        df.columns = [c.strip() for c in df.columns]
        if "Date" in df.columns:
            df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
        if "Is Excused" in df.columns:
            df["Is Excused"] = df["Is Excused"].fillna(False).astype(bool)
        else:
            df["Is Excused"] = False
        return df
    except Exception:
        return pd.DataFrame(columns=[
            "Date", "KPI Type", "Asset ID", "Failure Code",
            "Downtime (Mins)", "Is Excused", "Attributed To", "Description"
        ])


@st.cache_data(show_spinner=False)
def parse_uploaded_file(file_bytes: bytes):
    xf = io.BytesIO(file_bytes)
    cfg  = load_configuration(xf)
    xf.seek(0); pmpc = load_pmpc(xf)
    xf.seek(0); tsa  = load_tsa(xf)
    xf.seek(0); inc  = load_incidents(xf)
    return cfg, pmpc, tsa, inc


# ──────────────────────────────────────────────────────────────────────────────
# FINANCIAL CALCULATIONS
# ──────────────────────────────────────────────────────────────────────────────

def monthly_fee(cfg: dict) -> float:
    return cfg["ANNUAL_FEE"] / 12.0


def calc_pmpc_deduction(pmpc_pct: float, cfg: dict) -> float:
    """Proportional deduction between target and cap."""
    if pmpc_pct >= cfg["TARGET_PMPC"]:
        return 0.0
    actual = max(pmpc_pct, cfg["CAP_PMPC"])
    denom  = cfg["TARGET_PMPC"] - cfg["CAP_PMPC"]
    if denom == 0:
        return 0.0
    ratio  = (cfg["TARGET_PMPC"] - actual) / denom
    return ratio * cfg["WEIGHT_PMPC"] * cfg["MC_PERCENTAGE"] * monthly_fee(cfg)


def calc_tsa_deduction(tsa_pct: float, cfg: dict) -> float:
    """Proportional deduction between target and cap."""
    if tsa_pct >= cfg["TARGET_TSA"]:
        return 0.0
    actual = max(tsa_pct, cfg["CAP_TSA"])
    denom  = cfg["TARGET_TSA"] - cfg["CAP_TSA"]
    if denom == 0:
        return 0.0
    ratio  = (cfg["TARGET_TSA"] - actual) / denom
    return ratio * cfg["WEIGHT_TSA"] * cfg["MC_PERCENTAGE"] * monthly_fee(cfg)


def calc_tsr_deduction(incidents: pd.DataFrame, cfg: dict) -> float:
    """Flat fee per non-excused TSR incident above limit."""
    df = incidents[
        (incidents["KPI Type"] == "TSR") &
        (~incidents["Is Excused"])
    ]
    count = len(df)
    if count <= cfg["LIMIT_TSR"]:
        return 0.0
    # Determine penalty bracket based on worst downtime
    if "Downtime (Mins)" in df.columns:
        max_dt = df["Downtime (Mins)"].max()
    else:
        max_dt = 0
    if max_dt >= 30:
        penalty = cfg["PENALTY_TSR_30"]
    elif max_dt >= 10:
        penalty = cfg["PENALTY_TSR_10"]
    else:
        penalty = cfg["PENALTY_TSR_5"]
    return (count - cfg["LIMIT_TSR"]) * penalty


def calc_flat_deduction(incidents: pd.DataFrame, kpi_type: str,
                        limit: float, penalty: float) -> float:
    df = incidents[
        (incidents["KPI Type"] == kpi_type) &
        (~incidents["Is Excused"])
    ]
    excess = max(0, len(df) - limit)
    return excess * penalty


def calc_all_deductions(pmpc_pct, tsa_pct, incidents, cfg):
    d_pmpc = calc_pmpc_deduction(pmpc_pct, cfg)
    d_tsa  = calc_tsa_deduction(tsa_pct, cfg)
    d_tsr  = calc_tsr_deduction(incidents, cfg)
    d_pdr  = calc_flat_deduction(incidents, "PDR",  cfg["LIMIT_PDR"],  cfg["PENALTY_PDR"])
    d_tvmr = calc_flat_deduction(incidents, "TVMR", cfg["LIMIT_TVMR"], cfg["PENALTY_TVMR"])
    d_ler  = calc_flat_deduction(incidents, "LER",  cfg["LIMIT_LER"],  cfg["PENALTY_LER"])
    total  = d_pmpc + d_tsa + d_tsr + d_pdr + d_tvmr + d_ler
    cap    = cfg["MC_PERCENTAGE"] * monthly_fee(cfg)
    total  = min(total, cap)
    return {
        "PMPC": d_pmpc, "TSA": d_tsa, "TSR": d_tsr,
        "PDR": d_pdr, "TVMR": d_tvmr, "LER": d_ler,
        "Total": total, "Cap": cap,
    }


# ──────────────────────────────────────────────────────────────────────────────
# HELPER WIDGETS
# ──────────────────────────────────────────────────────────────────────────────

def badge(status: str) -> str:
    cls = {"PASS": "badge-pass", "FAIL": "badge-fail", "WARN": "badge-warn"}.get(status, "badge-warn")
    return f'<span class="{cls}">{status}</span>'


def gauge_chart(value, target, title, unit="%", max_val=None):
    if max_val is None:
        max_val = max(value * 1.3, target * 1.2)
    color = COLORS["green"] if value >= target else COLORS["red"]
    fig = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=value,
        delta={"reference": target, "valueformat": ".2f"},
        number={"suffix": unit, "valueformat": ".2f"},
        title={"text": title, "font": {"size": 15, "color": COLORS["dark"]}},
        gauge={
            "axis": {"range": [0, max_val], "tickwidth": 1},
            "bar":  {"color": color, "thickness": 0.25},
            "bgcolor": "#F0F4F8",
            "steps": [
                {"range": [0, target], "color": "#FFE0E0"},
                {"range": [target, max_val], "color": "#E0FFE8"},
            ],
            "threshold": {
                "line": {"color": COLORS["blue"], "width": 3},
                "thickness": 0.75, "value": target,
            },
        },
    ))
    fig.update_layout(
        height=240, margin=dict(t=40, b=20, l=20, r=20),
        paper_bgcolor="white", plot_bgcolor="white",
    )
    return fig


def bar_limit_chart(actual, limit, title, color=None):
    color = color or (COLORS["green"] if actual <= limit else COLORS["red"])
    fig = go.Figure()
    fig.add_bar(x=["Actual"], y=[actual], marker_color=color,
                name="Actual", text=[actual], textposition="outside")
    fig.add_bar(x=["Limit"], y=[limit], marker_color=COLORS["amber"],
                name="Limit", text=[limit], textposition="outside")
    fig.update_layout(
        title=title, height=260,
        margin=dict(t=50, b=20, l=20, r=20),
        paper_bgcolor="white", plot_bgcolor="white",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        yaxis=dict(showgrid=True, gridcolor="#F0F0F0"),
        xaxis=dict(showgrid=False),
        barmode="group",
    )
    return fig


def section(title: str):
    st.markdown(f'<div class="section-header">{title}</div>', unsafe_allow_html=True)


# ──────────────────────────────────────────────────────────────────────────────
# SIDEBAR
# ──────────────────────────────────────────────────────────────────────────────
with st.sidebar:
    st.image(
        "https://upload.wikimedia.org/wikipedia/en/thumb/6/6e/Roads_and_Transport_Authority_logo.svg/320px-Roads_and_Transport_Authority_logo.svg.png",
        width=180,
    )
    st.markdown("### Dubai Tram KPI Dashboard")
    st.markdown("**Al Sufouh Transit System**")
    st.markdown("---")

    uploaded = st.file_uploader(
        "Upload Input_Data.xlsx",
        type=["xlsx"],
        help="Upload the monthly data file to refresh the dashboard.",
    )

    st.markdown("---")
    page = st.radio(
        "Navigate",
        ["📊 Executive Summary", "🔧 PMPC", "🚊 TSA",
         "⚡ TSR", "🚪 PDR", "🎫 TVMR", "🛗 LER",
         "💰 Financial Impact"],
        label_visibility="collapsed",
    )
    st.markdown("---")
    st.caption("Version 1.0.0 · March 2026")

# ──────────────────────────────────────────────────────────────────────────────
# DATA RESOLUTION
# ──────────────────────────────────────────────────────────────────────────────

if uploaded is not None:
    file_bytes = uploaded.read()
    cfg, df_pmpc, df_tsa, df_inc = parse_uploaded_file(file_bytes)
    data_source = f"📂 {uploaded.name}"
else:
    cfg = DEFAULT_CONSTANTS.copy()
    # Default demo data
    df_pmpc = pd.DataFrame([{
        "Month": "Feb-26", "Planned Tasks": 1555,
        "Completed Tasks": 1555, "Status": "COMP", "KPI": "OK",
    }])
    df_tsa = pd.DataFrame([{
        "Month": "Feb-26", "Trams Available": 6,
        "Trams Required": 6, "TSA (%)": 100.0, "Status": "PASS",
    }])
    df_inc = pd.DataFrame([
        {"Date": pd.Timestamp("2026-02-18"), "KPI Type": "TSR",  "Asset ID": "T11",
         "Failure Code": "IOS075",   "Downtime (Mins)": 9.07,  "Is Excused": False,
         "Attributed To": "Maintainer", "Description": "T11 Tachometer Failure"},
        {"Date": pd.Timestamp("2026-02-05"), "KPI Type": "PDR",  "Asset ID": "PSD-01",
         "Failure Code": "OPN_FAIL", "Downtime (Mins)": 0,     "Is Excused": False,
         "Attributed To": "Maintainer", "Description": "Door Stuck – Station 1"},
        {"Date": pd.Timestamp("2026-02-12"), "KPI Type": "PDR",  "Asset ID": "PSD-02",
         "Failure Code": "SYS_FAIL", "Downtime (Mins)": 0,     "Is Excused": False,
         "Attributed To": "Maintainer", "Description": "Door Controller Fault"},
    ] + [
        {"Date": pd.Timestamp(f"2026-02-{d:02d}"), "KPI Type": "TVMR", "Asset ID": f"TVM-{i:02d}",
         "Failure Code": fc, "Downtime (Mins)": 0, "Is Excused": False,
         "Attributed To": "Maintainer", "Description": desc}
        for i, (d, fc, desc) in enumerate([
            (1,"BLANK_SCR","Blank Screen"),(2,"CARD_RDR","Card Reader Fault"),
            (3,"PAPER_JAM","Paper Jam"),(4,"COIN_MECH","Coin Mechanism Error"),
            (5,"BLANK_SCR","Display Freeze"),(6,"CARD_RDR","Card Error"),
            (7,"NET_ERR","Network Error"),(8,"COIN_MECH","Coin Jam"),
            (9,"BLANK_SCR","Display Failure"),(10,"PAPER_JAM","Paper Jam"),
            (11,"CARD_RDR","Card Reader"),(12,"BLANK_SCR","Screen Freeze"),
            (13,"NET_ERR","Network Error"),(14,"COIN_MECH","Coin Mechanism"),
            (15,"CARD_RDR","Card Error"),(16,"BLANK_SCR","Display Off"),
            (17,"PAPER_JAM","Paper Jam"),(18,"COIN_MECH","Coin Error"),
            (19,"NET_ERR","Connectivity Loss"),(20,"CARD_RDR","Card Reader"),
            (21,"BLANK_SCR","Screen Freeze"),(22,"PAPER_JAM","Paper Jam"),
        ], 1)
    ] + [
        {"Date": pd.Timestamp("2026-02-05"),  "KPI Type": "LER", "Asset ID": "LIFT-01",
         "Failure Code": "DR_SENSOR",  "Downtime (Mins)": 0,   "Is Excused": False,
         "Attributed To": "Maintainer", "Description": "Door Sensor Fault"},
        {"Date": pd.Timestamp("2026-02-10"),  "KPI Type": "LER", "Asset ID": "ESC-01",
         "Failure Code": "MTR_FAULT",  "Downtime (Mins)": 120, "Is Excused": False,
         "Attributed To": "Maintainer", "Description": "Motor Trip"},
        {"Date": pd.Timestamp("2026-02-20"),  "KPI Type": "LER", "Asset ID": "LIFT-02",
         "Failure Code": "CTRL_FAULT", "Downtime (Mins)": 0,   "Is Excused": False,
         "Attributed To": "Maintainer", "Description": "Control Panel Fault"},
    ])
    data_source = "📋 Demo data (Feb 2026)"

# ── Derived KPI values ────────────────────────────────────────────────────────
row_pmpc   = df_pmpc.iloc[0]
planned    = int(row_pmpc.get("Planned Tasks", 1555))
completed  = int(row_pmpc.get("Completed Tasks", 1555))
pmpc_pct   = completed / planned if planned > 0 else 0.0

row_tsa    = df_tsa.iloc[0]
tsa_avail  = int(row_tsa.get("Trams Available", 6))
tsa_req    = int(row_tsa.get("Trams Required", 6))
tsa_pct    = tsa_avail / tsa_req if tsa_req > 0 else 0.0

def kpi_counts(kpi_type):
    return len(df_inc[(df_inc["KPI Type"] == kpi_type) & (~df_inc["Is Excused"])])

tsr_count  = kpi_counts("TSR")
pdr_count  = kpi_counts("PDR")
tvmr_count = kpi_counts("TVMR")
ler_count  = kpi_counts("LER")

deductions = calc_all_deductions(pmpc_pct, tsa_pct, df_inc, cfg)
mfee       = monthly_fee(cfg)


# ──────────────────────────────────────────────────────────────────────────────
# PAGE: EXECUTIVE SUMMARY
# ──────────────────────────────────────────────────────────────────────────────
if page == "📊 Executive Summary":
    st.markdown('<div class="dash-title">🚊 Dubai Tram KPI Dashboard</div>', unsafe_allow_html=True)
    st.markdown(
        f'<div class="dash-subtitle">Al Sufouh Transit System · Maintenance Agreement · {data_source}</div>',
        unsafe_allow_html=True,
    )

    # ── KPI Status Cards ──────────────────────────────────────────────────────
    section("KPI Status Overview")
    kpis = [
        ("PMPC",  f"{pmpc_pct*100:.1f}%",  f"Target {cfg['TARGET_PMPC']*100:.0f}%",  pmpc_pct >= cfg["TARGET_PMPC"]),
        ("TSA",   f"{tsa_pct*100:.1f}%",   f"Target {cfg['TARGET_TSA']*100:.0f}%",   tsa_pct  >= cfg["TARGET_TSA"]),
        ("TSR",   str(tsr_count),           f"Limit {cfg['LIMIT_TSR']}",              tsr_count <= cfg["LIMIT_TSR"]),
        ("PDR",   str(pdr_count),           f"Limit {cfg['LIMIT_PDR']}",              pdr_count <= cfg["LIMIT_PDR"]),
        ("TVMR",  str(tvmr_count),          f"Limit {cfg['LIMIT_TVMR']}",             tvmr_count <= cfg["LIMIT_TVMR"]),
        ("LER",   str(ler_count),           f"Limit {cfg['LIMIT_LER']}",              ler_count <= cfg["LIMIT_LER"]),
    ]
    cols = st.columns(6)
    for col, (name, val, ref, ok) in zip(cols, kpis):
        delta_color = "normal" if ok else "inverse"
        status = "✅ PASS" if ok else "❌ FAIL"
        col.metric(label=f"**{name}**", value=val, delta=status, delta_color=delta_color)
        col.caption(ref)

    # ── Gauge Row ─────────────────────────────────────────────────────────────
    section("Performance Gauges")
    g1, g2 = st.columns(2)
    with g1:
        st.plotly_chart(gauge_chart(pmpc_pct * 100, cfg["TARGET_PMPC"] * 100,
                                    "PMPC Completion", "%", 100), use_container_width=True)
    with g2:
        st.plotly_chart(gauge_chart(tsa_pct * 100, cfg["TARGET_TSA"] * 100,
                                    "TSA Availability", "%", 100), use_container_width=True)

    # ── Incident Summary Bar ──────────────────────────────────────────────────
    section("Incident Count vs Limits")
    counts  = [tsr_count, pdr_count, tvmr_count, ler_count]
    limits  = [cfg["LIMIT_TSR"], cfg["LIMIT_PDR"], cfg["LIMIT_TVMR"], cfg["LIMIT_LER"]]
    labels  = ["TSR", "PDR", "TVMR", "LER"]
    colors  = [COLORS["green"] if c <= l else COLORS["red"] for c, l in zip(counts, limits)]

    fig_bar = go.Figure()
    fig_bar.add_bar(name="Actual", x=labels, y=counts,
                    marker_color=colors, text=counts, textposition="outside")
    fig_bar.add_scatter(name="Limit", x=labels, y=limits,
                        mode="markers+lines",
                        marker=dict(size=10, color=COLORS["amber"], symbol="diamond"),
                        line=dict(color=COLORS["amber"], dash="dash"))
    fig_bar.update_layout(
        height=320, margin=dict(t=30, b=20, l=20, r=20),
        paper_bgcolor="white", plot_bgcolor="white",
        legend=dict(orientation="h", y=1.12),
        yaxis=dict(showgrid=True, gridcolor="#F0F0F0"),
    )
    st.plotly_chart(fig_bar, use_container_width=True)

    # ── Financial Summary ─────────────────────────────────────────────────────
    section("Financial Summary (AED)")
    f1, f2, f3, f4 = st.columns(4)
    f1.metric("Monthly Fee",       f"AED {mfee:,.0f}")
    f2.metric("MC Component (10%)", f"AED {mfee * cfg['MC_PERCENTAGE']:,.0f}")
    f3.metric("Total Deduction",   f"AED {deductions['Total']:,.0f}",
              delta=f"Cap AED {deductions['Cap']:,.0f}", delta_color="off")
    net = mfee - deductions["Total"]
    f4.metric("Net Monthly Payment", f"AED {net:,.0f}")


# ──────────────────────────────────────────────────────────────────────────────
# PAGE: PMPC
# ──────────────────────────────────────────────────────────────────────────────
elif page == "🔧 PMPC":
    st.markdown('<div class="dash-title">🔧 Preventive Maintenance Plan Completion (PMPC)</div>',
                unsafe_allow_html=True)
    st.caption(data_source)

    pass_pmpc = pmpc_pct >= cfg["TARGET_PMPC"]
    ded       = deductions["PMPC"]

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Planned Tasks",    planned)
    c2.metric("Completed Tasks",  completed)
    c3.metric("PMPC %",           f"{pmpc_pct*100:.2f}%",
              delta=f"Target {cfg['TARGET_PMPC']*100:.0f}%",
              delta_color="normal" if pass_pmpc else "inverse")
    c4.metric("Deduction",        f"AED {ded:,.0f}")

    if pass_pmpc:
        st.success(f"✅ PMPC PASS — {pmpc_pct*100:.2f}% ≥ {cfg['TARGET_PMPC']*100:.0f}% target. No deduction applied.")
    else:
        st.error(f"❌ PMPC FAIL — {pmpc_pct*100:.2f}% < {cfg['TARGET_PMPC']*100:.0f}% target. Deduction: AED {ded:,.2f}")

    section("Gauge")
    st.plotly_chart(gauge_chart(pmpc_pct * 100, cfg["TARGET_PMPC"] * 100,
                                "PMPC Completion %", "%", 100), use_container_width=True)

    section("Task Breakdown")
    df_chart = pd.DataFrame({"Category": ["Planned", "Completed"], "Tasks": [planned, completed]})
    fig = go.Figure(go.Bar(
        x=df_chart["Category"], y=df_chart["Tasks"],
        marker_color=[COLORS["blue"], COLORS["green"] if pass_pmpc else COLORS["red"]],
        text=df_chart["Tasks"], textposition="outside",
    ))
    fig.update_layout(height=300, margin=dict(t=20, b=20, l=20, r=20),
                      paper_bgcolor="white", plot_bgcolor="white",
                      yaxis=dict(showgrid=True, gridcolor="#F0F0F0"))
    st.plotly_chart(fig, use_container_width=True)

    section("Raw Data")
    st.dataframe(df_pmpc, use_container_width=True)


# ──────────────────────────────────────────────────────────────────────────────
# PAGE: TSA
# ──────────────────────────────────────────────────────────────────────────────
elif page == "🚊 TSA":
    st.markdown('<div class="dash-title">🚊 Tram Service Availability (TSA)</div>',
                unsafe_allow_html=True)
    st.caption(data_source)

    pass_tsa = tsa_pct >= cfg["TARGET_TSA"]
    ded      = deductions["TSA"]

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Trams Available", tsa_avail)
    c2.metric("Trams Required",  tsa_req)
    c3.metric("TSA %",           f"{tsa_pct*100:.2f}%",
              delta=f"Target {cfg['TARGET_TSA']*100:.0f}%",
              delta_color="normal" if pass_tsa else "inverse")
    c4.metric("Deduction",       f"AED {ded:,.0f}")

    if pass_tsa:
        st.success(f"✅ TSA PASS — {tsa_avail}/{tsa_req} trams available ({tsa_pct*100:.2f}%). No deduction.")
    else:
        st.error(f"❌ TSA FAIL — {tsa_avail}/{tsa_req} trams available. Deduction: AED {ded:,.2f}")

    section("Gauge")
    st.plotly_chart(gauge_chart(tsa_pct * 100, cfg["TARGET_TSA"] * 100,
                                "TSA Availability %", "%", 100), use_container_width=True)

    section("Availability vs Requirement")
    fig = go.Figure()
    fig.add_bar(x=["Available", "Required"], y=[tsa_avail, tsa_req],
                marker_color=[COLORS["green"] if pass_tsa else COLORS["red"], COLORS["blue"]],
                text=[tsa_avail, tsa_req], textposition="outside")
    fig.update_layout(height=300, margin=dict(t=20, b=20, l=20, r=20),
                      paper_bgcolor="white", plot_bgcolor="white",
                      yaxis=dict(showgrid=True, gridcolor="#F0F0F0"))
    st.plotly_chart(fig, use_container_width=True)

    section("Raw Data")
    st.dataframe(df_tsa, use_container_width=True)


# ──────────────────────────────────────────────────────────────────────────────
# PAGE: TSR
# ──────────────────────────────────────────────────────────────────────────────
elif page == "⚡ TSR":
    st.markdown('<div class="dash-title">⚡ Tram Service Reliability (TSR)</div>',
                unsafe_allow_html=True)
    st.caption(data_source)

    df_tsr  = df_inc[df_inc["KPI Type"] == "TSR"].copy()
    non_exc = df_tsr[~df_tsr["Is Excused"]]
    pass_tsr = tsr_count <= cfg["LIMIT_TSR"]
    ded      = deductions["TSR"]

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total Incidents",       len(df_tsr))
    c2.metric("Non-Excused",           tsr_count)
    c3.metric("Limit",                 cfg["LIMIT_TSR"])
    c4.metric("Deduction",             f"AED {ded:,.0f}")

    if pass_tsr:
        st.success(f"✅ TSR PASS — {tsr_count} incidents ≤ limit {cfg['LIMIT_TSR']}. No deduction.")
    else:
        st.error(f"❌ TSR FAIL — {tsr_count} incidents > limit {cfg['LIMIT_TSR']}. Deduction: AED {ded:,.2f}")

    section("Incidents vs Limit")
    st.plotly_chart(bar_limit_chart(tsr_count, cfg["LIMIT_TSR"], "TSR Incidents vs Limit",
                                    COLORS["green"] if pass_tsr else COLORS["red"]),
                    use_container_width=True)

    if not df_tsr.empty:
        section("Incident Detail")
        st.dataframe(df_tsr.reset_index(drop=True), use_container_width=True)
    else:
        st.info("No TSR incidents recorded this month.")


# ──────────────────────────────────────────────────────────────────────────────
# PAGE: PDR
# ──────────────────────────────────────────────────────────────────────────────
elif page == "🚪 PDR":
    st.markdown('<div class="dash-title">🚪 Platform Screen Door Reliability (PDR)</div>',
                unsafe_allow_html=True)
    st.caption(data_source)

    df_pdr   = df_inc[df_inc["KPI Type"] == "PDR"].copy()
    pass_pdr = pdr_count <= cfg["LIMIT_PDR"]
    ded      = deductions["PDR"]

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total Failures",  len(df_pdr))
    c2.metric("Non-Excused",     pdr_count)
    c3.metric("Limit",           cfg["LIMIT_PDR"])
    c4.metric("Deduction",       f"AED {ded:,.0f}")

    if pass_pdr:
        st.success(f"✅ PDR PASS — {pdr_count} failures ≤ limit {cfg['LIMIT_PDR']}. No deduction.")
    else:
        st.error(f"❌ PDR FAIL — {pdr_count} failures > limit {cfg['LIMIT_PDR']}. Deduction: AED {ded:,.2f}")

    section("Failures vs Limit")
    st.plotly_chart(bar_limit_chart(pdr_count, cfg["LIMIT_PDR"], "PDR Failures vs Limit",
                                    COLORS["green"] if pass_pdr else COLORS["red"]),
                    use_container_width=True)

    if not df_pdr.empty:
        section("Failure Detail")
        st.dataframe(df_pdr.reset_index(drop=True), use_container_width=True)
    else:
        st.info("No PDR failures recorded this month.")


# ──────────────────────────────────────────────────────────────────────────────
# PAGE: TVMR
# ──────────────────────────────────────────────────────────────────────────────
elif page == "🎫 TVMR":
    st.markdown('<div class="dash-title">🎫 Ticket Vending Machine Reliability (TVMR)</div>',
                unsafe_allow_html=True)
    st.caption(data_source)

    df_tvmr   = df_inc[df_inc["KPI Type"] == "TVMR"].copy()
    pass_tvmr = tvmr_count <= cfg["LIMIT_TVMR"]
    ded       = deductions["TVMR"]

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total Failures",  len(df_tvmr))
    c2.metric("Non-Excused",     tvmr_count)
    c3.metric("Limit",           cfg["LIMIT_TVMR"])
    c4.metric("Deduction",       f"AED {ded:,.0f}")

    if pass_tvmr:
        st.success(f"✅ TVMR PASS — {tvmr_count} failures ≤ limit {cfg['LIMIT_TVMR']}. No deduction.")
    else:
        st.error(f"❌ TVMR FAIL — {tvmr_count} failures > limit {cfg['LIMIT_TVMR']}. Deduction: AED {ded:,.2f}")

    section("Failures vs Limit")
    st.plotly_chart(bar_limit_chart(tvmr_count, cfg["LIMIT_TVMR"], "TVMR Failures vs Limit",
                                    COLORS["green"] if pass_tvmr else COLORS["red"]),
                    use_container_width=True)

    if not df_tvmr.empty:
        section("Failure Breakdown by Code")
        by_code = df_tvmr.groupby("Failure Code").size().reset_index(name="Count").sort_values("Count", ascending=False)
        fig = go.Figure(go.Bar(
            x=by_code["Failure Code"], y=by_code["Count"],
            marker_color=COLORS["blue"], text=by_code["Count"], textposition="outside",
        ))
        fig.update_layout(height=300, margin=dict(t=20, b=20, l=20, r=20),
                          paper_bgcolor="white", plot_bgcolor="white",
                          yaxis=dict(showgrid=True, gridcolor="#F0F0F0"))
        st.plotly_chart(fig, use_container_width=True)

        section("Failure Detail")
        st.dataframe(df_tvmr.reset_index(drop=True), use_container_width=True)
    else:
        st.info("No TVMR failures recorded this month.")


# ──────────────────────────────────────────────────────────────────────────────
# PAGE: LER
# ──────────────────────────────────────────────────────────────────────────────
elif page == "🛗 LER":
    st.markdown('<div class="dash-title">🛗 Lifts & Escalators Reliability (LER)</div>',
                unsafe_allow_html=True)
    st.caption(data_source)

    df_ler   = df_inc[df_inc["KPI Type"] == "LER"].copy()
    pass_ler = ler_count <= cfg["LIMIT_LER"]
    ded      = deductions["LER"]

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total Failures",  len(df_ler))
    c2.metric("Non-Excused",     ler_count)
    c3.metric("Limit",           cfg["LIMIT_LER"])
    c4.metric("Deduction",       f"AED {ded:,.0f}")

    if pass_ler:
        st.success(f"✅ LER PASS — {ler_count} failures ≤ limit {cfg['LIMIT_LER']}. No deduction.")
    else:
        st.error(f"❌ LER FAIL — {ler_count} failures > limit {cfg['LIMIT_LER']}. Deduction: AED {ded:,.2f}")

    section("Failures vs Limit")
    st.plotly_chart(bar_limit_chart(ler_count, cfg["LIMIT_LER"], "LER Failures vs Limit",
                                    COLORS["green"] if pass_ler else COLORS["red"]),
                    use_container_width=True)

    if not df_ler.empty:
        section("Failure Detail")
        if "Downtime (Mins)" in df_ler.columns:
            total_dt = df_ler["Downtime (Mins)"].sum()
            st.metric("Total Downtime (Mins)", f"{total_dt:.1f}")
        st.dataframe(df_ler.reset_index(drop=True), use_container_width=True)
    else:
        st.info("No LER failures recorded this month.")


# ──────────────────────────────────────────────────────────────────────────────
# PAGE: FINANCIAL IMPACT
# ──────────────────────────────────────────────────────────────────────────────
elif page == "💰 Financial Impact":
    st.markdown('<div class="dash-title">💰 Financial Impact — Monthly Deduction Report</div>',
                unsafe_allow_html=True)
    st.caption(data_source)

    mc_budget = mfee * cfg["MC_PERCENTAGE"]

    # ── Summary metrics ───────────────────────────────────────────────────────
    section("Monthly Fee Breakdown")
    f1, f2, f3 = st.columns(3)
    f1.metric("Annual Contract Fee",   f"AED {cfg['ANNUAL_FEE']:,.0f}")
    f2.metric("Monthly Fee",           f"AED {mfee:,.0f}")
    f3.metric("MC Budget (10%)",       f"AED {mc_budget:,.0f}")

    section("Deduction Breakdown")
    items = {
        "PMPC": deductions["PMPC"],
        "TSA":  deductions["TSA"],
        "TSR":  deductions["TSR"],
        "PDR":  deductions["PDR"],
        "TVMR": deductions["TVMR"],
        "LER":  deductions["LER"],
    }

    d1, d2, d3, d4, d5, d6 = st.columns(6)
    for col, (k, v) in zip([d1, d2, d3, d4, d5, d6], items.items()):
        col.metric(k, f"AED {v:,.0f}")

    st.markdown("---")
    total = deductions["Total"]
    cap   = deductions["Cap"]
    net   = mfee - total

    t1, t2, t3 = st.columns(3)
    t1.metric("Total Deduction (pre-cap)", f"AED {sum(items.values()):,.0f}")
    t2.metric("Applied Deduction (capped)", f"AED {total:,.0f}",
              delta=f"Cap = AED {cap:,.0f}", delta_color="off")
    t3.metric("Net Monthly Payment", f"AED {net:,.0f}",
              delta=f"{'✅ Full' if total == 0 else '⚠️ Reduced'}", delta_color="off")

    # ── Waterfall chart ───────────────────────────────────────────────────────
    section("Deduction Waterfall (AED)")
    measures = ["absolute"] + ["relative"] * len(items) + ["total"]
    x_vals   = ["Monthly Fee"] + list(items.keys()) + ["Net Payment"]
    y_vals   = [mfee] + [-v for v in items.values()] + [net]
    text_vals = [f"{v:,.0f}" for v in [mfee] + list(items.values()) + [net]]

    fig = go.Figure(go.Waterfall(
        orientation="v",
        measure=measures,
        x=x_vals,
        y=y_vals,
        text=text_vals,
        textposition="outside",
        connector={"line": {"color": "#CCCCCC"}},
        increasing={"marker": {"color": COLORS["green"]}},
        decreasing={"marker": {"color": COLORS["red"]}},
        totals={"marker":    {"color": COLORS["blue"]}},
    ))
    fig.update_layout(
        height=420, margin=dict(t=30, b=20, l=20, r=20),
        paper_bgcolor="white", plot_bgcolor="white",
        yaxis=dict(showgrid=True, gridcolor="#F0F0F0", tickformat=",.0f"),
    )
    st.plotly_chart(fig, use_container_width=True)

    # ── Deduction pie ─────────────────────────────────────────────────────────
    non_zero = {k: v for k, v in items.items() if v > 0}
    if non_zero:
        section("Deduction Composition")
        fig_pie = go.Figure(go.Pie(
            labels=list(non_zero.keys()),
            values=list(non_zero.values()),
            hole=0.4,
            marker_colors=[COLORS["red"], COLORS["amber"], COLORS["blue"],
                           COLORS["gray"], COLORS["green"], "#9C27B0"],
        ))
        fig_pie.update_layout(height=350, margin=dict(t=20, b=20, l=20, r=20),
                               paper_bgcolor="white")
        st.plotly_chart(fig_pie, use_container_width=True)
    else:
        st.success("✅ No deductions applied this month — full monthly payment retained.")

    # ── Deduction table ───────────────────────────────────────────────────────
    section("Deduction Detail Table")
    df_fin = pd.DataFrame([
        {"KPI": k, "Deduction (AED)": v, "% of MC Budget": f"{v/mc_budget*100:.1f}%" if mc_budget else "–"}
        for k, v in items.items()
    ] + [
        {"KPI": "TOTAL (capped)", "Deduction (AED)": total,
         "% of MC Budget": f"{total/mc_budget*100:.1f}%" if mc_budget else "–"}
    ])
    st.dataframe(df_fin, use_container_width=True, hide_index=True)


# ──────────────────────────────────────────────────────────────────────────────
# FOOTER
# ──────────────────────────────────────────────────────────────────────────────
st.markdown("---")
st.markdown(
    "<small>Dubai Tram KPI Dashboard · Al Sufouh Transit System · "
    "Data Source: Maximo MMS / Monthly Report · "
    "Target limits based on DLP Average (Sept 2016 – Aug 2017)</small>",
    unsafe_allow_html=True,
)
