/**
 * Format a number as EGP currency.
 * @param {number} amount
 * @param {'en'|'ar'} language
 */
export function formatCurrency(amount, language = 'en') {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount ?? 0);
}

/**
 * Format an ISO date string as a localised short date + time.
 * @param {string} dateString
 * @param {'en'|'ar'} language
 */
export function formatDate(dateString, language = 'en') {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
