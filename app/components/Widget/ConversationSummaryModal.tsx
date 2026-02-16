import React, { createContext, useContext } from "react";
import { Sparkles, X, ThumbsUp, Activity, ThumbsDown, Minus } from "lucide-react";

// --- Types ---
export interface SummaryData {
  customerName?: string;
  overview: string;
  intent: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  sentimentScore: number;
  priority: "Low" | "Medium" | "High";
  tags: string[];
  keyQuotes: string[];
  suggestedAction: string;
  resolutionStatus: "Escalated" | "Requires Follow-up" | "Informational";
}

interface SummaryContextValue {
  summary: SummaryData | null;
  isLoading: boolean;
  customerName?: string;
  onClose: () => void;
}

const SummaryContext = createContext<SummaryContextValue | null>(null);

function useSummary() {
  const context = useContext(SummaryContext);
  if (!context) {
    throw new Error("Summary internal components must be used within Summary.Root");
  }
  return context;
}

// --- Compound Components ---

export interface SummaryRootProps {
  isOpen: boolean;
  onClose: () => void;
  summary: SummaryData | null;
  isLoading: boolean;
  customerName?: string;
  children: React.ReactNode;
}

export function SummaryRoot({
  isOpen,
  onClose,
  summary,
  isLoading,
  customerName,
  children,
}: SummaryRootProps) {
  if (!isOpen) return null;

  return (
    <SummaryContext.Provider value={{ summary, isLoading, customerName, onClose }}>
      <div className="summary-modal" role="dialog" aria-modal="true" aria-labelledby="summary-title">
        <div className="summary-card animate-slide-up-fade">
          {children}
        </div>
      </div>
    </SummaryContext.Provider>
  );
}

export function SummaryHeader({ title = "AI Conversation Summary" }: { title?: string }) {
  const { onClose, summary } = useSummary();
  return (
    <div className="summary-header">
      <div className="summary-header__title">
        <Sparkles size={18} className="summary-sparkle-icon" />
        <h3 id="summary-title" className="summary-header__text">{title}</h3>
        {summary?.priority && (
          <span className={`summary-priority-badge summary-priority-badge--${summary.priority.toLowerCase()}`}>
            {summary.priority}
          </span>
        )}
      </div>
      <button 
        onClick={onClose} 
        className="summary-header__close" 
        aria-label="Close summary"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function SummaryContent() {
  const { summary, isLoading, customerName } = useSummary();
  const displayCustomerName = summary?.customerName || customerName || "Customer";

  if (isLoading) {
    return (
      <div className="summary-content">
        <div className="skeleton-container">
          <div className="skeleton-row skeleton-pulse">
            <div className="skeleton-circle"></div>
            <div className="skeleton-bar w-2-3"></div>
          </div>
          <div className="skeleton-pulse skeleton-stack">
            <div className="skeleton-bar w-full"></div>
            <div className="skeleton-bar w-5-6"></div>
            <div className="skeleton-bar w-4-6"></div>
          </div>
          <div className="skeleton-row skeleton-pulse mt-4">
            <div className="skeleton-pill"></div>
            <div className="skeleton-pill"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="summary-content">
        <div className="summary-empty">
          <p>Failed to generate summary…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="summary-content">
      {/* Overview Section */}
      <div className="summary-section">
        <h4 className="summary-section__title">Overview</h4>
        <p className="summary-text">
          Customer <span className="summary-highlight">{displayCustomerName}</span>: {summary.overview}
        </p>
      </div>

      {/* Grid Stats */}
      <div className="summary-grid">
        <div className="summary-stat-box">
          <div className="summary-stat__label">Intent & Status</div>
          <div className="summary-stat__value">{summary.intent}</div>
          <div className="summary-status-small">{summary.resolutionStatus}</div>
        </div>
        <div className="summary-stat-box">
          <div className="summary-stat__label">Sentiment {summary.sentimentScore}%</div>
          <div className={`summary-stat__value summary-stat__value--${summary.sentiment.toLowerCase()}`}>
            {summary.sentiment === "Positive" && <ThumbsUp size={14} />}
            {summary.sentiment === "Negative" && <ThumbsDown size={14} />}
            {summary.sentiment === "Neutral" && <Minus size={14} />}
            <span>{summary.sentiment}</span>
          </div>
        </div>
      </div>

      {/* Key Quotes Section */}
      {summary.keyQuotes && summary.keyQuotes.length > 0 && (
        <div className="summary-section">
          <h4 className="summary-section__title">Key Quotes</h4>
          <div className="summary-quotes">
            {summary.keyQuotes.map((quote: string, i: number) => (
              <blockquote key={i} className="summary-quote">
                &quot;{quote}&quot;
              </blockquote>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="summary-tags">
        {summary.tags.map((tag: string, i: number) => (
          <span
            key={i}
            className={`summary-tag summary-tag--${i % 2 === 0 ? "indigo" : "amber"}`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Action Card */}
      <div className="summary-action-card">
        <div className="summary-action-card__header">
          <div className="summary-action-card__badge">
            <Sparkles size={10} />
            <span>Recommended Action</span>
          </div>
        </div>
        <div className="summary-action-card__body">
          <div className="summary-action-card__icon">
            <Activity size={18} />
          </div>
          <div className="summary-action-card__content">
            <p className="summary-action-card__text">{summary.suggestedAction}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Export (for backward compatibility or simpler usage) ---

export interface ConversationSummaryModalProps extends Omit<SummaryRootProps, "children"> {}

export function ConversationSummaryModal(props: ConversationSummaryModalProps) {
  return (
    <SummaryRoot {...props}>
      <SummaryHeader />
      <SummaryContent />
    </SummaryRoot>
  );
}

// Attach compound parts
ConversationSummaryModal.Root = SummaryRoot;
ConversationSummaryModal.Header = SummaryHeader;
ConversationSummaryModal.Content = SummaryContent;
