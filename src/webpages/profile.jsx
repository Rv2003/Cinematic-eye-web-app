import axios from "axios";
import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router";
import gsap from "gsap";
import { LoadingScreen } from "../components/loading";
import {
  Calendar,
  MapPin,
  User,
  DollarSign,
  CheckCircle2,
  Clock3,
  Search,
  Grid,
  List,
  Eye,
  Copy,
  Check,
  Sparkles,
  Camera,
  Layers,
  X,
  RefreshCw,
  FileText,
  Phone,
  ArrowUpRight,
  ShieldCheck,
  Film,
  CalendarCheck,
  AlertCircle
} from "lucide-react";

export function Profile({ token,setToken,setUser }) {
  const containerRef = useRef(null);
  const refreshIconRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'cards'
  const [activeBooking, setActiveBooking] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchBookings = async (showLoadingScreen = true) => {
    try {
      if (showLoadingScreen) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
        if (refreshIconRef.current) {
          gsap.to(refreshIconRef.current, {
            rotation: "+=360",
            duration: 0.8,
            ease: "power2.inOut",
            repeat: -1,
          });
        }
      }
      setError(null);

      const response = await axios.get(
        "http://localhost:5500/api/v1/booking/records",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data?.data;
      if (Array.isArray(data)) {
        setBookings(data);
      } else if (data) {
        setBookings([data]);
      } else {
        setBookings([]);
      }
    } catch (err) {
  console.error("Failed to fetch bookings:", err);

  if (err.response?.status === 401) {
    setToken(null);
    setUser(null);
    setBookings([]);
  } else {
    setError("Unable to retrieve booking records. Please try again.");
  }
} finally {
      setIsLoading(false);
      setIsRefreshing(false);
      if (refreshIconRef.current) {
        gsap.killTweensOf(refreshIconRef.current);
        gsap.set(refreshIconRef.current, { rotation: 0 });
      }
    }
  };

  useEffect(() => {
    fetchBookings(true);
  }, [token]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveBooking(null);
      }
    };
    if (activeBooking) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeBooking]);

  // GSAP Initial Page Entrance Animation
  useEffect(() => {
    if (isLoading) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".profile-header", {
        opacity: 0,
        y: -30,
        duration: 0.75,
      })
      .from(
        ".stat-card",
        {
          opacity: 0,
          y: 25,
          scale: 0.94,
          stagger: 0.08,
          duration: 0.65,
        },
        "-=0.4"
      )
      .from(
        ".controls-bar",
        {
          opacity: 0,
          y: 20,
          duration: 0.55,
        },
        "-=0.3"
      );
    }, containerRef);

    return () => ctx.revert();
  }, [isLoading]);

  // GSAP Transition for Table Rows / Grid Cards when filtered or view toggled
  useEffect(() => {
    if (isLoading) return;

    const ctx = gsap.context(() => {
      if (viewMode === "table") {
        gsap.from(".lux-row", {
          opacity: 0,
          y: 16,
          stagger: 0.04,
          duration: 0.45,
          ease: "power2.out",
        });
      } else {
        gsap.from(".booking-card", {
          opacity: 0,
          y: 22,
          scale: 0.96,
          stagger: 0.06,
          duration: 0.5,
          ease: "power3.out",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [viewMode, selectedStatus, bookings.length, isLoading]);

  // GSAP Modal Entrance Animation
  useEffect(() => {
    if (!activeBooking) return;

    const ctx = gsap.context(() => {
      const modalTl = gsap.timeline({ defaults: { ease: "power3.out" } });

      modalTl
        .from(".modal-overlay", {
          opacity: 0,
          duration: 0.25,
          ease: "power2.out",
        })
        .from(
          ".modal-card",
          {
            opacity: 0,
            y: 35,
            scale: 0.92,
            duration: 0.4,
            ease: "back.out(1.2)",
          },
          "-=0.15"
        )
        .from(
          ".timeline-item",
          {
            opacity: 0,
            scale: 0.5,
            stagger: 0.06,
            duration: 0.35,
            ease: "back.out(1.5)",
          },
          "-=0.2"
        )
        .from(
          ".modal-info-field",
          {
            opacity: 0,
            y: 12,
            stagger: 0.03,
            duration: 0.3,
            ease: "power2.out",
          },
          "-=0.2"
        );
    });

    return () => ctx.revert();
  }, [activeBooking]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // KPIs
  const stats = useMemo(() => {
    const total = bookings.length;
    const upcoming = bookings.filter(
      (b) => (b.status || "").toLowerCase() === "upcoming"
    ).length;
    const completed = bookings.filter(
      (b) => (b.status || "").toLowerCase() === "completed"
    ).length;
    const totalSpent = bookings.reduce((sum, b) => {
      const amt = Number(b.amount) || 0;
      return sum + amt;
    }, 0);

    return { total, upcoming, completed, totalSpent };
  }, [bookings]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesStatus =
        selectedStatus === "All" ||
        (booking.status || "Upcoming").toLowerCase() ===
          selectedStatus.toLowerCase();

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        (booking.session && booking.session.toLowerCase().includes(query)) ||
        (booking.location && booking.location.toLowerCase().includes(query)) ||
        (booking._id && booking._id.toLowerCase().includes(query)) ||
        (booking.fullname && booking.fullname.toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [bookings, selectedStatus, searchQuery]);

  const statusCounts = useMemo(() => {
    const counts = { All: bookings.length };
    bookings.forEach((b) => {
      const s = b.status || "Upcoming";
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [bookings]);

  const getStatusBadge = (status = "Upcoming") => {
    const s = status.toLowerCase();
    if (s === "completed") {
      return {
        bg: "rgba(16, 185, 129, 0.12)",
        color: "#10b981",
        border: "rgba(16, 185, 129, 0.28)",
        icon: CheckCircle2,
      };
    }
    if (s === "cancelled") {
      return {
        bg: "rgba(244, 63, 94, 0.12)",
        color: "#f43f5e",
        border: "rgba(244, 63, 94, 0.28)",
        icon: AlertCircle,
      };
    }
    // Default Upcoming / Pending
    return {
      bg: "rgba(212, 175, 55, 0.14)",
      color: "#d4af37",
      border: "rgba(212, 175, 55, 0.35)",
      icon: Clock3,
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date to be confirmed";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="profile-lux-root" ref={containerRef}>
      <style>{`
        .profile-lux-root {
          min-height: 100vh;
          background: #080808;
          color: #f5f3ef;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          padding: 40px 24px 80px;
          box-sizing: border-box;
          background-image: radial-gradient(circle at 15% 10%, rgba(212, 175, 55, 0.05) 0%, transparent 40%),
                            radial-gradient(circle at 85% 85%, rgba(212, 175, 55, 0.03) 0%, transparent 40%);
        }

        .profile-max-w {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Top Header Bar */
        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 36px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .eyebrow-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #d4af37;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .eyebrow-pulse {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #d4af37;
          box-shadow: 0 0 8px rgba(212, 175, 55, 0.8);
        }

        .profile-title {
          font-family: var(--font-heading, 'Cormorant Garamond', Georgia, serif);
          font-size: clamp(26px, 3.5vw, 36px);
          font-weight: 300;
          letter-spacing: 0.04em;
          margin: 0 0 6px;
        }

        .profile-title span {
          color: #d4af37;
          font-weight: 600;
        }

        .profile-subtitle {
          color: #8f8b82;
          font-size: 14px;
          margin: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .lux-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border-radius: 6px;
          transition: background 0.25s, border-color 0.25s, transform 0.25s, box-shadow 0.25s;
          cursor: pointer;
        }

        .lux-button-primary {
          background: #d4af37;
          color: #080808;
          border: 1px solid #d4af37;
          box-shadow: 0 4px 14px rgba(212, 175, 55, 0.25);
        }

        .lux-button-primary:hover {
          background: #f3cf58;
          border-color: #f3cf58;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(212, 175, 55, 0.35);
        }

        .lux-button-secondary {
          background: rgba(255, 255, 255, 0.04);
          color: #e5e5e5;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .lux-button-secondary:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(212, 175, 55, 0.4);
          color: #d4af37;
          transform: translateY(-1px);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.008) 100%);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 20px 22px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
        }

        .stat-card:hover {
          border-color: rgba(212, 175, 55, 0.35);
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.35);
        }

        .stat-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .stat-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #8c8880;
        }

        .stat-icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(212, 175, 55, 0.08);
          color: #d4af37;
          border: 1px solid rgba(212, 175, 55, 0.2);
        }

        .stat-value {
          font-size: 26px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #f5f3ef;
          line-height: 1;
        }

        /* Controls Section */
        .controls-bar {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 24px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .search-box {
          display: flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 8px 14px;
          flex: 1;
          min-width: 240px;
          max-width: 360px;
          transition: border-color 0.2s;
        }

        .search-box:focus-within {
          border-color: #d4af37;
          box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.2);
        }

        .search-input {
          background: transparent;
          border: none;
          outline: none;
          color: #f5f3ef;
          font-size: 13px;
          margin-left: 10px;
          width: 100%;
        }

        .search-input::placeholder {
          color: #666;
        }

        .filter-tabs {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 6px;
          font-size: 12px;
          background: transparent;
          color: #8f8b82;
          border: 1px solid transparent;
          transition: all 0.2s;
          cursor: pointer;
        }

        .tab-btn:hover {
          color: #f5f3ef;
          background: rgba(255, 255, 255, 0.04);
        }

        .tab-btn.active {
          color: #d4af37;
          background: rgba(212, 175, 55, 0.1);
          border-color: rgba(212, 175, 55, 0.3);
          font-weight: 500;
        }

        .tab-count {
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.08);
          color: #aaa;
        }

        .tab-btn.active .tab-count {
          background: rgba(212, 175, 55, 0.25);
          color: #f3cf58;
        }

        .view-switcher {
          display: flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 3px;
        }

        .view-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px 10px;
          border-radius: 4px;
          color: #777;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-btn.active {
          background: rgba(212, 175, 55, 0.15);
          color: #d4af37;
        }

        /* Table View */
        .table-container {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
        }

        .lux-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .lux-table th {
          padding: 16px 20px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #8c8880;
          font-weight: 500;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
        }

        .lux-table td {
          padding: 18px 20px;
          font-size: 13px;
          color: #d1cfc7;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          vertical-align: middle;
        }

        .lux-row {
          transition: background 0.2s;
        }

        .lux-row:hover {
          background: rgba(212, 175, 55, 0.035);
        }

        .id-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono, 'Space Mono', monospace);
          font-size: 11.5px;
          letter-spacing: 0.04em;
          color: #a8a29e;
          background: rgba(255, 255, 255, 0.04);
          padding: 3px 8px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: all 0.2s;
        }

        .id-badge:hover {
          border-color: rgba(212, 175, 55, 0.4);
          color: #d4af37;
        }

        .session-title {
          font-weight: 500;
          color: #f5f3ef;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: capitalize;
        }

        .price-text {
          font-family: var(--font-heading, 'Cormorant Garamond', Georgia, serif);
          font-weight: 600;
          color: #d4af37;
          font-size: 14px;
        }

        .table-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.05em;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #e5e5e5;
          cursor: pointer;
          transition: all 0.2s;
        }

        .table-action-btn:hover {
          background: rgba(212, 175, 55, 0.15);
          border-color: rgba(212, 175, 55, 0.4);
          color: #d4af37;
          transform: translateY(-1px);
        }

        /* Card Grid View */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .booking-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.025) 0%, rgba(255, 255, 255, 0.005) 100%);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
          position: relative;
        }

        .booking-card:hover {
          border-color: rgba(212, 175, 55, 0.35);
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);
        }

        .card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-session-type {
          font-family: var(--font-heading, 'Cormorant Garamond', Georgia, serif);
          font-size: 18px;
          font-weight: 500;
          color: #f5f3ef;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .card-details-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 12px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .card-detail-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #a8a29e;
        }

        .card-detail-item svg {
          color: #d4af37;
          flex-shrink: 0;
        }

        .card-footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }

        /* Empty State */
        .empty-container {
          text-align: center;
          padding: 64px 24px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px dashed rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }

        .empty-icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: #d4af37;
        }

        .empty-title {
          font-family: var(--font-heading, 'Cormorant Garamond', Georgia, serif);
          font-size: 20px;
          font-weight: 400;
          color: #f5f3ef;
          margin-bottom: 8px;
        }

        .empty-desc {
          color: #8c8880;
          font-size: 14px;
          max-width: 400px;
          margin: 0 auto 24px;
        }

        /* Details Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 9999;
        }

        .modal-card {
          background: #111111;
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 14px;
          width: 100%;
          max-width: 580px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.1);
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.02);
        }

        .modal-title-wrap h3 {
          font-family: var(--font-heading, 'Cormorant Garamond', Georgia, serif);
          font-size: 18px;
          margin: 0 0 4px;
          color: #f5f3ef;
        }

        .modal-close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #aaa;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border-color: #d4af37;
        }

        .modal-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .modal-section-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #8c8880;
          margin-bottom: 10px;
        }

        .timeline-steps {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          margin: 10px 0 16px;
        }

        .timeline-line {
          position: absolute;
          top: 10px;
          left: 12px;
          right: 12px;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          z-index: 1;
        }

        .timeline-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          position: relative;
          z-index: 2;
        }

        .timeline-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #1a1a1a;
          border: 2px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          color: #888;
        }

        .timeline-item.active .timeline-dot {
          background: #d4af37;
          border-color: #d4af37;
          color: #080808;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.6);
        }

        .timeline-label {
          font-size: 10px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .timeline-item.active .timeline-label {
          color: #d4af37;
          font-weight: 600;
        }

        .modal-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 16px;
        }

        .modal-info-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .modal-info-label {
          font-size: 11px;
          color: #777;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .modal-info-value {
          font-size: 14px;
          color: #f5f3ef;
          font-weight: 500;
        }

        .notes-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 14px 16px;
          font-size: 13px;
          color: #b5b1a8;
          line-height: 1.5;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: rgba(255, 255, 255, 0.015);
        }

        @media (max-width: 768px) {
          .profile-lux-root {
            padding: 24px 16px 60px;
          }
          .controls-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .search-box {
            max-width: 100%;
          }
          .filter-tabs {
            overflow-x: auto;
            padding-bottom: 4px;
          }
          .modal-info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="profile-max-w">
        {/* Header Section */}
        <header className="profile-header">
          <div>
            <div className="eyebrow-tag">
              <span className="eyebrow-pulse"></span>
              <span>Client Sanctuary</span>
            </div>
            <h1 className="profile-title">
              Your <span>Sessions</span> & Bookings
            </h1>
            <p className="profile-subtitle">
              Manage your cinema reservations, monitor production progress, and review records.
            </p>
          </div>

          <div className="header-actions">
            <button
              className="lux-button lux-button-secondary"
              onClick={() => fetchBookings(false)}
              disabled={isRefreshing}
              title="Refresh Records"
            >
              <span
                ref={refreshIconRef}
                style={{ display: "inline-flex", alignItems: "center" }}
              >
                <RefreshCw size={14} />
              </span>
              <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
            </button>
            <Link to="/booking" className="lux-button lux-button-primary">
              <Camera size={14} />
              <span>Book New Session</span>
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Total Bookings</span>
              <div className="stat-icon-wrapper">
                <Layers size={16} />
              </div>
            </div>
            <div className="stat-value">{stats.total}</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Upcoming Shoots</span>
              <div className="stat-icon-wrapper">
                <CalendarCheck size={16} />
              </div>
            </div>
            <div className="stat-value" style={{ color: "#d4af37" }}>
              {stats.upcoming}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Completed Shoots</span>
              <div className="stat-icon-wrapper">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="stat-value" style={{ color: "#10b981" }}>
              {stats.completed}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Total Investment</span>
              <div className="stat-icon-wrapper">
                <Sparkles size={16} />
              </div>
            </div>
            <div className="stat-value" style={{ fontSize: "22px" }}>
              Rs {stats.totalSpent.toLocaleString()}
            </div>
          </div>
        </section>

        {/* Controls: Search, Filter Tabs & View Switcher */}
        <div className="controls-bar">
          <div className="search-box">
            <Search size={16} color="#8c8880" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by session, location or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ color: "#888", display: "flex", alignItems: "center" }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filter-tabs">
            {["All", "Upcoming", "Completed", "Cancelled"].map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${selectedStatus === tab ? "active" : ""}`}
                onClick={() => setSelectedStatus(tab)}
              >
                <span>{tab}</span>
                <span className="tab-count">
                  {statusCounts[tab] || (tab === "All" ? bookings.length : 0)}
                </span>
              </button>
            ))}
          </div>

          <div className="view-switcher">
            <button
              className={`view-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              className={`view-btn ${viewMode === "cards" ? "active" : ""}`}
              onClick={() => setViewMode("cards")}
              title="Card Grid View"
            >
              <Grid size={16} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {filteredBookings.length === 0 ? (
          <div className="empty-container">
            <div className="empty-icon-circle">
              <Camera size={28} />
            </div>
            <h3 className="empty-title">
              {searchQuery || selectedStatus !== "All"
                ? "No matching records found"
                : "No reservations yet"}
            </h3>
            <p className="empty-desc">
              {searchQuery || selectedStatus !== "All"
                ? "Try adjusting your search query or switching your status filter to see other bookings."
                : "Ready to capture your story with breathtaking cinematic optics? Start by reserving your premier session."}
            </p>
            {searchQuery || selectedStatus !== "All" ? (
              <button
                className="lux-button lux-button-secondary"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("All");
                }}
              >
                Clear Filters
              </button>
            ) : (
              <Link to="/booking" className="lux-button lux-button-primary">
                <Sparkles size={14} />
                <span>Book Your First Session</span>
              </Link>
            )}
          </div>
        ) : viewMode === "table" ? (
          /* Table View */
          <div className="table-container">
            <div style={{ overflowX: "auto" }}>
              <table className="lux-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Session Experience</th>
                    <th>Date & Schedule</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Investment</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => {
                    const badge = getStatusBadge(booking.status);
                    const StatusIcon = badge.icon;
                    const idShort = booking._id
                      ? `${booking._id.slice(0, 6)}...${booking._id.slice(-4)}`
                      : "REF-N/A";

                    return (
                      <tr key={booking._id || Math.random()} className="lux-row">
                        <td>
                          <span
                            className="id-badge"
                            title="Click to copy full ID"
                            onClick={() => handleCopy(booking._id, booking._id)}
                            style={{ cursor: "pointer" }}
                          >
                            {copiedId === booking._id ? (
                              <Check size={12} color="#10b981" />
                            ) : (
                              <Copy size={12} />
                            )}
                            {idShort}
                          </span>
                        </td>
                        <td>
                          <div className="session-title">
                            <Film size={14} color="#d4af37" />
                            <span>{booking.session || "Custom Production"}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Calendar size={13} color="#8c8880" />
                            <span>{formatDate(booking.eventdate || booking.bookeddate)}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <MapPin size={13} color="#8c8880" />
                            <span>{booking.location || booking.Location || "Studio Sanctuary"}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className="status-pill"
                            style={{
                              backgroundColor: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`,
                            }}
                          >
                            <StatusIcon size={12} />
                            {booking.status || "Upcoming"}
                          </span>
                        </td>
                        <td>
                          <span className="price-text">
                            {booking.amount != null
                              ? `Rs ${Number(booking.amount).toLocaleString()}`
                              : "Quote Pending"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="table-action-btn"
                            onClick={() => setActiveBooking(booking)}
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Cards Grid View */
          <div className="cards-grid">
            {filteredBookings.map((booking) => {
              const badge = getStatusBadge(booking.status);
              const StatusIcon = badge.icon;
              const idShort = booking._id
                ? `${booking._id.slice(0, 6)}...${booking._id.slice(-4)}`
                : "REF-N/A";

              return (
                <div key={booking._id || Math.random()} className="booking-card">
                  <div className="card-header-row">
                    <span
                      className="id-badge"
                      onClick={() => handleCopy(booking._id, booking._id)}
                      style={{ cursor: "pointer" }}
                      title="Click to copy full ID"
                    >
                      {copiedId === booking._id ? (
                        <Check size={12} color="#10b981" />
                      ) : (
                        <Copy size={12} />
                      )}
                      {idShort}
                    </span>

                    <span
                      className="status-pill"
                      style={{
                        backgroundColor: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                      }}
                    >
                      <StatusIcon size={12} />
                      {booking.status || "Upcoming"}
                    </span>
                  </div>

                  <h4 className="card-session-type">
                    <Camera size={18} color="#d4af37" />
                    <span>{booking.session || "Custom Production"}</span>
                  </h4>

                  <div className="card-details-list">
                    <div className="card-detail-item">
                      <Calendar size={14} />
                      <span>{formatDate(booking.eventdate || booking.bookeddate)}</span>
                    </div>
                    <div className="card-detail-item">
                      <MapPin size={14} />
                      <span>{booking.location || booking.Location || "Studio Sanctuary"}</span>
                    </div>
                    {booking.WhatsappNumber && (
                      <div className="card-detail-item">
                        <Phone size={14} />
                        <span>{booking.WhatsappNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="card-footer-row">
                    <div>
                      <span style={{ fontSize: "10px", color: "#777", textTransform: "uppercase", display: "block" }}>
                        Investment
                      </span>
                      <span className="price-text">
                        {booking.amount != null
                          ? `Rs ${Number(booking.amount).toLocaleString()}`
                          : "Quote Pending"}
                      </span>
                    </div>

                    <button
                      className="table-action-btn"
                      onClick={() => setActiveBooking(booking)}
                    >
                      <span>Details</span>
                      <ArrowUpRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Interactive Booking Details Modal with GSAP Entrance */}
        {activeBooking && (
          <div className="modal-overlay" onClick={() => setActiveBooking(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title-wrap">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ShieldCheck size={16} color="#d4af37" />
                    <h3>Reservation Dossier</h3>
                  </div>
                  <span
                    className="id-badge"
                    onClick={() => handleCopy(activeBooking._id, "modal")}
                    style={{ cursor: "pointer", marginTop: "4px" }}
                  >
                    {copiedId === "modal" ? (
                      <Check size={12} color="#10b981" />
                    ) : (
                      <Copy size={12} />
                    )}
                    ID: {activeBooking._id || "N/A"}
                  </span>
                </div>
                <button
                  className="modal-close-btn"
                  onClick={() => setActiveBooking(null)}
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body">
                {/* Visual Production Timeline */}
                <div>
                  <div className="modal-section-title">Production Status</div>
                  <div className="timeline-steps">
                    <div className="timeline-line"></div>
                    <div className="timeline-item active">
                      <div className="timeline-dot">1</div>
                      <span className="timeline-label">Reserved</span>
                    </div>
                    <div className="timeline-item active">
                      <div className="timeline-dot">2</div>
                      <span className="timeline-label">Confirmed</span>
                    </div>
                    <div
                      className={`timeline-item ${
                        (activeBooking.status || "").toLowerCase() === "completed"
                          ? "active"
                          : ""
                      }`}
                    >
                      <div className="timeline-dot">3</div>
                      <span className="timeline-label">Production</span>
                    </div>
                    <div
                      className={`timeline-item ${
                        (activeBooking.status || "").toLowerCase() === "completed"
                          ? "active"
                          : ""
                      }`}
                    >
                      <div className="timeline-dot">4</div>
                      <span className="timeline-label">Delivered</span>
                    </div>
                  </div>
                </div>

                {/* Session Details Grid */}
                <div>
                  <div className="modal-section-title">Session Details</div>
                  <div className="modal-info-grid">
                    <div className="modal-info-field">
                      <span className="modal-info-label">
                        <Camera size={12} /> Experience Type
                      </span>
                      <span className="modal-info-value">
                        {activeBooking.session || "Standard Session"}
                      </span>
                    </div>

                    <div className="modal-info-field">
                      <span className="modal-info-label">
                        <Calendar size={12} /> Scheduled Date
                      </span>
                      <span className="modal-info-value">
                        {formatDate(activeBooking.eventdate || activeBooking.bookeddate)}
                      </span>
                    </div>

                    <div className="modal-info-field">
                      <span className="modal-info-label">
                        <MapPin size={12} /> Location / Venue
                      </span>
                      <span className="modal-info-value">
                        {activeBooking.location || activeBooking.Location || "Main Studio"}
                      </span>
                    </div>

                    <div className="modal-info-field">
                      <span className="modal-info-label">
                        <User size={12} /> Client Name
                      </span>
                      <span className="modal-info-value">
                        {activeBooking.fullname || activeBooking.username || "Client"}
                      </span>
                    </div>

                    {activeBooking.WhatsappNumber && (
                      <div className="modal-info-field">
                        <span className="modal-info-label">
                          <Phone size={12} /> WhatsApp Contact
                        </span>
                        <span className="modal-info-value">
                          {activeBooking.WhatsappNumber}
                        </span>
                      </div>
                    )}

                    <div className="modal-info-field">
                      <span className="modal-info-label">
                        <DollarSign size={12} /> Amount / Quote
                      </span>
                      <span className="modal-info-value" style={{ color: "#d4af37" }}>
                        {activeBooking.amount != null
                          ? `Rs ${Number(activeBooking.amount).toLocaleString()}`
                          : "Custom Quote Assigned by Studio"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Client Notes / Requests */}
                {(activeBooking.Description || activeBooking.notes) && (
                  <div>
                    <div className="modal-section-title">Creative Brief & Notes</div>
                    <div className="notes-card">
                      <FileText size={14} color="#d4af37" style={{ marginBottom: "6px" }} />
                      <p style={{ margin: 0 }}>
                        {activeBooking.Description || activeBooking.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  className="lux-button lux-button-secondary"
                  onClick={() => setActiveBooking(null)}
                >
                  Close
                </button>
                {activeBooking.WhatsappNumber && (
                  <a
                    href={`https://wa.me/${activeBooking.WhatsappNumber.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="lux-button lux-button-primary"
                  >
                    <span>Contact via WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}