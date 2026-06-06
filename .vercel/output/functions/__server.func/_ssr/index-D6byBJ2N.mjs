import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useRouter } from "../_libs/tanstack__react-router.mjs";
import { l as isRedirect } from "../_libs/tanstack__router-core.mjs";
import { s as supabase } from "./client-DGL-s__c.mjs";
import { r as registerServiceWorker, n as notificationsSupported, u as unsubscribePush, s as subscribePush, i as isStandalone, p as pwaSupported, g as getInstallBrowserHint } from "./router-yunpGyGe.mjs";
import { R as Root, P as Portal, C as Content, a as Close, T as Title, D as Description, O as Overlay } from "../_libs/radix-ui__react-dialog.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { c as createServerFn, T as TSS_SERVER_FUNCTION, g as getServerFnById } from "./index.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-CHcJPpTQ.mjs";
import "../_libs/seroval.mjs";
import { B as Bell, a as BellOff, L as LogOut, S as Save, A as Archive, b as Settings2, c as Activity, C as ChartColumn, D as Download, d as Share, E as EllipsisVertical, R as RefreshCw, T as Trash2, X } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./createMiddleware-BvN2ghIY.mjs";
function useServerFn(serverFn) {
  const router = useRouter();
  return reactExports.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router.stores.location.get();
        return router.navigate(router.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router, serverFn]);
}
const SYMBOL = "R_100";
class DerivBot {
  ws = null;
  cfg;
  listeners = /* @__PURE__ */ new Set();
  eventListeners = /* @__PURE__ */ new Set();
  state = {
    connected: false,
    running: false,
    authorized: false,
    balance: null,
    currency: "USD",
    lastDigit: null,
    lastPrice: null,
    streak: 0,
    streakDigit: null,
    ticks: [],
    trades: [],
    pnl: 0,
    wins: 0,
    losses: 0,
    totalTrades: 0,
    error: null,
    pendingTrade: false
  };
  reqId = 1;
  pending = /* @__PURE__ */ new Map();
  reconnectTimer = null;
  cooldown = 0;
  constructor(cfg) {
    this.cfg = cfg;
  }
  subscribe(fn) {
    this.listeners.add(fn);
    fn(this.state);
    return () => this.listeners.delete(fn);
  }
  onEvent(fn) {
    this.eventListeners.add(fn);
    return () => this.eventListeners.delete(fn);
  }
  fire(e) {
    this.eventListeners.forEach((l) => {
      try {
        l(e);
      } catch {
      }
    });
  }
  emit() {
    const snap = { ...this.state, ticks: this.state.ticks.slice(), trades: this.state.trades.slice() };
    this.listeners.forEach((l) => l(snap));
  }
  patch(p) {
    this.state = { ...this.state, ...p };
    this.emit();
  }
  updateConfig(p) {
    this.cfg = { ...this.cfg, ...p };
  }
  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;
    this.patch({ error: null });
    const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${this.cfg.appId}`);
    this.ws = ws;
    ws.onopen = () => {
      this.patch({ connected: true });
      this.send({ authorize: this.cfg.token });
    };
    ws.onmessage = (e) => this.onMessage(JSON.parse(e.data));
    ws.onclose = () => {
      this.patch({ connected: false, authorized: false });
      if (this.state.running) this.scheduleReconnect();
    };
    ws.onerror = () => {
      this.patch({ error: "WebSocket error" });
    };
  }
  scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 2e3);
  }
  send(payload) {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("WS not open"));
        return;
      }
      const req_id = this.reqId++;
      this.pending.set(req_id, resolve);
      this.ws.send(JSON.stringify({ ...payload, req_id }));
      setTimeout(() => {
        if (this.pending.has(req_id)) {
          this.pending.delete(req_id);
          reject(new Error("Request timeout"));
        }
      }, 15e3);
    });
  }
  onMessage(msg) {
    if (msg.req_id && this.pending.has(msg.req_id)) {
      const fn = this.pending.get(msg.req_id);
      this.pending.delete(msg.req_id);
      fn(msg);
    }
    if (msg.msg_type === "authorize") {
      if (msg.error) {
        this.patch({ error: msg.error.message, authorized: false });
        return;
      }
      this.patch({ authorized: true, balance: msg.authorize.balance, currency: msg.authorize.currency, error: null });
      this.send({ balance: 1, subscribe: 1 }).catch(() => {
      });
      this.send({ ticks: SYMBOL, subscribe: 1 }).catch(() => {
      });
    }
    if (msg.msg_type === "balance" && msg.balance) {
      this.patch({ balance: msg.balance.balance, currency: msg.balance.currency });
    }
    if (msg.msg_type === "tick" && msg.tick) {
      this.handleTick(msg.tick.quote);
    }
    if (msg.msg_type === "proposal_open_contract" && msg.proposal_open_contract) {
      this.handleContractUpdate(msg.proposal_open_contract);
    }
    if (msg.error && !msg.req_id) {
      this.patch({ error: msg.error.message });
    }
  }
  lastDigitOf(price) {
    const s = price.toFixed(2);
    return parseInt(s[s.length - 1], 10);
  }
  handleTick(price) {
    const digit = this.lastDigitOf(price);
    const tick = { price, digit, time: Date.now() };
    const ticks = [tick, ...this.state.ticks].slice(0, 60);
    let streak;
    let streakDigit;
    if (this.cfg.anyDigit) {
      if (this.state.streakDigit === digit) streak = this.state.streak + 1;
      else streak = 1;
      streakDigit = digit;
    } else {
      if (digit === this.cfg.targetDigit) streak = this.state.streak + 1;
      else streak = 0;
      streakDigit = this.cfg.targetDigit;
    }
    this.patch({ lastDigit: digit, lastPrice: price, ticks, streak, streakDigit });
    if (this.cooldown > 0) this.cooldown -= 1;
    if (this.state.running && !this.state.pendingTrade && this.cooldown === 0 && streak >= this.cfg.repetitionCount) {
      this.placeTrade(this.cfg.anyDigit ? digit : this.cfg.targetDigit);
    }
  }
  async placeTrade(barrierDigit) {
    this.patch({ pendingTrade: true, streak: 0 });
    this.cooldown = 2;
    try {
      const proposal = await this.send({
        proposal: 1,
        amount: this.cfg.stake,
        basis: "stake",
        contract_type: "DIGITDIFF",
        currency: this.state.currency || "USD",
        duration: 1,
        duration_unit: "t",
        symbol: SYMBOL,
        barrier: String(barrierDigit)
      });
      if (proposal.error) throw new Error(proposal.error.message);
      const buy = await this.send({ buy: proposal.proposal.id, price: this.cfg.stake });
      if (buy.error) throw new Error(buy.error.message);
      const contractId = buy.buy.contract_id;
      const trade = {
        id: String(contractId),
        time: Date.now(),
        digit: barrierDigit,
        buyPrice: buy.buy.buy_price,
        status: "open"
      };
      this.patch({ trades: [trade, ...this.state.trades].slice(0, 100) });
      this.send({ proposal_open_contract: 1, contract_id: contractId, subscribe: 1 }).catch(() => {
      });
      const startedAt = Date.now();
      const poll = async () => {
        const still = this.state.trades.find((t) => t.id === String(contractId));
        if (!still || still.status !== "open") return;
        if (Date.now() - startedAt > 3e4) return;
        try {
          const r = await this.send({ proposal_open_contract: 1, contract_id: contractId });
          if (r?.proposal_open_contract) this.handleContractUpdate(r.proposal_open_contract);
        } catch {
        }
        setTimeout(poll, 1500);
      };
      setTimeout(poll, 2500);
    } catch (e) {
      this.patch({ error: e?.message || "Trade failed", pendingTrade: false });
    }
  }
  handleContractUpdate(c) {
    const settled = c.is_sold || c.is_expired || c.status === "won" || c.status === "lost";
    if (!settled) return;
    const existing = this.state.trades.find((t) => t.id === String(c.contract_id));
    if (!existing || existing.status !== "open") return;
    const profit = Number(c.profit ?? Number(c.sell_price ?? 0) - Number(c.buy_price ?? 0));
    const status = profit >= 0 ? "won" : "lost";
    const trades = this.state.trades.map(
      (t) => t.id === String(c.contract_id) ? { ...t, status, profit, payout: c.payout } : t
    );
    const pnl = this.state.pnl + profit;
    const wins = this.state.wins + (status === "won" ? 1 : 0);
    const losses = this.state.losses + (status === "lost" ? 1 : 0);
    const totalTrades = this.state.totalTrades + 1;
    this.patch({ trades, pnl, wins, losses, totalTrades, pendingTrade: false });
    const settledTrade = trades.find((t) => t.id === String(c.contract_id));
    this.fire({ type: "trade_settled", trade: settledTrade, pnl });
    if (pnl <= -Math.abs(this.cfg.stopLoss)) {
      this.stop();
      this.patch({ error: `Stop Loss hit (${pnl.toFixed(2)})` });
      this.fire({ type: "stop_loss", pnl });
    } else if (pnl >= Math.abs(this.cfg.takeProfit)) {
      this.stop();
      this.patch({ error: `Take Profit reached (${pnl.toFixed(2)})` });
      this.fire({ type: "take_profit", pnl });
    }
  }
  start() {
    this.patch({ running: true, error: null });
    if (!this.state.connected) this.connect();
  }
  stop() {
    this.patch({ running: false });
  }
  resetSession() {
    this.patch({ pnl: 0, wins: 0, losses: 0, totalTrades: 0, trades: [], streak: 0, error: null });
  }
  disconnect() {
    this.stop();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
    this.patch({ connected: false, authorized: false, balance: null, lastDigit: null, lastPrice: null, streak: 0, ticks: [] });
  }
}
const DEFAULT_CFG = {
  token: "",
  appId: "1089",
  symbol: "R_100",
  stake: 1,
  targetDigit: 5,
  repetitionCount: 3,
  stopLoss: 10,
  takeProfit: 10,
  anyDigit: false
};
function useDerivBot() {
  const botRef = reactExports.useRef(null);
  const [state, setState] = reactExports.useState(null);
  const [cfg, setCfg] = reactExports.useState(DEFAULT_CFG);
  reactExports.useEffect(() => {
    const bot = new DerivBot(cfg);
    botRef.current = bot;
    const unsub = bot.subscribe(setState);
    return () => {
      unsub();
      bot.disconnect();
    };
  }, []);
  reactExports.useEffect(() => {
    botRef.current?.updateConfig(cfg);
  }, [cfg]);
  return {
    state,
    cfg,
    setCfg,
    connect: () => botRef.current?.connect(),
    start: () => botRef.current?.start(),
    stop: () => botRef.current?.stop(),
    reset: () => botRef.current?.resetSession(),
    disconnect: () => botRef.current?.disconnect(),
    onEvent: (fn) => botRef.current?.onEvent(fn)
  };
}
function useAuth() {
  const [session, setSession] = reactExports.useState(null);
  const [user, setUser] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
    }).catch((e) => {
      console.error("Auth session fetch failed:", e);
    }).finally(() => {
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return {
    user,
    session,
    loading,
    signOut: () => supabase.auth.signOut()
  };
}
function Footer() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "border-t border-border px-6 py-4 text-center text-[11px] text-muted-foreground", children: [
    "Built by",
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "a",
      {
        href: "https://architeq.co.za",
        target: "_blank",
        rel: "noopener noreferrer",
        className: "text-foreground/80 underline-offset-4 transition-colors hover:text-primary hover:underline",
        children: "Architeq Web Agency"
      }
    )
  ] });
}
const DISMISS_KEY = "smrttrdr-pwa-install-dismissed";
function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = reactExports.useState(null);
  const [installed, setInstalled] = reactExports.useState(isStandalone);
  const [installing, setInstalling] = reactExports.useState(false);
  const [bannerDismissed, setBannerDismissed] = reactExports.useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });
  reactExports.useEffect(() => {
    if (!pwaSupported()) return;
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    const mq = window.matchMedia("(display-mode: standalone)");
    const onDisplayChange = () => setInstalled(isStandalone());
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    mq.addEventListener("change", onDisplayChange);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      mq.removeEventListener("change", onDisplayChange);
    };
  }, []);
  const supported = pwaSupported();
  const canInstall = supported && !installed;
  const canNativeInstall = canInstall && !!deferredPrompt;
  const showBanner = canInstall && !bannerDismissed;
  const install = reactExports.useCallback(async () => {
    if (!deferredPrompt) return false;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } finally {
      setInstalling(false);
    }
  }, [deferredPrompt]);
  const dismissBanner = reactExports.useCallback(() => {
    setBannerDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
    }
  }, []);
  return {
    supported,
    canInstall,
    canNativeInstall,
    installed,
    installing,
    install,
    showBanner,
    dismissBanner
  };
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const Dialog = Root;
const DialogPortal = Portal;
const DialogOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = Overlay.displayName;
const DialogContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = Title.displayName;
const DialogDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = Description.displayName;
function InstallSteps({ hint }) {
  const steps = {
    "chrome-android": [
      "Tap the ⋮ menu in the top-right of Chrome.",
      'Choose "Install app" or "Add to Home screen".',
      'Tap "Install" to add SmrtTrdr to your home screen.'
    ],
    samsung: [
      "Tap the menu icon (☰ or ⋮) in Samsung Internet.",
      'Select "Add page to" → "Home screen".',
      "Confirm to install the app."
    ],
    "firefox-android": [
      "Tap the ⋮ menu in Firefox.",
      'Choose "Install" or "Add to Home screen".',
      "Confirm the installation."
    ],
    "ios-safari": [
      "Tap the Share button at the bottom of Safari.",
      'Scroll and tap "Add to Home Screen".',
      'Tap "Add" to install SmrtTrdr.'
    ],
    "desktop-chrome": [
      "Click the install icon in the address bar (⊕ or monitor icon).",
      'Or open the browser menu (⋮) and choose "Install SmrtTrdr…".',
      "Confirm to add the app to your device."
    ],
    generic: [
      "Open your browser menu (usually ⋮ or ☰).",
      'Look for "Install app", "Add to Home screen", or "Install".',
      "Follow the prompts to add SmrtTrdr."
    ]
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "mt-3 space-y-2 text-sm text-muted-foreground", children: steps[hint].map((step, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs text-primary shrink-0", children: [
      i + 1,
      "."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: step })
  ] }, i)) });
}
function PwaInstallButton({ className = "", showLabel = true }) {
  const { canInstall, canNativeInstall, installing, install } = usePwaInstall();
  const [instructionsOpen, setInstructionsOpen] = reactExports.useState(false);
  const hint = getInstallBrowserHint();
  if (!canInstall) return null;
  async function handleClick() {
    if (canNativeInstall) {
      const accepted = await install();
      if (!accepted) setInstructionsOpen(true);
    } else {
      setInstructionsOpen(true);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: handleClick,
        disabled: installing,
        className: className || "inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
        title: "Install app on your device",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" }),
          showLabel && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: installing ? "Installing…" : "Install" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: instructionsOpen, onOpenChange: setInstructionsOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Install SmrtTrdr" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Install to open SmrtTrdr full-screen without the Chrome browser bar. You also get faster launch and push notifications." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-surface/40 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-medium text-foreground", children: [
          hint === "ios-safari" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Share, { className: "h-4 w-4 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EllipsisVertical, { className: "h-4 w-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "From your browser menu" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InstallSteps, { hint })
      ] }),
      canNativeInstall && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: async () => {
            const accepted = await install();
            if (accepted) setInstructionsOpen(false);
          },
          disabled: installing,
          className: "w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50",
          children: installing ? "Installing…" : "Install now"
        }
      )
    ] }) })
  ] });
}
function PwaInstallBanner({ aboveNav = false }) {
  const { canInstall, canNativeInstall, installing, install, showBanner, dismissBanner } = usePwaInstall();
  const [instructionsOpen, setInstructionsOpen] = reactExports.useState(false);
  const hint = getInstallBrowserHint();
  if (!canInstall || !showBanner) return null;
  const bottomClass = aboveNav ? "bottom-[calc(env(safe-area-inset-bottom,0px)+4rem)]" : "bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)]";
  async function handleInstall() {
    if (canNativeInstall) {
      const accepted = await install();
      if (!accepted) setInstructionsOpen(true);
    } else {
      setInstructionsOpen(true);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `fixed ${bottomClass} inset-x-3 z-50 lg:bottom-4 lg:left-auto lg:right-4 lg:max-w-sm`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-lg border border-primary/30 bg-surface/95 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-surface/90", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/15", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-foreground", children: "Install SmrtTrdr" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-[11px] leading-relaxed text-muted-foreground", children: "Install to remove the Chrome bar and run SmrtTrdr like a native app." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: handleInstall,
                  disabled: installing,
                  className: "rounded-md bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground hover:brightness-110 disabled:opacity-50",
                  children: installing ? "Installing…" : canNativeInstall ? "Install" : "How to install"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setInstructionsOpen(true),
                  className: "rounded-md border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground",
                  children: "Browser menu"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: dismissBanner,
              className: "shrink-0 rounded p-1 text-muted-foreground hover:text-foreground",
              "aria-label": "Dismiss install banner",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: instructionsOpen, onOpenChange: setInstructionsOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Install from browser menu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "If the install button does not appear, use your browser's built-in option." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InstallSteps, { hint })
    ] }) })
  ] });
}
function AuthScreen() {
  const [mode, setMode] = reactExports.useState("login");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [err, setErr] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const { error } = mode === "login" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin }
      });
      if (error) setErr(error.message);
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen flex-col bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "flex justify-end px-4 pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PwaInstallButton, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex flex-1 items-center justify-center px-4 py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-4 grid h-10 w-10 place-items-center rounded-md bg-primary/15", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-3 rounded-sm bg-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-semibold tracking-tight", children: "ThDpstSmrtTrdr" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Sign in to access your trading bot" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-surface/40 p-6 shadow-2xl shadow-black/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-5 flex gap-1 rounded-md bg-surface-2 p-1 text-xs", children: ["login", "signup"].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setMode(m),
            className: `flex-1 rounded px-3 py-2 font-medium transition-all ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
            children: m === "login" ? "Log In" : "Sign Up"
          },
          m
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "email",
                required: true,
                autoComplete: "email",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                className: "w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm font-mono outline-none transition-colors focus:border-ring",
                placeholder: "you@example.com"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: "Password" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "password",
                required: true,
                minLength: 6,
                autoComplete: mode === "login" ? "current-password" : "new-password",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                className: "w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm font-mono outline-none transition-colors focus:border-ring",
                placeholder: "••••••••"
              }
            )
          ] }),
          err && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-bear/40 bg-bear/10 px-3 py-2 text-xs text-bear", children: err }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              disabled: busy,
              className: "w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50",
              children: busy ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-center text-[11px] text-muted-foreground", children: "Your Deriv API token is stored securely on your account." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PwaInstallBanner, {})
  ] });
}
function SessionHistory({ userId, refreshKey }) {
  const [rows, setRows] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  async function load() {
    setLoading(true);
    const { data } = await supabase.from("trading_sessions").select("*").eq("user_id", userId).order("ended_at", { ascending: false }).limit(50);
    setRows(data ?? []);
    setLoading(false);
  }
  reactExports.useEffect(() => {
    load();
  }, [userId, refreshKey]);
  async function remove(id) {
    await supabase.from("trading_sessions").delete().eq("id", id);
    setRows((r) => r.filter((x) => x.id !== id));
  }
  const totals = rows.reduce(
    (acc, r) => {
      acc.pnl += Number(r.pnl);
      acc.wins += r.wins;
      acc.losses += r.losses;
      acc.trades += r.total_trades;
      return acc;
    },
    { pnl: 0, wins: 0, losses: 0, trades: 0 }
  );
  const overallWinRate = totals.trades ? Math.round(totals.wins / totals.trades * 100) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-surface/40 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-baseline justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-sm font-semibold tracking-tight", children: "Session History" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: load,
          className: "text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3 w-3" }),
            " ",
            loading ? "…" : "Refresh"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tot, { label: "Sessions", v: String(rows.length) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tot, { label: "Net P/L", v: `${totals.pnl >= 0 ? "+" : ""}${totals.pnl.toFixed(2)}`, accent: totals.pnl >= 0 ? "bull" : "bear" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tot, { label: "Trades", v: String(totals.trades) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tot, { label: "Win rate", v: `${overallWinRate}%` })
    ] }),
    rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center py-8 text-xs text-muted-foreground", children: "No saved sessions yet. End a session to log it here." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 pr-3 font-medium", children: "Ended" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 pr-3 font-medium", children: "Acct" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 pr-3 font-medium", children: "Reps" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 pr-3 font-medium", children: "Trades" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 pr-3 font-medium", children: "W/L" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 pr-3 font-medium", children: "Win%" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 pr-3 font-medium text-right", children: "P/L" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 pr-0 font-medium" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "font-mono", children: rows.map((r) => {
        const wr = r.total_trades ? Math.round(r.wins / r.total_trades * 100) : 0;
        const pnl = Number(r.pnl);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-muted-foreground", children: new Date(r.ended_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: r.account_type === "real" ? "text-bear" : "text-primary", children: r.account_type }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 pr-3 text-muted-foreground", children: [
            r.repetition_count ?? "—",
            r.target_digit != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground/60", children: [
              " · d",
              r.target_digit
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: r.total_trades }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 pr-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-bull", children: r.wins }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "/" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-bear", children: r.losses })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 pr-3", children: [
            wr,
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: `py-2 pr-3 text-right ${pnl >= 0 ? "text-bull" : "text-bear"}`, children: [
            pnl >= 0 ? "+" : "",
            pnl.toFixed(2)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-0 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => remove(r.id),
              className: "text-muted-foreground hover:text-bear",
              title: "Delete",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
            }
          ) })
        ] }, r.id);
      }) })
    ] }) })
  ] });
}
function Tot({ label, v, accent }) {
  const color = accent === "bull" ? "text-bull" : accent === "bear" ? "text-bear" : "text-foreground";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-surface px-3 py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-mono text-sm ${color}`, children: v })
  ] });
}
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const subSchema = objectType({
  endpoint: stringType().url().max(2e3),
  p256dh: stringType().min(1).max(500),
  auth: stringType().min(1).max(500),
  userAgent: stringType().max(500).optional()
});
const saveSubscription = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => subSchema.parse(d)).handler(createSsrRpc("aca7a94adfc906b20421097c5e7e6eb3d4aa925d2e447c68dc7cf5b1e1df59c9"));
const removeSubscription = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  endpoint: stringType().url().max(2e3)
}).parse(d)).handler(createSsrRpc("7d17c1cf2e13b5e3404d3e4a3b99e4a7ab1d3dbd60410f1aaca8692d32ab6b65"));
const notifySchema = objectType({
  title: stringType().min(1).max(120),
  body: stringType().max(300).default(""),
  tag: stringType().max(80).optional(),
  url: stringType().max(500).optional()
});
const sendNotification = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => notifySchema.parse(d)).handler(createSsrRpc("e1746fb741861825449ca9f77d8a0d59c9c3ddff358528e831473ada6a63830f"));
function useAnimatedNumber(value, duration = 400) {
  const [v, setV] = reactExports.useState(value);
  const ref = reactExports.useRef(value);
  reactExports.useEffect(() => {
    const start = ref.current;
    const delta = value - start;
    if (delta === 0) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = start + delta * eased;
      setV(next);
      ref.current = next;
      if (p < 1) raf = requestAnimationFrame(tick);
      else ref.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return v;
}
function Dashboard() {
  const {
    user,
    loading,
    signOut
  } = useAuth();
  const {
    state,
    cfg,
    setCfg,
    start,
    stop,
    reset,
    connect,
    disconnect,
    onEvent
  } = useDerivBot();
  const s = state ?? {
    connected: false,
    running: false,
    authorized: false,
    balance: null,
    currency: "USD",
    lastDigit: null,
    lastPrice: null,
    streak: 0,
    streakDigit: null,
    ticks: [],
    trades: [],
    pnl: 0,
    wins: 0,
    losses: 0,
    totalTrades: 0,
    error: null,
    pendingTrade: false
  };
  const pnlAnim = useAnimatedNumber(s?.pnl ?? 0);
  const [accountType, setAccountType] = reactExports.useState("demo");
  const [demoToken, setDemoToken] = reactExports.useState("");
  const [realToken, setRealToken] = reactExports.useState("");
  const [savingToken, setSavingToken] = reactExports.useState(false);
  const [tokenLoaded, setTokenLoaded] = reactExports.useState(false);
  const [savedMsg, setSavedMsg] = reactExports.useState(null);
  const [confirmReal, setConfirmReal] = reactExports.useState(false);
  const [sessionStart, setSessionStart] = reactExports.useState(() => Date.now());
  const [historyKey, setHistoryKey] = reactExports.useState(0);
  const [savingSession, setSavingSession] = reactExports.useState(false);
  const [mobileTab, setMobileTab] = reactExports.useState("live");
  const [swReg, setSwReg] = reactExports.useState(null);
  const [pushOn, setPushOn] = reactExports.useState(false);
  const [pushBusy, setPushBusy] = reactExports.useState(false);
  const callSave = useServerFn(saveSubscription);
  const callRemove = useServerFn(removeSubscription);
  const callNotify = useServerFn(sendNotification);
  reactExports.useEffect(() => {
    let mounted = true;
    (async () => {
      const reg = await registerServiceWorker();
      if (!mounted) return;
      setSwReg(reg);
      if (reg && "PushManager" in window) {
        const sub = await reg.pushManager.getSubscription();
        setPushOn(!!sub && Notification.permission === "granted");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  reactExports.useEffect(() => {
    if (!user) return;
    const off = onEvent?.((e) => {
      if (e.type === "trade_settled") {
        const won = e.trade.status === "won";
        const profit = e.trade.profit ?? 0;
        callNotify({
          data: {
            title: won ? "Trade WON" : "Trade LOST",
            body: `${won ? "+" : ""}${profit.toFixed(2)} ${s?.currency || "USD"} · Net ${e.pnl >= 0 ? "+" : ""}${e.pnl.toFixed(2)} (digit ≠ ${e.trade.digit})`,
            tag: "trade"
          }
        }).catch(() => {
        });
      } else if (e.type === "take_profit") {
        callNotify({
          data: {
            title: "Take Profit reached",
            body: `Net ${e.pnl >= 0 ? "+" : ""}${e.pnl.toFixed(2)} — bot stopped.`,
            tag: "tp"
          }
        }).catch(() => {
        });
      } else if (e.type === "stop_loss") {
        callNotify({
          data: {
            title: "Stop Loss hit",
            body: `Net ${e.pnl.toFixed(2)} — bot stopped.`,
            tag: "sl"
          }
        }).catch(() => {
        });
      }
    });
    return () => {
      off?.();
    };
  }, [user?.id, onEvent]);
  async function enablePush() {
    if (!swReg || !user) return;
    setPushBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setPushBusy(false);
        return;
      }
      const sub = await subscribePush(swReg);
      if (!sub) {
        setPushBusy(false);
        return;
      }
      const json = sub.toJSON();
      await callSave({
        data: {
          endpoint: sub.endpoint,
          p256dh: json.keys?.p256dh || "",
          auth: json.keys?.auth || "",
          userAgent: navigator.userAgent.slice(0, 500)
        }
      });
      setPushOn(true);
    } catch (e) {
      console.error(e);
    } finally {
      setPushBusy(false);
    }
  }
  async function disablePush() {
    if (!swReg) return;
    setPushBusy(true);
    try {
      const sub = await swReg.pushManager.getSubscription();
      if (sub) {
        await callRemove({
          data: {
            endpoint: sub.endpoint
          }
        }).catch(() => {
        });
        await unsubscribePush(swReg);
      }
      setPushOn(false);
    } finally {
      setPushBusy(false);
    }
  }
  async function endAndSaveSession() {
    if (!user) return;
    if (!s || s.totalTrades === 0) {
      stop();
      reset();
      setSessionStart(Date.now());
      return;
    }
    setSavingSession(true);
    stop();
    const {
      error
    } = await supabase.from("trading_sessions").insert({
      user_id: user.id,
      account_type: accountType,
      pnl: Number(s.pnl.toFixed(4)),
      wins: s.wins,
      losses: s.losses,
      total_trades: s.totalTrades,
      stake: cfg.stake,
      target_digit: cfg.targetDigit,
      repetition_count: cfg.repetitionCount,
      started_at: new Date(sessionStart).toISOString(),
      ended_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    setSavingSession(false);
    if (!error) {
      reset();
      setSessionStart(Date.now());
      setHistoryKey((k) => k + 1);
    }
  }
  const activeToken = accountType === "real" ? realToken : demoToken;
  const digits = reactExports.useMemo(() => s?.ticks.slice(0, 30).map((t) => t.digit) ?? [], [s?.ticks]);
  reactExports.useEffect(() => {
    if (!user) {
      setTokenLoaded(false);
      setDemoToken("");
      setRealToken("");
      return;
    }
    let cancelled = false;
    (async () => {
      const {
        data
      } = await supabase.from("profiles").select("deriv_token_demo, deriv_token_real, account_type").eq("id", user.id).maybeSingle();
      if (cancelled) return;
      const dt = data?.deriv_token_demo ?? "";
      const rt = data?.deriv_token_real ?? "";
      const at = data?.account_type === "real" ? "real" : "demo";
      setDemoToken(dt);
      setRealToken(rt);
      setAccountType(at);
      setCfg((c) => ({
        ...c,
        token: at === "real" ? rt : dt
      }));
      setTokenLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);
  function switchAccount(next) {
    if (next === accountType) return;
    if (next === "real" && !confirmReal) {
      setConfirmReal(true);
      return;
    }
    setAccountType(next);
    setConfirmReal(false);
    disconnect();
    const tok = next === "real" ? realToken : demoToken;
    setCfg({
      ...cfg,
      token: tok
    });
    if (user) {
      supabase.from("profiles").update({
        account_type: next
      }).eq("id", user.id);
    }
  }
  async function saveToken() {
    if (!user) return;
    setSavingToken(true);
    setSavedMsg(null);
    const patch = accountType === "real" ? {
      deriv_token_real: realToken
    } : {
      deriv_token_demo: demoToken
    };
    const {
      error
    } = await supabase.from("profiles").update(patch).eq("id", user.id);
    setSavingToken(false);
    if (error) setSavedMsg("Save failed");
    else {
      setCfg({
        ...cfg,
        token: activeToken
      });
      setSavedMsg(`${accountType === "real" ? "Real" : "Demo"} token saved`);
      setTimeout(() => setSavedMsg(null), 2e3);
    }
  }
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background text-xs text-muted-foreground", children: "Loading…" });
  }
  if (!user) return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthScreen, {});
  const statusColor = !s?.connected ? "text-muted-foreground" : s?.running ? "text-bull" : "text-warn";
  const statusLabel = !s?.connected ? "Disconnected" : s?.running ? "Running" : s?.authorized ? "Idle" : "Connecting…";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-[100dvh] bg-background text-foreground pb-[calc(env(safe-area-inset-bottom,0px)+4rem)] lg:pb-0 px-safe", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between border-b border-border px-3 sm:px-6 py-3 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 sm:gap-3 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-6 shrink-0 rounded-sm bg-primary/20 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 rounded-sm bg-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-sm sm:text-base font-semibold tracking-tight truncate", children: [
          "ThDpstSmrtTrdr",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline text-muted-foreground", children: " · Digits Differ" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 sm:gap-4 text-xs shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `status-dot inline-block h-2 w-2 rounded-full ${statusColor}`, style: {
            backgroundColor: "currentColor"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `${statusColor} hidden xs:inline`, children: statusLabel })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground font-mono", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "hidden sm:inline", children: [
            s?.currency,
            " "
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: s?.balance != null ? s.balance.toFixed(2) : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block text-muted-foreground font-mono max-w-[160px] truncate", children: user.email }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PwaInstallButton, {}),
        notificationsSupported() && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: pushOn ? disablePush : enablePush, disabled: pushBusy || !swReg, className: `inline-flex items-center gap-1.5 rounded-md border px-2 py-1 transition-colors ${pushOn ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15" : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"}`, title: pushOn ? "Notifications on — tap to disable" : "Enable push notifications", children: [
          pushOn ? /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(BellOff, { className: "h-3.5 w-3.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: pushOn ? "Notify" : "Notify off" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => signOut(), className: "inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors", title: "Log out", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-3.5 w-3.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Log out" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "grid gap-px bg-border grid-cols-1 lg:[grid-template-columns:minmax(280px,320px)_1fr_minmax(260px,300px)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: `bg-background p-4 sm:p-5 space-y-5 ${mobileTab === "controls" ? "" : "hidden"} lg:block`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Connection" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: "Account" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 rounded-md bg-surface-2 p-1 text-xs", children: ["demo", "real"].map((m) => {
            const active = accountType === m;
            return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => switchAccount(m), className: `flex-1 rounded px-3 py-1.5 font-medium transition-all ${active ? m === "real" ? "bg-bear text-white" : "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`, children: m === "demo" ? "Demo" : "Real" }, m);
          }) }),
          accountType === "real" && !s?.authorized && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-bear/40 bg-bear/10 px-2.5 py-1.5 text-[11px] text-bear", children: "Live trading uses real funds. Trade at your own risk." }),
          confirmReal && accountType === "demo" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 rounded-md border border-warn/40 bg-warn/10 px-2.5 py-2 text-[11px] text-warn", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Switching to ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Real" }),
              " will trade with real money. Confirm?"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => switchAccount("real"), className: "rounded bg-bear px-2 py-1 text-[11px] text-white", children: "Confirm Real" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setConfirmReal(false), className: "rounded border border-border px-2 py-1 text-[11px] text-muted-foreground", children: "Cancel" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${accountType === "real" ? "Real" : "Demo"} API Token`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: accountType === "real" ? realToken : demoToken, onChange: (e) => {
          const v = e.target.value;
          if (accountType === "real") setRealToken(v);
          else setDemoToken(v);
        }, placeholder: tokenLoaded ? `Paste ${accountType} API token` : "Loading…", className: "input", autoComplete: "off" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "btn-secondary inline-flex items-center justify-center gap-1.5", onClick: saveToken, disabled: savingToken || !activeToken, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3.5 w-3.5" }),
            savingToken ? "Saving…" : "Save"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-secondary", onClick: connect, disabled: !activeToken || s?.connected, children: s?.authorized ? "Connected" : s?.connected ? "Authorizing…" : "Connect" })
        ] }),
        savedMsg && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: savedMsg }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Strategy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-2 rounded-md border border-border bg-surface-2 px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground", children: [
            "Any digit mode",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[10px] text-muted-foreground/70", children: "Trigger on whichever digit repeats" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: cfg.anyDigit, onChange: (e) => setCfg({
            ...cfg,
            anyDigit: e.target.checked
          }), className: "h-4 w-4 accent-primary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Target Digit", children: /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "input disabled:opacity-40", value: cfg.targetDigit, disabled: cfg.anyDigit, onChange: (e) => setCfg({
            ...cfg,
            targetDigit: Number(e.target.value)
          }), children: Array.from({
            length: 10
          }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: i, children: i }, i)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Repetitions", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NumInput, { value: cfg.repetitionCount, min: 1, step: 1, onChange: (v) => setCfg({
            ...cfg,
            repetitionCount: Math.max(1, v)
          }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Stake (USD)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NumInput, { value: cfg.stake, min: 0.35, step: 0.5, onChange: (v) => setCfg({
            ...cfg,
            stake: v
          }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "App ID", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "input", value: cfg.appId, onChange: (e) => setCfg({
            ...cfg,
            appId: e.target.value
          }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Risk" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Stop Loss ($)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NumInput, { value: cfg.stopLoss, min: 0, step: 1, onChange: (v) => setCfg({
            ...cfg,
            stopLoss: v
          }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Take Profit ($)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NumInput, { value: cfg.takeProfit, min: 0, step: 1, onChange: (v) => setCfg({
            ...cfg,
            takeProfit: v
          }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 pt-2", children: [
          !s?.running ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-primary col-span-1", onClick: start, disabled: !s?.authorized, children: "Start Bot" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-danger col-span-1", onClick: stop, children: "Stop Bot" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-ghost", onClick: reset, children: "Reset" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "btn-secondary w-full inline-flex items-center justify-center gap-1.5", onClick: endAndSaveSession, disabled: savingSession || !s || s.totalTrades === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "h-3.5 w-3.5" }),
          savingSession ? "Saving…" : "End & Save Session"
        ] }),
        s?.error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-bear/40 bg-bear/10 px-3 py-2 text-xs text-bear", children: s.error })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: `bg-background p-4 sm:p-6 space-y-6 ${mobileTab === "live" ? "" : "hidden"} lg:block`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-[1fr_1fr]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { title: "Last Digit", hint: `${cfg.symbol === "R_100" ? "Volatility 100 Index" : cfg.symbol}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between gap-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-mono text-[112px] leading-none tracking-tight tick-pulse ${s?.lastDigit === cfg.targetDigit ? "text-primary digit-glow" : "text-foreground"}`, children: s?.lastDigit ?? "—" }, s?.lastDigit ?? "—"),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Price" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-xl", children: s?.lastPrice?.toFixed(2) ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-xs uppercase tracking-wider text-muted-foreground", children: cfg.anyDigit ? `Reps (digit ${s?.streakDigit ?? "—"})` : "Streak" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-xl", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: s && s.streak > 0 ? "text-warn" : "", children: s?.streak ?? 0 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                    " / ",
                    cfg.repetitionCount
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-wrap gap-1.5", children: [
              digits.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-mono text-xs h-7 w-7 grid place-items-center rounded ${d === cfg.targetDigit ? "bg-primary/15 text-primary" : "bg-surface text-muted-foreground"}`, children: d }, i)),
              digits.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Waiting for ticks…" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Tick Stream", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[260px] overflow-hidden font-mono text-xs", children: s?.ticks.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: s.ticks.slice(0, 14).map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: new Date(t.time).toLocaleTimeString([], {
              hour12: false
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.price.toFixed(2) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: t.digit === cfg.targetDigit ? "text-primary" : "", children: [
              "·",
              t.digit
            ] })
          ] }, t.time + "-" + i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { children: "No ticks yet. Connect & start the bot." }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Trade Log", hint: `${s?.trades.length ?? 0} trade${(s?.trades.length ?? 0) === 1 ? "" : "s"}`, children: s?.trades.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 pr-4 font-medium", children: "Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 pr-4 font-medium", children: "Differ ≠" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 pr-4 font-medium", children: "Stake" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 pr-4 font-medium", children: "Result" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 pr-0 font-medium text-right", children: "P/L" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "font-mono", children: s.trades.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4 text-muted-foreground", children: new Date(t.time).toLocaleTimeString([], {
              hour12: false
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: t.digit }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: t.buyPrice.toFixed(2) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: t.status === "open" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-warn", children: "open" }) : t.status === "won" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-bull", children: "win" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-bear", children: "loss" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `py-2 pr-0 text-right ${t.profit == null ? "" : t.profit >= 0 ? "text-bull" : "text-bear"}`, children: t.profit == null ? "—" : `${t.profit >= 0 ? "+" : ""}${t.profit.toFixed(2)}` })
          ] }, t.id)) })
        ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { children: "Trades will appear here once the bot fires." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SessionHistory, { userId: user.id, refreshKey: historyKey })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: `bg-background p-4 sm:p-5 space-y-5 ${mobileTab === "stats" ? "" : "hidden"} lg:block`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Session" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Net P/L" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `font-mono text-4xl tracking-tight ${pnlAnim >= 0 ? "text-bull" : "text-bear"}`, children: [
            pnlAnim >= 0 ? "+" : "",
            pnlAnim.toFixed(2),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-base text-muted-foreground", children: [
              " ",
              s?.currency
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Wins", value: s?.wins ?? 0, accent: "bull" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Losses", value: s?.losses ?? 0, accent: "bear" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Trades", value: s?.totalTrades ?? 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Win rate", value: `${s && s.totalTrades ? Math.round(s.wins / s.totalTrades * 100) : 0}%` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Bot" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Status", v: statusLabel }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Pending", v: s?.pendingTrade ? "yes" : "no" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Mode", v: cfg.anyDigit ? "Any digit" : `Digit ${cfg.targetDigit}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Repetitions required", v: String(cfg.repetitionCount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: cfg.anyDigit ? `Reps waited (digit ${s?.streakDigit ?? "—"})` : "Streak", v: `${s?.streak ?? 0} / ${cfg.repetitionCount}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Symbol", v: "R_100" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Duration", v: "1 tick" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "pt-2 text-[11px] leading-relaxed text-muted-foreground", children: "Tokens stay in your browser only — never sent to any third-party server. Demo and Real tokens are stored separately on your account." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .input {
          width: 100%;
          background: var(--input);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 13px;
          font-family: var(--font-mono);
          color: var(--foreground);
          outline: none;
          transition: border-color .15s ease, background .15s ease;
        }
        .input:focus { border-color: var(--ring); }
        .btn-primary, .btn-secondary, .btn-danger, .btn-ghost {
          font-size: 13px; font-weight: 500; padding: 9px 12px;
          border-radius: 6px; transition: all .15s ease; cursor: pointer;
        }
        .btn-primary { background: var(--primary); color: var(--primary-foreground); }
        .btn-primary:hover:not(:disabled) { filter: brightness(1.05); }
        .btn-primary:disabled { opacity: .4; cursor: not-allowed; }
        .btn-secondary { background: var(--surface-2); color: var(--foreground); border: 1px solid var(--border); }
        .btn-secondary:hover:not(:disabled) { background: var(--accent); }
        .btn-secondary:disabled { opacity: .5; cursor: not-allowed; }
        .btn-danger { background: var(--bear); color: white; }
        .btn-danger:hover { filter: brightness(1.05); }
        .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--muted-foreground); }
        .btn-ghost:hover { color: var(--foreground); }
      ` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PwaInstallBanner, { aboveNav: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-safe", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3", children: [{
      id: "controls",
      label: "Controls",
      icon: Settings2
    }, {
      id: "live",
      label: "Live",
      icon: Activity
    }, {
      id: "stats",
      label: "Stats",
      icon: ChartColumn
    }].map(({
      id,
      label,
      icon: Icon
    }) => {
      const active = mobileTab === id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
        setMobileTab(id);
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }, className: `flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-4 w-4 ${active ? "" : "opacity-70"}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label })
      ] }, id);
    }) }) })
  ] });
}
function SectionLabel({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground", children });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: label }),
    children
  ] });
}
function NumInput({
  value,
  onChange,
  min,
  step
}) {
  const [draft, setDraft] = reactExports.useState(null);
  const display = draft !== null ? draft : String(value);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", className: "input", value: display, min, step, onFocus: () => setDraft(""), onChange: (e) => setDraft(e.target.value), onBlur: () => {
    if (draft === "" || draft === null) {
      setDraft(null);
      return;
    }
    const n = Number(draft);
    if (!isNaN(n)) onChange(n);
    setDraft(null);
  } });
}
function Divider() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border" });
}
function Panel({
  title,
  hint,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-surface/40 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-baseline justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-sm font-semibold tracking-tight", children: title }),
      hint && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: hint })
    ] }),
    children
  ] });
}
function Stat({
  label,
  value,
  accent
}) {
  const color = accent === "bull" ? "text-bull" : accent === "bear" ? "text-bear" : "text-foreground";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-surface px-3 py-2.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-mono text-lg ${color}`, children: value })
  ] });
}
function Row({
  k,
  v
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: k }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: v })
  ] });
}
function EmptyState({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center py-8 text-xs text-muted-foreground", children });
}
export {
  Dashboard as component
};
