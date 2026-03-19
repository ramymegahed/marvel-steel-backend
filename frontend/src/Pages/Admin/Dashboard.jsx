import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DollarSign, Package, ShoppingCart, TrendingUp, Loader, AlertCircle } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';
import { useLanguage } from '../../Components/Context/LanguageContext';
import { useAdmin } from '../../Components/Context/AdminContext';
import { BASE_URL } from '../../App';

// ─── Constants ─────────────────────────────────────────────────────────────
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const AVG_ORDER_VALUE = 1500;

// ─── Card Components ───────────────────────────────────────────────────────
const Card = React.memo(({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-[#2C2C2C]/10 ${className}`}>
        {children}
    </div>
));

Card.displayName = 'Card';

const CardHeader = React.memo(({ children }) => (
    <div className="p-6 pb-0">{children}</div>
));

CardHeader.displayName = 'CardHeader';

const CardTitle = React.memo(({ children }) => (
    <h3 className="text-lg font-semibold text-[#2C2C2C]" style={{ fontFamily: 'Playfair Display, serif' }}>
        {children}
    </h3>
));

CardTitle.displayName = 'CardTitle';

const CardContent = React.memo(({ children }) => (
    <div className="p-6 pt-0">{children}</div>
));

CardContent.displayName = 'CardContent';

// ─── Status Badge Component ────────────────────────────────────────────────
const StatusBadge = React.memo(({ status, t }) => {
    const getStatusColor = useCallback(() => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'processing':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'shipped':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    }, [status]);

    return (
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
            {t.status[status.toLowerCase()] || status}
        </span>
    );
});

StatusBadge.displayName = 'StatusBadge';

// ─── Stat Card Component ───────────────────────────────────────────────────
const StatCard = React.memo(({ stat, content, language }) => {
    const IconComponent = stat.icon;

    return (
        <Card>
            <CardContent className="p-5 sm:p-6">
                <div className="flex items-start justify-between mt-5">
                    <div>
                        <p className="text-xs sm:text-sm text-[#2C2C2C]/70">{stat.title}</p>
                        <h3 className="text-xl sm:text-2xl text-[#2C2C2C] mt-1 sm:mt-2 font-semibold">{stat.value}</h3>
                        {stat.change && (
                            <p className={`text-xs sm:text-sm mt-1 sm:mt-2 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.change} {content.vsLastMonth}
                            </p>
                        )}
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#8B5E3C]/10 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B5E3C]" aria-hidden="true" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

StatCard.displayName = 'StatCard';

// ─── Recent Orders Table ───────────────────────────────────────────────────
const RecentOrdersTable = React.memo(({ orders, content, language }) => {
    const formatCurrency = useCallback((amount) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    }, [language]);

    const formatDate = useCallback((dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }, [language]);

    if (orders.length === 0) {
        return <p className="text-center text-[#2C2C2C]/70 py-4 sm:py-8">{content.noRecentOrders}</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-[#2C2C2C]/10">
                        <th className={`${language === 'ar' ? 'text-right' : 'text-left'} py-3 px-4 text-xs sm:text-sm text-[#2C2C2C]/70 font-medium`}>
                            {content.tableHeaders.orderId}
                        </th>
                        <th className={`${language === 'ar' ? 'text-right' : 'text-left'} py-3 px-4 text-xs sm:text-sm text-[#2C2C2C]/70 font-medium`}>
                            {content.tableHeaders.customer}
                        </th>
                        <th className={`${language === 'ar' ? 'text-right' : 'text-left'} py-3 px-4 text-xs sm:text-sm text-[#2C2C2C]/70 font-medium`}>
                            {content.tableHeaders.amount}
                        </th>
                        <th className={`${language === 'ar' ? 'text-right' : 'text-left'} py-3 px-4 text-xs sm:text-sm text-[#2C2C2C]/70 font-medium`}>
                            {content.tableHeaders.status}
                        </th>
                        <th className={`${language === 'ar' ? 'text-right' : 'text-left'} py-3 px-4 text-xs sm:text-sm text-[#2C2C2C]/70 font-medium`}>
                            {content.tableHeaders.date}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id} className="border-b border-[#2C2C2C]/10 last:border-0 hover:bg-[#F5F1E8]/50 transition-colors">
                            <td className="py-3 px-4 text-xs sm:text-sm text-[#2C2C2C] font-medium">#{order.id}</td>
                            <td className="py-3 px-4 text-xs sm:text-sm text-[#2C2C2C]">{order.customer_name}</td>
                            <td className="py-3 px-4 text-xs sm:text-sm text-[#2C2C2C] font-medium">
                                {formatCurrency(order.total_price)}
                            </td>
                            <td className="py-3 px-4">
                                <StatusBadge status={order.status} t={content} />
                            </td>
                            <td className="py-3 px-4 text-xs sm:text-sm text-[#2C2C2C]/70">
                                {formatDate(order.created_at)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

RecentOrdersTable.displayName = 'RecentOrdersTable';

// ─── Mobile Recent Orders ──────────────────────────────────────────────────
const MobileRecentOrders = React.memo(({ orders, content, language }) => {
    const formatCurrency = useCallback((amount) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    }, [language]);

    const formatDate = useCallback((dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }, [language]);

    if (orders.length === 0) {
        return <p className="text-center text-[#2C2C2C]/70 py-4">{content.noRecentOrders}</p>;
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <div key={order.id} className="border-b border-[#2C2C2C]/10 last:border-0 pb-4 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-[#2C2C2C]">#{order.id}</span>
                        <StatusBadge status={order.status} t={content} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <p className="text-xs text-[#2C2C2C]/70">{content.tableHeaders.customer}</p>
                            <p className="text-[#2C2C2C]">{order.customer_name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[#2C2C2C]/70">{content.tableHeaders.amount}</p>
                            <p className="text-[#2C2C2C]">{formatCurrency(order.total_price)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[#2C2C2C]/70">{content.tableHeaders.date}</p>
                            <p className="text-[#2C2C2C]/70">{formatDate(order.created_at)}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
});

MobileRecentOrders.displayName = 'MobileRecentOrders';

// ─── Loading State ─────────────────────────────────────────────────────────
const LoadingState = React.memo(({ content }) => (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-[#8B5E3C] mx-auto mb-4" aria-label="Loading" />
            <p className="text-[#2C2C2C]">{content.loading}</p>
        </div>
    </div>
));

LoadingState.displayName = 'LoadingState';

// ─── Error State ───────────────────────────────────────────────────────────
const ErrorState = React.memo(({ error, content, onRetry }) => (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" aria-hidden="true" />
                <p className="text-[#2C2C2C] mb-2" role="alert">{content.error}</p>
                <p className="text-sm text-[#2C2C2C]/60 mb-6">{error}</p>
                <button
                    onClick={onRetry}
                    className="px-6 py-2 rounded-lg bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2"
                    aria-label={content.retry}
                >
                    {content.retry}
                </button>
            </CardContent>
        </Card>
    </div>
));

ErrorState.displayName = 'ErrorState';

// ─── Revenue Chart Component ───────────────────────────────────────────────
const RevenueChart = React.memo(({ data, content, language, viewport, chartMargin, chartHeight }) => (
    <Card>
        <CardHeader>
            <CardTitle>{content.charts.revenue}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className={`h-${chartHeight}`}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={chartMargin}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8DCC8" />
                        <XAxis dataKey="month" stroke="#6B6B6B" tick={{ fontSize: viewport.isTablet ? 11 : 12 }} />
                        <YAxis
                            stroke="#6B6B6B"
                            tick={{ fontSize: viewport.isTablet ? 11 : 12 }}
                            tickFormatter={(value) => `${value / 1000}K`}
                        />
                        <Tooltip
                            formatter={(value) => [
                                new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
                                    style: 'currency',
                                    currency: 'EGP',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                }).format(value),
                                'Revenue'
                            ]}
                            contentStyle={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E8DCC8',
                                borderRadius: '8px',
                            }}
                        />
                        <Bar
                            dataKey="revenue"
                            fill="#8B5E3C"
                            radius={viewport.isTablet ? [6, 6, 0, 0] : [8, 8, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </CardContent>
    </Card>
));

RevenueChart.displayName = 'RevenueChart';

// ─── Orders Chart Component ────────────────────────────────────────────────
const OrdersChart = React.memo(({ data, content, viewport, chartMargin, chartHeight }) => (
    <Card>
        <CardHeader>
            <CardTitle>{content.charts.orders}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className={`h-${chartHeight}`}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={chartMargin}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8DCC8" />
                        <XAxis dataKey="month" stroke="#6B6B6B" tick={{ fontSize: viewport.isTablet ? 11 : 12 }} />
                        <YAxis stroke="#6B6B6B" tick={{ fontSize: viewport.isTablet ? 11 : 12 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E8DCC8',
                                borderRadius: '8px',
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="orders"
                            stroke="#7A8C5A"
                            strokeWidth={viewport.isTablet ? 2.5 : 3}
                            dot={{ fill: '#7A8C5A', r: viewport.isTablet ? 4 : 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </CardContent>
    </Card>
));

OrdersChart.displayName = 'OrdersChart';

// ─── Content Dictionary ──────────────────────────────────────────────────────
const DASHBOARD_CONTENT = {
    en: {
        title: 'Dashboard',
        subtitle: 'Overview of your Marvel Steel e-commerce platform',
        stats: {
            totalRevenue: 'Total Revenue',
            totalProducts: 'Total Products',
            totalOrders: 'Total Orders',
            newOrders: 'New Orders',
            inDelivery: 'In Delivery',
            delivered: 'Delivered',
            monthlyGrowth: 'Monthly Growth',
        },
        charts: {
            revenue: 'Monthly Revenue',
            orders: 'Monthly Orders',
        },
        recentOrders: 'Recent Orders',
        tableHeaders: {
            orderId: 'Order ID',
            customer: 'Customer',
            amount: 'Amount',
            status: 'Status',
            date: 'Date',
        },
        status: {
            pending: 'Pending',
            processing: 'Processing',
            shipped: 'Shipped',
            delivered: 'Delivered',
            cancelled: 'Cancelled',
        },
        loading: 'Loading dashboard data...',
        error: 'Failed to load dashboard data',
        retry: 'Retry',
        noRecentOrders: 'No recent orders',
        vsLastMonth: 'vs last month',
    },
    ar: {
        title: 'لوحة التحكم',
        subtitle: 'نظرة عامة على منصة مارفل ستيل للتجارة الإلكترونية',
        stats: {
            totalRevenue: 'إجمالي الإيرادات',
            totalProducts: 'إجمالي المنتجات',
            totalOrders: 'إجمالي الطلبات',
            newOrders: 'طلبات جديدة',
            inDelivery: 'قيد التوصيل',
            delivered: 'تم التوصيل',
            monthlyGrowth: 'النمو الشهري',
        },
        charts: {
            revenue: 'الإيرادات الشهرية',
            orders: 'الطلبات الشهرية',
        },
        recentOrders: 'آخر الطلبات',
        tableHeaders: {
            orderId: 'رقم الطلب',
            customer: 'العميل',
            amount: 'المبلغ',
            status: 'الحالة',
            date: 'التاريخ',
        },
        status: {
            pending: 'قيد الانتظار',
            processing: 'قيد المعالجة',
            shipped: 'تم الشحن',
            delivered: 'تم التوصيل',
            cancelled: 'ملغي',
        },
        loading: 'جاري تحميل بيانات لوحة التحكم...',
        error: 'فشل تحميل بيانات لوحة التحكم',
        retry: 'إعادة المحاولة',
        noRecentOrders: 'لا توجد طلبات حديثة',
        vsLastMonth: 'عن الشهر الماضي',
    },
};

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Dashboard() {
    const { language } = useLanguage();
    const { getAuthHeaders } = useAdmin();

    // ─── State Management ──────────────────────────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        total_products: 0,
        total_orders: 0,
        new_orders: 0,
        in_delivery_orders: 0,
        delivered_orders: 0,
        recent_orders: [],
    });
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [monthlyOrders, setMonthlyOrders] = useState([]);
    const [viewport, setViewport] = useState({ isMobile: false, isTablet: false });

    // ─── Memoized values ─────────────────────────────────────────────────────
    const content = useMemo(() => DASHBOARD_CONTENT[language], [language]);

    const rtlStyles = useMemo(() => language === 'ar' ? {
        direction: 'rtl',
        textAlign: 'right',
    } : {}, [language]);

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const handleResize = useCallback(() => {
        setViewport({
            isMobile: window.innerWidth < MOBILE_BREAKPOINT,
            isTablet: window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT
        });
    }, []);

    // ─── Responsive Detection ──────────────────────────────────────────────────
    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize, { passive: true });
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    // ─── API Helper ────────────────────────────────────────────────────────────
    const apiFetch = useCallback(async (path, options = {}) => {
        const token = localStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };

        const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

        if (!res.ok) {
            let detail = `Request failed (${res.status})`;
            try {
                const body = await res.json();
                detail = body.detail || body.message || detail;
            } catch {
                // Ignore parse errors
            }
            throw new Error(detail);
        }

        return res.json();
    }, []);

    // ─── Fetch Dashboard Data ──────────────────────────────────────────────────
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);

        const controller = new AbortController();

        try {
            // Fetch all dashboard data in parallel
            const [dashboard, revenue, orders] = await Promise.all([
                apiFetch('/api/v1/admin/dashboard/', { signal: controller.signal }),
                apiFetch('/api/v1/admin/analytics/monthly-revenue', { signal: controller.signal }),
                apiFetch('/api/v1/admin/analytics/monthly-orders', { signal: controller.signal }),
            ]);

            setDashboardData(dashboard);
            setMonthlyRevenue(revenue);
            setMonthlyOrders(orders);
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }

        return () => controller.abort();
    }, [apiFetch]);

    // Initial fetch
    useEffect(() => {
        const abortController = new AbortController();
        fetchDashboardData();
        return () => abortController.abort();
    }, [fetchDashboardData]);

    // ─── Calculate Monthly Growth ──────────────────────────────────────────────
    const monthlyGrowth = useMemo(() => {
        if (monthlyRevenue.length < 2) return '+0%';

        const currentMonth = monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0;
        const previousMonth = monthlyRevenue[monthlyRevenue.length - 2]?.revenue || 0;

        if (previousMonth === 0) return '+100%';

        const growth = ((currentMonth - previousMonth) / previousMonth) * 100;
        return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
    }, [monthlyRevenue]);

    // ─── Stats Configuration ───────────────────────────────────────────────────
    const stats = useMemo(() => [
        {
            id: 'totalRevenue',
            title: content.stats.totalRevenue,
            value: new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
                style: 'currency',
                currency: 'EGP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(dashboardData.total_orders * AVG_ORDER_VALUE),
            change: monthlyGrowth,
            icon: DollarSign,
            trend: monthlyGrowth.startsWith('+') ? 'up' : 'down',
        },
        {
            id: 'totalProducts',
            title: content.stats.totalProducts,
            value: dashboardData.total_products.toLocaleString(),
            icon: Package,
            trend: 'up',
        },
        {
            id: 'totalOrders',
            title: content.stats.totalOrders,
            value: dashboardData.total_orders.toLocaleString(),
            icon: ShoppingCart,
            trend: 'up',
        },
        {
            id: 'newOrders',
            title: content.stats.newOrders,
            value: dashboardData.new_orders.toLocaleString(),
            icon: TrendingUp,
            trend: 'up',
        },
    ], [dashboardData, monthlyGrowth, content, language]);

    // ─── Chart Configuration ───────────────────────────────────────────────────
    const chartMargin = useMemo(() =>
        viewport.isMobile
            ? { top: 5, right: 5, bottom: 20, left: 0 }
            : { top: 10, right: 10, bottom: 10, left: 10 },
        [viewport.isMobile]
    );

    const chartHeight = useMemo(() => {
        if (viewport.isMobile) return 64;
        if (viewport.isTablet) return 64;
        return 80;
    }, [viewport.isMobile, viewport.isTablet]);

    // ─── Responsive classes ───────────────────────────────────────────────────
    const titleClasses = useMemo(() => {
        if (viewport.isMobile) return 'text-2xl mb-1';
        if (viewport.isTablet) return 'text-3xl mb-2';
        return 'text-3xl sm:text-4xl mb-2';
    }, [viewport.isMobile, viewport.isTablet]);

    const subtitleClasses = useMemo(() => {
        if (viewport.isMobile) return 'text-sm';
        if (viewport.isTablet) return 'text-base';
        return 'text-base sm:text-lg';
    }, [viewport.isMobile, viewport.isTablet]);

    const headerMargin = useMemo(() => {
        if (viewport.isMobile) return 'mb-6';
        if (viewport.isTablet) return 'mb-7';
        return 'mb-8';
    }, [viewport.isMobile, viewport.isTablet]);

    // ─── Loading State ─────────────────────────────────────────────────────────
    if (loading) {
        return <LoadingState content={content} />;
    }

    // ─── Error State ───────────────────────────────────────────────────────────
    if (error) {
        return (
            <ErrorState
                error={error}
                content={content}
                onRetry={fetchDashboardData}
            />
        );
    }

    // ─── Mobile Layout ─────────────────────────────────────────────────────────
    if (viewport.isMobile) {
        return (
            <div className="min-h-screen bg-[#F5F1E8] pb-12" style={rtlStyles}>
                <div className="max-w-7xl mx-auto px-4">
                    {/* Page Title */}
                    <div className={headerMargin}>
                        <h1 className={titleClasses} style={{ fontFamily: 'Playfair Display, serif' }}>
                            {content.title}
                        </h1>
                        <p className={subtitleClasses}>{content.subtitle}</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="space-y-4 mb-6">
                        {stats.map((stat) => (
                            <StatCard
                                key={stat.id}
                                stat={stat}
                                content={content}
                                language={language}
                            />
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="space-y-6 mb-6">
                        {/* Revenue Chart */}
                        <RevenueChart
                            data={monthlyRevenue}
                            content={content}
                            language={language}
                            viewport={viewport}
                            chartMargin={{ top: 5, right: 5, bottom: 20, left: 0 }}
                            chartHeight={64}
                        />

                        {/* Orders Chart */}
                        <OrdersChart
                            data={monthlyOrders}
                            content={content}
                            viewport={viewport}
                            chartMargin={{ top: 5, right: 5, bottom: 20, left: 0 }}
                            chartHeight={64}
                        />
                    </div>

                    {/* Recent Orders */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{content.recentOrders}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MobileRecentOrders
                                orders={dashboardData.recent_orders}
                                content={content}
                                language={language}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // ─── Tablet Layout ─────────────────────────────────────────────────────────
    if (viewport.isTablet) {
        return (
            <div className="min-h-screen bg-[#F5F1E8] pb-16" style={rtlStyles}>
                <div className="max-w-7xl mx-auto px-6">
                    {/* Page Title */}
                    <div className={headerMargin}>
                        <h1 className={titleClasses} style={{ fontFamily: 'Playfair Display, serif' }}>
                            {content.title}
                        </h1>
                        <p className={subtitleClasses}>{content.subtitle}</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-5 mb-6 ">
                        {stats.map((stat) => (
                            <StatCard
                                key={stat.id}
                                stat={stat}
                                content={content}
                                language={language}
                            />
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-2 gap-5 mb-6">
                        <RevenueChart
                            data={monthlyRevenue}
                            content={content}
                            language={language}
                            viewport={viewport}
                            chartMargin={chartMargin}
                            chartHeight={64}
                        />
                        <OrdersChart
                            data={monthlyOrders}
                            content={content}
                            viewport={viewport}
                            chartMargin={chartMargin}
                            chartHeight={64}
                        />
                    </div>

                    {/* Recent Orders */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{content.recentOrders}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RecentOrdersTable
                                orders={dashboardData.recent_orders}
                                content={content}
                                language={language}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // ─── Desktop Layout ────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#F5F1E8] pb-20 " style={rtlStyles}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  ">
                {/* Page Title */}
                <div className={headerMargin}>
                    <h1 className={titleClasses} style={{ fontFamily: 'Playfair Display, serif' }}>
                        {content.title}
                    </h1>
                    <p className={subtitleClasses}>{content.subtitle}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ">
                    {stats.map((stat) => (
                        <StatCard
                            key={stat.id}
                            stat={stat}
                            content={content}
                            language={language}
                        />
                    ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <RevenueChart
                        data={monthlyRevenue}
                        content={content}
                        language={language}
                        viewport={viewport}
                        chartMargin={chartMargin}
                        chartHeight={80}
                    />
                    <OrdersChart
                        data={monthlyOrders}
                        content={content}
                        viewport={viewport}
                        chartMargin={chartMargin}
                        chartHeight={80}
                    />
                </div>

                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle>{content.recentOrders}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentOrdersTable
                            orders={dashboardData.recent_orders}
                            content={content}
                            language={language}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}