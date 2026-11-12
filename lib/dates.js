/* Display formats of a page date.

   Shared by the `dateDisplay` filter (.eleventy.js) and by the cover generator
   (scripts/make-covers.js): a post must read the same date on its page and on
   its Open Graph image. Formatted in UTC so a YYYY-MM-DD date never shifts to
   the neighbouring day.
*/

const dateLocales = { ru: "ru-RU", en: "en-GB", he: "he-IL" };

function formatDate(value, lang = "en") {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date)) return "";
  return new Intl.DateTimeFormat(dateLocales[lang] || lang, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

module.exports = { dateLocales, formatDate };
